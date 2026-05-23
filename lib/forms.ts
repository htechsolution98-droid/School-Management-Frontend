import { API_BASE_URL, API_ENDPOINTS } from "./config"
import { fetchWithAuth } from "./auth"
import type {
  AdmissionFormCreatePayload,
  AdmissionFormResponse,
  PublicAdmissionForm,
} from "./form-builder-config"
import { z } from "zod"

const FORMS_URL = `${API_BASE_URL}${API_ENDPOINTS.FORMS}`

export async function getAdmissionForms(): Promise<AdmissionFormResponse[]> {
  const response = await fetchWithAuth(FORMS_URL)

  if (!response.ok) {
    let message = "Failed to fetch forms."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore malformed error bodies.
    }
    throw new Error(message)
  }

  const data = await response.json()
  // Handle both paginated { results: [...] }, wrapped { data: [...] }, and plain array responses
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function createAdmissionForm(
  payload: AdmissionFormCreatePayload
): Promise<AdmissionFormResponse> {
  const response = await fetchWithAuth(FORMS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Failed to create form."
    try {
      const err = await response.json()
      const fieldErrors = Object.values(err || {})
        .flat()
        .filter((value): value is string => typeof value === "string")
      message = err?.detail || err?.message || fieldErrors[0] || message
    } catch {
      // Ignore malformed error bodies.
    }
    throw new Error(message)
  }

  return response.json()
}

export async function getPublicFormFields(): Promise<PublicAdmissionForm[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FIELDS}`
  const response = await fetchWithAuth(url) // Note: Public fetch

  if (!response.ok) {
    let message = "Failed to fetch form fields."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  // return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
  return data;
}

export interface SchoolClass {
  id: number
  school_class: string
}

export async function getSchoolClasses(): Promise<SchoolClass[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.CLASSES}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch classes."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function deleteSchoolClass(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SCHOOL_CLASS}${id}/`
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Failed to delete class."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

// change full function -- S
export const getClasses = async (): Promise<SchoolClass[]> => {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.CLASSES}`
  );

  console.log("res : ", response)

  if (!response.ok) {
    throw new Error("Failed to fetch classes");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? []);
};

// change full function -- S
export async function toggleFormStatus(
  formId: number,
  is_active: boolean,
): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FORM_STATUS}${formId}/`

  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      is_active,
    }),
  })

  if (!response.ok) {
    let message = "Failed to update form status."

    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }

    throw new Error(message)
  }
}

// ✅ AFTER — uses fetchWithAuth, sends Bearer token
export async function getPublishedFormLink(): Promise<{ form_link: string }> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FORM_LINK}`

  const response = await fetchWithAuth(url)  // ← only this line changes

  if (!response.ok) {
    let message = "Failed to fetch form link."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()

  if (data.form_link && data.form_link.startsWith("/")) {
    const baseUrl = (API_BASE_URL || "").endsWith("/")
      ? (API_BASE_URL || "").slice(0, -1)
      : (API_BASE_URL || "")

    data.form_link = `${baseUrl}${data.form_link}`
  }

  return data
}

// ─── Principal Dashboard ──────────────────────────────────────────────────────

export interface DashboardCount {
  total_student: number;
  total_staff: number;
  admission_not_complete: number;
}

export async function fetchDashboardCount(): Promise<DashboardCount> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_COUNT}`
  );

  if (!response.ok) {
    let message = "Failed to fetch dashboard data.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

export async function saveSchoolClasses(classes: string[]): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SCHOOL_CLASS}`
  const payload = classes.map((c) => ({ school_class: c }))
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Failed to save classes."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export interface Division {
  id?: number
  SchoolClass: number | null
  class_name?: string
  division: string
  capacity: number | null
}

export async function getDivisions(): Promise<Division[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.DIVISION_SET}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch divisions."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function saveDivision(payload: Division): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.DIVISION_SET}`
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Failed to save division."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export async function deleteDivision(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.DIVISION_SET}${id}/`
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Failed to delete division."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export interface Subject {
  id?: number
  name: string
  division: number | null
}

export async function getSubjects(): Promise<Subject[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SET_SUBJECT}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch subjects."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }

  const data = await response.json()

  // ✅ Handle { data: [...], message: "..." } shape from your API
  return Array.isArray(data)
    ? data
    : (data.data ?? data.results ?? [])
}


export async function saveSubject(payload: Subject): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SET_SUBJECT}`
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Failed to save subject."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export async function deleteSubject(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SET_SUBJECT}${id}/`
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Failed to delete subject."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export interface Syllabus {
  id?: number
  syllabus_file: string | File | null
  division: number | null
  subject: number | null
}

export async function getSyllabusList(): Promise<Syllabus[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SYLLABUS}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch syllabus."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function saveSyllabus(payload: Syllabus): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SYLLABUS}`

  const formData = new FormData()
  if (payload.syllabus_file instanceof File) {
    formData.append("syllabus_file", payload.syllabus_file)
  }
  if (payload.division) formData.append("division", payload.division.toString())
  if (payload.subject) formData.append("subject", payload.subject.toString())

  const response = await fetchWithAuth(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    let message = "Failed to save syllabus."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export async function deleteSyllabus(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SYLLABUS}${id}/`
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  })

  if (!response.ok) {
    let message = "Failed to delete syllabus."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }
}

export interface Teacher {
  id: number
  name: string
}

export async function getTeachers(): Promise<Teacher[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_TEACHER}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch teachers."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {
      // Ignore
    }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export interface AssignClassPayload {
  is_class_teacher: boolean
  teacher: number
  subject: number
  division: number
}

export async function assignClass(payload: AssignClassPayload): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ASSIGN_CLASS}`
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = await response.json();
    const msg =
      data?.non_field_errors?.[0] ||        // ← API error
      data?.detail ||
      "Failed to assign teacher";
    throw new Error(msg);
  }
}

// add this function -- S
export interface TempUser {
  id: number
  admission_number: string
  school: number
  form: number
  status: string
}


