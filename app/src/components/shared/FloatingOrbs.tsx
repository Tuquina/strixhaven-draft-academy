import { useMemo } from "react";

// Bright core fading through the orb color — reads as a small magical
// sparkle rather than a flat blurred blob.
const COLORS = [
  "rgba(0, 220, 200, 1)", // teal
  "rgba(160, 90, 235, 1)", // purple
  "rgba(230, 190, 60, 1)", // gold
  "rgba(60, 210, 100, 1)", // green
];

const FLOAT_KEYFRAMES = ["orbFloat1", "orbFloat2", "orbFloat3"];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

interface Orb {
  size: number;
  blur: number;
  color: string;
  top: string;
  left: string;
  animation: string;
}

function generateOrbs(count: number): Orb[] {
  return Array.from({ length: count }, (_, i) => {
    const size = randomBetween(22, 52);
    const duration = randomBetween(9, 20);
    const delay = randomBetween(0, 14);
    const direction = Math.random() < 0.5 ? " reverse" : "";
    const keyframe = FLOAT_KEYFRAMES[i % FLOAT_KEYFRAMES.length];
    return {
      size,
      blur: size * 0.3,
      color: COLORS[i % COLORS.length],
      top: `${randomBetween(2, 92)}%`,
      left: `${randomBetween(2, 92)}%`,
      animation: `${keyframe} ${duration}s ease-in-out ${delay}s infinite${direction}`,
    };
  });
}

export function FloatingOrbs() {
  const orbs = useMemo(() => generateOrbs(10), []);

  return (
    <>
      {orbs.map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none fixed rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${orb.color} 30%, transparent 72%)`,
            boxShadow: `0 0 ${orb.size * 0.8}px ${orb.color}`,
            filter: `blur(${orb.blur}px)`,
            animation: orb.animation,
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
