import { NextResponse } from "next/server";
import { validateAdminCredentials } from "./controller";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials({ username, password });

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        token: "admin_token_school_erp_2026", // Mock session token
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
