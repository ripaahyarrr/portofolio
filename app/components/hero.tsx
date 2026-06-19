"use client";

import React, { useState, useEffect } from "react";
import { IdBadgeCard } from "./id-badge-card";

/* ── Typing effect hook ── */
export function useTypingEffect(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

/* ── Local time ── */
export function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, "0");
      const hour12 = h % 12 || 12;
      const ampm = h >= 12 ? "PM" : "AM";
      setTime(`SEA ${String(hour12).padStart(2, "0")}:${m} ${ampm}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="hidden lg:flex flex-col items-end font-[family-name:var(--font-noto)] tracking-widest uppercase">
      <span className="text-[9px]" style={{ color: "#9e9e9e" }}>Local Time</span>
      <span className="text-[11px] text-stone-800 font-medium">{time}</span>
    </div>
  );
}

/* ── Star background ── */
export function StarBackground() {
  const [stars, setStars] = useState<
    { id: number; left: string; top: string; size: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const s = [];
    for (let i = 0; i < 60; i++) {
      s.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      });
    }
    setStars(s);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-text-muted/20"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Floating code decorations ── */
const decorations = [
  { symbol: "{ }", top: "6%", left: "8%", size: "text-2xl", rotate: "-12deg", delay: "0s" },
  { symbol: "< / >", top: "4%", left: "35%", size: "text-lg", rotate: "8deg", delay: "1.2s" },
  { symbol: "[ ]", top: "8%", right: "20%", size: "text-xl", rotate: "15deg", delay: "0.6s" },
  { symbol: "=>", top: "3%", right: "10%", size: "text-2xl", rotate: "-5deg", delay: "2s" },
  { symbol: "//", top: "12%", right: "5%", size: "text-lg", rotate: "20deg", delay: "0.8s" },
  { symbol: "( )", bottom: "10%", left: "6%", size: "text-xl", rotate: "10deg", delay: "1.5s" },
  { symbol: "&&", bottom: "8%", left: "30%", size: "text-lg", rotate: "-8deg", delay: "0.3s" },
  { symbol: "!=", bottom: "12%", right: "35%", size: "text-xl", rotate: "12deg", delay: "1.8s" },
  { symbol: "++", bottom: "6%", right: "15%", size: "text-2xl", rotate: "-15deg", delay: "2.5s" },
  { symbol: "/* */", bottom: "10%", right: "5%", size: "text-sm", rotate: "6deg", delay: "0.9s" },
  { symbol: ";;", top: "18%", left: "3%", size: "text-sm", rotate: "-20deg", delay: "1.1s" },
  { symbol: "$ _", top: "15%", right: "3%", size: "text-lg", rotate: "18deg", delay: "2.2s" },
];

export function FloatingDecorations() {
  return (
    <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {decorations.map((d, i) => (
        <span
          key={i}
          className={`absolute font-mono ${d.size} text-text-muted/10 select-none code-decoration`}
          style={{
            top: d.top,
            left: d.left,
            right: d.right,
            bottom: d.bottom,
            "--rotate": d.rotate,
            animationDelay: d.delay,
          } as React.CSSProperties}
        >
          {d.symbol}
        </span>
      ))}
    </div>
  );
}

/* ── Mac folder icon ── */
export function MacFolder() {
  return (
    <div
      className="hidden lg:block absolute left-[400px] top-[560px] z-30 group cursor-pointer rotate-[6deg] transition-all duration-300 hover:scale-110 hover:-translate-y-2 hover:rotate-[2deg] hero-entrance"
      style={{ perspective: "500px", animation: "hero-slide-up 0.7s cubic-bezier(0.4,0,0.2,1) 2.8s both" }}
    >
      <div className="relative w-[155px] h-[155px] transition-all duration-300 group-hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)]">
        {/* Back panel — stays in place */}
        <img
          src="/assets/icons/mac-folder-back-opt.svg"
          alt=""
          className="absolute inset-0 w-full h-full z-0"
          draggable={false}
        />
        {/* Items that pop out on hover */}
        {/* iPad + notebook — left */}
        <img
          src="/assets/icons/Ipad and notebook.svg"
          alt="iPad and notebook"
          className="absolute left-1/2 bottom-[30%] w-[105px] -translate-x-1/2 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:-translate-y-[75px] group-hover:-translate-x-[140px] group-hover:rotate-[-15deg] z-10"
          style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))" }}
          draggable={false}
        />
        {/* Claude logo — upper center-right */}
        <img
          src="/assets/icons/Claude logo.svg"
          alt="Claude"
          className="absolute left-1/2 bottom-[30%] w-[65px] -translate-x-1/2 transition-all duration-500 ease-out delay-75 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[95px] group-hover:-translate-x-[30px] group-hover:rotate-[5deg] z-10"
          style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))" }}
          draggable={false}
        />
        {/* Laptop — right */}
        <img
          src="/assets/icons/laptop.svg"
          alt="Laptop"
          className="absolute left-1/2 bottom-[30%] w-[105px] -translate-x-1/2 transition-all duration-500 ease-out delay-150 opacity-0 group-hover:opacity-100 group-hover:-translate-y-[65px] group-hover:translate-x-[40px] group-hover:rotate-[10deg] z-10"
          style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.25))" }}
          draggable={false}
        />
        {/* Front panel — rotates open on hover */}
        <img
          src="/assets/icons/mac-folder-front-opt.svg"
          alt="Folder"
          className="absolute inset-0 w-full h-full z-20 transition-transform duration-500 ease-out origin-bottom group-hover:[transform:rotateX(-22deg)]"
          draggable={false}
        />
      </div>
    </div>
  );
}

/* ── Hanging name badge ── */
export function NameBadge() {
  return (
    <div className="hidden lg:block absolute left-[42px] top-[14px] z-20">
     <a href="https://www.linkedin.com/in/ripa-ahyar" target="_blank" rel="noopener noreferrer" className="badge-swing block cursor-pointer group/badge">
      <IdBadgeCard showVideo={false} revealMode="hover" />
     </a>
    </div>
  );
}