export async function getTempUsers(): Promise<TempUser[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_TEMP_USER_DATA}`

  const response = await fetchWithAuth(url)

  if (!response.ok) {
    throw new Error("Failed to fetch temp users")
  }

  const data = await response.json()

  return Array.isArray(data)
    ? data
    : (data.data ?? data.results ?? [])
}

// add this function -- S
export async function createSubmission(payload: any) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/submissions/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    let message = "Failed to create submission";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        JSON.stringify(err) ||
        message;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}

export async function updateSubmission(
  id: string,
  payload: any
) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/submissions/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    let message = "Failed to update submission";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        JSON.stringify(err) ||
        message;
    } catch {
      // ignore
    }

    throw new Error(message);
  }

  return response.json();
}

export async function submitDocuments(payload: {
  admission_number: string;
  documents: { document_field: number; file: File }[];
}): Promise<any> {
  const formData = new FormData();
  formData.append("admission_number", payload.admission_number);

  payload.documents.forEach((doc) => {
    formData.append("document_field", String(doc.document_field));
    formData.append("file", doc.file);
  });

  const response = await fetchWithAuth(
    `${API_BASE_URL}/documentsubmission/`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    let message = "Document submission failed";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  // console.log("SUBMIT DOCUMENTS RESPONSE:", data); // ← check what comes back

  // handle if response is array, take first item
  return Array.isArray(data) ? data[0] : data;
}

export async function createRazorOrder(payload: {
  amount: number;
  admission_number: string;
}) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.RAZOR_ORDER}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admission_number: payload.admission_number,
        amount: payload.amount * 100,  // ← convert rupees → paise
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Order creation failed"
    );
  }

  return data;
}


//this is the rozerpay logic
export async function verifyRazorPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  admission_number: string;
  pay_process?: boolean;
}) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Payment verification failed"
    );
  }

  return data;
}

export async function createOfflinePayment(payload: {
  amount: number;
  admission_number: string;
  pay_process?: boolean;
}) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/offline/payment/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Offline payment failed"
    );
  }

  return data;
}

// Add this 
export interface FeeVerifyRecord {
  id: number
  school: number
  admission_number: string
  fee_amount: number | null
  status: string
  fee_verified: boolean
  fee_verified_at: string | null
  fee_data: {
    id: number
    amount: number
    currency: string
    payment_mode: "online" | "offline"
    fee_verify: boolean
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    paid_at: string
    created_at: string
  } | null
  field_values: {
    id: number
    field: number
    field_label: string
    value: string
  }[]
}

export async function getFeeVerifyList(): Promise<FeeVerifyRecord[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/fee_verify/`
  )

  if (!response.ok) {
    let message = "Failed to fetch fee verification list."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function verifyFee(admissionNumber: string): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/fee_verify/${admissionNumber}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fee_verified: true,
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to verify fee.";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        message;
    } catch { }

    throw new Error(message);
  }
}

export interface Admission {
  id: number
  admission_number: string
  status: "pending" | "approved" | "rejected"
  gr_no?: string | null
  field_values: {
    id: number
    field: number
    field_label: string
    value: string
  }[]
  documents: {
    id: number
    document_field: number
    document_label: string
    file: string
  }[]
}

export async function fetchAdmissions(): Promise<Admission[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/admissionview/`
  )

  if (!response.ok) {
    let message = "Failed to fetch admissions."

    try {
      const err = await response.json()

      message =
        err?.detail ||
        err?.message ||
        message
    } catch { }

    throw new Error(message)
  }

  const data = await response.json()

  return Array.isArray(data)
    ? data
    : (data.data ?? data.results ?? [])
}

export async function patchFieldValues(
  admissionNumber: string,
  fieldValues: {
    field_id: number
    value: string
  }[],
) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/updatesubmition/${admissionNumber}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        field_values: fieldValues,
      }),
    }
  )

  if (!response.ok) {
    let message =
      "Failed to update student information."

    try {
      const err = await response.json()

      message =
        err?.detail ||
        err?.message ||
        message
    } catch { }

    throw new Error(message)
  }

  return response.json()
}

export async function patchDocuments(
  admissionNumber: string,
  documents: {
    document_field: number
    file: File
  }[],
) {
  const formData = new FormData()

  documents.forEach((doc, index) => {
    formData.append(
      `documents[${index}][document_field]`,
      String(doc.document_field),
    )

    formData.append(
      `documents[${index}][file]`,
      doc.file,
    )
  })

  const response = await fetchWithAuth(
    `${API_BASE_URL}/updateDocument/${admissionNumber}/`,
    {
      method: "PATCH",
      body: formData,
    }
  )

  if (!response.ok) {
    let message =
      "Failed to update documents."

    try {
      const err = await response.json()

      message =
        err?.detail ||
        err?.message ||
        message
    } catch { }

    throw new Error(message)
  }

  return response.json()
}

export async function assignGrNumber(
  admissionNumber: string,
  grNo: string,
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/clerk_verify/${admissionNumber}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gr_no: grNo,
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to assign GR number.";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        message;
    } catch { }

    throw new Error(message);
  }
}

export interface LocationSettings {
  latitude: string
  longitude: string
  radius: string
  start_time: string
  end_time: string
  half_day_time: string
}

export async function getLocationSettings(): Promise<LocationSettings> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_LOCATION}`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch location settings."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }

  return response.json()
}

export async function saveLocationSettings(payload: LocationSettings): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_LOCATION}`
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Failed to save location settings."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }
}


export interface TodayAttendance {
  attendance_date: string
  checked_in: boolean
  checked_out: boolean
  check_in: string | null
  check_out: string | null
  is_present: boolean
  is_half_day: boolean
}

export interface AttendanceLocationSettings {
  id?: number
  latitude?: string
  longitude?: string
  radius?: string
  start_time?: string
  end_time?: string
  school_name?: string
  half_day_time?: string
}

// ─── Get today's attendance ───────────────────────────────────────────────────

export async function getTodayAttendance(): Promise<TodayAttendance | null> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ATTENDANCE_TODAY}`
  const response = await fetchWithAuth(url)

  if (response.status === 404) {
    // No record yet — fresh day, not an error
    return null
  }

  if (!response.ok) {
    let message = "Failed to fetch today's attendance."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }

  return response.json()
}

// ─── Mark attendance (check-in OR check-out) ─────────────────────────────────

export async function markAttendance(payload: {
  latitude: number
  longitude: number
}): Promise<void> {
  const url = `${API_BASE_URL}/attendance/`
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = "Attendance action failed."
    try {
      const err = await response.json()
      message =
        err?.non_field_errors?.[0] ||
        err?.detail ||
        err?.message ||
        message
    } catch { }
    throw new Error(message)
  }
}



// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: number
  school: number
  staff: number
  attendance_date: string       // "2026-05-13"
  date_time: string             // "2026-05-13T05:12:38.748103Z"
  name: string
  category: string              // "TEACHER"
  is_present: boolean
  is_half_day: boolean
  check_in: string | null       // "2026-05-13T05:12:38.748103Z"
  check_out: string | null      // null or ISO string
}

// ─── Get all attendance records (history) ────────────────────────────────────

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const url = `${API_BASE_URL}/attendance/`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    let message = "Failed to fetch attendance history."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.results ?? data.data ?? [])
}

