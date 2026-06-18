"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteConfig } from "@/lib/siteConfig";
import { renderBold } from "@/lib/renderBold";

import { useTypingEffect, LocalTime, StarBackground, FloatingDecorations, MacFolder, NameBadge } from "./components/hero";
import { DotMatrixBoard } from "./components/dot-matrix";
import { VinylCard } from "./components/vinyl-card";
import { RetroWindows, StartMenu } from "./components/retro-windows";
import { ArrowAnimated, DrawInStars, ScrollRevealText } from "./components/scroll-text";
import { RippedPaperNote } from "./components/ripped-paper";
import { PortfolioViewer } from "./components/finder-window";
import { ScatterBoard } from "./components/scatter-board";
import { ClickBurst } from "./components/click-burst";
import { NavHeader } from "./components/nav-header";
import { CursorHint } from "./components/cursor-hint";
import { OpeningAnimation } from "./components/opening-animation";
import { YellowDotCursor } from "./components/yellow-dot-cursor";
import { MobileBanner } from "./components/mobile-banner";
import { MobileHero } from "./components/mobile-hero";

/* ── Isolated click-burst layer — owns its own state so page-wide clicks don't re-render the whole tree ── */
function PageBurstLayer() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("a, button, iframe")) return;
      const id = counter.current++;
      setBursts((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      {bursts.map((b) => (
        <ClickBurst key={b.id} x={b.x} y={b.y} onDone={() => setBursts((prev) => prev.filter((p) => p.id !== b.id))} />
      ))}
    </>
  );
}

/* ── Tab definitions ── */
const tabs = siteConfig.sections.map((s) => ({
  id: s.id,
  label: s.id
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" "),
}));

type DesktopPin = {
  id: string;
  left: number;
  top: number;
  color: string;
  size: number;
};

const desktopPins: DesktopPin[] = [
  { id: "badge", left: 150, top: -10, color: "#d83434", size: 28 },
  { id: "vinyl", left: 240, top: 420, color: "#4f55d4", size: 35 },
  { id: "paper-center", left: 900, top: 270, color: "#d83434", size: 31 },
  { id: "paper-top", left: 844, top: 30, color: "#d83434", size: 27 },
  { id: "ticket", left: 1168, top: 30, color: "#d83434", size: 28 },
  { id: "collage", left: 1410, top: 230, color: "#4f55d4", size: 38 },
  { id: "terminal", left: 852, top: 490, color: "#d83434", size: 26 },
];

const desktopThreads: [string, string][] = [
  ["badge", "paper-center"],
  ["vinyl", "paper-center"],
  ["paper-center", "paper-top"],
  ["paper-top", "ticket"],
  ["ticket", "collage"],
  ["paper-center", "collage"],
  ["paper-center", "terminal"],
];

const HERO_PINS_STORAGE_KEY = "rayo-hero-pins";
const PIN_SNAP_SIZE = 12;

