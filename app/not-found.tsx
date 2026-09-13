import Link from "next/link";

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-8 py-24 text-center">
      <span className="font-mono text-xs tracking-widest text-blood uppercase block mb-4">
        Expediente no encontrado
      </span>
      <h1 className="font-display text-3xl mb-4">EXP-0000</h1>
      <p className="text-bone-dim mb-10 leading-relaxed">
        Esta página no existe, o el testimonio que buscas nunca quedó archivado aquí.
      </p>
      <Link
        href="/"
        className="inline-block font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
      >
        Volver al archivo
      </Link>
    </main>
  );
}
