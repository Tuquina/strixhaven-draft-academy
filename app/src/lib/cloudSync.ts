import { supabase } from "./supabaseClient";
import { normalizeTournament } from "./storage";
import type { Tournament } from "../types";

const TABLE = "tournaments";
const DELETED_TABLE = "deleted_tournaments";

export function isCloudConfigured(): boolean {
  return supabase !== null;
}

export async function fetchCloudTournaments(): Promise<Tournament[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select("data");
  if (error) return null;
  return data.map((row) => normalizeTournament(row.data as Tournament));
}

// Tombstones of tournaments deleted from any device, so a device that still
// has a stale local copy knows to drop it instead of keeping (and re-pushing)
// a tournament someone else deleted.
export async function fetchDeletedTournamentIds(): Promise<Set<string> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(DELETED_TABLE).select("id");
  if (error) return null;
  return new Set(data.map((row) => row.id as string));
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
  const [deleteResult, tombstoneResult] = await Promise.all([
    supabase.from(TABLE).delete().eq("id", id),
    supabase.from(DELETED_TABLE).upsert({ id }),
  ]);
  return !deleteResult.error && !tombstoneResult.error;
}

// Local storage is the source of truth while offline; this only resolves
// what happens when a tournament exists on both sides after a reconnect.
// Last-write-wins per tournament, keyed by updatedAt. Tournaments tombstoned
// by any device (deletedIds) are dropped from both sides.
export function mergeTournaments(
  local: Tournament[],
  cloud: Tournament[],
  deletedIds: Set<string> = new Set()
): Tournament[] {
  const byId = new Map<string, Tournament>();
  for (const t of local) {
    if (!deletedIds.has(t.id)) byId.set(t.id, t);
  }
  for (const t of cloud) {
    if (deletedIds.has(t.id)) continue;
    const existing = byId.get(t.id);
    if (!existing || new Date(t.updatedAt) > new Date(existing.updatedAt)) {
      byId.set(t.id, t);
    }
  }
  return Array.from(byId.values());
}
