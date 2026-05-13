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

        ai_response = unwrap(
            client.post(
                "/api/ai/assistant",
                json={
                    "message": f"帮我记录今天上午测量的血压，{patient_name}，收缩压130，舒张压85",
                    "conversationId": None,
                },
            )
        )
        assert_true(ai_response.get("draftType") == "record", "AI assistant did not return draftType=record")

    print("smoke test passed")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"smoke test failed: {exc}", file=sys.stderr)
        raise
