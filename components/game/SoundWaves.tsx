"use client";

function wavyRingPath(
  cx: number,
  cy: number,
  radius: number,
  lobes: number,
  amplitude: number,
  segments = 120,
): string {
  const points: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const r = radius + amplitude * Math.sin(lobes * t);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(" ")} Z`;
}

const RINGS = [
  { r: 52, lobes: 6, amp: 5, delay: 0 },
  { r: 58, lobes: 7, amp: 6, delay: 0.35 },
  { r: 64, lobes: 8, amp: 7, delay: 0.7 },
  { r: 70, lobes: 9, amp: 8, delay: 1.05 },
  { r: 76, lobes: 10, amp: 9, delay: 1.4 },
];

type Props = {
  active: boolean;
  className?: string;
};

export function SoundWaves({ active, className = "" }: Props) {
  if (!active) return null;

  const cx = 100;
  const cy = 100;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible ${className}`}
      aria-hidden
    >
      {RINGS.map(({ r, lobes, amp, delay }) => (
        <g
          key={`${r}-${delay}`}
          className="animate-sound-wave-wavy"
          style={{ animationDelay: `${delay}s` }}
        >
          <path
            d={wavyRingPath(cx, cy, r, lobes, amp)}
            fill="none"
            stroke="#ff4d00"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity={0.65}
          />
        </g>
      ))}
    </svg>
  );
}
