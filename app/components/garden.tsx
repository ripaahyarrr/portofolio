"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { workProjects, type WorkProject } from "@/lib/workProjects";

const CHAR_W = 20;
const CHAR_H = 30;
const CHAR_SPEED = 2.6;
const HOUSE_SIZE = 78;
const INTERACT_PADDING = 30;
const WALK_FRAME_MS = 160;

type Direction = "up" | "down" | "left" | "right";
type Rect = { x: number; y: number; w: number; h: number };

const buildingPalette = [
  { wall: "#8EB4CE", roof: "#5F86A3", door: "#3F5E75" },
  { wall: "#DEBB8E", roof: "#B08C5C", door: "#7A5E3B" },
  { wall: "#8DC4AB", roof: "#5C9A7C", door: "#3E6B54" },
  { wall: "#E09D98", roof: "#B96C67", door: "#8A4844" },
  { wall: "#B09AD0", roof: "#8168A8", door: "#5A4778" },
  { wall: "#E8CE6B", roof: "#C2A63C", door: "#8C7A26" },
];

function shortName(label: string) {
  const cut = label.split(/ - | — /)[0].trim();
  return cut.length > 20 ? `${cut.slice(0, 18)}…` : cut;
}

function rectsOverlap(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function buildLayout(count: number, width: number, height: number) {
  const cols = count > 4 ? 3 : 2;
  const marginX = 90;
  const marginY = 90;
  const usableW = Math.max(width - marginX * 2, 200);
  const usableH = Math.max(height - marginY * 2, 200);
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rows = Math.ceil(count / cols);
    const jitterX = (Math.random() - 0.5) * 30;
    const jitterY = (Math.random() - 0.5) * 20;
    return {
      x: marginX + (usableW / Math.max(cols - 1, 1)) * col + jitterX,
      y: marginY + (usableH / Math.max(rows - 1, 1)) * row + jitterY,
    };
  });
}

function Building({ index, label, type }: { index: number; label: string; type: "house" | "plant" }) {
  const palette = buildingPalette[index % buildingPalette.length];

  return (
    <div className="absolute flex flex-col items-center" style={{ width: HOUSE_SIZE, pointerEvents: "none" }}>
      {type === "house" ? (
        <div className="relative" style={{ width: HOUSE_SIZE, height: HOUSE_SIZE }}>
          {/* Roof */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 0,
              width: 0,
              height: 0,
              borderLeft: `${HOUSE_SIZE / 2 + 6}px solid transparent`,
              borderRight: `${HOUSE_SIZE / 2 + 6}px solid transparent`,
              borderBottom: `${HOUSE_SIZE * 0.38}px solid ${palette.roof}`,
              filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.12))",
            }}
          />
          {/* Wall */}
          <div
            className="absolute rounded-b-[6px]"
            style={{
              left: 4,
              right: 4,
              top: HOUSE_SIZE * 0.34,
              bottom: 0,
              background: palette.wall,
              boxShadow: "inset 0 -6px 10px rgba(0,0,0,0.08)",
            }}
          />
          {/* Door */}
          <div
            className="absolute rounded-t-[4px]"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: HOUSE_SIZE * 0.26,
              height: HOUSE_SIZE * 0.4,
              background: palette.door,
            }}
          />
          {/* Window */}
          <div
            className="absolute rounded-[2px]"
            style={{ left: 10, top: HOUSE_SIZE * 0.52, width: 12, height: 12, background: "#FFF7E0", opacity: 0.9 }}
          />
        </div>
      ) : (
        <div className="relative" style={{ width: HOUSE_SIZE, height: HOUSE_SIZE }}>
          {/* Leaves cluster */}
          <div className="absolute rounded-full" style={{ left: HOUSE_SIZE * 0.12, top: HOUSE_SIZE * 0.16, width: HOUSE_SIZE * 0.5, height: HOUSE_SIZE * 0.5, background: palette.roof }} />
          <div className="absolute rounded-full" style={{ left: HOUSE_SIZE * 0.42, top: HOUSE_SIZE * 0.06, width: HOUSE_SIZE * 0.42, height: HOUSE_SIZE * 0.42, background: palette.wall }} />
          <div className="absolute rounded-full" style={{ left: HOUSE_SIZE * 0.5, top: HOUSE_SIZE * 0.3, width: HOUSE_SIZE * 0.34, height: HOUSE_SIZE * 0.34, background: palette.roof }} />
          {/* Flower accent */}
          <div className="absolute rounded-full" style={{ left: HOUSE_SIZE * 0.4, top: HOUSE_SIZE * 0.28, width: 10, height: 10, background: palette.door }} />
          {/* Pot */}
          <div
            className="absolute"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: HOUSE_SIZE * 0.32,
              height: HOUSE_SIZE * 0.22,
              background: "#9A6B4A",
              clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)",
            }}
          />
        </div>
      )}

      <span
        className="mt-1 rounded-full bg-white/85 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-stone-700 whitespace-nowrap shadow-sm border border-stone-200/70 font-[family-name:var(--font-mono)]"
        style={{ pointerEvents: "none" }}
      >
        {label}
      </span>
    </div>
  );
}

