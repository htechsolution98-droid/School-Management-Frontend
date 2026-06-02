import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import type { Teacher } from "@/types/clerk";

export async function getTeachers(): Promise<Teacher[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.GET_TEACHER}`);

  if (!response.ok) {
    let message = "Failed to fetch teachers.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.data ?? data.results ?? [];
}
