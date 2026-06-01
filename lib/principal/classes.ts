import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { fetchWithAuth } from "@/lib/auth";
import { getErrorMessage, normalizeList } from "./helpers";
import type { SchoolClass } from "@/types/principal";

export async function getSchoolClasses(): Promise<SchoolClass[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.CLASSES}`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to fetch classes."));
  }

  return normalizeList<SchoolClass>(await response.json());
}

export async function getClasses(): Promise<SchoolClass[]> {
  return getSchoolClasses();
}

export async function saveSchoolClasses(classes: string[]): Promise<void> {
  const payload = classes.map((school_class) => ({ school_class }));
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.SCHOOL_CLASS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to save classes."));
  }
}

export async function deleteSchoolClass(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.SCHOOL_CLASS}${id}/`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to delete class."));
  }
}
