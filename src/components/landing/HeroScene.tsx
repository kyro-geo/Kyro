"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const engines = [
  { name: "ChatGPT", score: 52, pos: "left-[-6%] top-[14%]", depth: 90, delay: 0 },
  { name: "Gemini", score: 44, pos: "right-[-4%] top-[4%]", depth: 140, delay: 1.2 },
  { name: "Perplexity", score: 39, pos: "right-[2%] bottom-[8%]", depth: 110, delay: 2.4 },
];
const bars = [82, 41, 29, 64, 15];
const trend = [31, 33, 32, 35, 41, 44, 43, 47];

/**
 * The hero's one authored moment: a dashboard slab floating in 3D space that
 * follows the pointer, with engine score chips at different Z-depths.
 */
export function HeroScene() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 16 });
  const sy = useSpring(my, { stiffness: 60, damping: 16 });
  const rotY = useTransform(sx, [-1, 1], [-26, -8]);
  const rotX = useTransform(sy, [-1, 1], [16, 4]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / innerWidth) * 2 - 1);
      my.set((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const pts = trend.map((v, i) => `${(i / (trend.length - 1)) * 260},${90 - ((v - 28) / 22) * 80}`).join(" ");

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[560px]" style={{ perspective: 1400 }} aria-hidden>
      <motion.div
        initial={{ opacity: 0, rotateX: 40, rotateY: -40, z: -200 }}
        animate={{ opacity: 1, rotateX: 10, rotateY: -17, z: 0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="absolute inset-0"
      >
        {/* back glow plane */}
        <div className="absolute inset-[8%] rounded-[32px] bg-iris-600/30 blur-3xl" style={{ transform: "translateZ(-120px)" }} />

        {/* main slab */}
        <div
          className="absolute inset-0 rounded-[22px] border border-white/10 bg-gradient-to-br from-ink-800 to-ink-900 p-6 shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="mb-5 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-ember-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-leaf-400/70" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-white/[0.04] px-2 font-mono text-[10px] leading-5 text-mist-500">app.kyro.ai/dashboard</span>
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-6" style={{ transform: "translateZ(30px)" }}>
            <div className="relative grid h-36 w-36 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none" stroke="#a5a8ff" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 - 264 * 0.47 }}
                  transition={{ duration: 1.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="text-center">
                <div className="font-display text-4xl font-extrabold text-white">47</div>
                <div className="text-[10px] font-medium text-mist-400">CVI / 100</div>
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              {bars.map((b, i) => (
                <div key={i} className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div className="h-full rounded-full bg-iris-400" initial={{ width: 0 }} animate={{ width: `${b}%` }} transition={{ duration: 1.2, delay: 1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white/[0.03] p-4" style={{ transform: "translateZ(50px)" }}>
            <svg viewBox="0 0 260 96" className="h-24 w-full overflow-visible">
              <defs>
                <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8286f7" stopOpacity=".45" />
                  <stop offset="100%" stopColor="#8286f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,96 ${pts} 260,96`} fill="url(#hero-area)" />
              <motion.path d={`M${pts.replace(/ /g, " L")}`} fill="none" stroke="#c3c6ff" strokeWidth="2.5" strokeLinejoin="round" pathLength={1} strokeDasharray="1" initial={{ strokeDashoffset: 1 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }} />
            </svg>
          </div>
        </div>

        {/* floating engine chips */}
        {engines.map((e) => (
          <div key={e.name} className={`absolute ${e.pos}`} style={{ transform: `translateZ(${e.depth}px)` }}>
            <div className="animate-float rounded-2xl border border-white/10 bg-ink-800/95 px-4 py-3 shadow-[0_24px_50px_-20px_rgba(0,0,0,.9)]" style={{ animationDelay: `${e.delay}s` }}>
              <div className="text-[10px] font-medium text-mist-400">{e.name}</div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-bold text-white">{e.score}</span>
                <span className="text-[10px] text-leaf-400">+{Math.round(e.score / 9)}</span>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
