import { useMemo } from "react";

// Bright core fading through the orb color — reads as a small magical
// sparkle rather than a flat blurred blob.
const COLORS = [
  "rgba(0, 220, 200, 1)", // teal (academy sky)
  "rgba(232, 212, 77, 1)", // verdant lime (hero title top)
  "rgba(230, 190, 60, 1)", // gold
  "rgba(60, 210, 100, 1)", // green
];

const LIFE_KEYFRAMES = ["orbLife1", "orbLife2", "orbLife3"];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Bias toward the screen border on one axis so orbs drift around the
// edges rather than cluttering the center of the page.
function edgeBiasedPosition(): { top: number; left: number } {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) return { top: randomBetween(0, 12), left: randomBetween(0, 100) };
  if (edge === 1) return { top: randomBetween(88, 100), left: randomBetween(0, 100) };
  if (edge === 2) return { top: randomBetween(0, 100), left: randomBetween(0, 12) };
  return { top: randomBetween(0, 100), left: randomBetween(88, 100) };
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
    const size = randomBetween(14, 32);
    const duration = randomBetween(14, 28);
    const delay = randomBetween(0, 22);
    const keyframe = LIFE_KEYFRAMES[i % LIFE_KEYFRAMES.length];
    const { top, left } = edgeBiasedPosition();
    return {
      size,
      blur: size * 0.3,
      color: COLORS[i % COLORS.length],
      top: `${top}%`,
      left: `${left}%`,
      // `backwards` is the key part: without it, the element sits at its
      // default (fully opaque, untransformed) style for the whole
      // animation-delay before the keyframes ever apply, which is why
      // orbs looked like static solid dots that then "popped" invisible
      // once the animation actually started.
      animation: `${keyframe} ${duration}s ease-in-out ${delay}s infinite normal backwards`,
    };
  });
}

export function FloatingOrbs() {
  const orbs = useMemo(() => generateOrbs(6), []);

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
            background: `radial-gradient(circle, rgba(255,255,255,0.85) 0%, ${orb.color} 30%, transparent 72%)`,
            boxShadow: `0 0 ${orb.size * 0.6}px ${orb.color}`,
            filter: `blur(${orb.blur}px)`,
            animation: orb.animation,
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}
