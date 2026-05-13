from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000").rstrip("/")
SEED_EMAIL = "caregiver@example.com"
SEED_PASSWORD = "password123"


def unwrap(response: httpx.Response) -> Any:
    try:
        payload = response.json()
    except ValueError as exc:
        raise AssertionError(f"{response.request.method} {response.request.url} returned non-JSON") from exc

    if response.status_code >= 400:
        message = payload.get("message") if isinstance(payload, dict) else response.text
        raise AssertionError(
            f"{response.request.method} {response.request.url} failed "
            f"with {response.status_code}: {message}"
        )

    if isinstance(payload, dict) and payload.get("success") is False:
        raise AssertionError(f"{response.request.method} {response.request.url} returned success=false")

    if isinstance(payload, dict) and "data" in payload:
        return payload["data"]
    return payload


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def assert_ai_base_shape(data: dict[str, Any], expected_intent: str, expected_draft_type: str | None) -> None:
    assert_true(data.get("intent") == expected_intent, f"AI intent should be {expected_intent}")
    assert_true(data.get("draftType") == expected_draft_type, f"AI draftType should be {expected_draft_type}")
    assert_true(isinstance(data.get("conversationId"), str) and data["conversationId"], "AI conversationId missing")
    assert_true(isinstance(data.get("answerText"), str) and data["answerText"], "AI answerText missing")
    assert_true(isinstance(data.get("sources"), list), "AI sources must be a list")
    assert_true(isinstance(data.get("riskNote"), str) and data["riskNote"], "AI riskNote missing")


def assert_record_draft(data: dict[str, Any], patient_id: str) -> None:
    assert_ai_base_shape(data, "care_record", "record")
    draft = data.get("draftPayload")
    assert_true(isinstance(draft, dict), "record draftPayload must be an object")
    assert_true(draft.get("patientId") == patient_id, "record draft patientId did not match created patient")
    assert_true(draft.get("recordType") == "blood_pressure", "record draft recordType should be blood_pressure")
    assert_true(isinstance(draft.get("occurredAt"), str) and draft["occurredAt"], "record draft occurredAt missing")
    assert_true(isinstance(draft.get("notes"), str), "record draft notes must be a string")
    metrics = draft.get("metrics")
    assert_true(isinstance(metrics, dict), "record draft metrics must be an object")
    assert_true(metrics.get("bloodPressureSystolic") == "130", "systolic metric should be split into its own field")
    assert_true(metrics.get("bloodPressureDiastolic") == "85", "diastolic metric should be split into its own field")
    assert_true("bloodPressure" not in metrics, "blood pressure must not be stored as a combined metric")


def assert_task_draft(data: dict[str, Any], patient_id: str) -> None:
    assert_ai_base_shape(data, "care_task", "task")
    draft = data.get("draftPayload")
    assert_true(isinstance(draft, dict), "task draftPayload must be an object")
    assert_true(draft.get("patientId") == patient_id, "task draft patientId did not match created patient")
    assert_true(isinstance(draft.get("title"), str) and draft["title"], "task draft title missing")
    assert_true(draft.get("taskType") == "blood_pressure", "task draft taskType should be blood_pressure")
    assert_true(draft.get("repeatRule") == "daily", "task draft repeatRule should be daily")
    assert_true(draft.get("priority") == "normal", "task draft priority should be normal")
    assert_true(isinstance(draft.get("remindOffsetMinutes"), int), "task draft remindOffsetMinutes must be integer")


def assert_knowledge_flow(client: httpx.Client) -> None:
    categories = unwrap(client.get("/api/knowledge/categories"))
    assert_true(isinstance(categories, list) and len(categories) > 0, "knowledge categories should not be empty")

    articles_page = unwrap(
        client.get(
            "/api/knowledge/articles",
            params={"q": "护理", "categoryId": categories[0]["id"], "page": 1, "pageSize": 10},
        )
    )
    if not articles_page.get("items"):
        articles_page = unwrap(client.get("/api/knowledge/articles", params={"page": 1, "pageSize": 10}))

    articles = articles_page.get("items", [])
    assert_true(isinstance(articles, list) and len(articles) > 0, "knowledge articles should not be empty")
    article_id = articles[0].get("id")
    assert_true(isinstance(article_id, str) and article_id, "knowledge article id missing")

    detail = unwrap(client.get(f"/api/knowledge/articles/{article_id}"))
    assert_true(detail.get("id") == article_id, "knowledge detail returned unexpected article")
    assert_true(isinstance(detail.get("content"), str) and detail["content"], "knowledge detail content missing")

    related = unwrap(client.get(f"/api/knowledge/articles/{article_id}/related"))
    assert_true(isinstance(related, list), "knowledge related articles must be a list")

    viewed = unwrap(client.post(f"/api/knowledge/articles/{article_id}/view", json={}))
    assert_true(viewed.get("articleId") == article_id, "knowledge view action returned unexpected article")
    assert_true(isinstance(viewed.get("viewCount"), int), "knowledge viewCount must be integer")

    liked = unwrap(client.post(f"/api/knowledge/articles/{article_id}/like", json={}))
    assert_true(liked.get("isLiked") is True, "knowledge like should mark article as liked")

    bookmarked = unwrap(client.post(f"/api/knowledge/articles/{article_id}/bookmark", json={}))
    assert_true(bookmarked.get("isBookmarked") is True, "knowledge bookmark should mark article as bookmarked")

    removed = unwrap(client.delete(f"/api/knowledge/articles/{article_id}/bookmark"))
    assert_true(removed.get("isBookmarked") is False, "knowledge bookmark delete should clear bookmark")


