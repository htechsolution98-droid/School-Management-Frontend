import { fetchWithAuth } from "@/lib/auth";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/config";
import type {
  AcademicYear,
  ApiResponse,
  CreateMonthlyFeePayload,
  CreateSingleFeePayload,
  DiscountPayload,
  FeeWiseClass,
  Student,
  StudentFee,
  StudentFeePayload,
  StudentForFee,
} from "@/types/fees";

export async function fetchStudents(): Promise<ApiResponse<Student[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/studentget/`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return { data: await response.json(), error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch students", success: false };
  }
}

export async function fetchAcademicYearsForFee(): Promise<ApiResponse<AcademicYear[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/academic-year/`);
    if (!response.ok) throw new Error("Failed to fetch academic years");
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.results ?? data.data ?? [], error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch academic years", success: false };
  }
}

export async function fetchFeeWiseClassesForFee(): Promise<ApiResponse<FeeWiseClass[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}`);
    if (!response.ok) throw new Error("Failed to fetch fee structures");
    const data = await response.json();
    return { data: Array.isArray(data) ? data : data.results ?? data.data ?? [], error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch fee structures", success: false };
  }
}

export async function fetchStudentFees(params?: {
  class_name?: string;
  billing_period?: string;
  search?: string;
  page?: number;
}): Promise<ApiResponse<{ results: StudentFee[]; count: number }>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.class_name) queryParams.append("class_name", params.class_name);
    if (params?.billing_period) queryParams.append("billing_period", params.billing_period);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`);
    if (!response.ok) throw new Error("Failed to fetch student fees");
    const data = await response.json();
    if (Array.isArray(data)) return { data: { results: data, count: data.length }, error: null, success: true };
    return { data: { results: data.results ?? data.data ?? [], count: data.count ?? data.total ?? 0 }, error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch student fees", success: false };
  }
}

export async function createMonthlyStudentFee(payload: CreateMonthlyFeePayload): Promise<ApiResponse<StudentFee>> {
  return createStudentFeeResponse(payload);
}

export async function createSingleStudentFee(payload: CreateSingleFeePayload): Promise<ApiResponse<StudentFee>> {
  return createStudentFeeResponse({ ...payload, billing_period: "" });
}

async function createStudentFeeResponse(payload: StudentFeePayload): Promise<ApiResponse<StudentFee>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create fee");
    return { data: await response.json(), error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to create fee", success: false };
  }
}

export async function addDiscountToStudentFee(
  feeId: number,
  payload: DiscountPayload
): Promise<ApiResponse<StudentFee>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/${feeId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to apply discount");
    return { data: await response.json(), error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to add discount", success: false };
  }
}

export async function deleteStudentFee(feeId: number): Promise<ApiResponse<null>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/${feeId}/`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete fee");
    return { data: null, error: null, success: true };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to delete fee", success: false };
  }
}

export async function createStudentFee(payload: StudentFeePayload): Promise<StudentFee> {
  const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || "Failed to create student fee.");
  return data;
}

export async function addDiscount(studentFeeId: number, payload: DiscountPayload): Promise<StudentFee> {
  const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/${studentFeeId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.detail || data?.message || "Failed to apply discount.");
  return data;
}

export async function getStudentsByFeeWiseClass(
  _feeWiseClassId: number,
  schoolClassId: number
): Promise<StudentForFee[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/fee-wise-class/?school_class=${schoolClassId}`);
  if (!response.ok) throw new Error("Failed to fetch students.");
  const data = await response.json();
  return Array.isArray(data) ? data : data.results ?? data.data ?? [];
}

export async function bulkCreateStudentFees(
  records: StudentFeePayload[]
): Promise<{ success: StudentFee[]; failed: { index: number; error: string }[] }> {
  const success: StudentFee[] = [];
  const failed: { index: number; error: string }[] = [];
  for (let i = 0; i < records.length; i++) {
    try {
      success.push(await createStudentFee(records[i]));
    } catch (error) {
      failed.push({ index: i, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  return { success, failed };
}
