import { getLatestRelease } from "../../../lib/releases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const latest = await getLatestRelease();
  const payload = latest ? [latest] : [];

  return Response.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

