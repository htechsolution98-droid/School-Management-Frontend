// ─── Teacher Attendance Types ─────────────────────────────────────────────────

export interface TodayAttendance {
  attendance_date: string;
  checked_in: boolean;
  checked_out: boolean;
  check_in: string | null;
  check_out: string | null;
  is_present: boolean;
  is_half_day: boolean;
}

export interface AttendanceLocationSettings {
  id?: number;
  latitude?: string;
  longitude?: string;
  radius?: string;
  start_time?: string;
  end_time?: string;
  school_name?: string;
  half_day_time?: string;
}

export interface AttendanceRecord {
  id: number;
  school: number;
  staff: number;
  attendance_date: string;       // "2026-05-13"
  date_time: string;             // "2026-05-13T05:12:38.748103Z"
  name: string;
  category: string;              // "TEACHER"
  is_present: boolean;
  is_half_day: boolean;
  check_in: string | null;       // "2026-05-13T05:12:38.748103Z"
  check_out: string | null;      // null or ISO string
}

// ─── Student Attendance Types ─────────────────────────────────────────────────

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

// ─── Homework Types ───────────────────────────────────────────────────────────

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
