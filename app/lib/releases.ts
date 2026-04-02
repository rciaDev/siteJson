import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";
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

export async function createRelease(entry: ReleaseEntry) {
  const db = getDb();
  const doc: ReleaseDoc = { ...entry, createdAt: serverTimestamp() };
  return await addDoc(collection(db, COLLECTION), doc);
}

export async function listReleases(max = 20): Promise<ReleaseEntry[]> {
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
    };
  });
}

export async function getLatestRelease(): Promise<ReleaseEntry | null> {
  const list = await listReleases(1);
  return list[0] ?? null;
}