def main() -> None:
    now = datetime.now(timezone.utc)
    unique_suffix = now.strftime("%Y%m%d%H%M%S")
    patient_name = f"冒烟测试患者{unique_suffix}"

    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        login_data = unwrap(
            client.post(
                "/api/auth/login",
                json={"email": SEED_EMAIL, "password": SEED_PASSWORD},
            )
        )
        token = login_data.get("token") if isinstance(login_data, dict) else None
        assert_true(isinstance(token, str) and len(token) > 10, "login did not return a token")

        client.headers.update({"Authorization": f"Bearer {token}"})

        me = unwrap(client.get("/api/users/me"))
        assert_true(me.get("email") == SEED_EMAIL, "GET /api/users/me returned unexpected user")

        patient = unwrap(
            client.post(
                "/api/patients",
                json={
                    "name": patient_name,
                    "age": 66,
                    "gender": "男",
                    "profileNote": "API smoke test patient",
                },
            )
        )
        patient_id = patient.get("id")
        assert_true(isinstance(patient_id, str) and patient_id, "POST /api/patients did not return patient id")

        patient_page = unwrap(
            client.get(
                "/api/patients",
                params={"keyword": patient_name, "page": 1, "pageSize": 5},
            )
        )
        assert_true(
            any(item.get("id") == patient_id for item in patient_page.get("items", [])),
            "GET /api/patients query did not include created patient",
        )

        record = unwrap(
            client.post(
                "/api/care-records",
                json={
                    "patientId": patient_id,
                    "recordType": "blood_pressure",
                    "occurredAt": now.isoformat(),
                    "notes": "API smoke test blood pressure record",
                    "source": "manual",
                    "metrics": [
                        {"key": "bloodPressureSystolic", "value": 131, "unit": "mmHg"},
                        {"key": "bloodPressureDiastolic", "value": 86, "unit": "mmHg"},
                    ],
                },
            )
        )
        record_id = record.get("id")
        assert_true(isinstance(record_id, str) and record_id, "POST /api/care-records did not return record id")

        records_page = unwrap(
            client.get(
                "/api/care-records",
                params={
                    "patientId": patient_id,
                    "recordType": "blood_pressure",
                    "page": 1,
                    "pageSize": 10,
                },
            )
        )
        assert_true(
            any(item.get("id") == record_id for item in records_page.get("items", [])),
            "GET /api/care-records query did not include created record",
        )

        trend = unwrap(
            client.get(
                f"/api/patients/{patient_id}/metrics/trend",
                params={"metricType": "blood_pressure_systolic"},
            )
        )
        assert_true(
            any(point.get("value") == 131 for point in trend.get("points", [])),
            "trend query did not include created systolic metric",
        )

        task = unwrap(
            client.post(
                "/api/tasks",
                json={
                    "patientId": patient_id,
                    "title": "API smoke test task",
                    "description": "Complete this task during API smoke test",
                    "taskType": "blood_pressure",
                    "remindTime": (now + timedelta(hours=1)).isoformat(),
                    "repeatRule": "once",
                    "priority": "normal",
                    "remindOffsetMinutes": 15,
                    "status": "pending",
                },
            )
        )
        task_id = task.get("id")
        assert_true(isinstance(task_id, str) and task_id, "POST /api/tasks did not return task id")

        tasks_page = unwrap(
            client.get(
                "/api/tasks",
                params={
                    "patientId": patient_id,
                    "status": "pending",
                    "repeatRule": "once",
                    "page": 1,
                    "pageSize": 10,
                },
            )
        )
        assert_true(
            any(item.get("id") == task_id for item in tasks_page.get("items", [])),
            "GET /api/tasks query did not include created task",
        )

        completed_task = unwrap(client.post(f"/api/tasks/{task_id}/complete", json={}))
        assert_true(completed_task.get("status") == "completed", "task completion did not set status=completed")

        assert_knowledge_flow(client)

        qa_response = unwrap(
            client.post(
                "/api/ai/assistant",
                json={
                    "message": "高血压患者在日常饮食上需要注意哪些事项？",
                    "conversationId": None,
                },
            )
        )
        assert_ai_base_shape(qa_response, "qa", None)
        assert_true(qa_response.get("draftPayload") is None, "QA draftPayload must be null")

        record_draft_response = unwrap(
            client.post(
                "/api/ai/assistant",
                json={
                    "message": f"帮我记录今天上午测量的血压，{patient_name}，收缩压130，舒张压85",
                    "conversationId": None,
                },
            )
        )
        assert_record_draft(record_draft_response, patient_id)

        task_draft_response = unwrap(
            client.post(
                "/api/ai/assistant",
                json={
                    "message": f"帮我创建一个每天早上8点给{patient_name}测血压的任务",
                    "conversationId": None,
                },
            )
        )
        assert_task_draft(task_draft_response, patient_id)

    print("smoke test passed")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"smoke test failed: {exc}", file=sys.stderr)
        raise
