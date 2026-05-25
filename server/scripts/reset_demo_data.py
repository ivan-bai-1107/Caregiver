from __future__ import annotations

import random
import sys
from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
from pathlib import Path

from sqlalchemy import text

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.database import SessionLocal
from app.core.redis import redis_delete_pattern
from app.core.security import hash_password
from app.models.admin import AdminUser, PromptTemplate
from app.models.ai_log import AiAssistantLog
from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.community import (
    CommunityComment,
    CommunityPost,
    CommunityPostBookmark,
    CommunityPostLike,
    CommunityPostReport,
)
from app.models.knowledge import KnowledgeArticle, KnowledgeCategory, UserKnowledgeBookmark, UserKnowledgeLike
from app.models.patient import Patient
from app.models.user import User
from app.models.user_settings import UserNotificationSetting, UserPreference
from app.services.prompt_service import DEFAULT_PROMPT_TEMPLATES

RANDOM_SEED = 20260515
MAIN_USER_EMAIL = "caregiver@example.com"
MAIN_USER_PASSWORD = "password123"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin123"
TZ = timezone(timedelta(hours=8))


def now() -> datetime:
    return datetime.now(TZ)


def at_day(day: datetime, hour: int, minute: int = 0) -> datetime:
    return datetime.combine(day.date(), time(hour, minute), tzinfo=TZ)


def truncate_business_tables(db) -> None:
    tables = [
        "email_verification_codes",
        "ai_assistant_logs",
        "community_post_reports",
        "community_post_bookmarks",
        "community_post_likes",
        "community_comments",
        "community_posts",
        "user_knowledge_bookmarks",
        "user_knowledge_likes",
        "knowledge_articles",
        "knowledge_categories",
        "care_metrics",
        "care_records",
        "care_tasks",
        "patients",
        "user_notification_settings",
        "user_preferences",
        "prompt_templates",
        "admin_users",
        "users",
    ]
    db.execute(text(f"TRUNCATE TABLE {', '.join(tables)} RESTART IDENTITY CASCADE"))


def clear_redis_state() -> None:
    for pattern in [
        "email_code*",
        "email_code_fail*",
        "email_code_lock*",
        "email_code_cooldown*",
        "login_fail*",
        "login_lock*",
        "rate:*",
        "cache:*",
    ]:
        redis_delete_pattern(pattern)


def create_users(db) -> list[User]:
    profiles = [
        ("示例照顾者", MAIN_USER_EMAIL, MAIN_USER_PASSWORD),
        ("王阿姨", "family.wang@example.com", "password123"),
        ("赵护工", "nurse.zhao@example.com", "password123"),
        ("林家属", "family.lin@example.com", "password123"),
        ("陈照护员", "care.chen@example.com", "password123"),
        ("何护士", "nurse.he@example.com", "password123"),
    ]
    users: list[User] = []
    for username, email, password in profiles:
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            avatar_url="",
            status="active",
        )
        db.add(user)
        db.flush()
        db.add(UserNotificationSetting(user_id=user.id))
        db.add(UserPreference(user_id=user.id, theme="system", language="zh-CN"))
        users.append(user)
    return users


def create_admins(db) -> None:
    db.add(
        AdminUser(
            username="系统管理员",
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            status="active",
        )
    )
    db.add(
        AdminUser(
            username="内容管理员",
            email="content.admin@example.com",
            password_hash=hash_password("admin123"),
            status="active",
        )
    )
    for template in DEFAULT_PROMPT_TEMPLATES:
        db.add(
            PromptTemplate(
                key=template["key"],
                name=template["name"],
                description=template["description"],
                content=template["content"],
                status="active",
                is_system=True,
            )
        )


