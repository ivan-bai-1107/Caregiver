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
import { TaskListPage } from "./pages/TaskListPage";
import { TaskFormPage } from "./pages/TaskFormPage";
import { HealthTrendPage } from "./pages/HealthTrendPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { AIConfirmPage } from "./pages/AIConfirmPage";
import { KnowledgeListPage } from "./pages/KnowledgeListPage";
import { KnowledgeDetailPage } from "./pages/KnowledgeDetailPage";
import { CommunityListPage } from "./pages/CommunityListPage";
import { CommunityDetailPage } from "./pages/CommunityDetailPage";
import { PostFormPage } from "./pages/PostFormPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSubPage } from "./pages/ProfileSubPage";
import { CareWorkflowPage } from "./pages/CareWorkflowPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminReviewsPage } from "./pages/admin/AdminReviewsPage";
import { AdminContentPage } from "./pages/admin/AdminContentPage";
import { AdminPromptPage } from "./pages/admin/AdminPromptPage";
import { AdminAILogPage } from "./pages/admin/AdminAILogPage";
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
