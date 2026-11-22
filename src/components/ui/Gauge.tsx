"use client";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

/** Animated circular score gauge (0–100) with counting number. */
export function Gauge({ value, size = 220, label = "/ 100" }: { value: number; size?: number; label?: string }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mv = useMotionValue(0);
  const offset = useTransform(mv, (v) => c - (v / 100) * c);
  const text = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    const ctl = animate(mv, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1] });
    return ctl.stop;
  }, [value, mv]);

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`Score ${value} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c3c6ff" />
            <stop offset="100%" stopColor="#6366e8" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gauge-g)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: offset, filter: "drop-shadow(0 6px 14px rgba(99,102,232,.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="tabular font-display text-6xl font-extrabold text-white">{text}</motion.span>
        <span className="mt-1 text-sm font-medium text-iris-300">{label}</span>
      </div>
    </div>
  );
}
