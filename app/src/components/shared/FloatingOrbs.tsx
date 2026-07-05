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
  { size: 200, color: "rgba(0, 220, 200, 0.85)", blur: 32, top: "10%", left: "4%", animation: "orbFloat1 12s ease-in-out infinite" },
  { size: 160, color: "rgba(150, 80, 230, 0.85)", blur: 28, top: "28%", right: "6%", animation: "orbFloat2 15s ease-in-out infinite" },
  { size: 140, color: "rgba(230, 190, 60, 0.85)", blur: 26, bottom: "22%", left: "8%", animation: "orbFloat3 18s ease-in-out infinite" },
  { size: 180, color: "rgba(60, 210, 100, 0.8)", blur: 30, bottom: "35%", right: "4%", animation: "orbFloat1 20s ease-in-out infinite reverse" },
  { size: 120, color: "rgba(0, 200, 220, 0.75)", blur: 22, top: "55%", left: "50%", animation: "orbFloat2 14s ease-in-out infinite" },
  { size: 110, color: "rgba(180, 100, 240, 0.8)", blur: 24, top: "5%", right: "28%", animation: "orbFloat3 16s ease-in-out infinite" },
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
