import api from "./axios";

export async function getMyClassTeacherClasses() {
  const response = await api.get("/class-teacher-progress/my-classes");
  return response.data.data;
}

export async function getClassTeacherStudents(assignmentId) {
  const response = await api.get("/class-teacher-progress/my-classes/" + assignmentId + "/students");
  return response.data.data;
}

export async function saveProgressReportDraft(payload) {
  const response = await api.post("/class-teacher-progress/reports/drafts", payload);
  return response.data;
}
