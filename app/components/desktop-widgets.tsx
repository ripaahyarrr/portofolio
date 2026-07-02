"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Matter from "matter-js";

const appTools = [
  { label: "Claude", icon: "/assets/images/app-claude.jpg", glow: "#D97706" },
  { label: "Figma", icon: "/assets/images/app-figma.jpg", glow: "#A259FF" },
  { label: "Cursor", icon: "/assets/images/app-cursor.jpg", glow: "#3B82F6" },
  { label: "Google AI Studio", icon: "/assets/images/app-google-ai.jpg", glow: "#4285F4" },
  { label: "Lovable", icon: "/assets/images/app-lovable.jpg", glow: "#F472B6" },
  { label: "Codex", icon: "/assets/images/app-codex.jpg", glow: "#10B981" },
  { label: "GitHub", icon: "/assets/images/app-github.jpg", glow: "#8B5CF6" },
  { label: "ChatGPT", icon: "/assets/images/app-chatgpt.jpg", glow: "#10A37F" },
];

export function WidgetClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();
  const hDeg = h * 30 + m * 0.5;
  const mDeg = m * 6;
  const sDeg = s * 6;
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#57534e" strokeWidth="1" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1="50" y1="8" x2="50" y2="14" stroke="#a8a29e" strokeWidth="1.5" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <line x1="50" y1="50" x2="50" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${hDeg} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" transform={`rotate(${mDeg} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="14" stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" transform={`rotate(${sDeg} 50 50)`} />
        <circle cx="50" cy="50" r="2.5" fill="white" />
      </svg>
      <div className="text-center">
        <div className="text-[22px] font-semibold text-white tabular-nums">
          {time.getHours().toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
        </div>
        <div className="text-[10px] text-stone-400">
          {days[time.getDay()]}, {time.getDate()} {months[time.getMonth()]}
        </div>
      </div>
    </div>
  );
}

const funFacts = [
  {
    front: "Boba Tea",
    emoji: "", image: "/assets/images/Eat.webp",
    back: "~500 cups in 3 years.",
  },
  {
    front: "Robotics",
    emoji: "", image: "/assets/images/Mountain.webp",
    back: "Former Global Launch Manager at ABB Robotics. Launched the IRB 120 robot — now displayed at the Shanghai Science and Technology Museum.",
  },
  {
    front: "2014",
    emoji: "", image: "/assets/images/Ai Powered.webp",
    back: "Moved to Seattle.\nMany ideas — and coffees — later.",
  },
];

const stackRotations = [3, -2, 5];
const spreadX = [-200, 0, 200];

