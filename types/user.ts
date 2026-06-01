export interface TempUser {
  id: number
  admission_number: string
  school: number
  form: number
  status: string
}

export interface SchoolClass {
  id: number
  school_class: string
}

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
    field_label: string;
    value: string;
  }[]
}
