import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL } from "@/lib/config";
import { normalizeList } from "./helpers";
import type { FeeVerifyRecord } from "@/types/fees";

export async function getFeeVerifyList(): Promise<FeeVerifyRecord[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/fee_verify/`);
  if (!response.ok) throw new Error("Failed to fetch fee verification list.");
  return normalizeList<FeeVerifyRecord>(await response.json());
}

export async function verifyFee(admissionNumber: string): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/fee_verify/${admissionNumber}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fee_verified: true }),
  });
  if (!response.ok) throw new Error("Failed to verify fee.");
}
