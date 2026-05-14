import hashlib
import json
from datetime import datetime
from statistics import mean

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis import redis_get_json, redis_set_json
from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.user import User
from app.schemas.trend import TrendAnalysis, TrendPoint, TrendSeries
from app.services.deepseek_service import DeepSeekServiceError, call_deepseek_json
from app.services.patient_service import get_patient_or_404
from app.services.prompt_service import TREND_ANALYSIS_SYSTEM_PROMPT, get_active_trend_analysis_prompt

METRIC_TYPE_MAP = {
    "blood_pressure_systolic": "bloodPressureSystolic",
    "blood_pressure_diastolic": "bloodPressureDiastolic",
    "bloodPressureSystolic": "bloodPressureSystolic",
    "bloodPressureDiastolic": "bloodPressureDiastolic",
    "blood_sugar": "bloodSugar",
    "bloodSugar": "bloodSugar",
    "temperature": "temperature",
    "heart_rate": "heartRate",
    "heartRate": "heartRate",
}

TREND_ANALYSIS_TTL_SECONDS = 60 * 60 * 24
TREND_DATA_TTL_SECONDS = 60 * 10

def get_metric_trend(
    db: Session,
    user: User,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> TrendSeries:
    patient = get_patient_or_404(db, user, patient_id)
    cache_key = trend_data_cache_key(user.id, patient.id, metric_type, start_at, end_at)
    cached = redis_get_json(cache_key)
    if isinstance(cached, dict):
        return TrendSeries.model_validate(cached)

    metric_key = METRIC_TYPE_MAP.get(metric_type, metric_type)
    statement = (
        select(CareRecord.occurred_at, CareMetric.value_numeric)
        .join(CareMetric, CareMetric.care_record_id == CareRecord.id)
        .where(
            CareRecord.patient_id == patient.id,
            CareMetric.metric_key == metric_key,
            CareMetric.value_numeric.is_not(None),
        )
        .order_by(CareRecord.occurred_at.asc())
    )
    if start_at is not None:
        statement = statement.where(CareRecord.occurred_at >= start_at)
    if end_at is not None:
        statement = statement.where(CareRecord.occurred_at <= end_at)

    rows = db.execute(statement).all()
    series = TrendSeries(
        patient_id=patient.id,
        metric_type=metric_type,
        points=[
            TrendPoint(occurred_at=occurred_at.isoformat(), value=float(value_numeric))
            for occurred_at, value_numeric in rows
        ],
    )
    redis_set_json(cache_key, TREND_DATA_TTL_SECONDS, series.model_dump(mode="json", by_alias=True))
    return series


def trend_cache_digest(
    user_id: str,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> str:
    raw = json.dumps(
        {
            "metricType": metric_type,
            "startAt": start_at.isoformat() if start_at else "",
            "endAt": end_at.isoformat() if end_at else "",
        },
        ensure_ascii=False,
        sort_keys=True,
    )
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]
    return digest


def trend_analysis_cache_key(
    user_id: str,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> str:
    digest = trend_cache_digest(user_id, patient_id, metric_type, start_at, end_at)
    return f"cache:trend:analysis:{user_id}:{patient_id}:{digest}"


def trend_data_cache_key(
    user_id: str,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> str:
    digest = trend_cache_digest(user_id, patient_id, metric_type, start_at, end_at)
    return f"cache:trend:data:{user_id}:{patient_id}:{digest}"


def get_metric_points(
    db: Session,
    patient_id: str,
    metric_key: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> list[dict[str, object]]:
    statement = (
        select(CareRecord.occurred_at, CareMetric.value_numeric)
        .join(CareMetric, CareMetric.care_record_id == CareRecord.id)
        .where(
            CareRecord.patient_id == patient_id,
            CareMetric.metric_key == metric_key,
            CareMetric.value_numeric.is_not(None),
        )
        .order_by(CareRecord.occurred_at.asc())
    )
    if start_at is not None:
        statement = statement.where(CareRecord.occurred_at >= start_at)
    if end_at is not None:
        statement = statement.where(CareRecord.occurred_at <= end_at)

    return [
        {"occurredAt": occurred_at.isoformat(), "value": float(value_numeric)}
        for occurred_at, value_numeric in db.execute(statement).all()
    ]


def build_analysis_points(
    db: Session,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> dict[str, object]:
    if metric_type == "blood_pressure":
        return {
            "metricType": metric_type,
            "unit": "mmHg",
            "series": {
                "systolic": get_metric_points(db, patient_id, "bloodPressureSystolic", start_at, end_at),
                "diastolic": get_metric_points(db, patient_id, "bloodPressureDiastolic", start_at, end_at),
            },
        }

    metric_key = METRIC_TYPE_MAP.get(metric_type, metric_type)
    unit = {
        "bloodSugar": "mmol/L",
        "temperature": "°C",
        "heartRate": "bpm",
    }.get(metric_key, "")
    return {
        "metricType": metric_type,
        "unit": unit,
        "series": {
            "value": get_metric_points(db, patient_id, metric_key, start_at, end_at),
        },
    }


def extract_values(points: list[dict[str, object]]) -> list[float]:
    values: list[float] = []
    for point in points:
        value = point.get("value")
        if isinstance(value, int | float):
            values.append(float(value))
    return values


def build_fallback_analysis(patient_id: str, metric_type: str, analysis_data: dict[str, object]) -> TrendAnalysis:
    series = analysis_data.get("series")
    values: list[float] = []
    if isinstance(series, dict):
        for points in series.values():
            if isinstance(points, list):
                values.extend(extract_values(points))

    if not values:
        return TrendAnalysis(
            patient_id=patient_id,
            metric_type=metric_type,
            summary="当前时间范围内暂无足够趋势数据，建议先持续补充护理记录。",
            risk_level="stable",
            highlights=["当前筛选范围内数据点不足。", "趋势判断需要连续记录支撑。"],
            suggestions=["继续按固定时间记录关键指标。", "如出现明显不适或异常数值，请及时联系专业医护人员。"],
            risk_note="AI 分析仅供护理参考，不构成医疗诊断或治疗建议。",
            generated_by="fallback",
        )

    first_value = values[0]
    last_value = values[-1]
    average_value = round(mean(values), 1)
    delta = round(last_value - first_value, 1)
    risk_level = "attention" if abs(delta) >= max(5, average_value * 0.08) else "stable"
    direction = "上升" if delta > 0 else "下降" if delta < 0 else "平稳"

    return TrendAnalysis(
        patient_id=patient_id,
        metric_type=metric_type,
        summary=f"本周期指标整体{direction}，均值约为 {average_value}。",
        risk_level=risk_level,
        highlights=[
            f"首末变化约为 {delta}。",
            f"周期均值约为 {average_value}。",
            "趋势结论基于当前筛选范围内的护理记录。",
        ],
        suggestions=[
            "建议继续在固定时段记录，减少测量时间差带来的误判。",
            "可结合饮食、用药、睡眠和活动情况一起观察。",
            "如连续出现异常或伴随不适，请及时联系专业医护人员。",
        ],
        risk_note="AI 分析仅供护理参考，不构成医疗诊断或治疗建议。",
        generated_by="fallback",
    )


def normalize_ai_analysis(
    patient_id: str,
    metric_type: str,
    raw: dict[str, object],
    generated_by: str,
) -> TrendAnalysis:
    def text(value: object, default: str) -> str:
        if isinstance(value, str) and value.strip():
            return value.strip()
        return default

    def text_list(value: object, default: list[str]) -> list[str]:
        if not isinstance(value, list):
            return default
        items = [str(item).strip() for item in value if str(item).strip()]
        return items[:4] if items else default

    risk_level = text(raw.get("riskLevel"), "attention")
    if risk_level not in {"stable", "attention", "high"}:
        risk_level = "attention"

    return TrendAnalysis(
        patient_id=patient_id,
        metric_type=metric_type,
        summary=text(raw.get("summary"), "AI 已完成趋势分析，请结合护理记录继续观察。"),
        risk_level=risk_level,
        highlights=text_list(raw.get("highlights"), ["趋势分析已生成。"]),
        suggestions=text_list(raw.get("suggestions"), ["建议持续记录并结合患者状态观察。"]),
        risk_note=text(raw.get("riskNote"), "AI 分析仅供护理参考，不构成医疗诊断或治疗建议。"),
        generated_by=generated_by,
    )


def build_trend_analysis_prompt(
    patient_name: str,
    patient_note: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
    analysis_data: dict[str, object],
) -> str:
    return json.dumps(
        {
            "patient": {
                "name": patient_name,
                "profileNote": patient_note,
            },
            "metricType": metric_type,
            "range": {
                "startAt": start_at.isoformat() if start_at else None,
                "endAt": end_at.isoformat() if end_at else None,
            },
            "trendData": analysis_data,
        },
        ensure_ascii=False,
    )


def should_use_deepseek_for_trend() -> bool:
    settings = get_settings()
    return (
        settings.ai_use_real_model
        and settings.ai_provider.strip().lower() == "deepseek"
        and bool(settings.deepseek_api_key.get_secret_value().strip())
    )


def get_trend_analysis(
    db: Session,
    user: User,
    patient_id: str,
    metric_type: str,
    start_at: datetime | None,
    end_at: datetime | None,
) -> TrendAnalysis:
    patient = get_patient_or_404(db, user, patient_id)
    cache_key = trend_analysis_cache_key(user.id, patient.id, metric_type, start_at, end_at)
    cached = redis_get_json(cache_key)
    if isinstance(cached, dict):
        return TrendAnalysis.model_validate(cached)

    analysis_data = build_analysis_points(db, patient.id, metric_type, start_at, end_at)
    analysis = build_fallback_analysis(patient.id, metric_type, analysis_data)

    if should_use_deepseek_for_trend():
        settings = get_settings()
        prompt = build_trend_analysis_prompt(
            patient_name=patient.name,
            patient_note=patient.profile_note,
            metric_type=metric_type,
            start_at=start_at,
            end_at=end_at,
            analysis_data=analysis_data,
        )
        try:
            raw = call_deepseek_json(
                settings=settings,
                system_prompt=get_active_trend_analysis_prompt(db),
                user_prompt=prompt,
                temperature=0.1,
            )
            analysis = normalize_ai_analysis(patient.id, metric_type, raw, generated_by="deepseek")
        except (DeepSeekServiceError, ValueError, TypeError, KeyError):
            analysis = build_fallback_analysis(patient.id, metric_type, analysis_data)

    redis_set_json(cache_key, TREND_ANALYSIS_TTL_SECONDS, analysis.model_dump(mode="json", by_alias=True))
    return analysis
