import { API_BASE_URL, API_ENDPOINTS } from "./config"
import { fetchWithAuth } from "./auth"

// ================= TYPES =================

export type FeatureType = {
  id: number
  name: string
}

export type CreateFeaturePayload = {
  name: string
}

// ================= URL =================

const FEATURE_URL =
  `${API_BASE_URL}${API_ENDPOINTS.FEATURE}`

const SCHOOL_FEATURE_URL =
  `${API_BASE_URL}/schoolfeature/`

const CHANGE_FEATURE_STATUS_URL =
  `${API_BASE_URL}/changefeaturestatus`

// ================= GET FEATURES =================

export async function getFeatures(): Promise<FeatureType[]> {
  const response = await fetchWithAuth(
    FEATURE_URL,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch features")
  }

  const data = await response.json()

  return Array.isArray(data)
    ? data
    : data.results ?? []
}

// ================= CREATE FEATURE =================

export async function createFeature(
  payload: CreateFeaturePayload
) {
  const response = await fetchWithAuth(
    FEATURE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    let message = "Failed to create feature"

    try {
      const err = await response.json()

      message =
        err?.detail ||
        err?.message ||
        message

    } catch {
      // ignore
    }

    throw new Error(message)
  }

  return response.json()
}

// ================= UPDATE SCHOOL FEATURE =================

export async function updateFeatureStatus(
  featureId: number,
  isEnabled: boolean
) {
  const response = await fetchWithAuth(
    `${CHANGE_FEATURE_STATUS_URL}/${featureId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        is_enabled: isEnabled,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Failed to update feature status"
    )
  }

  return data
}

// ================= CREATE SCHOOL FEATURE =================

export async function createSchoolFeature(
  schoolId: number,
  featureId: number
) {
  const response = await fetchWithAuth(
    SCHOOL_FEATURE_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        school: schoolId,
        feature: featureId,
        is_enabled: true,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      "Failed to create school feature"
    )
  }

  return data
}

// ================= GET FEATURES LIST =================

export async function fetchFeaturesList() {
  const response = await fetchWithAuth(
    FEATURE_URL,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      "Failed to fetch features"
    )
  }

  return data
}