def create_patients(db, users: list[User]) -> list[Patient]:
    patient_specs = [
        ("张明", 68, "男", "高血压长期管理，晨间血压波动较明显。"),
        ("李芳", 72, "女", "糖尿病合并轻度高血压，关注空腹和餐后血糖。"),
        ("王桂兰", 81, "女", "脑卒中后康复期，右侧上肢活动能力下降。"),
        ("周建国", 76, "男", "冠心病术后恢复，需关注胸闷、心率和活动耐受。"),
        ("陈爱华", 69, "女", "膝关节置换术后，重点记录疼痛和康复训练。"),
        ("刘海", 84, "男", "长期卧床，重点预防压疮和肺部感染。"),
        ("孙秀英", 79, "女", "阿尔茨海默症早期，服药提醒和走失风险管理。"),
        ("马国强", 73, "男", "慢阻肺稳定期，关注呼吸、咳痰和血氧。"),
        ("黄梅", 66, "女", "骨质疏松，近期有跌倒风险。"),
        ("吴德胜", 88, "男", "肾功能不全，饮食和饮水量需谨慎记录。"),
        ("郑丽", 74, "女", "帕金森病，观察震颤、步态和吞咽情况。"),
        ("赵文华", 71, "男", "血脂异常，配合低脂饮食和规律步行。"),
        ("何玉珍", 83, "女", "夜间睡眠差，偶有头晕。"),
        ("郭建平", 78, "男", "糖尿病足风险，需每日查看足部皮肤。"),
        ("林秋月", 70, "女", "术后营养恢复，食欲波动较大。"),
        ("朱国栋", 86, "男", "吞咽困难，餐食需软烂并观察呛咳。"),
        ("梁美云", 75, "女", "高血压伴焦虑，情绪变化会影响血压。"),
        ("宋志强", 82, "男", "轻度认知障碍，需家属协助服药。"),
        ("唐秀兰", 77, "女", "慢性腰痛，关注疼痛评分和活动量。"),
        ("冯立新", 69, "男", "起搏器术后随访，关注心率和伤口。"),
        ("蒋桂芳", 80, "女", "贫血恢复期，记录乏力和饮食摄入。"),
        ("韩建军", 73, "男", "痛风间歇期，低嘌呤饮食管理。"),
        ("谢兰", 67, "女", "甲状腺术后，关注精神状态和心率。"),
        ("邓国民", 85, "男", "多病共存，用药种类多，防止漏服。"),
    ]
    patients: list[Patient] = []
    for index, (name, age, gender, note) in enumerate(patient_specs):
        user = users[0] if index < 14 else users[(index % (len(users) - 1)) + 1]
        patient = Patient(user_id=user.id, name=name, age=age, gender=gender, profile_note=note)
        db.add(patient)
        patients.append(patient)
    db.flush()
    return patients


def add_metric(record: CareRecord, key: str, value: int | float | Decimal | str, unit: str = "") -> None:
    if isinstance(value, str):
        record.metrics.append(CareMetric(metric_key=key, value_text=value, unit=unit or None))
    else:
        record.metrics.append(CareMetric(metric_key=key, value_numeric=Decimal(str(value)), unit=unit or None))


def create_care_records(db, patients: list[Patient]) -> None:
    rng = random.Random(RANDOM_SEED)
    record_notes = [
        "精神状态平稳，配合测量。",
        "早餐后状态良好，未诉明显不适。",
        "夜间睡眠一般，晨起稍感乏力。",
        "今日活动量较少，建议下午短时步行。",
        "家属反馈饮食摄入正常。",
    ]
    start = now() - timedelta(days=44)
    for patient_index, patient in enumerate(patients):
        baseline_sys = 122 + (patient.age - 65) // 2 + (patient_index % 5) * 2
        baseline_dia = 76 + (patient_index % 4) * 2
        for day_offset in range(45):
            day = start + timedelta(days=day_offset)
            systolic = baseline_sys + rng.randint(-8, 10)
            diastolic = baseline_dia + rng.randint(-5, 6)
            bp = CareRecord(
                patient_id=patient.id,
                record_type="blood_pressure",
                occurred_at=at_day(day, 7, rng.choice([10, 20, 30])),
                notes=rng.choice(record_notes),
                source="manual",
            )
            add_metric(bp, "bloodPressureSystolic", systolic, "mmHg")
            add_metric(bp, "bloodPressureDiastolic", diastolic, "mmHg")
            db.add(bp)

            if day_offset % 2 == patient_index % 2:
                fasting = round(5.2 + (patient_index % 6) * 0.35 + rng.uniform(-0.5, 0.9), 1)
                sugar = CareRecord(
                    patient_id=patient.id,
                    record_type="blood_sugar",
                    occurred_at=at_day(day, 6, 50),
                    notes="空腹血糖记录，已同步饮食情况。",
                    source="manual",
                )
                add_metric(sugar, "bloodSugar", fasting, "mmol/L")
                db.add(sugar)

            if day_offset % 3 == patient_index % 3:
                hr = CareRecord(
                    patient_id=patient.id,
                    record_type="heart_rate",
                    occurred_at=at_day(day, 8, 5),
                    notes="静息心率记录。",
                    source="manual",
                )
                add_metric(hr, "heartRate", 64 + rng.randint(-6, 18), "次/分")
                db.add(hr)

            if day_offset % 5 == 0:
                temp = CareRecord(
                    patient_id=patient.id,
                    record_type="temperature",
                    occurred_at=at_day(day, 19, 30),
                    notes="晚间体温复核。",
                    source="manual",
                )
                add_metric(temp, "temperature", round(36.3 + rng.uniform(-0.2, 0.6), 1), "℃")
                db.add(temp)

            if day_offset % 7 == 0:
                diet = CareRecord(
                    patient_id=patient.id,
                    record_type="diet",
                    occurred_at=at_day(day, 12, 30),
                    notes="午餐摄入观察。",
                    source="manual",
                )
                add_metric(diet, "dietDescription", rng.choice(["米饭半碗、清蒸鱼、青菜，摄入约七成。", "软烂面条、鸡蛋羹，吞咽顺利。", "低盐粥、豆腐和蔬菜，胃口一般。"]))
                db.add(diet)

        medication = CareRecord(
            patient_id=patient.id,
            record_type="medication",
            occurred_at=at_day(now(), 8, 0),
            notes="晨间用药已核对。",
            source="manual",
        )
        add_metric(medication, "medicationName", rng.choice(["苯磺酸氨氯地平片", "二甲双胍缓释片", "阿托伐他汀钙片", "阿司匹林肠溶片"]))
        add_metric(medication, "medicationDose", rng.choice(["1片", "0.5片", "每日一次", "按医嘱"]))
        db.add(medication)


