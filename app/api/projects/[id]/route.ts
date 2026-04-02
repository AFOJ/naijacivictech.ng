import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonInternalError } from "@/lib/api-error-response";
import { getProjectById, parseProjectObjectId } from "@/lib/services/server/projects";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!parseProjectObjectId(id)) {
      return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
    }
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    const project = await getProjectById(id, viewerId);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (e) {
    return jsonInternalError(e, "GET /api/projects/[id]");
  }
}
