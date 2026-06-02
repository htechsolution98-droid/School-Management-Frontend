import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import type { TimetablePayload, TimetableRecord } from "@/types/clerk";

export async function getTimetable(
  classDivision: number,
  day?: string
): Promise<TimetableRecord[]> {
  const params = new URLSearchParams();
  params.set("class_division", String(classDivision));
  if (day) params.set("day", day);

  const response = await fetchWithAuth(`${API_BASE_URL}/timetable/?${params.toString()}`);

  if (!response.ok) {
    let message = "Failed to fetch timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results ?? data.data ?? [];
}

export async function createTimetable(
  payload: TimetablePayload
): Promise<TimetableRecord> {
  const response = await fetchWithAuth(`${API_BASE_URL}/timetable/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to create timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function updateTimetable(
  id: number,
  payload: TimetablePayload
): Promise<TimetableRecord> {
  const response = await fetchWithAuth(`${API_BASE_URL}/timetable/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to update timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
