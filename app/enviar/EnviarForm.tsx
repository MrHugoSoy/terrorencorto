"use client";

import { useState } from "react";

export default function EnviarForm({
  action,
  username,
}: {
  action: (formData: FormData) => void;
  username: string;
}) {
  const [mode, setMode] = useState<"autor" | "incognito">("autor");
  const [category, setCategory] = useState<"sin_resolver" | "testimonio_real" | "archivado">("sin_resolver");

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="category" value={category} />

      <div className="flex border border-border-dark rounded overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("autor")}
          className={`flex-1 py-3 font-mono text-xs uppercase tracking-wide ${
            mode === "autor" ? "bg-blood-deep text-bone" : "bg-void text-bone-dim"
          }`}
        >
          Publicar como autor
        </button>
        <button
          type="button"
          onClick={() => setMode("incognito")}
          className={`flex-1 py-3 font-mono text-xs uppercase tracking-wide border-l border-border-dark ${
            mode === "incognito" ? "bg-blood-deep text-bone" : "bg-void text-bone-dim"
          }`}
        >
          Modo incógnito
        </button>
      </div>

      <p className="font-mono text-xs text-bone-dim -mt-2">
        {mode === "autor" ? (
          <>Se publicará firmado como <span className="text-amber">@{username}</span></>
        ) : (
          <>Se publicará como <span className="text-amber">testigo anónimo</span> — sin ligarlo a tu cuenta en el sitio público</>
        )}
      </p>

      <div>
        <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
          Título
        </label>
        <input
          name="title"
          required
          maxLength={120}
          className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
          Describe lo que viste
        </label>
        <textarea
          name="content"
          required
          rows={8}
          placeholder="Empieza con dónde estabas y qué fue lo primero que notaste fuera de lugar..."
          className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber resize-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
          Dónde ocurrió
        </label>
        <input
          name="location"
          placeholder="Ciudad, lugar específico"
          className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-3">
          ¿Cómo clasificas tu historia?
        </label>
        <div className="flex flex-col gap-2">
          {([
            { value: "sin_resolver", label: "Sin resolver", desc: "Nunca encontré explicación para lo que ocurrió" },
            { value: "testimonio_real", label: "Testimonio real", desc: "Confirmo que lo viví y puedo dar fe de ello" },
            { value: "archivado", label: "Archivado", desc: "Ya tiene contexto o conclusión, pero lo comparto" },
          ] as const).map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`text-left px-4 py-3 rounded border transition-colors ${
                category === value
                  ? "border-amber bg-amber/10 text-bone"
                  : "border-border-dark text-bone-dim hover:border-amber/50"
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-wide block mb-0.5">{label}</span>
              <span className="text-xs">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 font-mono text-xs text-bone-dim leading-relaxed border border-border-dark rounded px-4 py-4">
        <input type="checkbox" name="channel_consent" className="mt-0.5" />
        Autorizo que esta historia sea narrada en el canal de YouTube @terrorencorto,
        respetando el modo de publicación que elegí arriba (con mi nombre o de forma anónima).
      </label>

      <button
        type="submit"
        className="mt-1 font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
      >
        Archivar mi testimonio
      </button>
    </form>
  );
}
