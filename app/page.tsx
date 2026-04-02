import { ReleaseForm } from "./components/ReleaseForm";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col bg-zinc-50 dark:bg-black">
      <ReleaseForm />
      <footer className="mt-auto border-t border-zinc-200/70 bg-white py-6 text-center text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-400">
        Site simples para cadastro/consulta de JSON com Firebase.
      </footer>
    </div>
  );
}
