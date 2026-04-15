export const routes = {
  home: "/",
  care: "/care",
  patients: "/patients",
  patientNew: "/patients/new",
  newPatient: "/patients/new",
  records: "/records",
  recordNew: "/records/new",
  newRecord: "/records/new",
  tasks: "/tasks",
  taskNew: "/tasks/new",
  newTask: "/tasks/new",
  aiAssistant: "/ai-assistant",
  aiConfirm: "/ai-confirm",
  knowledge: "/knowledge",
  profile: "/profile",
  adminLogin: "/admin/login",
  patientDetail(patientId: string) {
    return `${routes.patients}/${patientId}`;
  },
  patientEdit(patientId: string) {
    return `${routes.patients}/${patientId}/edit`;
  },
  healthTrend(patientId: string) {
    return `/health-trend/${patientId}`;
  },
  patientRecords(patientId: string) {
    return `${routes.records}?patient=${patientId}`;
  },
  patientTasks(patientId: string) {
    return `${routes.tasks}?patient=${patientId}`;
  },
} as const;

export const appRoutes = routes;

export function getPatientDetailRoute(patientId: string) {
  return `${routes.patients}/${patientId}`;
}

export function getPatientEditRoute(patientId: string) {
  return `${getPatientDetailRoute(patientId)}/edit`;
}

export function getHealthTrendRoute(patientId: string) {
  return `/health-trend/${patientId}`;
}

export function getPatientRecordsRoute(patientId: string) {
  return `${routes.records}?patient=${patientId}`;
}

export function getPatientTasksRoute(patientId: string) {
  return `${routes.tasks}?patient=${patientId}`;
}