function Character({ x, y, direction, walking, walkFrame }: { x: number; y: number; direction: Direction; walking: boolean; walkFrame: boolean }) {
  const legOffset = walking ? 2 : 0;
  const eyeTop = 5;
  const eyeLeft = direction === "left" ? 3 : direction === "right" ? 9 : 5;
  const showEyes = direction !== "up";

  return (
    <div className="absolute" style={{ left: x, top: y, width: CHAR_W, height: CHAR_H }}>
      {/* Legs */}
      <div
        className="absolute rounded-[2px] bg-stone-700"
        style={{ left: 3, bottom: 0, width: 6, height: 9, transform: `translateY(${walkFrame ? -legOffset : 0}px)` }}
      />
      <div
        className="absolute rounded-[2px] bg-stone-700"
        style={{ right: 3, bottom: 0, width: 6, height: 9, transform: `translateY(${walkFrame ? 0 : -legOffset}px)` }}
      />
      {/* Body */}
      <div className="absolute rounded-[3px]" style={{ left: 0, right: 0, top: 9, height: 13, background: "#D97706" }} />
      {/* Head */}
      <div className="absolute rounded-[3px]" style={{ left: 2, right: 2, top: 0, height: 12, background: "#F2C6A0" }}>
        {showEyes && (
          <>
            <span className="absolute rounded-full bg-stone-800" style={{ width: 2, height: 2, top: eyeTop, left: eyeLeft }} />
            {direction === "down" && (
              <span className="absolute rounded-full bg-stone-800" style={{ width: 2, height: 2, top: eyeTop, left: eyeLeft + 4 }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function Garden({ isMobile = false }: { isMobile?: boolean }) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [viewMode, setViewMode] = useState<"walk" | "list">("walk");
  const [ready, setReady] = useState(false);
  const layoutRef = useRef<{ x: number; y: number }[]>([]);
  const boundsRef = useRef({ width: 0, height: 0 });

  const [charState, setCharState] = useState({ x: 0, y: 0, direction: "down" as Direction, walking: false });
  const charPosRef = useRef({ x: 0, y: 0 });
  const directionRef = useRef<Direction>("down");
  const [walkFrame, setWalkFrame] = useState(false);

  const [nearbyIndex, setNearbyIndex] = useState<number | null>(null);
  const nearbyIndexRef = useRef<number | null>(null);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openIndexRef = useRef<number | null>(null);

  const keysPressed = useRef<Record<string, boolean>>({});
  const mobileInputs = useRef({ up: false, down: false, left: false, right: false });

  // Measure container and lay out houses/plants once on mount
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    boundsRef.current = { width, height };
    layoutRef.current = buildLayout(workProjects.length, width, height);
    charPosRef.current = { x: width / 2 - CHAR_W / 2, y: height / 2 - CHAR_H / 2 };
    setCharState({ x: charPosRef.current.x, y: charPosRef.current.y, direction: "down", walking: false });
    setReady(true);
  }, []);

  useEffect(() => { openIndexRef.current = openIndex; }, [openIndex]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      if (k === "e" && openIndexRef.current === null && nearbyIndexRef.current !== null) {
        setOpenIndex(nearbyIndexRef.current);
      }
      if (k === "escape" && openIndexRef.current !== null) {
        setOpenIndex(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Walk animation frame ticker
  useEffect(() => {
    const id = setInterval(() => setWalkFrame((f) => !f), WALK_FRAME_MS);
    return () => clearInterval(id);
  }, []);

  // Game loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((timestamp - lastTime) / 16.666, 3);
      lastTime = timestamp;

      if (!ready || viewMode !== "walk" || openIndexRef.current !== null) return;

      const isUp = keysPressed.current["w"] || keysPressed.current["arrowup"] || mobileInputs.current.up;
      const isDown = keysPressed.current["s"] || keysPressed.current["arrowdown"] || mobileInputs.current.down;
      const isLeft = keysPressed.current["a"] || keysPressed.current["arrowleft"] || mobileInputs.current.left;
      const isRight = keysPressed.current["d"] || keysPressed.current["arrowright"] || mobileInputs.current.right;

      let moveX = (isRight ? 1 : 0) - (isLeft ? 1 : 0);
      let moveY = (isDown ? 1 : 0) - (isUp ? 1 : 0);
      const walking = moveX !== 0 || moveY !== 0;

      if (walking) {
        const len = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX = (moveX / len) * CHAR_SPEED * dt;
        moveY = (moveY / len) * CHAR_SPEED * dt;

        let nextDirection = directionRef.current;
        if (Math.abs(moveY) >= Math.abs(moveX)) {
          nextDirection = moveY < 0 ? "up" : "down";
        } else {
          nextDirection = moveX < 0 ? "left" : "right";
        }
        directionRef.current = nextDirection;

        const { width, height } = boundsRef.current;
        const houses = layoutRef.current;
        const pos = charPosRef.current;

        const tryMove = (axis: "x" | "y", delta: number) => {
          const next = { ...pos, [axis]: pos[axis] + delta };
          const charRect: Rect = { x: next.x, y: next.y, w: CHAR_W, h: CHAR_H };
          const blocked = houses.some((h) => {
            const houseRect: Rect = { x: h.x - HOUSE_SIZE / 2 + 10, y: h.y - HOUSE_SIZE / 2 + HOUSE_SIZE * 0.34, w: HOUSE_SIZE - 20, h: HOUSE_SIZE * 0.66 };
            return rectsOverlap(charRect, houseRect);
          });
          if (!blocked) {
            pos[axis] = Math.min(Math.max(next[axis], 0), (axis === "x" ? width - CHAR_W : height - CHAR_H));
          }
        };

        tryMove("x", moveX);
        tryMove("y", moveY);
      }

      // Proximity check for nearby interactable
      const pos = charPosRef.current;
      const charCenter = { x: pos.x + CHAR_W / 2, y: pos.y + CHAR_H / 2 };
      let closestIndex: number | null = null;
      let closestDist = Infinity;
      layoutRef.current.forEach((h, i) => {
        const dist = Math.hypot(charCenter.x - h.x, charCenter.y - h.y);
        if (dist < HOUSE_SIZE / 2 + INTERACT_PADDING && dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      if (closestIndex !== nearbyIndexRef.current) {
        nearbyIndexRef.current = closestIndex;
        setNearbyIndex(closestIndex);
      }

      setCharState({ x: pos.x, y: pos.y, direction: directionRef.current, walking });
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [ready, viewMode]);

  const openProject: WorkProject | null = openIndex !== null ? workProjects[openIndex] : null;
  const nearbyProject = nearbyIndex !== null ? workProjects[nearbyIndex] : null;

  const handleDpadDown = useCallback((dir: keyof typeof mobileInputs.current) => () => {
    mobileInputs.current[dir] = true;
  }, []);
  const handleDpadUp = useCallback((dir: keyof typeof mobileInputs.current) => () => {
    mobileInputs.current[dir] = false;
  }, []);

  return (
    <div className="h-full flex flex-col relative select-none">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <div>
          <div className="text-[12px] text-stone-400 uppercase tracking-[0.2em] font-[family-name:var(--font-courier-prime)]">Project Garden</div>
          <div className="text-[13px] text-stone-500 font-[family-name:var(--font-noto)] mt-0.5">
            {viewMode === "walk" ? "Walk around and press E near a house to enter" : "Browsing as a plain list"}
          </div>
        </div>
        <button
          onClick={() => setViewMode((v) => (v === "walk" ? "list" : "walk"))}
          className="text-[11px] font-medium text-stone-600 hover:text-stone-800 bg-[#fffdfa] border border-stone-200/80 px-3 py-1.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-colors font-[family-name:var(--font-courier-prime)]"
        >
          {viewMode === "walk" ? "View as list" : "Back to garden"}
        </button>
      </div>

      {viewMode === "list" ? (
        <div className="flex-1 relative mx-3 mb-3 rounded-[22px] border border-stone-200/80 shadow-[0_12px_28px_rgba(0,0,0,0.06)] overflow-y-auto bg-[#FAF8F5] p-3 space-y-2">
          {workProjects.map((project, i) => (
            <button
              key={project.id}
              onClick={() => setOpenIndex(i)}
              className="w-full text-left rounded-xl border border-stone-200/70 bg-white/70 hover:bg-white px-4 py-3 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-medium text-stone-700">{project.fileName}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{project.role} · {project.year}</p>
              </div>
              <span className="text-[11px] text-stone-400">Open →</span>
            </button>
          ))}
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="flex-1 relative mx-3 mb-3 rounded-[22px] border border-stone-200/80 shadow-[0_12px_28px_rgba(0,0,0,0.06)] overflow-hidden"
          style={{ background: "#e9f0dd" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.15]"
            style={{ backgroundImage: "url(/assets/textures/paper-texture.webp)", backgroundSize: "480px", backgroundRepeat: "repeat" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(120,140,90,0.15) 1.4px, transparent 1.4px)",
              backgroundSize: "26px 26px",
            }}
          />

          {ready &&
            layoutRef.current.map((pos, i) => (
              <div key={workProjects[i].id} className="absolute" style={{ left: pos.x - HOUSE_SIZE / 2, top: pos.y - HOUSE_SIZE / 2 }}>
                <Building index={i} label={shortName(workProjects[i].label)} type={i % 2 === 0 ? "house" : "plant"} />
              </div>
            ))}

          {ready && (
            <Character x={charState.x} y={charState.y} direction={charState.direction} walking={charState.walking} walkFrame={walkFrame} />
          )}

          {/* Interact prompt */}
          <AnimatePresence>
            {nearbyProject && openIndex === null && (
              <motion.button
                key={nearbyProject.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                onClick={() => nearbyIndex !== null && setOpenIndex(nearbyIndex)}
                className="absolute z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-stone-900 text-white px-3 py-1.5 text-[11px] font-medium shadow-lg cursor-pointer font-[family-name:var(--font-mono)]"
                style={{
                  left: charState.x + CHAR_W / 2,
                  top: charState.y - 34,
                }}
              >
                <span className="bg-white/20 rounded px-1.5 py-0.5 text-[10px]">E</span>
                Enter
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mobile D-pad */}
          {(isMobile || (typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) && (
            <div className="absolute bottom-4 right-4 z-20 select-none" style={{ touchAction: "none" }}>
              <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[132px] h-[132px]">
                <div />
                <button
                  onTouchStart={handleDpadDown("up")}
                  onTouchEnd={handleDpadUp("up")}
                  className="col-start-2 row-start-1 bg-white/70 active:bg-white/95 rounded-xl shadow-md border border-stone-200/60 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-stone-700 text-[20px]">arrow_upward</span>
                </button>
                <div />
                <button
                  onTouchStart={handleDpadDown("left")}
                  onTouchEnd={handleDpadUp("left")}
                  className="col-start-1 row-start-2 bg-white/70 active:bg-white/95 rounded-xl shadow-md border border-stone-200/60 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-stone-700 text-[20px]">arrow_back</span>
                </button>
                <div className="col-start-2 row-start-2" />
                <button
                  onTouchStart={handleDpadDown("right")}
                  onTouchEnd={handleDpadUp("right")}
                  className="col-start-3 row-start-2 bg-white/70 active:bg-white/95 rounded-xl shadow-md border border-stone-200/60 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-stone-700 text-[20px]">arrow_forward</span>
                </button>
                <div />
                <button
                  onTouchStart={handleDpadDown("down")}
                  onTouchEnd={handleDpadUp("down")}
                  className="col-start-2 row-start-3 bg-white/70 active:bg-white/95 rounded-xl shadow-md border border-stone-200/60 flex items-center justify-center backdrop-blur-sm"
                >
                  <span className="material-symbols-outlined text-stone-700 text-[20px]">arrow_downward</span>
                </button>
                <div />
              </div>
            </div>
          )}

          {/* Keyboard hint */}
          {!isMobile && (
            <div className="absolute bottom-4 left-4 z-10 flex gap-2 pointer-events-none bg-[#fffdfa]/80 backdrop-blur-xs border border-stone-200/60 px-3 py-2 rounded-xl shadow-xs font-[family-name:var(--font-courier-prime)] text-[10px] text-stone-500">
              <span>Move:</span>
              <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">WASD</span>
              <span>/</span>
              <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">Arrows</span>
              <span className="ml-2">Interact:</span>
              <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">E</span>
            </div>
          )}
        </div>
      )}

      {/* Project detail modal */}
      <AnimatePresence>
        {openProject && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpenIndex(null)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={openProject.label}
              className="editor-window relative w-full max-w-[560px] max-h-[85%] flex flex-col font-[family-name:var(--font-mono)]"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-300/30 bg-[#F0EDE6]/80 shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                  <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
                  <div className="w-[11px] h-[11px] rounded-full bg-[#28C840] border border-[#1AAB29]" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[11px] text-stone-400">~/ripaahyar/garden/{openProject.fileName}</span>
                </div>
                <button
                  onClick={() => setOpenIndex(null)}
                  aria-label="Close"
                  className="text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto p-5 space-y-5 font-[family-name:var(--font-noto)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-stone-800 px-3 py-1 text-[11px] font-medium text-white">{openProject.role}</span>
                  <span className="text-[11px] text-stone-400">{openProject.year}</span>
                  <span className="h-1 w-1 rounded-full bg-stone-300" />
                  {openProject.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-stone-200 px-3 py-1 text-[11px] text-stone-500">{tag}</span>
                  ))}
                </div>

                <div className="space-y-2">
                  <h3 className="text-[18px] font-medium text-stone-800">{openProject.label}</h3>
                  <p className="text-[14px] leading-relaxed text-stone-600">{openProject.summary}</p>
                </div>

                <div>
                  {openProject.previewUrl.startsWith("/") ? (
                    <Link
                      href={openProject.previewUrl}
                      className="inline-flex items-center rounded-lg border border-stone-700 px-4 py-2 text-[13px] font-medium text-stone-700 transition-colors hover:bg-stone-800 hover:text-white"
                    >
                      Preview Website
                    </Link>
                  ) : (
                    <a
                      href={openProject.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-lg border border-stone-700 px-4 py-2 text-[13px] font-medium text-stone-700 transition-colors hover:bg-stone-800 hover:text-white"
                    >
                      Preview Website
                    </a>
                  )}
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200/70">
                  <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-stone-400">
                    <span className="h-[3px] w-3 rounded-full bg-stone-400" />
                    Problem
                  </p>
                  <p className="text-[14px] leading-relaxed text-stone-600 whitespace-pre-line">{openProject.problem}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200/70">
                  <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-stone-400">
                    <span className="h-[3px] w-3 rounded-full bg-stone-400" />
                    What I Did
                  </p>
                  <div className="space-y-2">
                    {openProject.contributions.map((item) => (
                      <div key={item} className="flex gap-2 text-[14px] text-stone-600 leading-relaxed">
                        <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-stone-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-stone-200/70">
                  <p className="flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-stone-400">
                    <span className="h-[3px] w-3 rounded-full bg-[#8EB4CE]" />
                    Outcome
                  </p>
                  <div className="space-y-2">
                    {openProject.outcome.map((item) => (
                      <div key={item} className="flex gap-2 text-[14px] text-stone-600 leading-relaxed">
                        <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#8EB4CE]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