// ─────────────────────────────────────────────────────────────
// Salary Types
// ─────────────────────────────────────────────────────────────

export type SalaryComponent = {
  id: number;
  name: string;
  component_type: "earning" | "deduction";
};

export type StaffMember = {
  id: number;
  name: string;
  category?: string;
  employee_id?: string;
  designation?: string;
};

export type StaffSalaryComponent = {
  id: number;
  staff: number;
  component: number;
  calculation_type: "fixed" | "percentage";
  value: string;
};

// ─────────────────────────────────────────────────────────────
// Salary Component APIs
// ─────────────────────────────────────────────────────────────

export async function getSalaryComponents(): Promise<SalaryComponent[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/salary-component/`
  );

  if (!response.ok) {
    let message = "Failed to fetch salary components.";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        message;
    } catch { }

    throw new Error(message);
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : (data.results ?? data.data ?? []);
}

export async function createSalaryComponent(payload: {
  name: string;
  component_type: "earning" | "deduction";
}): Promise<SalaryComponent> {

  const response = await fetchWithAuth(
    `${API_BASE_URL}/salary-component/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Failed to create salary component"
    );
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
// Staff APIs
// ─────────────────────────────────────────────────────────────

export async function getStaffList(): Promise<StaffMember[]> {

  const response = await fetchWithAuth(
    `${API_BASE_URL}/staff-list/`
  );

  if (!response.ok) {
    let message = "Failed to fetch staff list.";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        message;
    } catch { }

    throw new Error(message);
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : (data.results ?? data.data ?? []);
}

// ─────────────────────────────────────────────────────────────
// Staff Salary Component APIs
// ─────────────────────────────────────────────────────────────

export async function getStaffSalaryComponents(
  staffId: number
): Promise<StaffSalaryComponent[]> {

  const response = await fetchWithAuth(
    `${`${API_BASE_URL}/staff-salary-component/`}?staff=${staffId}`
  );

  if (!response.ok) {
    let message =
      "Failed to fetch staff salary components.";

    try {
      const err = await response.json();

      message =
        err?.detail ||
        err?.message ||
        message;
    } catch { }

    throw new Error(message);
  }

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : (data.results ?? data.data ?? []);
}

