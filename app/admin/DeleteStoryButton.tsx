"use client";

export default function DeleteStoryButton({ action }: { action: (f: FormData) => Promise<void> }) {
  return (
    <button
      type="submit"
      formAction={action}
      onClick={(e) => {
        if (!confirm("¿Eliminar esta historia permanentemente?")) {
          e.preventDefault();
        }
      }}
      className="font-mono text-xs uppercase tracking-wide rounded px-3 py-2 border border-blood text-blood hover:bg-blood hover:text-bone"
    >
      Eliminar
    </button>
  );
}
