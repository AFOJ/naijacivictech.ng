import { NextResponse } from "next/server";

/** Log server-side; never expose internal Error.message to clients. */
export function jsonInternalError(
  e: unknown,
  context?: string,
): NextResponse {
  if (context) {
    console.error(`[api] ${context}`, e);
  } else {
    console.error("[api]", e);
  }
  return NextResponse.json(
    { error: "Something went wrong" },
    { status: 500 },
  );
}
