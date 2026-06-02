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

export interface InitiatePaymentOptions {
  studentFeeId: number;
  partialAmount?: string;
  onSuccess: () => void;
  onFailure: (msg: string) => void;
}

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type {
  FeeFilters,
  FeeStatus,
  FeeSummary,
  MyStudentFee,
  OfflinePaymentPayload,
  Payment,
  PaymentFilters,
  PaymentMode,
  RazorpayOrderResponse,
  RazorpayVerifyPayload,
  StudentFee,
} from "@/types/fees";
