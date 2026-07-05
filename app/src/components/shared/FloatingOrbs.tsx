interface OrbSpec {
  size: number;
  color: string;
  blur: number;
  animation: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
}

const ORBS: OrbSpec[] = [
  { size: 180, color: "rgba(0, 200, 180, 0.35)", blur: 40, top: "10%", left: "4%", animation: "orbFloat1 12s ease-in-out infinite" },
  { size: 140, color: "rgba(120, 60, 200, 0.4)", blur: 35, top: "28%", right: "6%", animation: "orbFloat2 15s ease-in-out infinite" },
  { size: 120, color: "rgba(212, 175, 55, 0.35)", blur: 30, bottom: "22%", left: "8%", animation: "orbFloat3 18s ease-in-out infinite" },
  { size: 160, color: "rgba(50, 180, 80, 0.3)", blur: 38, bottom: "35%", right: "4%", animation: "orbFloat1 20s ease-in-out infinite reverse" },
  { size: 100, color: "rgba(0, 180, 200, 0.25)", blur: 25, top: "55%", left: "50%", animation: "orbFloat2 14s ease-in-out infinite" },
  { size: 90, color: "rgba(160, 80, 220, 0.3)", blur: 28, top: "5%", right: "28%", animation: "orbFloat3 16s ease-in-out infinite" },
];

export function FloatingOrbs() {
  return (
    <>
      {ORBS.map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none fixed rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 65%)`,
            filter: `blur(${orb.blur}px)`,
            animation: orb.animation,
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
