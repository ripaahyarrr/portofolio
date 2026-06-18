"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IdBadgeCard } from "./id-badge-card";

const terminalLines = [
  { prompt: "$ whoami", output: "UI/UX Designer with 5+ years experience" },
  { prompt: "$ ls interests/", output: "AI/UX/UI Design/Visual Storytelling/visual creativity" },
];

/* ── Dot matrix data ── */
const FIGMA_COLS = 18;
// prettier-ignore
const figmaGrid = [
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,1,1,1,1,0,1,1,1,1,0,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,
  0,0,0,0,1,1,1,1,1,0,1,1,1,1,0,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,
  0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,
  0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
];

function getFigmaColor(i: number) {
  const row = Math.floor(i / FIGMA_COLS);
  const col = i % FIGMA_COLS;
  const isLeft = col < 9;
  if (row <= 6) return isLeft ? "#F24E1E" : "#FF7262";
  if (row <= 10) return isLeft ? "#A259FF" : "#1ABCFE";
  return "#0ACF83";
}

const figmaDotOrder = figmaGrid.reduce<number[]>((acc, val, i) => { if (val) acc.push(i); return acc; }, []);
const dotSequenceMap = new Map<number, number>();
figmaDotOrder.forEach((dotIndex, seqIndex) => dotSequenceMap.set(dotIndex, seqIndex));

