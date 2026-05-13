import { createBrowserRouter } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "@/features/home/pages/HomePage";
import { PatientListPage } from "./pages/PatientListPage";
import { PatientDetailPage } from "@/features/patients/pages/PatientDetailPage";
import { PatientFormPage } from "./pages/PatientFormPage";
import { RecordListPage } from "./pages/RecordListPage";
import { RecordFormPage } from "@/features/records/pages/RecordFormPage";
import { TaskListPage } from "@/features/tasks/pages/TaskListPage";
import { TaskFormPage } from "@/features/tasks/pages/TaskFormPage";
import { HealthTrendPage } from "./pages/HealthTrendPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { AIConfirmPage } from "./pages/AIConfirmPage";
import { KnowledgeListPage } from "@/features/knowledge/pages/KnowledgeListPage";
import { KnowledgeDetailPage } from "@/features/knowledge/pages/KnowledgeDetailPage";
import { CommunityListPage } from "@/features/community/pages/CommunityListPage";
import { CommunityDetailPage } from "@/features/community/pages/CommunityDetailPage";
import { PostFormPage } from "@/features/community/pages/PostFormPage";
import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { ProfileSubPage } from "@/features/profile/pages/ProfileSubPage";
import { CareWorkflowPage } from "@/features/care/pages/CareWorkflowPage";
import { AdminLoginPage } from "@/features/admin/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { AdminReviewsPage } from "@/features/admin/pages/AdminReviewsPage";
import { AdminContentPage } from "@/features/admin/pages/AdminContentPage";
import { AdminPromptPage } from "@/features/admin/pages/AdminPromptPage";
import { AdminAILogPage } from "@/features/admin/pages/AdminAILogPage";
import { AdminLayout } from "./components/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { path: "dashboard", Component: AdminDashboardPage },
      { path: "users", Component: AdminUsersPage },
      { path: "reviews", Component: AdminReviewsPage },
      { path: "content", Component: AdminContentPage },
      { path: "prompts", Component: AdminPromptPage },
      { path: "ai-logs", Component: AdminAILogPage },
    ],
  },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "care", Component: CareWorkflowPage },
      { path: "patients", Component: PatientListPage },
      { path: "patients/new", Component: PatientFormPage },
      { path: "patients/:id", Component: PatientDetailPage },
      { path: "patients/:id/edit", Component: PatientFormPage },
      { path: "records", Component: RecordListPage },
      { path: "records/new", Component: RecordFormPage },
      { path: "tasks", Component: TaskListPage },
      { path: "tasks/new", Component: TaskFormPage },
      { path: "health-trend/:patientId", Component: HealthTrendPage },
      { path: "ai-assistant", Component: AIAssistantPage },
      { path: "ai-confirm", Component: AIConfirmPage },
      { path: "knowledge", Component: KnowledgeListPage },
      { path: "knowledge/:id", Component: KnowledgeDetailPage },
      { path: "community", Component: CommunityListPage },
      { path: "community/new", Component: PostFormPage },
      { path: "community/:id", Component: CommunityDetailPage },
      { path: "profile", Component: ProfilePage },
      { path: "profile/:section", Component: ProfileSubPage },
    ],
  },
]);