def create_tasks(db, patients: list[Patient]) -> None:
    task_templates = [
        ("测量血压", "blood_pressure", "每天早上固定时间测量并记录血压。", "daily"),
        ("空腹血糖", "blood_sugar", "早餐前测量血糖，异常时复测并备注饮食。", "daily"),
        ("晚间服药提醒", "medication", "核对药盒并提醒患者按时服药。", "daily"),
        ("康复训练", "rehab", "完成关节活动和步行训练，记录耐受情况。", "daily"),
        ("皮肤检查", "other", "查看骶尾部、足跟和髋部皮肤受压情况。", "daily"),
        ("复诊准备", "appointment", "整理近期记录和异常情况，准备复诊沟通。", "once"),
    ]
    priorities = ["normal", "normal", "high", "low"]
    statuses = ["pending", "pending", "completed", "scheduled"]
    for patient_index, patient in enumerate(patients):
        for task_index, (title, task_type, description, repeat_rule) in enumerate(task_templates):
            if patient_index % 3 == 2 and task_index in {1, 5}:
                continue
            remind_at = now() + timedelta(days=(task_index % 4) - 1, hours=8 + task_index * 2)
            status = statuses[(patient_index + task_index) % len(statuses)]
            db.add(
                CareTask(
                    patient_id=patient.id,
                    title=title,
                    description=description,
                    task_type=task_type,
                    remind_time=remind_at,
                    repeat_rule=repeat_rule,
                    priority=priorities[(patient_index + task_index) % len(priorities)],
                    remind_offset_minutes=15,
                    status=status,
                )
            )


