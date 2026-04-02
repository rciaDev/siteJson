import { Timestamp, addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getDb } from "./firebase";

export type ReleaseEntry = {
  versao: string;
  release: string;
  data: string; // YYYY-MM-DD
  novidades: string[];
  correcoes: string[];
};

type ReleaseDoc = ReleaseEntry & {
  createdAt?: unknown;
};

const COLLECTION = "releases";

export type ReleaseMeta = {
  createdAt: Date | null;
};

export type ReleaseEntryWithMeta = ReleaseEntry & ReleaseMeta;

export async function createRelease(entry: ReleaseEntry) {
  const db = getDb();
  const doc: ReleaseDoc = { ...entry, createdAt: serverTimestamp() };
  return await addDoc(collection(db, COLLECTION), doc);
}

function toCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value && "toDate" in value && typeof (value as any).toDate === "function") {
    try {
      return (value as any).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

export async function listReleases(max = 20): Promise<ReleaseEntryWithMeta[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as ReleaseDoc;
    return {
      versao: String(data.versao ?? ""),
      release: String(data.release ?? ""),
      data: String(data.data ?? ""),
      novidades: Array.isArray(data.novidades) ? data.novidades.map(String) : [],
      correcoes: Array.isArray(data.correcoes) ? data.correcoes.map(String) : [],
      createdAt: toCreatedAt(data.createdAt),
    };
  });
}

export async function getLatestRelease(): Promise<ReleaseEntryWithMeta | null> {
  const list = await listReleases(1);
  return list[0] ?? null;
}

export async function getLastUpdatedAt(): Promise<Date | null> {
  const latest = await getLatestRelease();
  return latest?.createdAt ?? null;
}

