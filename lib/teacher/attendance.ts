import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { fetchWithAuth } from "@/lib/auth";
import type {
  TodayAttendance,
  AttendanceRecord,
} from "@/types/teacher";

// ─── Get today's attendance ───────────────────────────────────────────────────

export async function getTodayAttendance(): Promise<TodayAttendance | null> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE_TODAY}`;
  const response = await fetchWithAuth(url);

  if (response.status === 404) {
    // No record yet — fresh day, not an error
    return null;
  }

  if (!response.ok) {
    let message = "Failed to fetch today's attendance.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

// ─── Mark attendance (check-in OR check-out) ─────────────────────────────────

export async function markAttendance(payload: {
  latitude: number;
  longitude: number;
}): Promise<void> {
  const url = `${API_BASE_URL}/attendance/`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Attendance action failed.";
    try {
      const err = await response.json();
      message =
        err?.non_field_errors?.[0] ||
        err?.detail ||
        err?.message ||
        message;
    } catch { }
    throw new Error(message);
  }
}

// ─── Get all attendance records (history) ────────────────────────────────────

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const url = `${API_BASE_URL}/attendance/`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch attendance history.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}
