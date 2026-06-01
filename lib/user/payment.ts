import { API_BASE_URL, API_ENDPOINTS } from "../config"
import { fetchWithAuth } from "../auth"

export async function createRazorOrder(payload: {
  amount: number
  admission_number: string
}) {
  const response = await fetchWithAuth(
    `${API_BASE_URL}${API_ENDPOINTS.RAZOR_ORDER}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admission_number: payload.admission_number,
        amount: payload.amount * 100, // convert rupees -> paise
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Order creation failed"
    )
  }

  return data
}

export async function verifyRazorPayment(payload: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  admission_number: string
  pay_process?: boolean
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
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Payment verification failed"
    )
  }

  return data
}

export async function createOfflinePayment(payload: {
  amount: number
  admission_number: string
  pay_process?: boolean
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
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.error ||
      data?.message ||
      "Offline payment failed"
    )
  }

  return data
}
