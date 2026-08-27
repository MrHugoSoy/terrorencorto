import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import MobileNav from "@/components/MobileNav";
import Avatar from "@/components/Avatar";

export const metadata: Metadata = {
  metadataBase: new URL("https://terrorencorto.com"),
  title: "Terror en Corto",
  description: "Archivo de testimonios reales, leyendas urbanas y encuentros sin explicación.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin, avatar_url").eq("id", user.id).single()
    : { data: null };
  const isAdmin = !!profile?.is_admin;

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@700;800;900&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="grain" />
        <header className="border-b border-border-dark">
          <div className="max-w-325 mx-auto px-6 md:px-8 h-16 md:h-auto md:py-2 flex items-center justify-between">
            <Link href="/" className="shrink-0">
              <Image src="/logo.svg" alt="Terror en Corto" width={70} height={52} priority className="md:w-23.5 md:h-17.5" />
            </Link>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-wider text-bone-dim">
                <Link href="/" className="hover:text-amber">Inicio</Link>
                <Link href="/archivo" className="hover:text-amber">Archivo</Link>
                <Link href="/concurso" className="hover:text-amber">Concurso</Link>
                <Link href="/videos" className="hover:text-amber">Videos</Link>
                <Link href="/enviar" className="hover:text-amber">Enviar historia</Link>
                {isAdmin && <Link href="/admin" className="text-blood hover:text-amber">Admin</Link>}
                {isAdmin && <Link href="/admin/concurso" className="text-blood hover:text-amber">Concurso admin</Link>}
                {isAdmin && <Link href="/admin/videos" className="text-blood hover:text-amber">Videos admin</Link>}
              </nav>
              <div className="hidden md:flex items-center gap-4">
                {user && (
                  <Link href="/perfil" aria-label="Mi perfil" className="opacity-80 hover:opacity-100">
                    <Avatar src={profile?.avatar_url} size={28} />
                  </Link>
                )}
                {user ? (
                  <LogoutButton />
                ) : (
                  <Link
                    href="/login"
                    className="font-mono text-xs uppercase tracking-wider border border-border-dark px-4 py-2 rounded hover:border-amber hover:text-amber"
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
              <MobileNav loggedIn={!!user} isAdmin={isAdmin} avatarUrl={profile?.avatar_url ?? null} />
            </div>
          </div>
        </header>
        {children}
        <footer className="border-t border-border-dark mt-20">
          <div className="max-w-325 mx-auto px-8 py-9 font-mono text-xs text-bone-dim leading-relaxed">
            ADVERTENCIA: el contenido de este archivo no ha sido verificado por ninguna autoridad. Léase bajo su propio riesgo.
            <br />
            © Terror en Corto. Algunas historias pueden ser narradas en el canal de YouTube @terrorencorto con autorización del autor.
          </div>
        </footer>
      </body>
    </html>
  );
}
