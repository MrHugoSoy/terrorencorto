import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import DeleteVideoButton from "./DeleteVideoButton";

export const dynamic = "force-dynamic";

async function agregarVideo(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("channel_videos").insert({
    title: formData.get("title") as string,
    youtube_url: formData.get("youtube_url") as string,
    description: (formData.get("description") as string) || null,
  });
  if (error) throw new Error(`Error al guardar: ${error.message}`);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

async function eliminarVideo(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase.from("channel_videos").delete().eq("id", formData.get("id") as string);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

export default async function AdminVideosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/");

  const { data: videos } = await supabase
    .from("channel_videos")
    .select("id, title, youtube_url, description, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-325 mx-auto px-8 py-16">
      <h1 className="font-display text-2xl mb-2">Videos del canal</h1>
      <p className="text-bone-dim text-sm mb-10">Agrega los videos de YouTube que quieres mostrar en el sitio.</p>

      {/* Agregar video */}
      <div className="bg-paper border border-border-dark p-6 mb-10">
        <h2 className="font-display text-lg mb-5">Agregar video</h2>
        <form action={agregarVideo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="title" type="text" required placeholder="Título del video"
            className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
          <input name="youtube_url" type="url" required placeholder="https://youtube.com/watch?v=..."
            className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm font-mono" />
          <input name="description" type="text" placeholder="Descripción breve (opcional)"
            className="bg-void border border-border-dark rounded px-3 py-2 text-bone text-sm" />
          <div className="md:col-span-3">
            <button type="submit"
              className="font-mono text-xs uppercase tracking-wide border border-amber text-amber rounded px-5 py-2 hover:bg-amber hover:text-void">
              + Agregar video
            </button>
          </div>
        </form>
      </div>

      {/* Lista de videos */}
      <div className="flex flex-col gap-3">
        {!videos?.length && (
          <p className="font-mono text-xs text-bone-dim py-8 text-center border border-border-dark rounded">
            Todavía no hay videos agregados.
          </p>
        )}
        {videos?.map((video) => (
          <div key={video.id} className="flex items-center justify-between gap-4 border border-border-dark rounded px-4 py-3">
            <div className="min-w-0">
              <span className="font-semibold text-sm">{video.title}</span>
              <div className="font-mono text-xs text-bone-dim truncate">{video.youtube_url}</div>
            </div>
            <DeleteVideoButton action={eliminarVideo} id={video.id} />
          </div>
        ))}
      </div>
    </main>
  );
}
