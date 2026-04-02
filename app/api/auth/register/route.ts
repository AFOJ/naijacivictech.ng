import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { connectMongoose } from "@/lib/mongoose";
import { UserModel } from "@/lib/models/User";
import { hashPassword } from "@/lib/password";
import { checkRateLimit, clientIp } from "@/lib/rate-limit-ip";

const MIN_PASSWORD_LEN = 10;
/** bcrypt uses at most 72 bytes; keep UI/server aligned */
const MAX_PASSWORD_LEN = 72;
const MAX_NAME_LEN = 120;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const emailRaw = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!isValidEmail(emailRaw)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }
    if (password.length < MIN_PASSWORD_LEN) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LEN} characters`,
        },
        { status: 400 },
      );
    }
    if (password.length > MAX_PASSWORD_LEN) {
      return NextResponse.json(
        { error: "Password is too long" },
        { status: 400 },
      );
    }
    if (!name || name.length > MAX_NAME_LEN) {
      return NextResponse.json(
        { error: "Name is required (max 120 characters)" },
        { status: 400 },
      );
    }

    const email = normalizeEmail(emailRaw);
    await connectMongoose();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      return NextResponse.json(
        {
          error:
            "Unable to register with this email. Try signing in or use a different address.",
        },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    await UserModel.create({
      email,
      name,
      passwordHash,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    return jsonInternalError(e, "POST /api/auth/register");
  }
}
