from app.models.ai_log import AiAssistantLog
from app.models.admin import AdminUser, PromptTemplate
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
from app.models.knowledge import (
    KnowledgeArticle,
    KnowledgeCategory,
    UserKnowledgeBookmark,
    UserKnowledgeLike,
)
from app.models.patient import Patient
from app.models.user import EmailVerificationCode, User
from app.models.user_settings import UserNotificationSetting, UserPreference

__all__ = [
    "AiAssistantLog",
    "AdminUser",
    "CareMetric",
    "CareRecord",
    "CareTask",
    "CommunityComment",
    "CommunityPost",
    "CommunityPostBookmark",
    "CommunityPostLike",
    "CommunityPostReport",
    "EmailVerificationCode",
    "KnowledgeArticle",
    "KnowledgeCategory",
    "Patient",
    "PromptTemplate",
    "User",
    "UserKnowledgeBookmark",
    "UserKnowledgeLike",
    "UserNotificationSetting",
    "UserPreference",
]
