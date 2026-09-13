"use client";

export default function DeleteEntryButton({ action }: { action: (f: FormData) => Promise<void> }) {
  return (
    <button
      type="submit"
      formAction={action}
      onClick={(e) => {
        if (!confirm("¿Eliminar este corto del concurso?")) e.preventDefault();
      }}
      className="font-mono text-xs uppercase tracking-wide text-blood hover:text-bone px-3 py-2 shrink-0"
    >
      Eliminar
    </button>
  );
}
