import { API_BASE_URL } from "@/lib/config";
import { fetchWithAuth } from "@/lib/auth";
import { getErrorMessage, normalizeList } from "./helpers";
import type { TempUser } from "@/types/principal";

export async function getTempUsersForPrincipal(): Promise<TempUser[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/tempusers/`);

  if (!response.ok) {
    throw new Error("Failed to fetch temp users");
  }

  return normalizeList<TempUser>(await response.json());
}

export async function activateTempUser(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/tempusers/${id}/activate/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: true }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to activate user."));
  }
}

export async function deactivateTempUser(id: number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/tempusers/${id}/activate/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: false }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to deactivate user."));
  }
}

export async function deactivateAllTempUsers(): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/tempusers/deactivate-all/`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to deactivate all users."));
  }
}