function PolaroidCard({ fact, index, spread, isFlipped, onFlip, onHoverCard }: {
  fact: typeof funFacts[0]; index: number; spread: boolean; isFlipped: boolean; onFlip: (i: number) => void; onHoverCard: () => void;
}) {
  return (
    <motion.div
      animate={{
        x: spread ? spreadX[index] : 0,
        y: spread ? 0 : index * -4,
        rotate: spread ? 0 : stackRotations[index],
        zIndex: isFlipped ? 20 : spread ? 10 : funFacts.length - index,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className="absolute cursor-pointer"
      style={{ width: 185, perspective: 800 }}
      onMouseEnter={onHoverCard}
      onClick={(e) => { e.stopPropagation(); if (spread) onFlip(index); }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
      >
        {/* Front */}
        <div
          className="rounded-xl bg-[#fafaf8] shadow-[0_4px_14px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)] flex flex-col p-[8px] pb-[22px] border border-stone-200/60"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="bg-stone-100 rounded-lg flex items-center justify-center overflow-hidden" style={{ aspectRatio: "4/5" }}>
            {fact.image ? (
              <img src={fact.image} alt={fact.front} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-[40px]">{fact.emoji}</span>
            )}
          </div>
        </div>
        {/* Back */}
        <div
          className="rounded-xl bg-stone-800 shadow-[0_4px_14px_rgba(0,0,0,0.1)] p-4 absolute inset-0 flex flex-col justify-center border border-stone-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-[12px] text-stone-400 uppercase tracking-wider mb-2 font-[family-name:var(--font-courier-prime)] font-bold">{fact.front}</div>
          <p className="text-[11px] text-stone-200 leading-relaxed font-[family-name:var(--font-noto)]">{fact.back}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FunFactsWidget() {
  const [spread, setSpread] = useState(false);
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="col-span-2 relative pt-2"
      onMouseLeave={() => { setSpread(false); setFlippedSet(new Set()); }}
    >
      {/* Masking tape */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[16px] top-0 rounded-[4px] bg-[#efe5d7]/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-[0.5px] border border-[#e5dcd0]/50 rotate-[-2deg] z-20" />

      {/* Card Container */}
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_12px_28px_rgba(0,0,0,0.06)] h-full flex flex-col p-4">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }} />
        {/* Subtle warm top gradient */}
        <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />

        <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-2 self-start z-10">Fun Facts</div>
        <div className="flex-1 flex items-center justify-center relative z-10" style={{ minHeight: 180 }}>
          {funFacts.map((fact, i) => (
            <PolaroidCard
              key={fact.front}
              fact={fact}
              index={i}
              spread={spread}
              isFlipped={flippedSet.has(i)}
              onFlip={(idx) => setFlippedSet(prev => {
                const next = new Set(prev);
                if (next.has(idx)) next.delete(idx); else next.add(idx);
                return next;
              })}
              onHoverCard={() => setSpread(true)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const circumference = 2 * Math.PI * 32;

function EnergyCircle() {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="cursor-pointer relative h-full pt-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Masking tape */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[16px] top-0 rounded-[4px] bg-[#efe5d7]/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-[0.5px] border border-[#e5dcd0]/50 rotate-[2deg] z-20" />

      {/* Card Container */}
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_12px_28px_rgba(0,0,0,0.06)] h-full flex flex-col p-4">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }} />
        {/* Subtle warm top gradient */}
        <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />

        <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3 z-10 self-start">Energy Level</div>
        <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
          <div className="relative w-[110px] h-[110px]">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="44" fill="none" stroke="#e2dbd2" strokeWidth="7" />
              <motion.circle
                key={hovered ? "active" : "idle"}
                cx="55" cy="55" r="44"
                fill="none" stroke="#5A9E82" strokeWidth="7"
                strokeLinecap="butt"
                strokeDasharray={Math.PI * 2 * 44}
                initial={hovered ? { strokeDashoffset: Math.PI * 2 * 44 } : false}
                animate={{ strokeDashoffset: Math.PI * 2 * 44 * (1 - 0.95) }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                transform="rotate(-90 55 55)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold text-stone-700 leading-none font-[family-name:var(--font-courier-prime)]">95%</span>
            </div>
          </div>
          <div className="text-[12px] text-stone-600 font-[family-name:var(--font-noto)] mt-2">Morning Run ☀️</div>
        </div>
      </div>
    </motion.div>
  );
}

const radarStats = [
  { label: "AI Tools", value: 95 },
  { label: "Coffee", value: 90 },
  { label: "Research", value: 85 },
  { label: "Design", value: 80 },
  { label: "Curiosity", value: 100 },
  { label: "Nature", value: 75 },
];
const radarCx = 85, radarCy = 82, radarMaxR = 60, radarLevels = 4, radarN = radarStats.length;
const radarAngle = (i: number) => (Math.PI * 2 * i) / radarN - Math.PI / 2;
const radarPt = (i: number, r: number) => `${radarCx + r * Math.cos(radarAngle(i))},${radarCy + r * Math.sin(radarAngle(i))}`;

function FuelMixRadar() {
  const [revealCount, setRevealCount] = useState(radarN);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startReveal = () => {
    setRevealCount(0);
    timersRef.current = radarStats.map((_, i) =>
      setTimeout(() => setRevealCount(i + 1), (i + 1) * 150)
    );
  };
  const stopReveal = () => {
    timersRef.current.forEach(clearTimeout);
    setRevealCount(radarN);
  };

  const getPoints = (count: number) =>
    radarStats.map((s, i) => radarPt(i, i < count ? (s.value / 100) * radarMaxR : 0)).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="cursor-pointer relative h-full pt-2"
      onMouseEnter={startReveal}
      onMouseLeave={stopReveal}
    >
      {/* Masking tape */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[16px] top-0 rounded-[4px] bg-[#efe5d7]/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-[0.5px] border border-[#e5dcd0]/50 rotate-[-2.5deg] z-20" />

      {/* Card Container */}
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_12px_28px_rgba(0,0,0,0.06)] h-full flex flex-col p-4">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }} />
        {/* Subtle warm top gradient */}
        <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />

        <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-1 z-10 self-start">Fuel Mix</div>
        <svg className="self-center z-10" width="240" height="200" viewBox="-40 -5 230 190">
          {[...Array(radarLevels)].map((_, l) => {
            const r = radarMaxR * ((l + 1) / radarLevels);
            const pts = radarStats.map((_, i) => radarPt(i, r)).join(" ");
            return <polygon key={l} points={pts} fill="none" stroke="#e2dbd2" strokeWidth="0.5" />;
          })}
          {radarStats.map((_, i) => (
            <line key={i} x1={radarCx} y1={radarCy} x2={Number(radarPt(i, radarMaxR).split(",")[0])} y2={Number(radarPt(i, radarMaxR).split(",")[1])} stroke="#e2dbd2" strokeWidth="0.5" />
          ))}
          <motion.polygon
            animate={{ points: getPoints(revealCount) }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            fill="rgba(106,158,192,0.2)"
            stroke="#6A9EC0"
            strokeWidth="1.5"
          />
          {radarStats.map((_, i) => {
            const [x, y] = radarPt(i, (radarStats[i].value / 100) * radarMaxR).split(",").map(Number);
            return (
              <motion.circle
                key={i}
                cx={x} cy={y} r="2.5" fill="#6A9EC0"
                animate={{ opacity: i < revealCount ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            );
          })}
          {radarStats.map((s, i) => {
            const angle = radarAngle(i);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const lR = radarMaxR + 14;
            const x = radarCx + lR * cos;
            const y = radarCy + lR * sin;
            const anchor = cos < -0.1 ? "end" : cos > 0.1 ? "start" : "middle";
            const dx = cos < -0.1 ? -4 : cos > 0.1 ? 4 : 0;
            const dy = sin < -0.5 ? -4 : sin > 0.5 ? 8 : 0;
            return <text key={i} x={x + dx} y={y + dy} textAnchor={anchor} dominantBaseline="middle" className="text-[10px] font-semibold font-[family-name:var(--font-courier-prime)] fill-stone-500">{s.label}</text>;
          })}
        </svg>
      </div>
    </motion.div>
  );
}

const designChips = [
  { label: "Strategic Thinking", color: "#5A9E82" },
  { label: "Data-driven", color: "#6A9EC0" },
  { label: "Detail-focused", color: "#9680C2" },
  { label: "Systems Mindset", color: "#C9A060" },
  { label: "Problem Solver", color: "#D4746E" },
  { label: "Impact-Oriented", color: "#5A8FA0" },
  { label: "Design Systems", color: "#7e5aa0ff" },
];

const CHIP_W = 95;
const CHIP_H = 22;
const AREA_W = 280;
const AREA_H = 155;

/* Organized grid positions for hover state */
const chipWidths = [124, 84, 101, 107, 101, 107, 101];
function getOrganizedPositions(areaH: number) {
  const gap = 6;
  const rows: { x: number; y: number }[][] = [];
  let row: { x: number; y: number }[] = [];
  let cx = 0;
  designChips.forEach((_, i) => {
    const w = chipWidths[i] || CHIP_W;
    if (cx + w > AREA_W && row.length > 0) {
      rows.push(row);
      row = [];
      cx = 0;
    }
    row.push({ x: cx, y: 0 });
    cx += w + gap;
  });
  if (row.length) rows.push(row);
  const totalH = rows.length * (CHIP_H + gap) - gap;
  const startY = (areaH - totalH) / 2;
  const result: { x: number; y: number }[] = [];
  let idx = 0;
  rows.forEach((r, ri) => {
    const rowW = r.length > 0 ? r[r.length - 1].x + (chipWidths[idx + r.length - 1] || CHIP_W) : 0;
    const offsetX = (AREA_W - rowW) / 2 + 15;
    r.forEach((pos) => {
      result.push({ x: pos.x + offsetX, y: startY + ri * (CHIP_H + gap) });
      idx++;
    });
  });
  return result;
}

function ReminderCard() {
  const [hovered, setHovered] = useState(false);
  const [physicsActive, setPhysicsActive] = useState(false);
  const [chipStates, setChipStates] = useState<{ x: number; y: number; angle: number }[]>(
    designChips.map(() => ({ x: AREA_W / 2, y: -30, angle: 0 }))
  );
  const engineRef = useRef<Matter.Engine | null>(null);
  const rafRef = useRef<number>(0);
  const hasLandedRef = useRef(false);
  const chipAreaRef = useRef<HTMLDivElement>(null);

  const startPhysics = useCallback(() => {
    if (engineRef.current) Matter.Engine.clear(engineRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const areaH = chipAreaRef.current ? chipAreaRef.current.clientHeight : AREA_H;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 0.56 } });
    engineRef.current = engine;

    const floor = Matter.Bodies.rectangle(AREA_W / 2, areaH + 10, AREA_W + 40, 20, { isStatic: true });
    const wallL = Matter.Bodies.rectangle(-10, areaH / 2, 20, areaH * 2, { isStatic: true });
    const wallR = Matter.Bodies.rectangle(AREA_W + 10, areaH / 2, 20, areaH * 2, { isStatic: true });
    Matter.Composite.add(engine.world, [floor, wallL, wallR]);

    const bodies = designChips.map((_, i) => {
      const w = chipWidths[i] || CHIP_W;
      const startX = 40 + (i * 65) % (AREA_W - 80);
      return Matter.Bodies.rectangle(
        startX, -20 - i * 35,
        w, CHIP_H,
        { restitution: 0.25, friction: 0.5, frictionAir: 0.01, angle: ((Math.random() - 0.5) * Math.PI) / 5 }
      );
    });
    Matter.Composite.add(engine.world, bodies);

    setPhysicsActive(true);
    const step = () => {
      Matter.Engine.update(engine, 1000 / 60);
      setChipStates(bodies.map((b, i) => {
        const w = chipWidths[i] || CHIP_W;
        return {
          x: b.position.x - w / 2,
          y: b.position.y - CHIP_H / 2,
          angle: b.angle,
        };
      }));
      // Check if all bodies are nearly still
      const allStopped = bodies.every(b => {
        const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
        return speed < 0.3;
      });
      if (allStopped && bodies[bodies.length - 1].position.y > 0) {
        hasLandedRef.current = true;
        // Keep the final positions, stop the loop
        cancelAnimationFrame(rafRef.current);
        setPhysicsActive(false);
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  // Run physics on mount (first landing on desktop)
  useEffect(() => {
    startPhysics();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="cursor-pointer relative h-full pt-2 flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        // Re-run physics on mouse leave
        startPhysics();
      }}
    >
      {/* Masking tape */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[16px] top-0 rounded-[4px] bg-[#efe5d7]/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-[0.5px] border border-[#e5dcd0]/50 rotate-[-1.5deg] z-20" />

      {/* Card Container */}
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_12px_28px_rgba(0,0,0,0.06)] h-full flex flex-col p-4 flex-1">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }} />
        {/* Subtle warm top gradient */}
        <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />

        <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3 z-10 self-start">Design Notes</div>
        <div ref={chipAreaRef} className="relative flex-1 z-10" style={{ width: AREA_W }}>
          {designChips.map((chip, i) => {
            const orgPositions = getOrganizedPositions(chipAreaRef.current?.clientHeight || AREA_H);
            const target = hovered && !physicsActive
              ? { x: orgPositions[i].x, y: orgPositions[i].y, angle: 0 }
              : chipStates[i];
            return (
              <span
                key={chip.label}
                className="absolute px-[10px] py-[4px] rounded-full text-[10px] font-medium text-white whitespace-nowrap shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-black/5 font-[family-name:var(--font-courier-prime)]"
                style={{
                  backgroundColor: chip.color,
                  left: target.x,
                  top: target.y,
                  transform: `rotate(${target.angle}rad)`,
                  transition: hovered && !physicsActive
                    ? `left 0.5s ease-in ${i * 0.06}s, top 0.5s ease-in ${i * 0.06}s, transform 0.5s ease-in ${i * 0.06}s`
                    : "none",
                }}
              >
                {chip.label}
              </span>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Dock with macOS-style magnification + brand glow ── */
const BASE_SIZE = 36;
const MAX_SIZE = 54;
const MAGNIFY_RANGE = 150;

function DockBar() {
  const mouseX = useMotionValue(-1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white/60 backdrop-blur-sm rounded-xl px-4 flex justify-evenly items-center"
      style={{ height: MAX_SIZE + 60 }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(-1000)}
    >
      {appTools.map((tool, i) => (
        <DockIcon key={i} tool={tool} mouseX={mouseX} />
      ))}
    </motion.div>
  );
}

function DockIcon({ tool, mouseX }: {
  tool: typeof appTools[number]; mouseX: ReturnType<typeof useMotionValue<number>>;
}) {
  const iconRef = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (mx: number) => {
    if (!iconRef.current) return MAGNIFY_RANGE + 1;
    const rect = iconRef.current.getBoundingClientRect();
    return mx - (rect.left + rect.width / 2);
  });

  const size = useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [BASE_SIZE, MAX_SIZE, BASE_SIZE]);
  const glowOpacity = useTransform(distance, [-MAGNIFY_RANGE, 0, MAGNIFY_RANGE], [0, 0.7, 0]);

  return (
    <div ref={iconRef} className="relative flex items-end justify-center" style={{ marginBottom: 14 }}>
      {/* Brand glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          bottom: -8,
          left: "50%",
          x: "-50%",
          width: useTransform(size, (s: number) => s + 16),
          height: useTransform(size, (s: number) => s + 16),
          background: `radial-gradient(circle, ${tool.glow}60 0%, transparent 70%)`,
          opacity: glowOpacity,
        }}
      />
      <motion.img
        src={tool.icon}
        alt={tool.label}
        title={tool.label}
        className="object-cover rounded-[9px] cursor-default relative z-[1]"
        style={{ width: size, height: size }}
        draggable={false}
      />
    </div>
  );
}

const journeyData = [
  { step: "Staff Designer", company: "Gunadarma University Computing Center", tag: "2018 - 2020" },
  { step: "UI/UX & QA Mentor (Part-Time)", company: "Ministry of Education and Culture", tag: "2022 - 2024" },
  { step: "UI/UX Designer (Freelance)", company: "Ministry of Education and Culture", tag: "2021 - 2024" },
  { step: "Project Management Officer (Seconded Role)", company: "Sinar Mas Multiartha Tbk", tag: "2023" },
  { step: "UI/UX Designer", company: "Sinar Mas Multiartha Tbk", tag: "2021 - NOW", hollow: true, pulse: true },
];

function JourneyTimeline() {
  const [hovered, setHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  React.useEffect(() => {
    if (!hovered) {
      setVisibleCount(0);
      return;
    }
    if (visibleCount >= journeyData.length) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), 150);
    return () => clearTimeout(timer);
  }, [hovered, visibleCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative flex-1 pt-2 cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Masking tape */}
      <div className="absolute left-1/2 -translate-x-1/2 w-[70px] h-[16px] top-0 rounded-[4px] bg-[#efe5d7]/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-[0.5px] border border-[#e5dcd0]/50 rotate-[1deg] z-20" />

      {/* Card Container */}
      <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_12px_28px_rgba(0,0,0,0.06)] h-full flex flex-col p-4">
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }} />
        {/* Subtle warm top gradient */}
        <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />

        <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-4 z-10 self-start">My Journey</div>
        <div className="space-y-0 z-10 flex-1">
          {journeyData.map((item, i) => {
            const isLast = i === journeyData.length - 1;
            if (isLast) return null;
            const total = journeyData.length - 1;
            const fadeOpacity = 0.5 + (i / (total - 1)) * 0.5;
            return (
              <div
                key={i}
                className="flex items-center gap-3 py-[10px] transition-opacity duration-300"
                style={{
                  opacity: hovered ? (i < visibleCount ? fadeOpacity : 0) : fadeOpacity,
                  borderBottom: i < journeyData.length - 2 ? "1px solid #efe5d7" : "none",
                }}
              >
                <span className="text-[11px] text-stone-400 font-[family-name:var(--font-courier-prime)] w-[20px] shrink-0 font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="shrink-0 w-[8px] h-[8px] rounded-full bg-stone-300" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[12px] text-stone-600 font-medium leading-snug font-[family-name:var(--font-noto)]">{item.step}</span>
                  <span className="text-[10px] text-stone-400 mt-0.5 leading-normal truncate font-[family-name:var(--font-noto)]">{item.company}</span>
                </div>
                <span
                  className="text-[8px] font-medium tracking-wider px-2 py-0.5 rounded-full shrink-0 font-[family-name:var(--font-courier-prime)]"
                  style={{ background: "#efe5d7", color: "#857d76" }}
                >
                  {item.tag}
                </span>
              </div>
            );
          })}
        </div>
        {/* Highlighted last item */}
        <div
          className="mt-3 rounded-xl px-5 py-4 flex items-center gap-3 transition-opacity duration-300 z-10"
          style={{
            background: "rgba(90, 158, 130, 0.08)",
            border: "1px solid rgba(90, 158, 130, 0.2)",
            opacity: hovered ? (journeyData.length - 1 < visibleCount ? 1 : 0) : 1,
          }}
        >
          <span className="text-[11px] text-[#5A9E82] font-[family-name:var(--font-courier-prime)] w-[20px] shrink-0 font-bold">
            {String(journeyData.length).padStart(2, "0")}
          </span>
          <div className="relative shrink-0 w-[10px] h-[10px]">
            <div className="absolute inset-0 rounded-full bg-[#5A9E82] animate-ping opacity-30" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#5A9E82] relative" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-[15px] text-stone-800 font-bold block leading-tight truncate font-[family-name:var(--font-noto)]">{journeyData[journeyData.length - 1].step}</span>
            <span className="text-[11px] text-stone-500 mt-1 leading-normal truncate font-[family-name:var(--font-noto)]">{journeyData[journeyData.length - 1].company}</span>
          </div>
          <span
            className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full shrink-0 font-[family-name:var(--font-courier-prime)]"
            style={{ background: "#5A9E82", color: "white" }}
          >
            {journeyData[journeyData.length - 1].tag}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function WeatherCard() {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ boxShadow: hovered ? "0 4px 20px rgba(251,191,36,0.3), 0 0 40px rgba(251,191,36,0.12)" : "none" }}
      className="bg-white/90 rounded-xl px-3 py-2.5 cursor-pointer overflow-hidden relative transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center gap-2">
        <img src="/assets/images/weather-thumbnail.jpg" alt="Seattle" className="w-[48px] h-[48px] rounded-lg object-cover flex-shrink-0" />
        <div>
          <div className="text-[9px] text-stone-400 uppercase tracking-wider mb-1">Seattle</div>
          <div className="flex items-center gap-1.5">
            <motion.span
              className="material-symbols-outlined text-amber-400"
              style={{ fontSize: 18 }}
              animate={{ y: hovered ? -2 : 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              sunny
            </motion.span>
            <span className="text-[18px] font-light text-stone-700 leading-none">72°</span>
          </div>
          <div className="text-[9px] text-stone-400 mt-1">Sunny, perfect weather for building things</div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mobile list versions of widgets ── */

/* ── Mobile list versions of widgets ── */

function MobileCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_6px_16px_rgba(0,0,0,0.04)] p-4 flex flex-col">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.3) 1px, transparent 0)",
        backgroundSize: "10px 10px",
      }} />
      {/* Subtle warm top gradient */}
      <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(214,120,91,0.06),rgba(214,120,91,0))] pointer-events-none" />
      <div className="relative z-10 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}

function MobileDesignNotes() {
  return (
    <MobileCardWrapper>
      <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3">Design Notes</div>
      <div className="flex flex-wrap gap-2">
        {designChips.map((chip) => (
          <span
            key={chip.label}
            className="px-3 py-1.5 rounded-full text-[10px] font-medium text-white font-[family-name:var(--font-courier-prime)] shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-black/5"
            style={{ backgroundColor: chip.color }}
          >
            {chip.label}
          </span>
        ))}
      </div>
    </MobileCardWrapper>
  );
}

function MobileEnergyLevel() {
  return (
    <MobileCardWrapper>
      <div className="flex items-center gap-4">
        <div className="relative w-[72px] h-[72px] shrink-0">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30" fill="none" stroke="#e2dbd2" strokeWidth="5" />
            <circle
              cx="36" cy="36" r="30"
              fill="none" stroke="#5A9E82" strokeWidth="5"
              strokeLinecap="butt"
              strokeDasharray={Math.PI * 2 * 30}
              strokeDashoffset={Math.PI * 2 * 30 * (1 - 0.95)}
              transform="rotate(-90 36 36)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[16px] font-bold text-stone-700 font-[family-name:var(--font-courier-prime)]">95%</span>
          </div>
        </div>
        <div>
          <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-1">Energy Level</div>
          <div className="text-[13px] text-stone-600 font-[family-name:var(--font-noto)]">Morning Run ☀️</div>
        </div>
      </div>
    </MobileCardWrapper>
  );
}

function MobileFuelMix() {
  return (
    <MobileCardWrapper>
      <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3">Fuel Mix</div>
      <div className="space-y-2.5">
        {radarStats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-stone-500 w-[74px] shrink-0 font-[family-name:var(--font-courier-prime)]">{s.label}</span>
            <div className="flex-1 h-[6px] bg-[#efe5d7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6A9EC0] rounded-full"
                style={{ width: `${s.value}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-stone-400 w-[28px] text-right font-[family-name:var(--font-courier-prime)]">{s.value}</span>
          </div>
        ))}
      </div>
    </MobileCardWrapper>
  );
}

function MobileJourney() {
  return (
    <MobileCardWrapper>
      <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3">My Journey</div>
      <div className="space-y-0">
        {journeyData.map((item, i) => {
          const isLast = i === journeyData.length - 1;
          const total = journeyData.length - 1;
          const fadeOpacity = isLast ? 1 : 0.35 + (i / (total - 1)) * 0.65;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 py-2 ${isLast ? "mt-2 rounded-lg px-3 py-3" : ""}`}
              style={{
                opacity: fadeOpacity,
                borderBottom: !isLast && i < journeyData.length - 2 ? "1px solid #efe5d7" : "none",
                ...(isLast ? { background: "rgba(90, 158, 130, 0.08)", border: "1px solid rgba(90, 158, 130, 0.2)" } : {}),
              }}
            >
              <span className="text-[10px] text-stone-400 font-[family-name:var(--font-courier-prime)] w-[16px] shrink-0 font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className={`shrink-0 rounded-full ${isLast ? "w-[8px] h-[8px] bg-[#5A9E82]" : "w-[6px] h-[6px] bg-stone-300"}`} />
              <span className={`flex-1 font-[family-name:var(--font-noto)] ${isLast ? "text-[13px] text-stone-800 font-bold" : "text-[11px] text-stone-500"}`}>
                {item.step}
              </span>
              <span
                className="text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 font-[family-name:var(--font-courier-prime)]"
                style={isLast ? { background: "#5A9E82", color: "white" } : { background: "#efe5d7", color: "#857d76" }}
              >
                {item.tag}
              </span>
            </div>
          );
        })}
      </div>
    </MobileCardWrapper>
  );
}

function MobileFunFacts() {
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());

  return (
    <MobileCardWrapper>
      <div className="font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-[#c26f51] text-[10px] font-semibold mb-3">Fun Facts</div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {funFacts.map((fact, i) => (
          <div
            key={fact.front}
            className="shrink-0 cursor-pointer"
            style={{ width: 130, perspective: 600 }}
            onClick={() => setFlippedSet(prev => {
              const next = new Set(prev);
              if (next.has(i)) next.delete(i); else next.add(i);
              return next;
            })}
          >
            <motion.div
              animate={{ rotateY: flippedSet.has(i) ? 180 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ transformStyle: "preserve-3d", position: "relative" }}
            >
              {/* Front */}
              <div
                className="rounded-lg bg-[#fafaf8] shadow-sm p-[6px] pb-[16px]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="bg-stone-100 rounded-md flex items-center justify-center overflow-hidden" style={{ aspectRatio: "4/5" }}>
                  {fact.image ? (
                    <img src={fact.image} alt={fact.front} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <span className="text-[28px]">{fact.emoji}</span>
                  )}
                </div>
              </div>
              {/* Back */}
              <div
                className="rounded-lg bg-stone-800 shadow-sm p-3 absolute inset-0 flex flex-col justify-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 font-[family-name:var(--font-courier-prime)] font-bold">{fact.front}</div>
                <p className="text-[10px] text-stone-200 leading-relaxed font-[family-name:var(--font-noto)]">{fact.back}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-stone-400 text-center mt-2 font-[family-name:var(--font-courier-prime)]">Tap to flip</div>
    </MobileCardWrapper>
  );
}

export function DesktopWidgets({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="p-3 flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: 500 }}>
        <MobileDesignNotes />
        <MobileEnergyLevel />
        <MobileFuelMix />
        <MobileJourney />
        <MobileFunFacts />
      </div>
    );
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Top row: Reminders, Energy, Calendar */}
      <div className="grid grid-cols-3 gap-3">
        <ReminderCard />

        <EnergyCircle />

        <FuelMixRadar />
      </div>

      {/* Bottom row: Weather + To-Do (left), Goals (right) */}
      <div className="grid grid-cols-3 gap-3">
        {/* Left column: Weather + To-Do stacked */}
        <div className="flex flex-col gap-3">
          <JourneyTimeline />
        </div>

        {/* Goals - spans 2 columns, matches height of weather + todo */}
        <FunFactsWidget />
      </div>

      {/* Dock: hidden for now to reduce window height */}
      {/* <DockBar /> */}
    </div>
  );
}