export async function createStaffSalaryComponent(payload: {
  staff: number;
  component: number;
  calculation_type: "fixed" | "percentage";
  value: string;
}): Promise<StaffSalaryComponent> {

  const response = await fetchWithAuth(
    `${API_BASE_URL}/staff-salary-component/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Failed to assign salary component"
    );
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Paste these TWO functions into your forms.ts to replace the existing ones.
// getSalaryPayments now actually uses the ?salary_month= query param.
// ─────────────────────────────────────────────────────────────────────────────

export interface SalaryPayment {
  id: number;
  school: number;
  staff: number;
  staff_name: string;
  staff_category: string;
  salary_month: string;
  basic_salary: string;
  total_earnings: string;
  total_deductions: string;
  working_days: number;
  present_days: string;
  absent_days: number;
  half_days: number;
  attendance_deduction: string;
  component_snapshot: {
    component_id: number;
    name: string;
    component_type: "earning" | "deduction";
    calculation_type: string;
    value: string;
    amount: string;
  }[];
  net_salary: string;
  paid_amount: string;
  payment_mode: string;
  payment_status: string;
  transaction_id: string | null;
  receipt_number: string;
  payment_date: string;
  note: string;
  paid_by: number;
  paid_by_username: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/staff-salary-payment/?salary_month={month}
 *
 * Fetches all salary payment records for the given month.
 * If no month is provided, returns ALL records (use sparingly).
 *
 * The API returns a mix of:
 *   - Already-paid records (payment_status === "paid")
 *   - These map directly to StaffMember via transformStaff() in the page
 */
export async function getSalaryPayments(
  month?: string
): Promise<SalaryPayment[]> {
  // Build URL with optional month filter
  const params = new URLSearchParams();
  if (month) params.set("salary_month", month);

  const url = `${API_BASE_URL}${API_ENDPOINTS.STAFF_SALARY_PAYMENT}${params.toString() ? `?${params.toString()}` : ""
    }`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch salary payments.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

/**
 * POST /api/staff-salary-payment/
 *
 * Generates (pays) a salary for a staff member for a given month.
 * System auto-calculates: basic salary, attendance deduction, components, net salary.
 *
 * Offline payload:
 *   { staff, salary_month, payment_mode: "offline", receipt_number, note? }
 *
 * Online payload:
 *   { staff, salary_month, payment_mode: "online", receipt_number, transaction_id, note? }
 */
export async function generateSalary(payload: {
  staff: number;
  salary_month: string;
  payment_mode: "online" | "offline";
  receipt_number: string;
  transaction_id?: string;
  note?: string;
}): Promise<SalaryPayment> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.STAFF_SALARY_PAYMENT}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to generate salary"
    );
  }

  return data;
}

// ─── Timetable Types & APIs ───────────────────────────────────────────────────

export interface TimetableStructure {
  id: number;
  class_div: number;
  academic_year: string;
  working_days: string[];
  lecture_slots: TimetableLectureSlot[];
  break_slots: TimetableBreakSlot[];
}

export interface TimetableLectureSlot {
  slot_number: number;
  slot_start_time: string;
  slot_end_time: string;
}

export interface TimetableBreakSlot {
  slot_number: number;
  slot_start_time: string;
  slot_end_time: string;
  duration_minutes: number;
}

export interface TimetablePayload {
  day: string;
  class_division: number;
  total_lecture: number;
  start_time: string;
  end_time: string;
  slots: TimetableSlot[];
}

export interface TimetableSlot {
  slot_number: number;
  is_lecture: boolean;
  is_break: boolean;
  slot_start_time: string;
  slot_end_time: string;
  subject: number | null;
  teacher: number | null;
}

export interface TimetableRecord {
  id: number;
  day: string;
  class_division: number;
  total_lecture: number;
  start_time: string;
  end_time: string;
  slots: TimetableSlot[];
}

// Save timetable structure (Step 1 - local state only, no API needed)
// Structure is passed to Step 3 where final timetable is saved

// GET timetable by class_division and day
export async function getTimetable(
  classDivision: number,
  day?: string
): Promise<TimetableRecord[]> {
  const params = new URLSearchParams();
  params.set("class_division", String(classDivision));
  if (day) params.set("day", day);

  const url = `${API_BASE_URL}/timetable/?${params.toString()}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// POST - Create timetable for a day (Step 3)
export async function createTimetable(
  payload: TimetablePayload
): Promise<TimetableRecord> {
  const response = await fetchWithAuth(`${API_BASE_URL}/timetable/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to create timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

// PUT - Update timetable for a day
export async function updateTimetable(
  id: number,
  payload: TimetablePayload
): Promise<TimetableRecord> {
  const response = await fetchWithAuth(`${API_BASE_URL}/timetable/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to update timetable.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}


// ─── ADD THIS to your forms.ts (after the assignClass function) ──────────────
export interface AssignedTeacher {
  teacher: number;
  subject: number;
  subject_name: string;
  division: number;
  division_name: string;
  class_name: string;
  is_class_teacher: boolean;
  teacher_name: string;
}

export async function getAssignedTeachers(
  divisionId: number | string
): Promise<AssignedTeacher[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ASSIGN_CLASS}?division=${divisionId}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch assigned teachers.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// ─── Student Attendance Types & APIs ─────────────────────────────────────────

export interface StudentAttendanceListResponse {
  success: boolean;
  division_id: number;
  division_name: string;
  total_students: number;
  students: {
    id: number;
    surname: string | null;
    name: string;
    gr_no: string;
  }[];
  message?: string;
}

export interface StudentAttendancePayload {
  student: number;
  is_present: boolean;
  is_absent: boolean;
}

// GET /attendance/students/
export async function getStudentsForAttendance(): Promise<StudentAttendanceListResponse> {
  const url = `${API_BASE_URL}/get/attendance/students/`;
  const response = await fetchWithAuth(url);

  const data = await response.json();

  // Handle "not assigned as class teacher" case
  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || "Failed to fetch students for attendance."
    );
  }

  return data;
}

// POST /api/student-attendance/
export async function submitStudentAttendance(
  records: StudentAttendancePayload[]
): Promise<void> {
  const url = `${API_BASE_URL}/student-attendance/`;

  const promises = records.map((record) =>
    fetchWithAuth(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
  );

  const responses = await Promise.all(promises);

  for (const res of responses) {
    if (!res.ok) {
      let message = "Failed to submit student attendance.";
      try {
        const err = await res.json();
        message = err?.detail || err?.message || message;
      } catch { }
      throw new Error(message);
    }
  }
}

// ─── Homework Types & APIs ────────────────────────────────────────────────────

export interface HomeworkItem {
  id: number;
  school: number;
  division: number;
  division_name: string;
  school_class_name: string;
  teacher: number;
  teacher_name: string;
  title: string;
  description: string;
  assigned_date: string;
  due_date: string;
  attachment: string | null;
  is_active: boolean;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface HomeworkSubmission {
  id: number;
  school: number;
  homework: number;
  homework_title: string;
  student: number;
  student_name: string;
  attachment: string | null;
  submitted_at: string;
  submission_date: string;
  status: "pending" | "submitted" | "late" | "checked";
  marks: number | null;
  teacher_remark: string | null;
  checked_by: number | null;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
}

// GET /homework/ — student sees their division's homework
export async function getStudentHomework(): Promise<HomeworkItem[]> {
  const url = `${API_BASE_URL}/homework/`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch homework.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// GET /homework-submission/ — student's own submissions
export async function getMySubmissions(): Promise<HomeworkSubmission[]> {
  const url = `${API_BASE_URL}/homework-submission/`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch submissions.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// POST /homework-submission/ — submit homework
export async function submitHomework(
  homeworkId: number,
  attachment?: File
): Promise<HomeworkSubmission> {
  const url = `${API_BASE_URL}/homework-submission/`;
  const formData = new FormData();
  formData.append("homework", String(homeworkId));
  if (attachment) {
    formData.append("attachment", attachment);
  }

  const response = await fetchWithAuth(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to submit homework."
    );
  }

  return data;
}


// ─────────────────────────────────────────────────────────────────────────────
// HOMEWORK API ADDITIONS
// Append these functions to your existing forms.ts file.
// They use the same `fetchWithAuth`, `API_BASE_URL` already in that file.
// ─────────────────────────────────────────────────────────────────────────────


// ─── GET /homework/ — list all homework for this teacher ─────────────────────

export async function getTeacherHomework(): Promise<HomeworkItem[]> {
  const url = `${API_BASE_URL}/homework/`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch homework.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// ─── GET /homework-submission/?homework=<id> — submissions for one homework ──

export async function getHomeworkSubmissions(
  homeworkId: number
): Promise<HomeworkSubmission[]> {
  const url = `${API_BASE_URL}/homework-submission/?homework=${homeworkId}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch submissions.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// ─── POST /homework/ — create homework (multipart for optional file) ──────────
//
// Payload (FormData):
//   division      number   (required)
//   title         string   (required)
//   description   string
//   due_date      string   "YYYY-MM-DD"  (required)
//   is_active     "true" | "false"
//   attachment    File     (optional)

export async function createHomework(
  payload: FormData
): Promise<HomeworkItem> {
  const url = `${API_BASE_URL}/homework/`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    body: payload,
    // ⚠️ Do NOT set Content-Type — browser sets it with the correct boundary
  });

  if (!response.ok) {
    let message = "Failed to create homework.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || JSON.stringify(err) || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

// ─── PATCH /homework/<id>/ — update homework ──────────────────────────────────

export async function updateHomework(
  id: number,
  payload: FormData
): Promise<HomeworkItem> {
  const url = `${API_BASE_URL}/homework/${id}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    body: payload,
  });

  if (!response.ok) {
    let message = "Failed to update homework.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || JSON.stringify(err) || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

// ─── DELETE /homework/<id>/ ───────────────────────────────────────────────────

export async function deleteHomework(id: number): Promise<void> {
  const url = `${API_BASE_URL}/homework/${id}/`;
  const response = await fetchWithAuth(url, { method: "DELETE" });

  if (!response.ok) {
    let message = "Failed to delete homework.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }
}

// ─── PATCH /homework-submission/<id>/ — grade a submission ───────────────────
//
// Sends:  { status: "checked", marks: 85, teacher_remark: "Good work" }
// Alternatively you can hit the action endpoint:
//   POST /homework-submission/<id>/check_submission/  (same payload)

export async function gradeSubmission(
  submissionId: number,
  marks: number,
  teacherRemark: string
): Promise<HomeworkSubmission> {
  const url = `${API_BASE_URL}/homework-submission/${submissionId}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "checked",
      marks,
      teacher_remark: teacherRemark,
    }),
  });

  if (!response.ok) {
    let message = "Failed to grade submission.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  return response.json();
}

// ─── POST /homework-submission/ — student submits homework ───────────────────
//
// Only needed on the student side.
// Payload:  homework (id), optional attachment (File)

export async function submitHomeworkAsStudent(
  homeworkId: number,
  attachment?: File
): Promise<HomeworkSubmission> {
  const url = `${API_BASE_URL}/homework-submission/`;
  const formData = new FormData();
  formData.append("homework", String(homeworkId));
  if (attachment) formData.append("attachment", attachment);

  const response = await fetchWithAuth(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Failed to submit homework.");
  }

  return data;
}

// ─── Academic Year Types & APIs ───────────────────────────────────────────────

export interface BillingPeriod {
  code: string;   // e.g. "2026-04"
  label: string;  // e.g. "Apr 2026"
}

export interface AcademicYear {
  id: number;
  name?: string;
  start_year: number;
  end_year: number;
  start_month: number;
  end_month: number;
  billing_periods: string[];
  is_active?: boolean;
  status?: "Active" | "Completed" | "Upcoming";
}


// GET /api/academic-year/
export async function getAcademicYears(): Promise<AcademicYear[]> {
  const url = `${API_BASE_URL}/academic-year/`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch academic years.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}


// POST /api/academic-year/
export async function createAcademicYear(payload: {
  name: string;
  start_month: number;
  end_month: number;
}): Promise<AcademicYear> {
  const url = `${API_BASE_URL}/academic-year/`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to create academic year."
    );
  }

  return data;
}

export async function createAcademicYearForPrincipal(payload: {
  start_year: number;
  end_year: number;
  start_month: number;
  end_month: number;
}): Promise<AcademicYear> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACADEMIC_YEAR}`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message
        ? (data?.detail || data?.message)
        : JSON.stringify(data)
    );
  }

  return data;
}

export async function getAcademicYearsForPrincipal(): Promise<AcademicYear[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACADEMIC_YEAR}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch academic years.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

export async function updateAcademicYearForPrincipal(
  id: number,
  payload: { start_year: number; end_year: number; start_month: number; end_month: number }
): Promise<AcademicYear> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACADEMIC_YEAR}${id}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to update academic year."
    );
  }

  return data;
}

