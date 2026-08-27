import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";
import EnviarForm from "./EnviarForm";

async function enviarHistoria(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const captchaOk = await verifyTurnstile(formData.get("cf-turnstile-response") as string | null);
  if (!captchaOk) {
    redirect(`/enviar?error=${encodeURIComponent("No pudimos verificar que eres humano. Intenta de nuevo.")}`);
  }

  const mode = formData.get("mode") as string;
  const channelConsent = formData.get("channel_consent") === "on";

  const { error } = await supabase.from("stories").insert({
    author_id: user.id,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    location: formData.get("location") as string,
    mode,
    category: formData.get("category") as string,
    channel_consent: channelConsent,
  });

  if (error) {
    redirect(`/enviar?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/enviar?exito=1");
}

export default async function EnviarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; exito?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { error, exito } = await searchParams;

  return (
    <main className="max-w-2xl mx-auto px-8 py-16">
      <span className="font-mono text-xs tracking-widest text-blood uppercase block mb-4">
        Abre un expediente
      </span>
      <h1 className="font-display text-3xl mb-3">¿Tienes algo que confesar?</h1>
      <p className="text-bone-dim mb-10 leading-relaxed">
        Tu historia entra a revisión antes de publicarse. Si autorizas que se use en el canal,
        puede ser narrada en video — con o sin tu nombre, según el modo que elijas.
      </p>

      {error && (
        <p className="font-mono text-xs text-blood border border-blood rounded px-3 py-2 mb-6">
          {error}
        </p>
      )}
      {exito && (
        <p className="font-mono text-xs text-amber border border-amber rounded px-3 py-2 mb-6">
          Tu testimonio quedó archivado. Te avisaremos cuando sea revisado.
        </p>
      )}

      <EnviarForm action={enviarHistoria} username={profile?.username ?? "usuario"} />
    </main>
  );
}
