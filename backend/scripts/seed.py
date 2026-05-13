from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.admin import AdminUser
from app.models.care_metric import CareMetric
from app.models.care_record import CareRecord
from app.models.care_task import CareTask
from app.models.community import CommunityComment, CommunityPost
from app.models.knowledge import KnowledgeArticle, KnowledgeCategory
from app.models.patient import Patient
from app.models.user import User
from app.models.user_settings import UserNotificationSetting, UserPreference


def get_or_create_user(db) -> User:
    user = db.scalar(select(User).where(User.email == "caregiver@example.com"))
    if user is not None:
        user.status = "active"
        return user

    user = User(
        username="示例照顾者",
        email="caregiver@example.com",
        password_hash=hash_password("password123"),
    )
    db.add(user)
    db.flush()
    db.add(UserNotificationSetting(user_id=user.id))
    db.add(UserPreference(user_id=user.id))
    return user


def get_or_create_admin(db) -> AdminUser:
    admin = db.scalar(select(AdminUser).where(AdminUser.email == "admin@example.com"))
    if admin is not None:
        admin.status = "active"
        return admin

    admin = AdminUser(
        username="系统管理员",
        email="admin@example.com",
        password_hash=hash_password("admin123"),
        status="active",
    )
    db.add(admin)
    db.flush()
    return admin


def get_or_create_patient(db, user: User, name: str, age: int, gender: str, note: str) -> Patient:
    patient = db.scalar(select(Patient).where(Patient.user_id == user.id, Patient.name == name))
    if patient is not None:
        return patient

    patient = Patient(user_id=user.id, name=name, age=age, gender=gender, profile_note=note)
    db.add(patient)
    db.flush()
    return patient


def add_record_if_empty(db, patient: Patient) -> None:
    existing_record = db.scalar(select(CareRecord).where(CareRecord.patient_id == patient.id))
    if existing_record is not None:
        return

    now = datetime.now(timezone.utc)
    samples = [
        (now - timedelta(days=5), 128, 82),
        (now - timedelta(days=3), 132, 84),
        (now - timedelta(days=1), 130, 85),
    ]
    for occurred_at, systolic, diastolic in samples:
        record = CareRecord(
            patient_id=patient.id,
            record_type="blood_pressure",
            occurred_at=occurred_at,
            notes="种子数据：晨间血压记录",
            source="manual",
        )
        record.metrics = [
            CareMetric(metric_key="bloodPressureSystolic", value_numeric=systolic, unit="mmHg"),
            CareMetric(metric_key="bloodPressureDiastolic", value_numeric=diastolic, unit="mmHg"),
        ]
        db.add(record)


def add_task_if_empty(db, patient: Patient) -> None:
    existing_task = db.scalar(select(CareTask).where(CareTask.patient_id == patient.id))
    if existing_task is not None:
        return

    remind_time = datetime.now(timezone.utc) + timedelta(hours=12)
    db.add(
        CareTask(
            patient_id=patient.id,
            title="测量血压",
            description="每天早上为患者测量并记录血压。",
            task_type="blood_pressure",
            remind_time=remind_time,
            repeat_rule="daily",
            priority="normal",
            remind_offset_minutes=15,
            status="pending",
        )
    )


def get_or_create_knowledge_category(db, name: str, slug: str, description: str, sort_order: int) -> KnowledgeCategory:
    category = db.scalar(select(KnowledgeCategory).where(KnowledgeCategory.slug == slug))
    if category is not None:
        return category

    category = KnowledgeCategory(
        name=name,
        slug=slug,
        description=description,
        sort_order=sort_order,
    )
    db.add(category)
    db.flush()
    return category


