"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="max-w-lg mx-auto px-8 py-24 text-center">
      <span className="font-mono text-xs tracking-widest text-blood uppercase block mb-4">
        Expediente corrupto
      </span>
      <h1 className="font-display text-3xl mb-4">Algo salió mal.</h1>
      <p className="text-bone-dim mb-10 leading-relaxed">
        Ocurrió un error al cargar esta página. No es tu culpa — inténtalo de nuevo.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="font-mono text-sm tracking-wide px-6 py-3 rounded border border-border-dark text-bone-dim hover:border-amber hover:text-amber"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
