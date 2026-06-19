"use client";

import React from "react";

type IdBadgeCardProps = {
  compact?: boolean;
  showVideo?: boolean;
  revealMode?: "hover" | "toggle";
};

export function IdBadgeCard({
  compact = false,
  showVideo = false,
  revealMode = "hover",
}: IdBadgeCardProps) {
  const wrapperClassName = compact ? "w-[142px]" : "w-[212px]";
  const photoSizeClassName = compact ? "w-[66px] h-[66px]" : "w-[102px] h-[102px]";
  const paddingClassName = compact ? "px-3 pt-4 pb-3" : "px-5 pt-5 pb-4";
  const tapeClassName = compact ? "w-[52px] h-[14px] -top-2" : "w-[74px] h-[18px] -top-3";
  const nameClassName = compact ? "text-[15px]" : "text-[24px]";
  const roleClassName = compact ? "text-[8px]" : "text-[11px]";
  const metaClassName = compact ? "text-[7px]" : "text-[9px]";
  const doodleClassName = compact ? "text-[24px]" : "text-[36px]";

  const photoImageClassName = revealMode === "hover"
    ? "absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-300 group-hover/badge:opacity-0"
    : "absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-300";
  const photoVideoClassName = revealMode === "hover"
    ? "absolute inset-0 h-full w-full rounded-full object-cover opacity-0 transition-opacity duration-300 group-hover/badge:opacity-100"
    : "absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-300";

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div className={`absolute left-1/2 -translate-x-1/2 ${tapeClassName} rounded-[6px] bg-[#efe5d7]/90 shadow-[0_2px_5px_rgba(0,0,0,0.1)] rotate-[-2deg]`} />

      <div className="relative overflow-hidden rounded-[26px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_14px_30px_rgba(0,0,0,0.1)] rotate-[-3deg]">
        <div className="absolute inset-0 opacity-[0.16]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.35) 1px, transparent 0)",
          backgroundSize: compact ? "10px 10px" : "12px 12px",
        }} />
        <div className="absolute inset-x-0 top-0 h-[34%] bg-[linear-gradient(180deg,rgba(214,120,91,0.12),rgba(214,120,91,0))]" />
        <div className={`relative ${paddingClassName}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-[family-name:var(--font-courier-prime)] text-[10px] uppercase tracking-[0.28em] text-stone-400">
                Designer Note
              </p>
            </div>
            <div className="rounded-full border border-[#d7896c]/60 px-2 py-1 font-[family-name:var(--font-courier-prime)] text-[8px] uppercase tracking-[0.2em] text-[#c26f51]">
              UI
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <div className={`relative shrink-0 ${photoSizeClassName} rounded-full border-[3px] border-[#f4e6da] bg-white shadow-[0_8px_18px_rgba(0,0,0,0.1)]`}>
              <img
                src="/assets/images/profile.png"
                alt="Ripa Ahyar"
                className={photoImageClassName}
                style={revealMode === "toggle" ? { opacity: showVideo ? 0 : 1 } : undefined}
                draggable={false}
              />
              <video
                src="/assets/videos/badge-hover.mp4?v=2"
                muted
                loop
                playsInline
                autoPlay
                className={photoVideoClassName}
                style={revealMode === "toggle" ? { opacity: showVideo ? 1 : 0 } : undefined}
                draggable={false}
              />
            </div>
          </div>

          <div className="mt-3 text-center">
            <h3 className={`font-semibold tracking-[-0.03em] text-stone-800 ${nameClassName}`}>
              Ripa Ahyar
            </h3>
            <p className={`mt-1 font-[family-name:var(--font-noto)] uppercase tracking-[0.24em] text-[#c26f51] ${roleClassName}`}>
              UI/UX Designer
            </p>
            <div className="mx-auto mt-3 h-px w-[82%] bg-[#d9c7bb]" />
            <p className={`mt-3 font-[family-name:var(--font-noto)] leading-relaxed text-stone-500 ${metaClassName}`}>
              Designing clearer flows, warmer interfaces, and thoughtful details.
            </p>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className={`font-[family-name:var(--font-courier-prime)] uppercase tracking-[0.2em] text-stone-400 ${metaClassName}`}>
              RA / 2026
            </div>
            <div className={`font-[family-name:var(--font-courier-prime)] leading-none text-[#d17a5d]/80 ${doodleClassName}`}>
              ~*
            </div>
          </div>

          <div className="absolute right-3 top-3 h-[18px] w-[18px] rounded-full border border-stone-300/70 bg-white/80" />
        </div>
      </div>
    </div>
  );
}
