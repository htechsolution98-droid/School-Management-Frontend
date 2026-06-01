import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import { normalizeList } from "./helpers";
import type { GenerateSalaryPayload, SalaryPayment } from "@/types/fees";

export async function getSalaryPayments(month?: string): Promise<SalaryPayment[]> {
  const params = new URLSearchParams();
  if (month) params.set("salary_month", month);
  const url = `${API_BASE_URL}${API_ENDPOINTS.STAFF_SALARY_PAYMENT}${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetchWithAuth(url);
  if (!response.ok) throw new Error("Failed to fetch salary payments.");
  return normalizeList<SalaryPayment>(await response.json());
}

export async function generateSalary(payload: GenerateSalaryPayload): Promise<SalaryPayment> {
  const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.STAFF_SALARY_PAYMENT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || "Failed to generate salary");
  return data;
}