def add_knowledge_articles_if_empty(db) -> None:
    existing_article = db.scalar(select(KnowledgeArticle))
    if existing_article is not None:
        return

    chronic = get_or_create_knowledge_category(
        db,
        name="慢病管理",
        slug="chronic",
        description="高血压、糖尿病等长期照护知识。",
        sort_order=1,
    )
    diet = get_or_create_knowledge_category(
        db,
        name="饮食护理",
        slug="diet",
        description="照护场景中的饮食搭配与营养观察。",
        sort_order=2,
    )
    rehab = get_or_create_knowledge_category(
        db,
        name="康复训练",
        slug="rehab",
        description="居家康复训练与活动安全提示。",
        sort_order=3,
    )
    symptoms = get_or_create_knowledge_category(
        db,
        name="常见症状处理",
        slug="symptoms",
        description="发热、头晕、乏力等常见状态观察。",
        sort_order=4,
    )
    now = datetime.now(timezone.utc)
    articles = [
        {
            "category": chronic,
            "title": "高血压患者的日常护理要点",
            "summary": "涵盖血压监测、用药管理、饮食控制及情绪调节等核心内容，适合家庭照顾者参考。",
            "content": "# 一、血压监测\n\n建议每天固定时间测量血压，记录收缩压、舒张压和测量时间。连续记录能帮助照顾者更早发现异常波动。\n\n# 二、饮食管理\n\n日常饮食应以低盐、清淡、均衡为原则，减少腌制食品和高盐调味品。照顾者可以协助准备易消化、富含蔬菜的餐食。\n\n# 三、用药提醒\n\n降压药应按医嘱规律服用，不要自行停药或调整剂量。如出现头晕、胸闷等明显不适，应及时联系专业医护人员。",
            "article_type": "article",
            "author_name": "李医生",
            "author_title": "心血管内科 · 主任医师",
            "source": "中国高血压防治指南",
            "read_time_minutes": 5,
            "cover_color": "primary",
            "view_count": 1234,
            "like_count": 156,
        },
        {
            "category": chronic,
            "title": "糖尿病患者血糖监测完整指南",
            "summary": "详解空腹血糖、餐后血糖的正确测量方法，以及常见血糖波动的护理应对策略。",
            "content": "# 一、监测时间\n\n常见监测时间包括空腹、餐后两小时和睡前。照顾者应帮助患者保持记录连续性。\n\n# 二、异常观察\n\n如果血糖持续偏高或偏低，应结合饮食、活动量和用药情况记录，并及时咨询医生。",
            "article_type": "article",
            "author_name": "张护士",
            "author_title": "内分泌科 · 护师",
            "source": "中国糖尿病护理标准",
            "read_time_minutes": 7,
            "cover_color": "blue",
            "view_count": 987,
            "like_count": 102,
        },
        {
            "category": diet,
            "title": "老年人三餐营养搭配原则",
            "summary": "基于老年人消化特点，提供低盐、低脂、高纤维的日常饮食搭配建议。",
            "content": "# 一、少量多样\n\n老年人三餐应兼顾主食、优质蛋白和蔬菜水果。照顾者可根据吞咽、咀嚼和消化状态调整软硬度。\n\n# 二、观察反馈\n\n关注餐后腹胀、食欲下降、便秘等状态，必要时记录并反馈给医生或营养师。",
            "article_type": "article",
            "author_name": "王营养师",
            "author_title": "营养科 · 主管营养师",
            "source": "中国营养学会",
            "read_time_minutes": 6,
            "cover_color": "accent",
            "view_count": 856,
            "like_count": 89,
        },
        {
            "category": rehab,
            "title": "卧床患者的预防压疮护理技巧",
            "summary": "系统介绍皮肤检查、体位变换、气垫使用等预防压疮的护理操作方法。",
            "content": "# 一、定时翻身\n\n长期卧床患者应定时变换体位，避免同一部位持续受压。翻身时动作要平稳，保护骨突部位。\n\n# 二、皮肤检查\n\n每天观察骶尾部、足跟、髋部等易受压位置，发现发红、破损或渗液应及时处理。",
            "article_type": "article",
            "author_name": "陈护师",
            "author_title": "康复科 · 主管护师",
            "source": "临床护理实践指南",
            "read_time_minutes": 8,
            "cover_color": "blue",
            "view_count": 723,
            "like_count": 76,
        },
        {
            "category": rehab,
            "title": "脑卒中患者上肢康复训练方案",
            "summary": "分阶段说明脑卒中后上肢功能康复训练动作，适合居家照顾者辅助患者练习。",
            "content": "# 一、训练前准备\n\n训练前应确认患者精神状态、疼痛情况和关节活动范围。动作以缓慢、可控、不诱发疼痛为原则。\n\n# 二、分阶段训练\n\n早期以被动活动和摆位为主，随后逐步加入辅助主动运动。照顾者应记录训练时间和患者反应。",
            "article_type": "video",
            "author_name": "赵康复师",
            "author_title": "康复医学科 · 副主任治疗师",
            "source": "国家康复医学指南",
            "read_time_minutes": 12,
            "cover_color": "primary",
            "view_count": 612,
            "like_count": 61,
        },
        {
            "category": symptoms,
            "title": "老年人发热的护理与观察要点",
            "summary": "如何判断发热程度、正确处理发热症状、何时需要及时就医。",
            "content": "# 一、记录体温\n\n发热时应记录体温、测量时间、伴随症状和处理措施。避免只凭体感判断严重程度。\n\n# 二、及时就医\n\n如果出现高热不退、意识改变、呼吸困难或明显脱水，应及时联系专业医护人员。",
            "article_type": "article",
            "author_name": "刘护士",
            "author_title": "急诊科 · 主管护师",
            "source": "家庭护理手册",
            "read_time_minutes": 5,
            "cover_color": "warm",
            "view_count": 534,
            "like_count": 44,
        },
    ]

    for index, item in enumerate(articles):
        db.add(
            KnowledgeArticle(
                category_id=item["category"].id,
                title=item["title"],
                summary=item["summary"],
                content=item["content"],
                article_type=item["article_type"],
                author_name=item["author_name"],
                author_title=item["author_title"],
                source=item["source"],
                read_time_minutes=item["read_time_minutes"],
                cover_color=item["cover_color"],
                status="published",
                view_count=item["view_count"],
                like_count=item["like_count"],
                published_at=now - timedelta(days=index),
            )
        )