export async function deleteAcademicYearForPrincipal(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACADEMIC_YEAR}${id}/`;
  const response = await fetchWithAuth(url, { method: "DELETE" });

  if (!response.ok) {
    let message = "Failed to delete academic year.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }
}

// ─── Fee Type Types & APIs ────────────────────────────────────────────────────

export interface FeeType {
  id: number;
  name: string;
  billing_cycle: "single" | "monthly" | "quarterly" | "half_yearly" | "yearly";
}

export interface FeeTypeFormData {
  name: string;
  billing_cycle: "single" | "monthly" | "quarterly" | "half_yearly" | "yearly";
}

export const billingCycleOptions = [
  { value: "single", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "yearly", label: "Yearly" },
] as const;

// Helper — "monthly" → "Monthly"
export function getBillingCycleLabel(cycle: string): string {
  return billingCycleOptions.find((o) => o.value === cycle)?.label ?? cycle;
}

// Helper — badge color per billing cycle
export function getBillingCycleBadgeColor(cycle: string): string {
  const map: Record<string, string> = {
    single: "bg-blue-50    text-blue-700    border border-blue-200",
    monthly: "bg-purple-50  text-purple-700  border border-purple-200",
    quarterly: "bg-orange-50  text-orange-700  border border-orange-200",
    half_yearly: "bg-teal-50    text-teal-700    border border-teal-200",
    yearly: "bg-green-50   text-green-700   border border-green-200",
  };
  return map[cycle] ?? "bg-gray-50 text-gray-600 border border-gray-200";
}

// Helper — icon background per fee name
export function getFeeTypeIconBg(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("tuition")) return "bg-purple-50";
  if (lower.includes("transport")) return "bg-orange-50";
  if (lower.includes("exam")) return "bg-blue-50";
  if (lower.includes("library")) return "bg-emerald-50";
  if (lower.includes("lab")) return "bg-violet-50";
  if (lower.includes("admission")) return "bg-rose-50";
  return "bg-indigo-50";
}

// GET /api/feetype/
export async function getFeeTypes(): Promise<FeeType[]> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_TYPE}`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch fee types.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// POST /api/feetype/
export async function createFeeType(
  payload: FeeTypeFormData
): Promise<FeeType> {
  const url = `${API_BASE_URL}/feetype/`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to create fee type."
    );
  }

  return data;
}

// PATCH /api/feetype/<id>/
export async function updateFeeType(
  id: number,
  payload: FeeTypeFormData
): Promise<FeeType> {
  const url = `${API_BASE_URL}/feetype/${id}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to update fee type."
    );
  }

  return data;
}

// DELETE /api/feetype/<id>/
export async function deleteFeeType(id: number): Promise<void> {
  const url = `${API_BASE_URL}/feetype/${id}/`;
  const response = await fetchWithAuth(url, { method: "DELETE" });

  if (!response.ok) {
    let message = "Failed to delete fee type.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }
}
export const feeTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Fee type name is required")
    .max(100, "Name must be 100 characters or less"),
  billing_cycle: z.enum(
    ["single", "monthly", "quarterly", "half_yearly", "yearly"],
    { error: "Please select a billing cycle" }  //  Zod v4 syntax
  ),
})

// ─── Fee Structure Types & APIs ───────────────────────────────────────────────
// Add these to your existing forms.ts file
// Requires: fetchWithAuth, API_BASE_URL already defined in that file

// ─── Types ────────────────────────────────────────────────────────────────────

export type LateFeeType = "per_day" | "flat";

export interface FeeWiseClass {
  id: number;
  feetype: number;
  feetype_name: string;
  billing_cycle: string;
  school_class: number;
  school_class_name: string;
  amount: string;

  late_fee_enabled: boolean;
  grace_days: number | null;
  late_fee_type: LateFeeType | null;
  late_fee_amount: string | null;
  max_late_fee: string | null;
}

export interface FeeWiseClassPayload {
  feetype: number;
  school_class: number;
  amount: string;
  late_fee_enabled: boolean;
  grace_days?: number | null;
  late_fee_type?: LateFeeType | null;
  late_fee_amount?: string | null;
  max_late_fee?: string | null;
}

export interface StudentFee {
  id: number;
  student: number;
  student_name: string;
  student_surname: string | null;
  academic_year: number;
  academic_year_name: string;
  fee_wise_class: number;
  fee_wise_class_name: string;
  feetype_name: string;
  class_name: string;
  billing_period: string;
  due_date: string;
  amount: string;
  payable_amount: string;
  discount_amount: string;
  discount_reference: string | null;
  discount_note: string | null;
  status: "paid" | "unpaid" | "partially_paid" | "overdue" | "pending" | "partial" | "cancelled";

  // ── fields used by pay-fees page ──
  fine_amount: string;
  paid_amount: string;
  actual_payable_amount: string;
  balance_amount: string;
  payments?: Payment[];
}

export interface StudentFeePayload {
  student: number;
  academic_year: number;
  fee_wise_class: number;
  billing_period: string; // "2026-04" for monthly, "" for single
  due_date: string;       // "YYYY-MM-DD"
}

export interface DiscountPayload {
  discount_amount: string;
  discount_reference: string;
  discount_note: string;
}

// ─── GET /api/fee-wise-class/ ─────────────────────────────────────────────────

export async function getFeeWiseClasses(filters?: {
  school_class?: number;
  feetype?: number;
}): Promise<FeeWiseClass[]> {
  const params = new URLSearchParams();
  if (filters?.school_class) params.set("school_class", String(filters.school_class));
  if (filters?.feetype) params.set("feetype", String(filters.feetype));

  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch class-wise fees.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// ─── POST /api/fee-wise-class/ ────────────────────────────────────────────────

export async function createFeeWiseClass(
  payload: FeeWiseClassPayload
): Promise<FeeWiseClass> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || JSON.stringify(data) || "Failed to create fee."
    );
  }

  return data;
}

// ─── PATCH /api/fee-wise-class/<id>/ ─────────────────────────────────────────

export async function updateFeeWiseClass(
  id: number,
  payload: Partial<FeeWiseClassPayload>
): Promise<FeeWiseClass> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${id}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to update fee."
    );
  }

  return data;
}

// ─── DELETE /api/fee-wise-class/<id>/ ────────────────────────────────────────

export async function deleteFeeWiseClass(id: number): Promise<void> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}${id}/`;
  const response = await fetchWithAuth(url, { method: "DELETE" });

  if (!response.ok) {
    let message = "Failed to delete fee.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }
}

// ─── POST /api/student-fee/ ───────────────────────────────────────────────────

export async function createStudentFee(
  payload: StudentFeePayload
): Promise<StudentFee> {
  const url = `${API_BASE_URL}/student-fee/`;
  const response = await fetchWithAuth(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to create student fee."
    );
  }

  return data;
}

