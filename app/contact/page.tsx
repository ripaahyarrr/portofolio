import type { Metadata } from "next";
import { NavHeader } from "../components/nav-header";
import { YellowDotCursor } from "../components/yellow-dot-cursor";
import { ContactForm } from "../components/contact-form";

export const metadata: Metadata = {
  title: "Contact — Ripa Ahyar",
  description: "Get in touch with Ripa Ahyar — send a message directly or reach out on WhatsApp.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <YellowDotCursor active />
      <NavHeader />
      <div className="flex flex-col items-center px-4 pt-10 pb-24">
        <div className="max-w-[620px] text-center mb-8">
          <p className="font-[family-name:var(--font-noto)] text-[11px] uppercase tracking-[0.24em] text-stone-400 mb-3">
            Contact
          </p>
          <h1 className="font-[family-name:var(--font-noto)] text-[28px] md:text-[34px] text-stone-800">
            Let&apos;s build something together
          </h1>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
