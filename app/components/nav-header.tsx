"use client";

import React from "react";
import Image from "next/image";
export function NavHeader() {
  const navLinks = [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Playground", href: "#playground" },
  ];

  return (
    <nav className="relative z-[100]">
      <div className="mx-auto max-w-[1400px] px-8 pt-6 pb-3 flex items-center justify-between">
        <a
          href="/"
          className="inline-flex items-center transition-opacity hover:opacity-80"
        >
          <Image
            src="/assets/icons/Logo.png"
            alt="Ripa Ahyar"
            width={800}
            height={800}
            className="h-[46px] w-auto"
            priority
          />
        </a>
        <div className="flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-noto)] text-[12px] text-stone-500 hover:text-stone-800 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