// ─── PATCH /api/student-fee/<id>/ — add discount ─────────────────────────────

export async function addDiscount(
  studentFeeId: number,
  payload: DiscountPayload
): Promise<StudentFee> {
  const url = `${API_BASE_URL}/student-fee/${studentFeeId}/`;
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to apply discount."
    );
  }

  return data;
}


// ─── ADD THESE to your existing lib/forms.ts ─────────────────────────────────
// These are NEW additions only — paste them at the bottom of forms.ts

// ─── Student List for Fee Generation ─────────────────────────────────────────

export interface StudentForFee {
  id: number;
  name: string;
  surname: string | null;
  admission_number: string;
  gr_no: string | null;
  division: number;
  division_name?: string;
  school_class?: number;
}

export interface StudentFeeStatus {
  student_id: number;
  fee_wise_class_id: number;
  billing_period: string;
  already_generated: boolean;
  student_fee_id?: number;
}

// GET /api/students/?school_class=<id>  — students by class
export async function getStudentsByFeeWiseClass(
  feeWiseClassId: number,   // used for reference / future direct endpoint
  schoolClassId: number     // used for the actual /students/ filter
): Promise<StudentForFee[]> {
  const url = `${API_BASE_URL}/fee-wise-class/?school_class=${schoolClassId}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch students.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// POST /api/student-fee/ — create one student fee record
// (Already defined above as createStudentFee, reusing it)

// POST bulk — generate fees for multiple students at once
// Calls createStudentFee for each student in sequence
export async function bulkCreateStudentFees(
  records: StudentFeePayload[]
): Promise<{ success: StudentFee[]; failed: { index: number; error: string }[] }> {
  const success: StudentFee[] = [];
  const failed: { index: number; error: string }[] = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const result = await createStudentFee(records[i]);
      success.push(result);
    } catch (e: any) {
      failed.push({ index: i, error: e.message ?? "Unknown error" });
    }
  }

  return { success, failed };
}

// GET /api/student-fee/?school_class=<id>&billing_period=<period>
// Check which fees already exist so we don't duplicate
export async function getExistingStudentFees(filters: {
  school_class?: number;
  billing_period?: string;
  academic_year?: number;
  fee_wise_class?: number;   // ← NEW
}): Promise<StudentFee[]> {
  const params = new URLSearchParams();

  if (filters.school_class)
    params.set("school_class", String(filters.school_class));

  // billing_period can be "" for single fees — still send it
  if (filters.billing_period !== undefined)
    params.set("billing_period", filters.billing_period);

  if (filters.academic_year)
    params.set("academic_year", String(filters.academic_year));

  if (filters.fee_wise_class)                                     // ← NEW
    params.set("fee_wise_class", String(filters.fee_wise_class)); // ← NEW

  const url = `${API_BASE_URL}/fee-wise-class/${params.toString() ? `?${params.toString()}` : ""
    }`;

  const response = await fetchWithAuth(url);

  if (!response.ok) {
    let message = "Failed to fetch existing student fees.";
    try {
      const err = await response.json();
      message = err?.detail || err?.message || message;
    } catch { }
    throw new Error(message);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? data.data ?? []);
}

// Types
export interface Student {
  id: number;
  surname: string | null;
  name: string;
  father_name: string;
  mother_name: string;
  school_class: number | null;
  class_name?: string;
}

export interface CreateSingleFeePayload {
  student: number;
  academic_year: number;
  fee_wise_class: number;
  billing_period: string;
  due_date: string;
}

// ─── Student Fee Page - Fee Generation APIs ───────────────────────────────────
// These use fetchWithAuth to send Bearer token automatically


export interface CreateMonthlyFeePayload {
  student: number;
  academic_year: number;
  fee_wise_class: number;
  billing_period: string;
  due_date: string;
}
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ─── Fetch all students ───────────────────────────────────────────────────────
export async function fetchStudents(): Promise<ApiResponse<Student[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/studentget/`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch students: ${response.statusText}`);
    }
    const data = await response.json();
    return { data, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch students",
      success: false,
    };
  }
}

// ─── Fetch academic years (with auth) ────────────────────────────────────────
export async function fetchAcademicYearsForFee(): Promise<ApiResponse<AcademicYear[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/academic-year/`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch academic years: ${response.statusText}`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.results ?? data.data ?? []);
    return { data: list, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch academic years",
      success: false,
    };
  }
}

// ─── Fetch fee wise classes (with auth) ──────────────────────────────────────
export async function fetchFeeWiseClassesForFee(): Promise<ApiResponse<FeeWiseClass[]>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.FEE_WISE_CLASS}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch fee structures: ${response.statusText}`);
    }
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data.results ?? data.data ?? []);
    return { data: list, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch fee structures",
      success: false,
    };
  }
}

