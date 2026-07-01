import { db } from "@/db";
import { memories } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const buildingId = url.searchParams.get("buildingId");
    const rows = buildingId
      ? await db
          .select()
          .from(memories)
          .where(eq(memories.buildingId, buildingId))
          .orderBy(desc(memories.createdAt))
      : await db.select().from(memories).orderBy(desc(memories.createdAt)).limit(500);
    return Response.json({ memories: rows });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const author = String(body.author ?? "").trim();
    const message = String(body.message ?? "").trim();
    const buildingId = String(body.buildingId ?? "").trim();
    const buildingName = String(body.buildingName ?? "").trim();

    if (!author || author.length > 80) {
      return Response.json({ error: "Name is required (max 80 chars)." }, { status: 400 });
    }
    if (!message || message.length > 2000) {
      return Response.json(
        { error: "Message is required (max 2000 chars)." },
        { status: 400 },
      );
    }
    if (!buildingId || !buildingName) {
      return Response.json({ error: "A building must be selected." }, { status: 400 });
    }

    const role = ["student", "alumni", "staff", "visitor"].includes(body.role)
      ? body.role
      : "student";
    const gradYearRaw = Number(body.gradYear);
    const gradYear =
      Number.isInteger(gradYearRaw) && gradYearRaw >= 1960 && gradYearRaw <= 2100
        ? gradYearRaw
        : null;
    const faculty =
      typeof body.faculty === "string" && body.faculty.trim()
        ? body.faculty.trim().slice(0, 80)
        : null;
    const photoUrl =
      typeof body.photoUrl === "string" && /^https?:\/\//.test(body.photoUrl.trim())
        ? body.photoUrl.trim().slice(0, 1000)
        : null;

    const [row] = await db
      .insert(memories)
      .values({
        buildingId,
        buildingName: buildingName.slice(0, 120),
        author: author.slice(0, 80),
        role,
        gradYear,
        faculty,
        message,
        photoUrl,
      })
      .returning();

    return Response.json({ memory: row }, { status: 201 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
