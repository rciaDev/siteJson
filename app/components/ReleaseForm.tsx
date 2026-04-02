"use client";

import { useEffect, useMemo, useState } from "react";
import { createRelease, listReleases, type ReleaseEntry } from "../lib/releases";

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toPrettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function ReleaseForm() {
  const [versao, setVersao] = useState("");
  const [release, setRelease] = useState("");
  const [data, setData] = useState("");
  const [novidadesText, setNovidadesText] = useState("");
  const [correcoesText, setCorrecoesText] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [history, setHistory] = useState<ReleaseEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const payload = useMemo<ReleaseEntry>(
    () => ({
      versao: versao.trim(),
      release: release.trim(),
      data: data.trim(),
      novidades: splitLines(novidadesText),
      correcoes: splitLines(correcoesText),
    }),
    [versao, release, data, novidadesText, correcoesText],
  );

  async function refreshHistory() {
    setLoadingHistory(true);
    try {
      const items = await listReleases(20);
      setHistory(items);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    refreshHistory().catch(() => {
      // erros tratados via UI no submit
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    if (!payload.versao || !payload.release || !payload.data) {
      setError("Preencha versão, release e data.");
      return;
    }

    setSaving(true);
    try {
      await createRelease(payload);
      setOkMsg("Salvo com sucesso.");
      setNovidadesText("");
      setCorrecoesText("");
      await refreshHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Cadastro de Releases (JSON)</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Preencha os campos e salve. O histórico fica registrado no Firebase (Firestore).
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <a
            className="underline underline-offset-4 text-zinc-800 dark:text-zinc-200"
            href="/api/releases/latest"
            target="_blank"
            rel="noreferrer"
          >
            Ver endpoint do último JSON
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Novo lançamento</h2>

          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Versão</div>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-zinc-700"
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
                  placeholder="1.05"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Release</div>
                <input
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-zinc-700"
                  value={release}
                  onChange={(e) => setRelease(e.target.value)}
                  placeholder="1681"
                />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Data</div>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-zinc-700"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Novidades (1 por linha)</div>
              <textarea
                className="mt-1 min-h-28 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-zinc-700"
                value={novidadesText}
                onChange={(e) => setNovidadesText(e.target.value)}
                placeholder={"Download de dlls atualizadas para envio de email.\nAdicionado suporte a histórico de atualizações."}
              />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Correções (1 por linha)</div>
              <textarea
                className="mt-1 min-h-24 w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300 dark:border-white/10 dark:bg-zinc-900 dark:focus:ring-zinc-700"
                value={correcoesText}
                onChange={(e) => setCorrecoesText(e.target.value)}
                placeholder={"Ajuste do relatório de vendas sem estoque ignorando produtos de consumo."}
              />
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}

            {okMsg ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
                {okMsg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold">Preview do JSON</h2>
            <span className="text-xs text-zinc-500">{new Date().toLocaleString()}</span>
          </div>

          <pre className="mt-4 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-5 text-zinc-800 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-100">
            {toPrettyJson([payload])}
          </pre>
        </section>
      </div>

      <section className="mt-10 rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <button
            type="button"
            onClick={() => refreshHistory().catch(() => {})}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900"
          >
            Atualizar
          </button>
        </div>

        {loadingHistory ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Carregando...</p>
        ) : history.length ? (
          <div className="mt-4 space-y-4">
            {history.map((item, idx) => (
              <details
                key={`${item.versao}-${item.release}-${item.data}-${idx}`}
                className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-950"
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">
                      v{item.versao} — release {item.release}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.data}</div>
                  </div>
                </summary>
                <pre className="mt-3 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-5 text-zinc-800 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-100">
                  {toPrettyJson([item])}
                </pre>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Nenhum registro ainda.</p>
        )}
      </section>
    </div>
  );
}

