"use client";

import { useRef } from "react";

export default function DeleteContestButton({ action, id }: { action: (f: FormData) => Promise<void>; id: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={() => {
          if (confirm("¿Eliminar este concurso y todos sus cortos y votos?")) {
            formRef.current?.requestSubmit();
          }
        }}
        className="font-mono text-xs uppercase tracking-wide rounded px-4 py-2 border border-blood text-blood hover:bg-blood hover:text-bone"
      >
        Eliminar
      </button>
    </form>
  );
}
