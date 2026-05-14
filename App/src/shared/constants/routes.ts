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
    return `${routes.records}?patient=${encodeURIComponent(patientId)}`;
  },
  patientTasks(patientId: string) {
    return `${routes.tasks}?patient=${encodeURIComponent(patientId)}`;
  },
  newRecordForPatient(patientId: string) {
    return `${routes.newRecord}?patient=${encodeURIComponent(patientId)}`;
  },
  newTaskForPatient(patientId: string) {
    return `${routes.newTask}?patient=${encodeURIComponent(patientId)}`;
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
  return `${routes.records}?patient=${encodeURIComponent(patientId)}`;
}

export function getPatientTasksRoute(patientId: string) {
  return `${routes.tasks}?patient=${encodeURIComponent(patientId)}`;
}

export function getNewRecordForPatientRoute(patientId: string) {
  return `${routes.newRecord}?patient=${encodeURIComponent(patientId)}`;
}

export function getNewTaskForPatientRoute(patientId: string) {
  return `${routes.newTask}?patient=${encodeURIComponent(patientId)}`;
}
