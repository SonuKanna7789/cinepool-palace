import { supabase } from "@/lib/supabase";
import type { Crew, CrewMessage, WatchParty } from "@/types";
import { getProfilesByIds } from "./profiles";

export async function getCrews(userId: string): Promise<Crew[]> {
  const [{ data: crews, error }, { data: memberships }] = await Promise.all([
    supabase.from("crews").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("crew_members").select("crew_id, user_id"),
  ]);
  if (error) throw error;

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const m of memberships ?? []) {
    counts.set(m.crew_id, (counts.get(m.crew_id) ?? 0) + 1);
    if (m.user_id === userId) mine.add(m.crew_id);
  }
  return (crews ?? []).map((c: Crew) => ({
    ...c,
    member_count: counts.get(c.id) ?? 0,
    is_member: mine.has(c.id),
  }));
}

export async function getCrew(crewId: string, userId: string): Promise<Crew | null> {
  const { data, error } = await supabase.from("crews").select("*").eq("id", crewId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { data: members } = await supabase
    .from("crew_members")
    .select("user_id")
    .eq("crew_id", crewId);
  return {
    ...data,
    member_count: members?.length ?? 0,
    is_member: (members ?? []).some((m: { user_id: string }) => m.user_id === userId),
  };
}

export async function createCrew(input: {
  userId: string;
  name: string;
  description?: string;
  city?: string;
  emoji?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("crews")
    .insert({
      name: input.name,
      description: input.description || null,
      city: input.city || null,
      emoji: input.emoji || "🎬",
      created_by: input.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  await supabase
    .from("crew_members")
    .insert({ crew_id: data.id, user_id: input.userId, role: "owner" });
  return data.id;
}

export async function joinCrew(crewId: string, userId: string) {
  const { error } = await supabase.from("crew_members").insert({ crew_id: crewId, user_id: userId });
  if (error) throw error;
}

export async function leaveCrew(crewId: string, userId: string) {
  const { error } = await supabase
    .from("crew_members")
    .delete()
    .eq("crew_id", crewId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getMessages(crewId: string): Promise<CrewMessage[]> {
  const { data, error } = await supabase
    .from("crew_messages")
    .select("*")
    .eq("crew_id", crewId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  const messages = data ?? [];
  const profiles = await getProfilesByIds(messages.map((m: CrewMessage) => m.user_id));
  return messages.map((m: CrewMessage) => ({ ...m, profile: profiles.get(m.user_id) ?? null }));
}

export async function sendMessage(crewId: string, userId: string, body: string) {
  const { error } = await supabase
    .from("crew_messages")
    .insert({ crew_id: crewId, user_id: userId, body });
  if (error) throw error;
}

export function subscribeToMessages(crewId: string, onMessage: () => void) {
  const channel = supabase
    .channel(`crew-chat-${crewId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "crew_messages", filter: `crew_id=eq.${crewId}` },
      onMessage
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getParties(crewId: string, userId: string): Promise<WatchParty[]> {
  const { data, error } = await supabase
    .from("watch_parties")
    .select("*")
    .eq("crew_id", crewId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  const parties = data ?? [];
  if (parties.length === 0) return [];

  const { data: rsvps } = await supabase
    .from("party_rsvps")
    .select("party_id, user_id, status")
    .in("party_id", parties.map((p: WatchParty) => p.id));

  return parties.map((p: WatchParty) => {
    const partyRsvps = (rsvps ?? []).filter((r) => r.party_id === p.id);
    const mine = partyRsvps.find((r) => r.user_id === userId);
    return {
      ...p,
      rsvp_count: partyRsvps.filter((r) => r.status === "in").length,
      my_rsvp: (mine?.status as WatchParty["my_rsvp"]) ?? null,
    };
  });
}

export async function createParty(input: {
  crewId: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  posterPath: string | null;
  cinemaName: string;
  city?: string;
  startsAt: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from("watch_parties")
    .insert({
      crew_id: input.crewId,
      movie_id: input.movieId,
      movie_title: input.movieTitle,
      poster_path: input.posterPath,
      cinema_name: input.cinemaName,
      city: input.city || null,
      starts_at: input.startsAt,
      notes: input.notes || null,
      created_by: input.userId,
    })
    .select("id")
    .single();
  if (error) throw error;
  await supabase
    .from("party_rsvps")
    .insert({ party_id: data.id, user_id: input.userId, status: "in" });
}

export async function rsvp(partyId: string, userId: string, status: "in" | "maybe" | "out") {
  const { error } = await supabase
    .from("party_rsvps")
    .upsert({ party_id: partyId, user_id: userId, status });
  if (error) throw error;
}
