import { useCallback, useEffect, useRef, useState } from "react";
import { genId } from "../lib/id";
import { getColorCombo } from "../lib/colors";
import { generatePods, generateRoundRobin } from "../lib/schedule";
import { loadTournaments, normalizeTournament, saveTournaments } from "../lib/storage";
import { DEFAULT_COMMANDER_ROUNDS, DEFAULT_POD_SIZE, isMultiplayerFormat, MIN_POD_SIZE } from "../lib/gameFormats";
import {
  deleteCloudTournament,
  fetchCloudTournaments,
  isCloudConfigured,
  mergeTournaments,
  pushTournament,
} from "../lib/cloudSync";
import type {
  GameFormat,
  ManaColor,
  MatchFormat,
  MatchResult,
  PodResult,
  Tournament,
} from "../types";

export type SyncStatus = "disabled" | "syncing" | "synced" | "offline";

export interface CreateTournamentInput {
  name: string;
  description: string;
  format: MatchFormat;
  gameFormat: GameFormat;
  allowDraws: boolean;
}

export interface PlayerFormInput {
  editingId: string | null;
  name: string;
  colors: ManaColor[];
  notes: string;
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() =>
    loadTournaments()
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    isCloudConfigured() ? "syncing" : "disabled"
  );
  const isFirstRun = useRef(true);

  useEffect(() => {
    // Skip persisting the initial load straight back to storage.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    saveTournaments(tournaments);

    if (!isCloudConfigured()) return;
    setSyncStatus("syncing");
    Promise.all(tournaments.map((t) => pushTournament(t))).then((results) => {
      setSyncStatus(results.every(Boolean) ? "synced" : "offline");
    });
  }, [tournaments]);

  // One-time reconcile with the cloud on load: local storage is shown
  // immediately, then merged with whatever the cloud has (last-write-wins
  // per tournament) as soon as it's reachable.
  useEffect(() => {
    if (!isCloudConfigured()) return;
    let cancelled = false;
    fetchCloudTournaments().then((cloud) => {
      if (cancelled) return;
      if (cloud === null) {
        setSyncStatus("offline");
        return;
      }
      setTournaments((local) => mergeTournaments(local, cloud));
      setSyncStatus("synced");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateTournament = useCallback(
    (id: string, updater: (t: Tournament) => Tournament) => {
      setTournaments((all) =>
        all.map((t) =>
          t.id === id
            ? { ...updater(t), updatedAt: new Date().toISOString() }
            : t
        )
      );
    },
    []
  );

  const createTournament = useCallback((input: CreateTournamentInput): string => {
    const id = genId();
    const now = new Date().toISOString();
    const tournament: Tournament = {
      id,
      name: input.name.trim(),
      description: input.description.trim(),
      host: "Fernando Tuquina",
      status: "drafting",
      format: input.format,
      gameFormat: input.gameFormat,
      allowDraws: input.allowDraws,
      players: [],
      rounds: [],
      createdAt: now,
      updatedAt: now,
    };
    setTournaments((all) => [...all, tournament]);
    return id;
  }, []);

  const deleteTournament = useCallback((id: string) => {
    setTournaments((all) => all.filter((t) => t.id !== id));
    void deleteCloudTournament(id);
  }, []);

  const addOrUpdatePlayer = useCallback(
    (tournamentId: string, form: PlayerFormInput) => {
      const name = form.name.trim();
      if (!name) return;
      updateTournament(tournamentId, (t) => {
        const combo = getColorCombo(form.colors, t.gameFormat === "draft");
        if (form.editingId) {
          return {
            ...t,
            players: t.players.map((p) =>
              p.id === form.editingId
                ? {
                    ...p,
                    name,
                    colors: [...form.colors],
                    colorCombinationName: combo.name,
                    strixhavenCollegeName: combo.college,
                    deckNotes: form.notes.trim(),
                  }
                : p
            ),
          };
        }
        return {
          ...t,
          players: [
            ...t.players,
            {
              id: genId(),
              name,
              colors: [...form.colors],
              colorCombinationName: combo.name,
              strixhavenCollegeName: combo.college,
              deckNotes: form.notes.trim(),
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [updateTournament]
  );

  const removePlayer = useCallback(
    (tournamentId: string, playerId: string) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        players: t.players.filter((p) => p.id !== playerId),
        rounds: [],
        status: t.status === "active" ? "drafting" : t.status,
      }));
    },
    [updateTournament]
  );

  const generateSchedule = useCallback(
    (tournamentId: string, roundsCount?: number) => {
      updateTournament(tournamentId, (t) => {
        if (isMultiplayerFormat(t.gameFormat)) {
          if (t.players.length < MIN_POD_SIZE) return t;
          return {
            ...t,
            rounds: generatePods(t.players, roundsCount ?? DEFAULT_COMMANDER_ROUNDS, DEFAULT_POD_SIZE),
            status: "active",
          };
        }
        if (t.players.length < 2) return t;
        return {
          ...t,
          rounds: generateRoundRobin(t.players),
          status: "active",
        };
      });
    },
    [updateTournament]
  );

  const saveResult = useCallback(
    (tournamentId: string, matchId: string, result: MatchResult) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        rounds: t.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((m) =>
            m.id === matchId ? { ...m, status: "completed", result } : m
          ),
        })),
      }));
    },
    [updateTournament]
  );

  const savePodResult = useCallback(
    (tournamentId: string, podId: string, result: PodResult) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        rounds: t.rounds.map((round) => ({
          ...round,
          pods: (round.pods ?? []).map((pod) =>
            pod.id === podId ? { ...pod, status: "completed" as const, result } : pod
          ),
        })),
      }));
    },
    [updateTournament]
  );

  const finalizeTournament = useCallback(
    (tournamentId: string) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        status: "finished",
        finalizedAt: new Date().toISOString(),
      }));
    },
    [updateTournament]
  );

  const reopenTournament = useCallback(
    (tournamentId: string) => {
      updateTournament(tournamentId, (t) => ({
        ...t,
        status: "active",
        finalizedAt: undefined,
      }));
    },
    [updateTournament]
  );

  const exportTournament = useCallback((tournament: Tournament) => {
    const blob = new Blob([JSON.stringify(tournament, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (tournament.name || "torneo") + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importTournament = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(String(e.target?.result));
          if (!raw.name || !raw.players) throw new Error("invalid");
          const tournament: Tournament = normalizeTournament({ ...raw, id: genId() });
          setTournaments((all) => [...all, tournament]);
          resolve(true);
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  }, []);

  return {
    tournaments,
    syncStatus,
    createTournament,
    deleteTournament,
    updateTournament,
    addOrUpdatePlayer,
    removePlayer,
    generateSchedule,
    saveResult,
    savePodResult,
    finalizeTournament,
    reopenTournament,
    exportTournament,
    importTournament,
  };
}
