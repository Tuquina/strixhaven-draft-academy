import { supabase } from "./supabaseClient";
import type { Tournament } from "../types";

const TABLE = "tournaments";

export function isCloudConfigured(): boolean {
  return supabase !== null;
}

export async function fetchCloudTournaments(): Promise<Tournament[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select("data");
  if (error) return null;
  return data.map((row) => row.data as Tournament);
}

export async function pushTournament(tournament: Tournament): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: tournament.id, data: tournament, updated_at: tournament.updatedAt });
  return !error;
}

export async function deleteCloudTournament(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return !error;
}

// Local storage is the source of truth while offline; this only resolves
// what happens when a tournament exists on both sides after a reconnect.
// Last-write-wins per tournament, keyed by updatedAt.
export function mergeTournaments(local: Tournament[], cloud: Tournament[]): Tournament[] {
  const byId = new Map<string, Tournament>();
  for (const t of local) byId.set(t.id, t);
  for (const t of cloud) {
    const existing = byId.get(t.id);
    if (!existing || new Date(t.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(t.id, t);
    }
  }
  return Array.from(byId.values());
}