def add_community_seed_if_empty(db, user: User) -> None:
    existing_post = db.scalar(select(CommunityPost))
    if existing_post is not None:
        return

    posts = [
        CommunityPost(
            author_id=user.id,
            title="分享一个测血压的小技巧",
            content="测血压前建议让患者安静休息至少5分钟，袖带位置和手臂高度都要尽量保持稳定。我在照护记录里会同时写下测量时间，便于后续看趋势。",
            tag="experience",
            status="passed",
            like_count=24,
            comment_count=1,
        ),
        CommunityPost(
            author_id=user.id,
            title="老年糖尿病患者的饮食记录表格",
            content="我把每天三餐、加餐和血糖监测时间整理成一个表格，家属轮班时也能看懂当天情况。重点是记录要简单，避免大家坚持不下来。",
            tag="tools",
            status="passed",
            like_count=36,
            comment_count=1,
        ),
        CommunityPost(
            author_id=user.id,
            title="照顾卧床老人时如何预防压疮？",
            content="最近家里老人卧床时间比较长，想请教大家翻身、皮肤观察和床垫选择方面有哪些经验。",
            tag="question",
            status="pending",
            like_count=0,
            comment_count=0,
        ),
    ]
    for post in posts:
        db.add(post)
    db.flush()

    db.add(
        CommunityComment(
            post_id=posts[0].id,
            author_id=user.id,
            content="非常实用。固定时间测量和连续记录确实能减少很多误判。",
            status="passed",
        )
    )
    db.add(
        CommunityComment(
            post_id=posts[1].id,
            author_id=user.id,
            content="这个表格思路很好，我也准备给家里人做一版。",
            status="pending",
        )
    )


def main() -> None:
    with SessionLocal() as db:
        user = get_or_create_user(db)
        get_or_create_admin(db)
        zhang_ming = get_or_create_patient(
            db,
            user,
            name="张明",
            age=68,
            gender="男",
            note="高血压长期管理，需每日记录血压并观察头晕、乏力等状态。",
        )
        get_or_create_patient(
            db,
            user,
            name="李芳",
            age=72,
            gender="女",
            note="术后康复期，重点关注饮食、活动量和夜间休息。",
        )
        add_record_if_empty(db, zhang_ming)
        add_task_if_empty(db, zhang_ming)
        add_knowledge_articles_if_empty(db)
        add_community_seed_if_empty(db, user)
        db.commit()
        print("Seed completed.")
        print("Login email: caregiver@example.com")
        print("Password: password123")
        print("Admin email: admin@example.com")
        print("Admin password: admin123")


if __name__ == "__main__":
    main()
