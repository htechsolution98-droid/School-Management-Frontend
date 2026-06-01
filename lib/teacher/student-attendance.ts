import { API_BASE_URL } from "@/lib/config";
import { fetchWithAuth } from "@/lib/auth";
import type {
  StudentAttendanceListResponse,
  StudentAttendancePayload,
} from "@/types/teacher";

// ─── GET /get/attendance/students/ ────────────────────────────────────────────

export async function getStudentsForAttendance(): Promise<StudentAttendanceListResponse> {
  const url = `${API_BASE_URL}/get/attendance/students/`;
  const response = await fetchWithAuth(url);

  const data = await response.json();

  // Handle "not assigned as class teacher" case
  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || "Failed to fetch students for attendance."
    );
  }

  return data;
}

// ─── POST /student-attendance/ ────────────────────────────────────────────────

export async function submitStudentAttendance(
  records: StudentAttendancePayload[]
): Promise<void> {
  const url = `${API_BASE_URL}/student-attendance/`;

  const promises = records.map((record) =>
    fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
  );

  const responses = await Promise.all(promises);

  for (const res of responses) {
    if (!res.ok) {
      let message = "Failed to submit student attendance.";
      try {
        const err = await res.json();
        message = err?.detail || err?.message || message;
      } catch { }
      throw new Error(message);
    }
  }
}
