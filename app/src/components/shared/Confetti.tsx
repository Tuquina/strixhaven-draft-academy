import { useMemo } from "react";

const COLORS = ["#C89B3C", "#3FA7FF", "#9D6BFF", "#4E9F3D", "#D3202A", "#E9D8B4"];
const PARTICLE_COUNT = 60;

interface ConfettiProps {
  active: boolean;
}

export function Confetti({ active }: ConfettiProps) {
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      key: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      color: COLORS[i % COLORS.length],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
      round: Math.random() > 0.5,
    }));
    // Regenerate only when a new celebration starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.key}
          style={{
            position: "absolute",
            left: p.left + "%",
            top: "-20px",
            width: p.size + "px",
            height: p.size + "px",
            backgroundColor: p.color,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            borderRadius: p.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
