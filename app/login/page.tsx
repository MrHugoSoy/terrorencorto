import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function login(formData: FormData) {
  "use server";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="max-w-sm mx-auto px-8 py-20">
      <h1 className="font-display text-2xl mb-2">Bienvenido de vuelta</h1>
      <p className="text-bone-dim text-sm mb-8">
        Tu identidad solo se muestra en modo autor. En incógnito, nunca se revela.
      </p>

      {error && (
        <p className="font-mono text-xs text-blood border border-blood rounded px-3 py-2 mb-6">
          {error}
        </p>
      )}

      <form action={login} className="flex flex-col gap-4">
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
            className="w-full bg-void border border-border-dark rounded px-3 py-3 text-bone focus:outline-none focus:border-amber"
          />
        </div>
        <button
          type="submit"
          className="mt-2 font-mono text-sm tracking-wide px-6 py-3 rounded bg-blood-deep border border-blood hover:bg-blood"
        >
          Entrar al archivo
        </button>
      </form>

      <p className="font-mono text-xs text-bone-dim mt-8">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-amber">
          Crea una
        </Link>
      </p>
    </main>
  );
}