def create_knowledge(db, users: list[User]) -> list[KnowledgeArticle]:
    categories = [
        ("慢病管理", "chronic", "高血压、糖尿病、冠心病等长期照护知识。"),
        ("饮食护理", "diet", "居家照护场景下的营养、吞咽和饮食观察。"),
        ("康复训练", "rehab", "术后、卒中后和骨关节康复训练建议。"),
        ("用药管理", "medication", "药盒、漏服、复诊和多药联用提醒。"),
        ("居家安全", "safety", "跌倒、压疮、走失和环境改造。"),
        ("心理陪伴", "mental", "沟通、睡眠、焦虑和认知障碍陪伴。"),
    ]
    category_models = []
    for order, (name, slug, description) in enumerate(categories, start=1):
        category = KnowledgeCategory(name=name, slug=slug, description=description, sort_order=order)
        db.add(category)
        category_models.append(category)
    db.flush()

    topic_map = [
        ("高血压家庭照护一周清单", "慢病管理", "低盐饮食、规律监测和异常识别是家庭照护的核心。"),
        ("低盐饮食的一日菜单", "饮食护理", "用具体餐次帮助照顾者控制盐和脂肪摄入。"),
        ("糖尿病空腹与餐后血糖观察", "慢病管理", "说明不同时间点血糖的观察意义和记录方法。"),
        ("脑卒中上肢康复动作示范", "康复训练", "适合家属辅助的上肢活动训练步骤。"),
        ("卧床患者压疮预防检查表", "居家安全", "翻身、皮肤检查和床垫使用要点。"),
        ("家庭药盒管理和漏服处理", "用药管理", "多药共用时的核对流程和漏服应对。"),
        ("照护者如何和老人沟通复健目标", "心理陪伴", "减少抵触情绪，提高康复训练配合度。"),
        ("夜间频繁起夜如何记录", "居家安全", "结合饮水、用药和睡眠状态观察风险。"),
    ]
    articles: list[KnowledgeArticle] = []
    authors = [
        ("李医生", "心血管内科 · 主任医师"),
        ("张护士", "内分泌科 · 主管护师"),
        ("王营养师", "营养科 · 主管营养师"),
        ("赵康复师", "康复医学科 · 治疗师"),
        ("陈护师", "老年护理 · 主管护师"),
        ("刘药师", "临床药学 · 主管药师"),
    ]
    cover_colors = ["primary", "blue", "accent", "warm"]
    for index in range(48):
        base_title, category_name, summary = topic_map[index % len(topic_map)]
        category = next(item for item in category_models if item.name == category_name)
        author, title = authors[index % len(authors)]
        article_type = "video" if index % 9 == 3 else "article"
        article = KnowledgeArticle(
            category_id=category.id,
            title=base_title if index < len(topic_map) else f"{base_title}（进阶 {index // len(topic_map) + 1}）",
            summary=summary,
            content=(
                f"# 重点\n\n{summary}\n\n"
                "照顾者应结合患者近期记录、用药情况和精神状态进行判断。"
                "如出现持续异常、胸闷、呼吸困难、意识改变或跌倒外伤，应及时联系专业医护人员。\n\n"
                "# 记录建议\n\n建议记录时间、数值、饮食、活动、用药和患者主观感受，方便复诊时回顾趋势。"
            ),
            article_type=article_type,
            author_name=author,
            author_title=title,
            source="护理知识库",
            video_url="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" if article_type == "video" else "",
            read_time_minutes=4 + index % 9,
            cover_color=cover_colors[index % len(cover_colors)],
            status="published" if index < 42 else ("draft" if index % 2 == 0 else "archived"),
            view_count=180 + index * 17,
            like_count=20 + index * 3,
            published_at=now() - timedelta(days=index),
        )
        db.add(article)
        articles.append(article)
    db.flush()

    for user in users:
        for article in articles[:18:3]:
            db.add(UserKnowledgeLike(user_id=user.id, article_id=article.id))
        for article in articles[1:15:4]:
            db.add(UserKnowledgeBookmark(user_id=user.id, article_id=article.id))
    return articles


def create_community(db, users: list[User]) -> list[CommunityPost]:
    rng = random.Random(RANDOM_SEED + 1)
    tags = ["experience", "question", "tools", "care", "rehab"]
    titles = [
        "大家测血压一般固定在什么时间？",
        "如何让老人更愿意配合康复训练",
        "分享一个家庭药盒检查流程",
        "卧床老人皮肤发红时怎么观察",
        "糖尿病饮食记录表怎么做更省事",
        "复诊前整理护理记录的小方法",
        "夜间起夜次数多需要记录哪些内容",
        "照护者轮班交接有哪些注意点",
    ]
    contents = [
        "最近在整理照护记录，发现固定时间记录后趋势更清楚，也方便复诊时和医生沟通。",
        "家里老人有时不愿意训练，我尝试把目标拆小，完成后及时鼓励，配合度比以前好一些。",
        "我们把早中晚药分格放好，每天拍照确认，漏服情况明显减少。",
        "我会每天看骶尾部和足跟，发现红印会先减压并继续观察变化。",
        "记录三餐内容、血糖时间和活动量，几周后能看出一些规律。",
        "复诊前把异常数值和不舒服的时间点单独标出来，医生看起来更快。",
    ]
    posts: list[CommunityPost] = []
    for index in range(80):
        status_value = "passed"
        reason = ""
        if index % 17 == 0:
            status_value = "pending"
        elif index % 23 == 0:
            status_value = "rejected"
            reason = "内容描述不完整，建议补充护理场景后重新发布。"
        post = CommunityPost(
            author_id=users[index % len(users)].id,
            title=titles[index % len(titles)],
            content=contents[index % len(contents)],
            tag=tags[index % len(tags)],
            status=status_value,
            review_reason=reason,
            view_count=40 + index * 6,
            like_count=0,
            comment_count=0,
            report_count=0,
            created_at=now() - timedelta(days=index % 30, hours=index % 8),
        )
        db.add(post)
        posts.append(post)
    db.flush()

    comment_texts = [
        "这个方法很实用，我也准备试一下。",
        "建议同时记录饮食和活动量，后面看趋势会更清楚。",
        "我家也遇到过类似情况，固定流程后确实省心很多。",
        "如果连续几天异常，最好还是及时问医生。",
        "谢谢分享，照护交接时这个信息很有帮助。",
    ]
    liked_pairs: set[tuple[str, str]] = set()
    bookmarked_pairs: set[tuple[str, str]] = set()
    reported_pairs: set[tuple[str, str]] = set()
    for post_index, post in enumerate(posts):
        if post.status == "passed":
            for offset in range(rng.randint(1, 4)):
                author = users[(post_index + offset + 1) % len(users)]
                db.add(
                    CommunityComment(
                        post_id=post.id,
                        author_id=author.id,
                        content=comment_texts[(post_index + offset) % len(comment_texts)],
                        status="passed",
                    )
                )
                post.comment_count += 1
        for user in users:
            if (post_index + len(user.id)) % 3 == 0:
                key = (user.id, post.id)
                if key not in liked_pairs:
                    db.add(CommunityPostLike(user_id=user.id, post_id=post.id))
                    liked_pairs.add(key)
                    post.like_count += 1
            if (post_index + len(user.email)) % 11 == 0:
                key = (user.id, post.id)
                if key not in bookmarked_pairs:
                    db.add(CommunityPostBookmark(user_id=user.id, post_id=post.id))
                    bookmarked_pairs.add(key)
            if post.status == "passed" and post_index % 29 == 0:
                key = (user.id, post.id)
                if key not in reported_pairs:
                    db.add(CommunityPostReport(user_id=user.id, post_id=post.id, reason="信息需要管理员复核"))
                    reported_pairs.add(key)
                    post.report_count += 1
    return posts


