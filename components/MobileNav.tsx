"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MobileNav({ loggedIn, isAdmin }: { loggedIn: boolean; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
        className="md:hidden flex flex-col justify-center gap-1.25 p-2 -mr-2"
      >
        <span className={`block h-px bg-bone transition-all duration-200 ${open ? "w-6 rotate-45 translate-y-1.75" : "w-6"}`} />
        <span className={`block h-px bg-bone transition-all duration-200 ${open ? "opacity-0 w-6" : "w-6"}`} />
        <span className={`block h-px bg-bone transition-all duration-200 ${open ? "w-6 -rotate-45 -translate-y-1.75" : "w-4"}`} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-void flex flex-col md:hidden">
          {/* Header del overlay */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-border-dark shrink-0">
            <span className="font-display text-xl">Terror en Corto</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="text-bone-dim text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 flex flex-col px-6 overflow-y-auto">
            {[
              { href: "/", label: "Inicio" },
              { href: "/archivo", label: "Archivo" },
              { href: "/concurso", label: "Concurso" },
              { href: "/videos", label: "Videos" },
              { href: "/enviar", label: "Enviar historia" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-mono text-xl uppercase tracking-widest py-5 border-b border-border-dark transition-colors ${
                  pathname === href ? "text-amber" : "hover:text-amber"
                }`}
              >
                {label}
              </Link>
            ))}

            {loggedIn && (
              <>
                <Link href="/perfil" className={`font-mono text-xl uppercase tracking-widest py-5 border-b border-border-dark transition-colors ${pathname === "/perfil" ? "text-amber" : "hover:text-amber"}`}>
                  Mi perfil
                </Link>
                {isAdmin && (
                  <>
                    <div className="pt-6 pb-2">
                      <span className="font-mono text-xs text-bone-dim uppercase tracking-widest">Admin</span>
                    </div>
                    <Link href="/admin" className="font-mono text-xl uppercase tracking-widest py-5 border-b border-border-dark text-blood hover:text-amber">
                      Moderación
                    </Link>
                    <Link href="/admin/concurso" className="font-mono text-xl uppercase tracking-widest py-5 border-b border-border-dark text-blood hover:text-amber">
                      Concurso
                    </Link>
                    <Link href="/admin/videos" className="font-mono text-xl uppercase tracking-widest py-5 border-b border-border-dark text-blood hover:text-amber">
                      Videos
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Sesión */}
          <div className="px-6 py-6 shrink-0 border-t border-border-dark">
            {loggedIn ? (
              <button
                onClick={logout}
                className="w-full font-mono text-sm uppercase tracking-widest border border-border-dark text-bone-dim py-4 rounded hover:border-blood hover:text-blood transition-colors"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                className="block text-center font-mono text-sm uppercase tracking-widest border border-amber text-amber py-4 rounded hover:bg-amber hover:text-void transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
