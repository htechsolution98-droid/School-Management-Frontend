import { API_ENDPOINTS } from "@/lib/config";
import { apiFetch } from "./helpers";
import type { DashboardCount } from "@/types/principal";

export async function fetchDashboardCount(): Promise<DashboardCount> {
  return apiFetch<DashboardCount>(
    API_ENDPOINTS.DASHBOARD_COUNT,
    {},
    "Failed to fetch dashboard data."
  );
}