def create_ai_logs(db, user: User, patients: list[Patient]) -> None:
    messages = [
        "高血压患者日常饮食需要注意什么？",
        "帮我记录今天上午测量的血压，张明，收缩压130，舒张压85",
        "帮我创建一个每天早上8点测血压的任务",
        "糖尿病患者餐后血糖偏高怎么记录？",
        "卧床患者预防压疮需要观察哪些部位？",
    ]
    for index in range(90):
        patient = patients[index % min(len(patients), 12)]
        intent = ["qa", "care_record", "care_task"][index % 3]
        draft_type = None
        draft_payload = None
        if intent == "care_record":
            draft_type = "record"
            draft_payload = {
                "patientId": patient.id,
                "patientName": patient.name,
                "recordType": "blood_pressure",
                "metrics": {"bloodPressureSystolic": "130", "bloodPressureDiastolic": "85"},
            }
        elif intent == "care_task":
            draft_type = "task"
            draft_payload = {
                "patientId": patient.id,
                "patientName": patient.name,
                "title": "测量血压",
                "taskType": "blood_pressure",
                "repeatRule": "daily",
            }
        db.add(
            AiAssistantLog(
                user_id=user.id,
                conversation_id=f"conv_demo_{index:03d}",
                message=messages[index % len(messages)],
                intent=intent,
                answer_text="已结合护理知识库和患者记录生成回复，请在执行前核对患者实际情况。",
                draft_type=draft_type,
                draft_payload=draft_payload,
                sources=["高血压家庭照护一周清单"] if intent == "qa" else [],
                risk_note="AI 回复仅供护理参考，不构成医疗诊断建议。",
                created_at=now() - timedelta(hours=index * 3),
            )
        )


def main() -> None:
    random.seed(RANDOM_SEED)
    with SessionLocal() as db:
        truncate_business_tables(db)
        users = create_users(db)
        create_admins(db)
        patients = create_patients(db, users)
        create_care_records(db, patients)
        create_tasks(db, patients)
        create_knowledge(db, users)
        create_community(db, users)
        create_ai_logs(db, users[0], patients)
        db.commit()

    clear_redis_state()

    print("Demo data reset completed.")
    print(f"Users: {len(users)}")
    print(f"Patients: {len(patients)}")
    print("Care records: about 1,800")
    print("Care tasks: about 120")
    print("Knowledge articles: 48")
    print("Community posts: 80")
    print("AI logs: 90")
    print(f"Client account: {MAIN_USER_EMAIL} / {MAIN_USER_PASSWORD}")
    print(f"Admin account: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")


if __name__ == "__main__":
    main()
