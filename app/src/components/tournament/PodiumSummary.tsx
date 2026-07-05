import type { StandingRow } from "../../lib/standings";

const MEDALS = ["🥇", "🥈", "🥉"];

interface PodiumSummaryProps {
  podium: StandingRow[];
}

export function PodiumSummary({ podium }: PodiumSummaryProps) {
  if (podium.length === 0) return null;
  const champion = podium[0];

  return (
    <div className="bg-gradient-to-b from-gold/6 to-transparent px-6 py-10 text-center">
      <h2 className="m-0 mb-8 font-heading text-[28px] font-extrabold text-gold">Podio Final</h2>
      <div className="mx-auto flex max-w-[600px] flex-wrap items-end justify-center gap-8">
        {podium.map((p, i) => (
          <div key={p.id} className="animate-fade-in flex flex-col items-center gap-2">
            <div className="text-4xl">{MEDALS[i]}</div>
            <div className="font-heading text-lg font-bold text-parchment">{p.name}</div>
            <div className="font-sans text-[13px] text-parchment/50">{p.comboName}</div>
            <div className="font-sans text-sm font-bold text-gold">{p.pts} pts</div>
          </div>
        ))}
      </div>
      <div className="mt-7 inline-block max-w-[500px] rounded-lg border border-gold/12 bg-gold/6 px-5 py-4">
        <p className="m-0 font-sans text-sm font-semibold text-parchment/60">
          Campeón: {champion.name} con {champion.comboName}
        </p>
        <p className="m-0 mt-1 font-sans text-xs text-parchment/30">Hosted by Fernando Tuquina</p>
      </div>
    </div>
  );
}