/* ── Terminal typing ── */
function MobileTerminal() {
  const [display, setDisplay] = useState<string[]>([]);
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let delay = 1200;

    terminalLines.forEach((line, lineIdx) => {
      for (let c = 1; c <= line.prompt.length; c++) {
        timeouts.push(setTimeout(() => {
          setDisplay(prev => {
            const next = [...prev];
            next[lineIdx * 2] = line.prompt.slice(0, c);
            return next;
          });
        }, delay));
        delay += 25;
      }
      delay += 300;
      timeouts.push(setTimeout(() => {
        setDisplay(prev => {
          const next = [...prev];
          next[lineIdx * 2 + 1] = line.output;
          return next;
        });
      }, delay));
      delay += 400;
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const allDone = display.length > 0 && display[terminalLines.length * 2 - 1] !== undefined;

  return (
    <div
      className="w-full rounded-lg overflow-hidden transition-transform duration-300"
      style={{
        background: "#ffffff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        border: "1px solid #e7e5e4",
        transform: tapped ? "scale(1.03)" : "scale(1)",
      }}
      onPointerDown={(e) => { if (allDone) { e.stopPropagation(); setTapped(t => !t); } }}
    >
      <div className="flex items-center justify-between px-3 py-2" style={{ background: "linear-gradient(to bottom, #FAFAF9, #F0EFED)", borderBottom: "1px solid #e7e5e4" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-[9px] h-[9px] rounded-full bg-[#FF5F57] border border-[#E0443E]" />
          <div className="w-[9px] h-[9px] rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
          <div className="w-[9px] h-[9px] rounded-full bg-[#28C840] border border-[#1AAB29]" />
        </div>
        <span className="text-[10px] text-stone-400 select-none">ripa-ahyar — zsh</span>
        <div className="w-[40px]" />
      </div>
      <div className="w-full p-3 font-mono text-[11px] leading-[1.7]" style={{ minHeight: "80px" }}>
        {terminalLines.map((line, i) => (
          <div key={i}>
            {display[i * 2] !== undefined && (
              <div className="text-stone-800">
                <span className="text-emerald-600">~</span>{" "}
                {display[i * 2]}
                {display[i * 2 + 1] === undefined && (
                  <span className="inline-block w-[5px] h-[10px] bg-stone-400 ml-[1px] align-text-bottom" style={{ animation: "blink 1s step-end infinite" }} />
                )}
              </div>
            )}
            {display[i * 2 + 1] !== undefined && (
              <div className="text-stone-500 mb-1">{display[i * 2 + 1]}</div>
            )}
          </div>
        ))}
        {tapped && allDone && (
          <div className="flex justify-center mt-1">
            <img src="/cat-dance.gif" alt="Dancing cat" className="h-[70px]" draggable={false} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mobile Hero Layout ── */
export function MobileHero() {
  const [badgeTapped, setBadgeTapped] = useState(false);
  const [ticketTapped, setTicketTapped] = useState(false);
  const [vinylTapped, setVinylTapped] = useState(false);
  const [folderTapped, setFolderTapped] = useState(false);
  const [matrixTapped, setMatrixTapped] = useState(false);

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="lg:hidden flex flex-col items-center px-6 pt-3 pb-12 gap-6 relative z-10">

      {/* Row 1: Badge (left) + Ticket & Vinyl stacked (right) */}
      <motion.div
        className="flex items-start justify-center w-full gap-4"
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {/* Name badge */}
        <div
          className="flex flex-col items-center shrink-0 transition-transform duration-300 badge-swing mt-2 -ml-1"
          style={{ transform: badgeTapped ? "scale(1.05) rotate(1deg)" : "scale(1)" }}
          onPointerDown={(e) => { e.stopPropagation(); setBadgeTapped(t => !t); }}
        >
          <IdBadgeCard compact showVideo={badgeTapped} revealMode="toggle" />
        </div>

        {/* Right column: Ticket + Vinyl stacked */}
        <div className="flex flex-col gap-4 mt-1">
          {/* Concert ticket — tap for shimmer */}
          <div
            className="w-[200px] rotate-[4deg] relative overflow-hidden transition-transform duration-300"
            style={{ transform: ticketTapped ? "scale(1.08) rotate(1deg)" : "rotate(4deg)" }}
            onPointerDown={(e) => { e.stopPropagation(); setTicketTapped(t => !t); }}
          >
            <img src="/ticket.png?v=2" alt="Design x Technology ticket" className="w-full rounded-sm shadow-md" draggable={false} />
            {ticketTapped && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute top-0 -left-full w-full h-full"
                  style={{
                    animation: "ticket-scan 2.2s ease-in-out infinite",
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,100,100,0.08) 25%, rgba(255,200,50,0.12) 35%, rgba(100,255,150,0.12) 45%, rgba(255,255,255,0.3) 50%, rgba(100,180,255,0.12) 55%, rgba(200,100,255,0.12) 65%, rgba(255,100,150,0.08) 75%, transparent 100%)",
                    filter: "blur(1.5px)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Vinyl card — tap to expand vinyl */}
          <a
            href="https://dengerin-playlist.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-[145px] self-center -ml-2 cursor-pointer block"
            onPointerDown={(e) => { e.stopPropagation(); setVinylTapped(t => !t); }}
          >
            <div className="absolute inset-x-0 top-[12px] flex justify-center z-10 pointer-events-none transition-all duration-500"
              style={{
                transform: vinylTapped ? "scale(1.8) translateY(-35px) translateX(-10px)" : "none",
                filter: vinylTapped ? "drop-shadow(0 12px 30px rgba(0,0,0,0.35))" : "none",
              }}
            >
              <img src="/Vinyl.png?v=2" alt="Vinyl record" className={`w-20 h-20 vinyl-spin ${vinylTapped ? "vinyl-spin-active" : ""}`} draggable={false} />
            </div>
            <div
              className="relative border rounded-xl shadow-sm flex flex-col items-center w-[145px] pt-7 pb-3 overflow-hidden"
              style={{
                borderColor: "rgba(204,120,92,0.34)",
                background:
                  "radial-gradient(circle at 22% 24%, rgba(204,120,92,0.28) 0%, rgba(204,120,92,0.14) 18%, rgba(204,120,92,0) 44%), radial-gradient(circle at 78% 74%, rgba(227,163,139,0.26) 0%, rgba(227,163,139,0.1) 28%, rgba(227,163,139,0) 52%), linear-gradient(180deg, #fffaf7 0%, #f9ebe4 100%)",
              }}
            >
              <div className="w-20 h-20" />
              <p className="font-[family-name:var(--font-noto)] text-[9px] text-text-primary uppercase tracking-widest mt-1">
                Playlist
              </p>
              <h3 className="font-[family-name:var(--font-noto)] text-text-primary font-bold text-[13px] mt-1">
                Dengerin
              </h3>
              <p className="font-[family-name:var(--font-noto)] text-[9px] text-text-primary mt-1">
                Ripaahyar • 23 tracks
              </p>
              <div className="px-3 mt-1">
                <p className="font-[family-name:var(--font-noto)] text-[9px] text-stone-400 text-center leading-snug">
                  Imported from the public Spotify playlist page.
                </p>
              </div>
            </div>
          </a>
        </div>
      </motion.div>

      {/* Row 2: Dot matrix (left) | Name+tagline (center) | Folder (right) */}
      <motion.div
        className="flex items-center justify-center gap-3 w-full"
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Dot matrix — tap to scale */}
        <div
          className={`shrink-0 rounded-xl p-1.5 transition-all duration-300 cursor-pointer ${matrixTapped ? "dot-matrix-active" : ""}`}
          style={{
            background: "linear-gradient(160deg, #4a4a4a 0%, #3a3a3a 30%, #2d2d2d 100%)",
            boxShadow: matrixTapped
              ? "0 8px 25px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(162,89,255,0.3)"
              : "0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
            transform: matrixTapped ? "scale(1.2) rotate(3deg)" : "scale(1)",
          }}
          onPointerDown={(e) => { e.stopPropagation(); setMatrixTapped(t => !t); }}
        >
          <div className="grid gap-[1.5px]" style={{ gridTemplateColumns: `repeat(${FIGMA_COLS}, 1fr)` }}>
            {figmaGrid.map((on, i) => {
              const seq = dotSequenceMap.get(i) ?? 0;
              const color = on ? getFigmaColor(i) : "";
              return (
                <div
                  key={i}
                  className={`dot-led w-[3px] h-[3px] rounded-full${on ? " dot-on" : ""}`}
                  style={{
                    "--dot-color": color,
                    "--dot-delay": `${seq * 12}ms`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>

        {/* Name + tagline */}
        <div className="flex flex-col items-center">
          <img src="/Ripa Ahyar.svg" alt="Ripa Ahyar" className="h-[45px] mb-1.5" draggable={false} />
          <p className="font-[family-name:var(--font-noto)] text-[9px] text-stone-500 text-center tracking-[0.18em] uppercase" style={{ lineHeight: "1.8" }}>
            I think, then I build.
          </p>
        </div>

        {/* Yellow folder — tap to open */}
        <div
          className="shrink-0 w-[90px] h-[90px] relative transition-transform duration-300"
          style={{
            perspective: "500px",
            transform: folderTapped ? "scale(1.1) rotate(-2deg) translateY(-5px)" : "scale(1)",
          }}
          onPointerDown={(e) => { e.stopPropagation(); setFolderTapped(t => !t); }}
        >
          <img src="/mac-folder-back-opt.svg" alt="" className="absolute inset-0 w-full h-full z-0" draggable={false} />
          {/* Items that pop out on tap */}
          <img
            src="/Claude logo.svg"
            alt="Claude"
            className="absolute left-1/2 bottom-[30%] w-[40px] -translate-x-1/2 transition-all duration-500 ease-out z-10"
            style={{
              opacity: folderTapped ? 1 : 0,
              transform: folderTapped ? "translate(-50%, -55px) rotate(5deg)" : "translate(-50%, 0)",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            draggable={false}
          />
          <img
            src="/mac-folder-front-opt.svg"
            alt="Folder"
            className="absolute inset-0 w-full h-full z-20 transition-transform duration-500 ease-out origin-bottom"
            style={{ transform: folderTapped ? "rotateX(-22deg)" : "none" }}
            draggable={false}
          />
        </div>
      </motion.div>

      {/* Row 3: Terminal */}
      <motion.div
        className="w-full max-w-[360px]"
        {...fadeUp}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <MobileTerminal />
      </motion.div>
    </div>
  );
}
