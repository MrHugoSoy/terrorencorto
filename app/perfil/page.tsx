import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { texto: string; clase: string }> = {
  pendiente:         { texto: "En revisión",             clase: "text-bone-dim border-border-dark" },
  publicado:         { texto: "Publicado",               clase: "text-amber border-amber" },
  seleccionado_canal:{ texto: "Seleccionado para canal", clase: "text-amber border-amber" },
  usado_canal:       { texto: "Narrado en el canal",     clase: "text-amber border-amber" },
  rechazado:         { texto: "No aceptado",             clase: "text-blood border-blood" },
};

const CATEGORY_LABEL: Record<string, string> = {
  testimonio_real: "Testimonio real",
  leyenda_urbana:  "Leyenda urbana",
  paranormal:      "Paranormal",
  creepypasta:     "Creepypasta",
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, created_at")
    .eq("id", user.id)
    .single();

  const { data: stories } = await supabase
    .from("stories")
    .select("id, title, status, category, case_number, created_at, mode")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const publicadas = stories?.filter(s =>
    ["publicado", "seleccionado_canal", "usado_canal"].includes(s.status)
  ).length ?? 0;

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="border-b border-border-dark pb-8 mb-10">
        <p className="font-mono text-xs text-blood uppercase tracking-widest mb-2">Mi expediente</p>
        <h1 className="font-display text-3xl mb-1">@{profile?.username}</h1>
        <p className="font-mono text-xs text-bone-dim">
          {stories?.length ?? 0} historias enviadas · {publicadas} publicadas
        </p>
      </div>

      {!stories?.length && (
        <div className="text-center py-12">
          <p className="text-bone-dim mb-6">Aún no has enviado ninguna historia.</p>
          <Link
            href="/enviar"
            className="font-mono text-sm border border-blood text-blood px-6 py-3 rounded hover:bg-blood hover:text-bone"
          >
            Enviar mi primera historia
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {stories?.map((story) => {
          const estado = STATUS_LABEL[story.status] ?? STATUS_LABEL.pendiente;
          const categoria = CATEGORY_LABEL[story.category] ?? story.category;
          const isPublic = ["publicado", "seleccionado_canal", "usado_canal"].includes(story.status);

          return (
            <div key={story.id} className="border border-border-dark p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-bone-dim mb-1">{story.case_number}</p>
                  {isPublic ? (
                    <Link
                      href={`/historias/${story.id}`}
                      className="font-semibold hover:text-amber transition-colors"
                    >
                      {story.title}
                    </Link>
                  ) : (
                    <span className="font-semibold">{story.title}</span>
                  )}
                </div>
                <span className={`font-mono text-xs border rounded px-2 py-1 shrink-0 ${estado.clase}`}>
                  {estado.texto}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-xs text-bone-dim">
                <span>{categoria} · {story.mode === "incognito" ? "incógnito" : "con nombre"}</span>
                <span>{new Date(story.created_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>

              {story.status === "pendiente" && (
                <p className="font-mono text-xs text-bone-dim border-t border-border-dark pt-3">
                  Tu historia está en revisión. Te avisaremos cuando sea publicada.
                </p>
              )}
              {story.status === "rechazado" && (
                <p className="font-mono text-xs text-blood border-t border-border-dark pt-3">
                  Esta historia no cumplió los criterios de publicación.
                </p>
              )}
              {story.status === "usado_canal" && (
                <p className="font-mono text-xs text-amber border-t border-border-dark pt-3">
                  ¡Tu historia fue narrada en el canal! Puedes verla en la página del expediente.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