// ─── Fetch all student fees (with auth) ──────────────────────────────────────
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

    const url = `${API_BASE_URL}/student-fee/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch student fees: ${response.statusText}`);
    }
    const data = await response.json();

    if (Array.isArray(data)) {
      return { data: { results: data, count: data.length }, error: null, success: true };
    }
    return {
      data: {
        results: data.results ?? data.data ?? [],
        count: data.count ?? data.total ?? 0,
      },
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch student fees",
      success: false,
    };
  }
}

// ─── Create monthly student fee (with auth) ───────────────────────────────────
export async function createMonthlyStudentFee(
  payload: CreateMonthlyFeePayload
): Promise<ApiResponse<StudentFee>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `Failed to create fee: ${response.statusText}`
      );
    }
    const data = await response.json();
    return { data, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create monthly fee",
      success: false,
    };
  }
}

// ─── Create single student fee (with auth) ────────────────────────────────────
export async function createSingleStudentFee(
  payload: CreateSingleFeePayload
): Promise<ApiResponse<StudentFee>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, billing_period: "" }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `Failed to create fee: ${response.statusText}`
      );
    }
    const data = await response.json();
    return { data, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to create single fee",
      success: false,
    };
  }
}

// ─── Add discount to student fee (with auth) ──────────────────────────────────
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `Failed to apply discount: ${response.statusText}`
      );
    }
    const data = await response.json();
    return { data, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to add discount",
      success: false,
    };
  }
}

