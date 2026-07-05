interface RadialTimerProps {
  size: number;
  progress: number; // 0..1 fraction of time remaining
  secondsRemaining: number;
  label: string;
  danger?: boolean;
}

export function RadialTimer({ size, progress, secondsRemaining, label, danger }: RadialTimerProps) {
  const strokeWidth = Math.max(4, size * 0.06);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);
  const center = size / 2;
  const accent = danger ? "#c8564a" : "#c89b3c";
  const handAngle = ((secondsRemaining % 60) / 60) * 2 * Math.PI;
  const handLength = radius * 0.75;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 2 * Math.PI;
        const outer = radius - strokeWidth * 0.55;
        const inner = radius - strokeWidth * 1.3;
        return (
          <line
            key={i}
            x1={center + Math.sin(angle) * inner}
            y1={center - Math.cos(angle) * inner}
            x2={center + Math.sin(angle) * outer}
            y2={center - Math.cos(angle) * outer}
            stroke="rgba(233,216,180,0.3)"
            strokeWidth={1.5}
          />
        );
      })}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={accent}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s ease" }}
      />
      <line
        x1={center}
        y1={center}
        x2={center + Math.sin(handAngle) * handLength}
        y2={center - Math.cos(handAngle) * handLength}
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.7}
      />
      <circle cx={center} cy={center} r={3} fill={accent} />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Cinzel, serif"
        fontWeight={700}
        fontSize={size * 0.19}
        fill={danger ? "#e88a7d" : "#e9d8b4"}
      >
        {label}
      </text>
    </svg>
  );
}
