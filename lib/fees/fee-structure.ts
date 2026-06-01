import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { normalizeList } from "./helpers";
import type { FeeWiseClass, FeeWiseClassPayload } from "@/types/fees";

export async function getFeeWiseClasses(filters?: {
  school_class?: number;
  feetype?: number;
}): Promise<FeeWiseClass[]> {
  const params = new URLSearchParams();
  if (filters?.school_class) params.set("school_class", String(filters.school_class));
  if (filters?.feetype) params.set("feetype", String(filters.feetype));
  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) throw new Error("Failed to fetch class-wise fees.");
  return normalizeList<FeeWiseClass>(await response.json());
}

export async function createFeeWiseClass(payload: FeeWiseClassPayload): Promise<FeeWiseClass> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || JSON.stringify(data) || "Failed to create fee.");
  return data;
}

export async function updateFeeWiseClass(
  id: number,
  payload: Partial<FeeWiseClassPayload>
): Promise<FeeWiseClass> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || "Failed to update fee.");
  return data;
}

export async function deleteFeeWiseClass(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${id}/`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete fee.");
}
