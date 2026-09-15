"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WHATSAPP_NUMBER = "6285289395268";
const WHATSAPP_DISPLAY = "+62 852-8939-5268";

type Status = "idle" | "submitting" | "success" | "error";

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(body.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setErrorMessage("Network error — please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[620px]"
    >
      <div className="editor-window font-[family-name:var(--font-mono)]">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-300/30 bg-[#F0EDE6]/80">
          <div className="flex gap-1.5">
            <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57] border border-[#E0443E]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
            <div className="w-[11px] h-[11px] rounded-full bg-[#28C840] border border-[#1AAB29]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-stone-400">~/ripaahyar/contact.tsx</span>
          </div>
          <div className="w-[52px]" />
        </div>

        {/* Body */}
        <motion.form
          onSubmit={handleSubmit}
          className="px-6 py-7 space-y-5 text-[13px] leading-relaxed"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
        >
          <motion.p variants={fieldVariants} className="text-syn-comment select-none">
            {"// say hello — I'll get back to you"}
          </motion.p>

          <motion.label variants={fieldVariants} className="block">
            <span>
              <span className="text-syn-keyword">const</span>{" "}
              <span className="text-syn-property">name</span>{" "}
              <span className="text-syn-plain">=</span>{" "}
              <span className="text-syn-plain">&quot;</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="Jane Doe"
              className="inline-block w-[240px] max-w-[70%] bg-transparent text-syn-string placeholder:text-syn-string/40 outline-none border-b border-transparent focus:border-syn-string/40 transition-colors"
            />
            <span className="text-syn-plain">&quot;;</span>
          </motion.label>

          <motion.label variants={fieldVariants} className="block">
            <span>
              <span className="text-syn-keyword">const</span>{" "}
              <span className="text-syn-property">email</span>{" "}
              <span className="text-syn-plain">=</span>{" "}
              <span className="text-syn-plain">&quot;</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              placeholder="jane@email.com"
              className="inline-block w-[240px] max-w-[70%] bg-transparent text-syn-string placeholder:text-syn-string/40 outline-none border-b border-transparent focus:border-syn-string/40 transition-colors"
            />
            <span className="text-syn-plain">&quot;;</span>
          </motion.label>

          <motion.label variants={fieldVariants} className="block">
            <span>
              <span className="text-syn-keyword">const</span>{" "}
              <span className="text-syn-property">message</span>{" "}
              <span className="text-syn-plain">=</span>{" "}
              <span className="text-syn-plain">`</span>
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={2000}
              rows={4}
              placeholder="What's on your mind?"
              className="block w-full mt-1.5 bg-editor-surface/60 text-syn-string placeholder:text-syn-string/40 outline-none border border-editor-border rounded-md px-3 py-2 resize-none focus:border-syn-string/50 transition-colors"
            />
            <span className="text-syn-plain">`;</span>
          </motion.label>

          <motion.div variants={fieldVariants} className="pt-1 flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="rounded-md border border-stone-700 px-4 py-1.5 text-[12px] text-stone-700 hover:bg-stone-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === "submitting" ? (
                <>
                  <span className="text-syn-keyword">await</span> sendMessage()
                </>
              ) : (
                <>
                  <span className="text-syn-keyword">run</span>(sendMessage)
                </>
              )}
            </button>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Chat on WhatsApp — ${WHATSAPP_DISPLAY}`}
              className="flex items-center gap-1.5 text-stone-400 hover:text-emerald-600 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.25 8.24zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.24-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.42-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z" />
              </svg>
              <span className="text-[11px]">WhatsApp</span>
            </a>
          </motion.div>

          <AnimatePresence mode="wait">
            {status === "success" && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-emerald-600 text-[12px]"
              >
                {"// message sent — thanks! I'll reply soon."}
              </motion.p>
            )}
            {status === "error" && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-[12px]"
              >
                {`// error: ${errorMessage}`}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </motion.div>
  );
}
