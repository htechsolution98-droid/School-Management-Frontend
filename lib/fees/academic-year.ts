import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { normalizeList } from "./helpers";
import type { AcademicYear } from "@/types/fees";

export async function getAcademicYears(): Promise<AcademicYear[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-year/`);
  if (!response.ok) {
    let message = "Failed to fetch academic years.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch {}
    throw new Error(message);
  }
  return normalizeList<AcademicYear>(await response.json());
}

export async function createAcademicYear(payload: {
  name: string;
  start_month: number;
  end_month: number;
}): Promise<AcademicYear> {
  const response = await fetchWithAuth(`${API_BASE_URL}/academic-year/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Failed to create academic year.");
  }
  return data;
}
