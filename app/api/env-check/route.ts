const REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  return Response.json(
    {
      ok: missing.length === 0,
      missing,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}

