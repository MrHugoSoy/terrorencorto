import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { entryId, contestId } = await req.json();

  const { data: contest } = await supabase
    .from("contests")
    .select("is_active, ends_at")
    .eq("id", contestId)
    .single();

  const isOpen = contest?.is_active && (!contest.ends_at || new Date(contest.ends_at) > new Date());
  if (!isOpen) {
    return NextResponse.json({ error: "La votación para este concurso no está abierta." }, { status: 400 });
  }

  const { data: entry } = await supabase
    .from("contest_entries")
    .select("contest_id")
    .eq("id", entryId)
    .single();

  if (entry?.contest_id !== contestId) {
    return NextResponse.json({ error: "Este corto no pertenece a este concurso." }, { status: 400 });
  }

  const { error } = await supabase.from("contest_votes").insert({
    entry_id: entryId,
    contest_id: contestId,
    user_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