// ─── Delete student fee (with auth) ──────────────────────────────────────────
export async function deleteStudentFee(feeId: number): Promise<ApiResponse<null>> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/student-fee/${feeId}/`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to delete fee: ${response.statusText}`);
    }
    return { data: null, error: null, success: true };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to delete fee",
      success: false,
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatBillingPeriod(period: string): string {
  if (!period) return "—";
  const [year, month] = period.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function getUniqueClasses(students: Student[]): string[] {
  const classes = students
    .filter((s) => s.class_name)
    .map((s) => s.class_name as string);
  return [...new Set(classes)].sort();
}

// ─── Form Validators ──────────────────────────────────────────────────────────
export function validateMonthlyFeeForm(data: {
  student: string;
  academic_year: string;
  fee_wise_class: string;
  billing_period: string;
  due_date: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.student) errors.student = "Student is required";
  if (!data.academic_year) errors.academic_year = "Academic year is required";
  if (!data.fee_wise_class) errors.fee_wise_class = "Fee structure is required";
  if (!data.billing_period) errors.billing_period = "Billing period is required";
  if (!data.due_date) errors.due_date = "Due date is required";
  return errors;
}

export function validateSingleFeeForm(data: {
  student: string;
  academic_year: string;
  fee_wise_class: string;
  due_date: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.student) errors.student = "Student is required";
  if (!data.academic_year) errors.academic_year = "Academic year is required";
  if (!data.fee_wise_class) errors.fee_wise_class = "Fee structure is required";
  if (!data.due_date) errors.due_date = "Due date is required";
  return errors;
}

export function validateDiscountForm(data: {
  discount_amount: string;
  discount_reference: string;
  discount_note: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.discount_amount) {
    errors.discount_amount = "Discount amount is required";
  } else if (isNaN(parseFloat(data.discount_amount)) || parseFloat(data.discount_amount) <= 0) {
    errors.discount_amount = "Enter a valid discount amount";
  }
  if (!data.discount_reference) errors.discount_reference = "Reference is required";
  return errors;
}


export async function getAdmissionReceipt(admission_number: string) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/admission-receipt/${admission_number}/`,
    { method: "GET" }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "Failed to fetch receipt");
  }
  return data;
}

// app/student/pay-fees/forms.ts

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeeStatus = "pending" | "partial" | "paid" | "cancelled";
export type PaymentMode = "cash" | "online" | "cheque" | "bank_transfer" | "upi";

export interface Payment {
  id: number;
  student_fee: number;
  amount: string;
  payment_mode: PaymentMode;
  receipt_number: string;
  note?: string;
  is_verified: boolean;
  date: string;
  created_at?: string;
}

export interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  remainingBalance: number;
}

export interface RazorpayOrderResponse {
  order_id: string;
  amount: number; // in paise
  currency: string;
  key: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface OfflinePaymentPayload {
  student_fee: number;
  amount: string;
  payment_mode: PaymentMode;
  receipt_number: string;
  note?: string;
  is_verified?: boolean;
}

export interface FeeFilters {
  student?: number;
  school_class?: number;
  academic_year?: number;
  status?: FeeStatus | "all";
  billing_period?: string; // "2026-04"
}

// Rename to avoid conflict
export interface MyStudentFee {
  id: number;
  student: number;
  school_class?: number;
  academic_year?: number;
  billing_period: string;
  status: FeeStatus;
  amount: string;
  discount_amount: string;
  fine_amount: string;
  paid_amount: string;
  actual_payable_amount: string;
  balance_amount: string;
  payments: Payment[];
}

export interface PaymentFilters {
  student_fee?: number;
  student?: number;
  school_class?: number;
  payment_mode?: PaymentMode;
  date_from?: string; // "2026-04-01"
  date_to?: string;   // "2026-04-30"
}
// ─── Internal API helpers ─────────────────────────────────────────────────────

/**
 * Generic authenticated fetch wrapper.
 * Automatically adds Bearer token via fetchWithAuth.
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.replace(/^\/api/, "")}`;

  const response = await fetchWithAuth(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.statusText}`;
    try {
      const err = await response.json();
      message = err?.detail || err?.message || JSON.stringify(err) || message;
    } catch { }
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json();
}

/**
 * Build a query string from an object, skipping undefined/null values.
 * Example: buildQuery({ page: 1, status: "paid" }) → "?page=1&status=paid"
 */
function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}
// ─── Student Fees API ─────────────────────────────────────────────────────────
// Change these function signatures:

export async function getMyFees(): Promise<MyStudentFee[]> {
  return apiFetch<MyStudentFee[]>("/my-fees/");
}

export async function getStudentFees(
  filters: FeeFilters = {}
): Promise<MyStudentFee[]> {
  const query = buildQuery({
    student: filters.student,
    school_class: filters.school_class,
    academic_year: filters.academic_year,
    status: filters.status !== "all" ? filters.status : undefined,
    billing_period: filters.billing_period,
  });
  return apiFetch<MyStudentFee[]>(`/student-fee/${query}`);
}

export function computeFeeSummary(fees: MyStudentFee[]): FeeSummary {
  return fees.reduce<FeeSummary>(
    (acc, fee) => {
      const payable = parseFloat(fee.actual_payable_amount);
      const paid = parseFloat(fee.paid_amount);
      const balance = parseFloat(fee.balance_amount);

      acc.totalFees += payable;
      acc.paidAmount += paid;
      acc.pendingAmount += fee.status === "pending" ? balance : 0;
      acc.remainingBalance += balance;
      return acc;
    },
    { totalFees: 0, paidAmount: 0, pendingAmount: 0, remainingBalance: 0 }
  );
}

export async function updateFeeStatus(
  feeId: number,
  status: FeeStatus
): Promise<MyStudentFee> {
  return apiFetch<MyStudentFee>(`/student-fee/${feeId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
// ─── Razorpay API ─────────────────────────────────────────────────────────────

/**
 * Create a Razorpay order for a student fee.
 * POST /api/student-fee/razor/order/
 *
 * @param studentFeeId - The student fee record id.
 * @param partialAmount - Optional partial amount (omit for full balance).
 */
export async function createRazorpayOrder(
  studentFeeId: number,
  partialAmount?: string
): Promise<RazorpayOrderResponse> {
  const body: { student_fee: number; amount?: string } = {
    student_fee: studentFeeId,
  };
  if (partialAmount) body.amount = partialAmount;

  return apiFetch<RazorpayOrderResponse>("/student-fee/razor/order/", {

    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Verify a Razorpay payment after the checkout modal closes successfully.
 * POST /api/student-fee/razor/verify/
 */
export async function verifyRazorpayPayment(
  payload: RazorpayVerifyPayload
): Promise<{ success: boolean; message?: string }> {
  return apiFetch("/student-fee/razor/verify/", {

    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Full Razorpay pay-now flow:
 *  1. Create order on backend
 *  2. Open Razorpay checkout
 *  3. Verify signature on backend
 *
 * @param studentFeeId - Fee to pay.
 * @param partialAmount - Optional partial amount string, e.g. "500.00".
 * @param studentName - Prefill name in Razorpay checkout.
 * @param studentEmail - Prefill email.
 * @param studentContact - Prefill phone.
 * @param onSuccess - Called after successful verification.
 * @param onFailure - Called on any error.
 */
export async function initiateRazorpayPayment({
  studentFeeId,
  partialAmount,
  studentName = "",
  studentEmail = "",
  studentContact = "",
  onSuccess,
  onFailure,
}: {
  studentFeeId: number;
  partialAmount?: string;
  studentName?: string;
  studentEmail?: string;
  studentContact?: string;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}): Promise<void> {
  try {
    const order = await createRazorpayOrder(studentFeeId, partialAmount);

    // Razorpay checkout is loaded via CDN script in your _document or layout.
    // Add <script src="https://checkout.razorpay.com/v1/checkout.js" /> to your layout.
    const Razorpay = (window as typeof window & { Razorpay: new (opts: unknown) => { open(): void } }).Razorpay;

    const rzp = new Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "School Fees",
      description: "Fee Payment",
      prefill: {
        name: studentName,
        email: studentEmail,
        contact: studentContact,
      },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          onSuccess();
        } catch (err) {
          onFailure((err as Error).message ?? "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => onFailure("Payment cancelled by user"),
      },
    });

    rzp.open();
  } catch (err) {
    onFailure((err as Error).message ?? "Failed to create payment order");
  }
}

// ─── Payment History API ──────────────────────────────────────────────────────

/**
 * Fetch payment history with optional filters.
 * GET /api/student-fee-payment/
 */
export async function getPaymentHistory(
  filters: PaymentFilters = {}
): Promise<Payment[]> {
  const query = buildQuery({
    student_fee: filters.student_fee,
    student: filters.student,
    school_class: filters.school_class,
    payment_mode: filters.payment_mode,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });
  return apiFetch<Payment[]>(`/student-fee-payment/${query}`);

}
/**
 * Record an offline payment (cash / cheque / bank transfer etc.).
 * POST /api/student-fee-payment/
 */
export async function createOfflineStudentFeePayment(
  payload: OfflinePaymentPayload
): Promise<Payment> {
  return apiFetch<Payment>("/student-fee-payment/", {

    method: "POST",
    body: JSON.stringify({ is_verified: true, ...payload }),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format a numeric string or number as Indian Rupee display value. */
export function formatINR(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₹ ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Convert a billing_period string "2026-04" to a display label "April 2026". */
export function billingPeriodToLabel(period: string): string {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

/** Normalize API FeeStatus to the badge label used in the UI. */
export function feeStatusLabel(status: FeeStatus): string {
  return status.toUpperCase();
}

/** Map a billing_period "2026-04" to a month name for filter dropdowns. */
export function periodToMonthName(period: string): string {
  const [, month] = period.split("-");
  return new Date(2000, Number(month) - 1, 1).toLocaleString("en-IN", {
    month: "long",
  });
}


// ─── Temp Users ───────────────────────────────────────────────────────────────

export interface TempUser {
  id: number
  username: string
  email: string | null
  mobile: string | null
  is_active: boolean
}

export async function getTempUsersForPrincipal(): Promise<TempUser[]> {
  const url = `${API_BASE_URL}/tempusers/`
  const response = await fetchWithAuth(url)

  if (!response.ok) {
    throw new Error("Failed to fetch temp users")
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (data.data ?? data.results ?? [])
}

export async function activateTempUser(id: number): Promise<void> {
  const url = `${API_BASE_URL}/tempusers/${id}/activate/`
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: true }),
  })

  if (!response.ok) {
    let message = "Failed to activate user."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch { }
    throw new Error(message)
  }
}

export async function deactivateTempUser(id: number): Promise<void> {
  const url = `${API_BASE_URL}/tempusers/${id}/activate/`
  const response = await fetchWithAuth(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: false }),
  })

  if (!response.ok) {
    let message = "Failed to deactivate user."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {}
    throw new Error(message)
  }
}

// ADD this to forms.ts — after deactivateTempUser
export async function deactivateAllTempUsers(): Promise<void> {
  const url = `${API_BASE_URL}/tempusers/deactivate-all/`
  const response = await fetchWithAuth(url, { method: "POST" })

  if (!response.ok) {
    let message = "Failed to deactivate all users."
    try {
      const err = await response.json()
      message = err?.detail || err?.message || message
    } catch {}
    throw new Error(message)
  }
}


