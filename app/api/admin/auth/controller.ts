import { AdminCredentials, staticAdminUser } from "./model";

/**
 * Validates the admin credentials against static configuration.
 * Returns true if credentials match username: "admin" and password: "admin123"
 */
export function validateAdminCredentials(credentials: AdminCredentials): boolean {
  if (!credentials) return false;
  return (
    credentials.username.trim() === staticAdminUser.username &&
    credentials.password === staticAdminUser.password
  );
}
