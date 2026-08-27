import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function registro(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const username = (formData.get("username") as string)?.trim().toLowerCase();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: { username },
    },
  });

  if (error) {
    redirect(`/registro?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?mensaje=revisa-tu-correo");
}

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="max-w-sm mx-auto px-8 py-20">
      <h1 className="font-display text-2xl mb-2">Abre tu expediente</h1>
      <p className="text-bone-dim text-sm mb-8">
        Un usuario, dos formas de publicar: con tu nombre o sin él. Tú decides cada vez que envías una historia.
      </p>

      {error && (
        <p className="font-mono text-xs text-blood border border-blood rounded px-3 py-2 mb-6">
          {error}
        </p>
      )}

      <form action={registro} className="flex flex-col gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
            Nombre de usuario
          </label>
          <input
            name="username"
            type="text"
            required
            pattern="[a-z0-9_]{3,20}"
            title="Solo minúsculas, números y guión bajo, 3-20 caracteres"
            placeholder="testigo07"
            className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
            Correo
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-wide text-bone-dim mb-2">
            Contraseña
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
          />
        </div>
        <button
          type="submit"
          className="mt-2 font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
        >
          Crear mi cuenta
        </button>
      </form>

      <p className="font-mono text-xs text-bone-dim mt-8">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-amber">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
