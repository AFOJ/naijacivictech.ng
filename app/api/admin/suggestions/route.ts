import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { requireAdminSession } from "@/lib/require-admin";
import { listPipelineSuggestionsModerationPage } from "@/lib/services/server/projects";

export async function GET(request: Request) {
  const gate = await requireAdminSession();
  if (!gate.ok) {
    return NextResponse.json(
      { error: gate.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: gate.status },
    );
  }

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? "24");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 24;
  const cursor = searchParams.get("cursor");
  const includeTotal = cursor == null || cursor === "";

  try {
    const page = await listPipelineSuggestionsModerationPage(
      gate.session.user!.id,
      {
        limit,
        cursor: cursor || undefined,
        includeTotal,
      },
    );
    return NextResponse.json(page);
  } catch (e) {
    return jsonInternalError(e, "GET admin/suggestions");
  }
}