function HeroPin({
  pin,
  onPointerDownPin,
  isDragging,
}: {
  pin: DesktopPin;
  onPointerDownPin: (id: string, event: React.PointerEvent<HTMLDivElement>) => void;
  isDragging: boolean;
}) {
  const { id, left, top, color, size } = pin;
  const isRedPin = color === "#d83434";

  return (
    <div
      onPointerDown={(event) => onPointerDownPin(id, event)}
      className={`pin-drag-handle absolute z-[60] pointer-events-auto ${isDragging ? "pin-dragging" : ""}`}
      style={{
        left,
        top,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
        touchAction: "none",
        transition: isDragging
          ? "none"
          : "left 220ms cubic-bezier(0.22, 1, 0.36, 1), top 220ms cubic-bezier(0.22, 1, 0.36, 1), filter 180ms ease",
      }}
      aria-hidden
    >
      {isRedPin && (
        <div
          className="absolute left-1/2 top-[72%] -translate-x-1/2"
          style={{
            zIndex: 0,
            width: 2,
            height: size + 10,
            background: "linear-gradient(to bottom, rgba(242,242,242,0.98), rgba(162,162,162,0.98))",
            boxShadow: "0 1px 3px rgba(0,0,0,0.24)",
          }}
        />
      )}
      {isRedPin ? (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              zIndex: 1,
              top: size * 0.34,
              width: size * 0.82,
              height: size * 0.82,
              background:
                "radial-gradient(circle at 35% 32%, rgba(255,133,133,0.95) 0%, rgba(255,56,56,0.98) 34%, rgba(210,16,16,1) 72%, rgba(128,0,6,0.98) 100%)",
              boxShadow:
                "0 8px 16px rgba(0,0,0,0.24), inset -4px -5px 6px rgba(110,0,0,0.34)",
            }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              zIndex: 2,
              top: 0,
              width: size * 0.74,
              height: size * 0.74,
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,177,177,1) 0%, rgba(255,73,73,1) 32%, rgba(229,24,24,1) 70%, rgba(150,0,8,0.98) 100%)",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.22), inset -3px -4px 5px rgba(120,0,0,0.28)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              zIndex: 3,
              left: size * 0.29,
              top: size * 0.08,
              width: size * 0.16,
              height: size * 0.11,
              background: "rgba(255,255,255,0.78)",
              filter: "blur(0.4px)",
              transform: "rotate(-18deg)",
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              zIndex: 1,
              background: `radial-gradient(circle at 34% 30%, rgba(174,162,255,0.98) 0%, rgba(133,108,255,0.96) 26%, ${color} 62%, rgba(39,34,126,0.98) 100%)`,
              boxShadow: `0 5px 10px rgba(0,0,0,0.22), inset -2px -3px 4px rgba(22,16,92,0.34)`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              zIndex: 2,
              left: size * 0.25,
              top: size * 0.14,
              width: size * 0.2,
              height: size * 0.14,
              background: "rgba(214,208,255,0.8)",
              filter: "blur(0.4px)",
              transform: "rotate(-18deg)",
            }}
          />
        </>
      )}
    </div>
  );
}

function HeroThreadDecor({
  pins,
  onPointerDownPin,
  draggingPinId,
}: {
  pins: DesktopPin[];
  onPointerDownPin: (id: string, event: React.PointerEvent<HTMLDivElement>) => void;
  draggingPinId: string | null;
}) {
  const pinMap = new Map(pins.map((pin) => [pin.id, pin]));

  return (
    <>
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-[6]" aria-hidden>
        <div
          className="absolute inset-[32px] rounded-[40px] opacity-[0.65]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,112,102,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(120,112,102,0.14) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,0.55) 56%, rgba(0,0,0,0.18) 74%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 28%, rgba(0,0,0,0.55) 56%, rgba(0,0,0,0.18) 74%, rgba(0,0,0,0) 100%)",
          }}
        />
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <filter id="threadShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.6" stdDeviation="1.8" floodColor="rgba(70,0,0,0.34)" />
            </filter>
            <linearGradient id="threadRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8c0f18" />
              <stop offset="50%" stopColor="#ba1d27" />
              <stop offset="100%" stopColor="#7f0c14" />
            </linearGradient>
          </defs>
          {desktopThreads.map(([fromId, toId]) => {
            const from = pinMap.get(fromId);
            const to = pinMap.get(toId);
            if (!from || !to) return null;

            const d = `M${from.left} ${from.top} L${to.left} ${to.top}`;
            return (
            <g key={d} filter="url(#threadShadow)">
              <path d={d} stroke="url(#threadRed)" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={d} stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 8" />
            </g>
            );
          })}
        </svg>
      </div>
      <div className="hidden lg:block absolute inset-0 pointer-events-none z-[60]" aria-hidden>
        {pins.map((pin) => (
          <HeroPin
            key={pin.id}
            pin={pin}
            onPointerDownPin={onPointerDownPin}
            isDragging={draggingPinId === pin.id}
          />
        ))}
      </div>
    </>
  );
}

