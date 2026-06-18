"use client";

import React from "react";

export function VinylCard() {
  return (
    <a href="https://dengerin-playlist.netlify.app/" target="_blank" rel="noopener noreferrer" className="hidden lg:block absolute left-[40px] top-[410px] z-30 transition-all duration-300 -rotate-[5deg] hover:rotate-[2deg] hover:scale-110 hover:-translate-y-5 cursor-pointer group/vinyl hero-entrance" style={{ overflow: "visible", animation: "hero-slide-left 0.7s cubic-bezier(0.4,0,0.2,1) 2.5s both" }}>
      <div className="relative w-[240px]" style={{ overflow: "visible" }}>
        {/* Vinyl record — outside card, centered with margin */}
        <div className="absolute inset-x-0 top-[24px] flex justify-center z-10 pointer-events-none" style={{ overflow: "visible" }}>
          <img
            src="/Vinyl.png?v=2"
            alt="Vinyl record"
            className="w-36 h-36 vinyl-spin transition-all duration-500 ease-out group-hover/vinyl:scale-[2.3] group-hover/vinyl:-translate-y-[70px] group-hover/vinyl:-translate-x-[20px] group-hover/vinyl:drop-shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            style={{ willChange: "transform" }}
            draggable={false}
          />
        </div>
        {/* Rotating gradient border — visible on hover */}
        <div
          className="absolute inset-[-1px] rounded-2xl opacity-0 transition-opacity duration-400 group-hover/vinyl:opacity-100 pointer-events-none"
          style={{
            background: "conic-gradient(from var(--vinyl-angle), #CC785C, #E3A38B, transparent, transparent, #CC785C)",
            animation: "vinyl-border-rotate 3s linear infinite",
          }}
        />
        <div
          className="relative border rounded-2xl shadow-sm flex flex-col items-center w-[240px] pt-6 pb-6 overflow-hidden bg-white transition-colors duration-500"
          style={{
            borderColor: "rgba(204,120,92,0.34)",
          }}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-out group-hover/vinyl:opacity-100 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 22% 24%, rgba(204,120,92,0.28) 0%, rgba(204,120,92,0.14) 18%, rgba(204,120,92,0) 44%), radial-gradient(circle at 78% 74%, rgba(227,163,139,0.26) 0%, rgba(227,163,139,0.1) 28%, rgba(227,163,139,0) 52%), linear-gradient(180deg, #fffaf7 0%, #f9ebe4 100%)",
            }}
          />
          {/* Animated blobs — hidden by default, appear on hover */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-0 transition-opacity duration-500 ease-out group-hover/vinyl:opacity-100">
            <div className="vinyl-blob vinyl-blob-1" />
            <div className="vinyl-blob vinyl-blob-2" />
            <div className="vinyl-blob vinyl-blob-3" />
          </div>
          {/* Spacer matching default vinyl size */}
          <div className="relative z-[1] w-36 h-36" />
          {/* Info */}
          <div className="relative z-[1] mt-4 text-center px-5">
            <p className="font-[family-name:var(--font-noto)] text-[10px] text-text-primary uppercase tracking-widest mb-1">Playlist</p>
            <h3 className="font-[family-name:var(--font-noto)] text-text-primary font-bold text-lg leading-tight mb-1">Dengerin</h3>
            <p className="font-[family-name:var(--font-noto)] text-text-primary text-[11px] mb-1">Ripaahyar • 23 tracks • 105:39</p>
            <p className="font-[family-name:var(--font-noto)] text-stone-400 text-[13px] font-medium leading-snug">Imported from the public Spotify playlist page.</p>
          </div>
        </div>
      </div>
    </a>
  );
}
