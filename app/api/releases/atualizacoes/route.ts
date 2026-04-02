import { listReleases } from "../../../lib/releases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatPtBrDateTime(date: Date) {
  const d = pad2(date.getDate());
  const m = pad2(date.getMonth() + 1);
  const y = date.getFullYear();
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

export async function GET() {
  const releases = await listReleases(15);
  return Response.json(
    {
      releases: releases.map((r) => ({
        versao: r.versao,
        release: r.release,
        data: r.data,
        novidades: r.novidades ?? [],
        correcoes: r.correcoes ?? [],
        Data: r.createdAt ? formatPtBrDateTime(r.createdAt) : null,
      })),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