/* ── Main page ── */
export default function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const { displayed, done } = useTypingEffect(siteConfig.name, 80);
  const activeSection = siteConfig.sections[activeTab];
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [imgZIndex, setImgZIndex] = useState<number[]>([1, 1, 2, 3, 3, 1, 1, 4, 1, 1, 1]);
  const zCounterRef = useRef(10);
  const [arrowVisible, setArrowVisible] = useState(false);
  const onArrowVisible = useRef(() => setArrowVisible(true)).current;
  const [showOpening, setShowOpening] = useState(true);
  const [heroPins, setHeroPins] = useState<DesktopPin[]>(desktopPins);
  const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(HERO_PINS_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as Array<Pick<DesktopPin, "id" | "left" | "top">>;
      if (!Array.isArray(parsed)) return;

      setHeroPins((prev) =>
        prev.map((pin) => {
          const savedPin = parsed.find((item) => item.id === pin.id);
          return savedPin ? { ...pin, left: savedPin.left, top: savedPin.top } : pin;
        }),
      );
    } catch {
      // Ignore malformed saved positions.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        HERO_PINS_STORAGE_KEY,
        JSON.stringify(heroPins.map(({ id, left, top }) => ({ id, left, top }))),
      );
    } catch {
      // Ignore storage write issues.
    }
  }, [heroPins]);

  const updatePinPosition = (id: string, pointX: number, pointY: number, dx = 0, dy = 0) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;

    setHeroPins((prev) =>
      prev.map((pin) => {
        if (pin.id !== id) return pin;
        const half = pin.size / 2;
        const left = Math.min(Math.max(pointX - rect.left + dx, half), rect.width - half);
        const top = Math.min(Math.max(pointY - rect.top + dy, half), rect.height - half);
        return { ...pin, left, top };
      }),
    );
  };

  const snapPinPosition = (id: string) => {
    setHeroPins((prev) =>
      prev.map((pin) => {
        if (pin.id !== id) return pin;
        return {
          ...pin,
          left: Math.round(pin.left / PIN_SNAP_SIZE) * PIN_SNAP_SIZE,
          top: Math.round(pin.top / PIN_SNAP_SIZE) * PIN_SNAP_SIZE,
        };
      }),
    );
  };

  const handlePinPointerDown = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = heroRef.current?.getBoundingClientRect();
    const pin = heroPins.find((item) => item.id === id);
    if (!rect || !pin) return;

    const pointerLeft = event.clientX - rect.left;
    const pointerTop = event.clientY - rect.top;

    dragStateRef.current = {
      id,
      dx: pin.left - pointerLeft,
      dy: pin.top - pointerTop,
    };
    setDraggingPinId(id);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;
      updatePinPosition(dragState.id, event.clientX, event.clientY, dragState.dx, dragState.dy);
    };

    const handlePointerUp = () => {
      const draggingId = dragStateRef.current?.id;
      dragStateRef.current = null;
      if (draggingId) {
        snapPinPosition(draggingId);
      }
      setDraggingPinId(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [heroPins]);

  return (
    <div className="relative" style={{ overflowX: "clip" }}>
      {showOpening && <OpeningAnimation onComplete={() => setShowOpening(false)} />}
      <YellowDotCursor active={!showOpening} />
      <div style={{ opacity: showOpening ? 0 : 1 }}><NavHeader /></div>
      <StarBackground />
      <PageBurstLayer />

      {/* Mobile banner — only visible on small screens */}
      {!showOpening && <MobileBanner />}

      {/* Mobile hero — stacked layout for small screens */}
      <MobileHero />

      {/* Hero — full viewport, centered (desktop only) */}
      <CursorHint label="Hover on items" delay={5} duration={5}>
      <div className="hidden lg:flex min-h-screen items-center justify-center px-4 relative z-10">
      <div ref={heroRef} className="relative w-[1400px] h-[900px] overflow-visible" style={{ maxWidth: "100vw", transform: "translateX(-25px)" }}>
        <HeroThreadDecor
          pins={heroPins}
          onPointerDownPin={handlePinPointerDown}
          draggingPinId={draggingPinId}
        />
        <MacFolder />
        <DotMatrixBoard />
        <VinylCard />
        <NameBadge />
        <RetroWindows />
        {/* Ripped paper + ice coffee + plant */}
        <div className="hidden lg:block absolute top-[20px] left-[650px] -translate-x-1/2 z-20 rotate-[-5deg] transition-all duration-300 hover:scale-200 hover:rotate-[1deg] group/paper hero-entrance" style={{ animation: "hero-fade-in 0.7s cubic-bezier(0.4,0,0.2,1) 2.65s both" }}>
          <img
            src="/ripped-paper.png?v=3"
            alt="Ripped paper note"
            className="w-[520px] opacity-100 drop-shadow-[0_6px_20px_rgba(0,0,0,0.25)] transition-all duration-300"
            draggable={false}
          />
          <div className="absolute top-[50%] left-[55%] -translate-x-1/2 -translate-y-1/2">
            <img src="/ice-coffee.png?v=3" alt="Ice coffee" className="w-[130px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] hover:coffee-wobble" draggable={false} />
          </div>
          <div className="absolute top-[70%] left-[16%] -translate-x-1/2 -translate-y-1/2">
            <img src="/plant.png?v=6" alt="Plant" className="w-[150px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300 scale-[1.3] rotate-[-5deg] -translate-y-3 hover:drop-shadow-[0_12px_20px_rgba(0,0,0,0.3)] plant-hover" draggable={false} />
          </div>
          <div className="absolute top-1/2 left-[80%] -translate-x-1/2 -translate-y-1/2 group/pencil">
            <img src="/apple-pencil.png?v=2" alt="Apple Pencil" className="pencil-img w-[90px] drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-300 group-hover/pencil:scale-200 group-hover/pencil:-translate-y-2" draggable={false} />
            {/* Hand drawn line that reveals on hover */}
            <div className="absolute -bottom-[6px] left-[0px] w-[90px] h-[12px] pointer-events-none overflow-hidden">
              <img
                src="/hand-drawn-line.svg"
                alt=""
                className="w-full h-full object-contain pencil-line"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Flower vase sticker */}
        <div className="hidden lg:block absolute left-[380px] top-[355px] z-20 group/flower hero-entrance" style={{ animation: "hero-pop 0.7s cubic-bezier(0.4,0,0.2,1) 3.1s both" }}>
          <div className="relative w-[120px] rotate-[-6deg] transition-all duration-500 ease-out group-hover/flower:scale-[1.8] group-hover/flower:rotate-[-2deg] group-hover/flower:-translate-y-6 group-hover/flower:z-40" style={{ willChange: "transform" }}>
            <img
              src="/flower.png?v=3"
              alt=""
              className="w-full scale-[2.5] transition-opacity duration-500 ease-out group-hover/flower:opacity-0"
              draggable={false}
            />
            <img
              src="/flower hover.png?v=3"
              alt=""
              className="absolute inset-x-0 top-[20px] w-full scale-[1.1] opacity-0 transition-opacity duration-500 ease-out group-hover/flower:opacity-100 flower-glitch-target"
              draggable={false}
            />
          </div>
        </div>


        {/* Concert ticket */}
        <div
          className="hidden lg:block absolute right-[50px] top-[50px] z-30 w-[370px] rotate-[4deg] transition-transform duration-300 ease-out hover:scale-[1.2] hover:rotate-[1deg] group/ticket hero-entrance"
          style={{ willChange: "transform", animation: "hero-fade-in 0.7s cubic-bezier(0.4,0,0.2,1) 3.25s both" }}
        >
          <img
            src="/ticket.png?v=2"
            alt="Design x Technology ticket"
            className="w-full opacity-95"
            draggable={false}
          />
          {/* Scan shimmer effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover/ticket:opacity-100">
            <div
              className="absolute top-0 -left-full w-full h-full group-hover/ticket:animate-[ticket-scan_2.2s_ease-in-out_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,100,100,0.08) 25%, rgba(255,200,50,0.12) 35%, rgba(100,255,150,0.12) 45%, rgba(255,255,255,0.3) 50%, rgba(100,180,255,0.12) 55%, rgba(200,100,255,0.12) 65%, rgba(255,100,150,0.08) 75%, transparent 100%)",
                filter: "blur(1.5px)",
              }}
            />
          </div>
        </div>

        {/* Image collage */}
        <a href="https://unsplash.com/@yl1980s" target="_blank" rel="noopener noreferrer" className="hidden lg:block absolute right-[-30px] top-[200px] z-10 rotate-[6deg] transition-transform duration-300 ease-out hover:rotate-[2deg] hover:scale-105 cursor-pointer group/collage overflow-visible hero-entrance"
      style={{ willChange: "transform", animation: "hero-fade-in 0.7s cubic-bezier(0.4,0,0.2,1) 3.4s both" }}>
          <div className="relative overflow-visible">
            <img
              src="/cat.png?v=2"
              alt="Cat peeking"
              className="absolute top-[40%] right-[20%] w-[250px] z-20 transition-[transform,opacity] duration-500 ease-out scale-0 opacity-0 origin-center group-hover/collage:scale-100 group-hover/collage:opacity-100 group-hover/collage:rotate-[8deg] drop-shadow-[0_8px_20px_rgba(0,0,0,0.35)] group-hover/collage:-translate-y-3"
              style={{ willChange: "transform, opacity" }}
            />
            <img
              src="/image-collage.jpg?v=2"
              alt="Photo collage"
              className="w-[340px] rounded-xl shadow-lg relative z-10"
            />
          </div>
        </a>
        {/* Center text */}
        <div className="absolute top-[42%] left-[calc(50%+30px)] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="relative mb-4 hero-entrance overflow-hidden" style={{ animation: "hero-blur-in 0.6s ease-out 0.3s both" }}>
            <img src="/Ripa Ahyar.svg" alt="Ripa Ahyar Hero" className="h-[80px] md:h-[100px]" draggable={false} />
            {/* Glare sweep */}
            <div className="absolute inset-0 pointer-events-none" style={{ animation: "hero-glare 1.2s ease-in-out 5s both" }}>
              <div className="absolute top-0 h-full w-[60%] -skew-x-12" style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.8) 48%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.8) 52%, rgba(255,255,255,0.25) 75%, transparent 100%)",
              }} />
            </div>
          </div>
          <p className="font-[family-name:var(--font-noto)] text-xs md:text-base text-stone-500 text-center tracking-[0.2em] uppercase hero-entrance ml-3" style={{ lineHeight: "1.8", animation: "hero-fade-in 0.5s cubic-bezier(0.4,0,0.2,1) 1.9s both" }}>
            I think, then I build
          </p>
        </div>
      </div>
      </div>
      </CursorHint>

      {/* Ripped paper quote + bio with decorative images */}
      <div id="about" className="mt-[120px] scroll-mt-16" />
      <div className="relative translate-x-0 lg:-translate-x-[20px]">
        <RippedPaperNote />
        <ScrollRevealText />
      </div>

      {/* Portfolio — folder view / book view */}
      <PortfolioViewer />

      {/* Bulletin board */}
      <div id="playground" className="mt-8 lg:mt-12 scroll-mt-16" />
      <ScatterBoard
        imgZIndex={imgZIndex}
        setImgZIndex={setImgZIndex}
        zCounterRef={zCounterRef}
        arrowVisible={arrowVisible}
        setBursts={setBursts}
        bursts={bursts}
      />

      {/* Social icons */}
      <motion.div
        className="flex justify-center gap-6 pt-12 pb-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* X */}
        <motion.a variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} href="https://x.com/Ripaahyarr" target="_blank" rel="noopener noreferrer" className="relative font-[family-name:var(--font-noto)] text-[14px] text-stone-500 flex items-center justify-center social-morph">
          <span className="social-morph-text">{`{X}`}</span>
          <svg className="social-morph-icon w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </motion.a>
        {/* LinkedIn */}
        <motion.a variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} href="https://www.linkedin.com/in/ripa-ahyar" target="_blank" rel="noopener noreferrer" className="relative font-[family-name:var(--font-noto)] text-[14px] text-stone-500 flex items-center justify-center social-morph">
          <span className="social-morph-text">{`{LinkedIn}`}</span>
          <svg className="social-morph-icon w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </motion.a>
        {/* Figma */}
        <motion.a variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} href="https://www.figma.com/@ripaahyar" target="_blank" rel="noopener noreferrer" className="relative font-[family-name:var(--font-noto)] text-[14px] text-stone-500 flex items-center justify-center social-morph">
          <span className="social-morph-text">{`{Figma}`}</span>
          <svg className="social-morph-icon w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 00-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.098-7.509a3.023 3.023 0 00-3.019 3.019 3.023 3.023 0 003.019 3.019h.098a3.023 3.023 0 003.019-3.019 3.023 3.023 0 00-3.019-3.019h-.098z"/></svg>
        </motion.a>
        {/* Github */}
        <motion.a variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} href="https://github.com/ripaahyarrr?tab=repositories" target="_blank" rel="noopener noreferrer" className="relative font-[family-name:var(--font-noto)] text-[14px] text-stone-500 flex items-center justify-center social-morph">
          <span className="social-morph-text">{`{Github}`}</span>
          <svg className="social-morph-icon w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
        </motion.a>
        {/* Unsplash */}
        <motion.a variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.4 }} href="https://unsplash.com/@yl1980s" target="_blank" rel="noopener noreferrer" className="relative font-[family-name:var(--font-noto)] text-[14px] text-stone-500 flex items-center justify-center social-morph">
          <span className="social-morph-text">{`{Unsplash}`}</span>
          <svg className="social-morph-icon w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z"/></svg>
        </motion.a>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="w-full flex flex-col items-center gap-4 pt-2 pb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        viewport={{ once: true, margin: "-50px" }}
      >
        <div className="flex items-center gap-3">
          <img src="/star.svg" alt="" className="w-5 h-5 brightness-0 opacity-70 animate-spin" style={{ animationDuration: "4s" }} draggable={false} />
          <p className="font-[family-name:var(--font-noto)] text-[13px] tracking-wide" style={{ color: "#212121" }}>
            Build with Codex - Shipped on Vercel

          </p>
          <img src="/star.svg" alt="" className="w-5 h-5 brightness-0 opacity-70 animate-spin" style={{ animationDuration: "4s" }} draggable={false} />
        </div>
      </motion.footer>



      {/* Sections — hidden for now */}
      <div className="hidden flex-col items-center px-4 pb-24 relative z-10">
        {/* Navigation pills */}
        <nav className="flex flex-wrap justify-center gap-3 mb-16">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-full font-mono text-xs transition-all ${
                i === activeTab
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-text-muted hover:text-text-secondary border border-editor-border hover:border-text-muted/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Section content card */}
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="font-sans text-4xl md:text-5xl text-text-primary">
                {activeSection.title}
              </h2>
              <p className="text-text-secondary leading-relaxed text-base md:text-lg">
                {renderBold(activeSection.description)}
              </p>
              {activeSection.highlights.length > 0 && (
                <ul className="space-y-3">
                  {activeSection.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-text-secondary/90 leading-relaxed">
                      <span className="text-accent mt-1 shrink-0">-</span>
                      <span>{renderBold(h.text)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {activeSection.cta && activeSection.cta.url && (
                <a
                  href={activeSection.cta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-sm text-accent hover:text-accent/80 transition-colors underline decoration-accent/30 hover:decoration-accent underline-offset-4"
                >
                  {activeSection.cta.label} &rarr;
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <p className="font-mono text-xs text-text-muted">
            Build with Codex - Shipped on Vercel

          </p>
        </footer>
      </div>
    </div>
  );
}
