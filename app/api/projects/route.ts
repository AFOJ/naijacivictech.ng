import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jsonInternalError } from "@/lib/api-error-response";
import {
  createIdeaFromBody,
  createListingFromBody,
  parseCreateIdeaBody,
  parseCreateListingBody,
} from "@/lib/api/create-project";
import { checkRateLimit, clientIp } from "@/lib/rate-limit-ip";
import {
  getProjectsStats,
  listProjectsPage,
  type ProjectListSort,
} from "@/lib/services/server/projects";

function parseSort(raw: string | null): ProjectListSort | undefined {
  if (raw === "latest" || raw === "oldest" || raw === "votes") return raw;
  return undefined;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const viewerId = session?.user?.id ?? null;
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    if (scope === "stats") {
      const stats = await getProjectsStats();
      return NextResponse.json({ stats });
    }

    if (scope === "directory" || scope === "pipeline") {
      const limitRaw = Number(searchParams.get("limit") ?? "24");
      const limit = Number.isFinite(limitRaw) ? limitRaw : 24;
      const cursor = searchParams.get("cursor");
      const sort = parseSort(searchParams.get("sort"));
      const category = searchParams.get("category");
      const q = searchParams.get("q");
      const includeTotal = cursor == null || cursor === "";

      const page = await listProjectsPage(viewerId, {
        scope,
        limit,
        cursor: cursor || undefined,
        sort,
        category: category || undefined,
        search: q || undefined,
        includeTotal,
      });
      return NextResponse.json(page);
    }

    return NextResponse.json(
      { error: "Missing or invalid scope (use stats, directory, or pipeline)" },
      { status: 400 },
    );
  } catch (e) {
    return jsonInternalError(e, "GET /api/projects");
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = checkRateLimit(`create-project:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }

  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const userEmail = session?.user?.email ?? null;
    const userName = session?.user?.name ?? null;
    const authCtx = { userId, userEmail, userName };

    const body: unknown = await request.json();
    const kind =
      body && typeof body === "object" && "kind" in body
        ? (body as { kind?: unknown }).kind
        : undefined;

    if (kind === "listing") {
      const project = await createListingFromBody(
        parseCreateListingBody(body),
        authCtx,
      );
      return NextResponse.json({ project }, { status: 201 });
    }
    if (kind === "idea") {
      const project = await createIdeaFromBody(
        parseCreateIdeaBody(body),
        authCtx,
      );
      return NextResponse.json({ project }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Unsupported kind; use listing or idea" },
      { status: 400 },
    );
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create project";
    const status =
      message.startsWith("Expected") ||
      message.includes("required") ||
      message === "Invalid body" ||
      message.includes("must be at most")
        ? 400
        : 500;
    if (status === 500) {
      return jsonInternalError(e, "POST /api/projects");
    }
    return NextResponse.json({ error: message }, { status });
  }
}
