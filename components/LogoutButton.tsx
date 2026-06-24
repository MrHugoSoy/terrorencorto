"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="font-mono text-xs uppercase tracking-wider border border-border-dark px-4 py-2 rounded hover:border-amber hover:text-amber"
    >
      Cerrar sesión
    </button>
  );
}
