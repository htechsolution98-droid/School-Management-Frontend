import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { normalizeList } from "./helpers";
import type { ComponentType, SalaryComponent } from "@/types/fees";

export async function getSalaryComponents(): Promise<SalaryComponent[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/salary-component/`);
  if (!response.ok) throw new Error("Failed to fetch salary components.");
  return normalizeList<SalaryComponent>(await response.json());
}

export async function createSalaryComponent(payload: {
  name: string;
  component_type: ComponentType;
}): Promise<SalaryComponent> {
  const response = await fetchWithAuth(`${API_BASE_URL}/salary-component/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || "Failed to create salary component");
  return data;
}
