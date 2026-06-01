import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import type { AssignClassPayload, AssignedTeacher } from "@/types/clerk";

export async function assignClass(payload: AssignClassPayload): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_CLASS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    const message =
      data?.non_field_errors?.[0] ||
      data?.detail ||
      data?.message ||
      "Failed to assign teacher";
    throw new Error(message);
  }
}

export async function getAssignedTeachers(
  divisionId: number | string
): Promise<AssignedTeacher[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.ASSIGN_CLASS}?division=${divisionId}`
  );

  if (!response.ok) {
    let message = "Failed to fetch assigned teachers.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results ?? data.data ?? [];
}
