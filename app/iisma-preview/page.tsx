import Link from "next/link";
import { YellowDotCursor } from "../components/yellow-dot-cursor";

export default function IISMAPreviewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2ea] text-stone-800">
      <YellowDotCursor active />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "url(/paper-texture.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "420px 420px",
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-[-40px] h-[280px] w-[280px] rounded-full bg-[#d9c6aa]/30 blur-3xl" />
        <div className="absolute right-[-60px] top-[15%] h-[260px] w-[260px] rounded-full bg-[#d7b3a5]/30 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[20%] h-[240px] w-[240px] rounded-full bg-[#b5c9d5]/35 blur-3xl" />
      </div>

      <img
        src="/sticky-notes.svg?v=3"
        alt=""
        className="pointer-events-none absolute left-[6%] top-[12%] hidden w-[220px] rotate-[-12deg] opacity-80 drop-shadow-[0_12px_18px_rgba(0,0,0,0.08)] lg:block"
        draggable={false}
      />
      <img
        src="/ticket.png?v=2"
        alt=""
        className="pointer-events-none absolute right-[7%] top-[10%] hidden w-[240px] rotate-[10deg] opacity-90 drop-shadow-[0_14px_20px_rgba(0,0,0,0.12)] lg:block"
        draggable={false}
      />
      <img
        src="/flower.png?v=3"
        alt=""
        className="pointer-events-none absolute bottom-[10%] left-[7%] hidden w-[110px] rotate-[-10deg] opacity-90 drop-shadow-[0_10px_18px_rgba(0,0,0,0.12)] lg:block"
        draggable={false}
      />
      <img
        src="/apple-pencil.png?v=2"
        alt=""
        className="pointer-events-none absolute bottom-[8%] right-[8%] hidden w-[130px] rotate-[18deg] opacity-90 drop-shadow-[0_12px_20px_rgba(0,0,0,0.12)] lg:block"
        draggable={false}
      />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1320px] items-center px-6 py-16 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="mb-6 flex items-center gap-3">
              <img src="/star.svg" alt="" className="h-5 w-5 opacity-60" draggable={false} />
              <p className="text-[12px] font-medium uppercase tracking-[0.26em] text-stone-400">
                IISMA Preview
              </p>
            </div>

            <div className="max-w-[560px]">
              <p className="font-[family-name:var(--font-mono)] text-[92px] leading-none text-stone-300 lg:text-[128px]">
                404
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-noto)] text-[34px] leading-[1.08] text-stone-900 lg:text-[56px]">
                This case study preview took a different route.
              </h1>
              <p className="mt-5 max-w-[520px] font-[family-name:var(--font-noto)] text-[15px] leading-8 text-stone-600 lg:text-[17px]">
                The external IISMA preview is unavailable right now, so this screen stands in as a curated 404.
                The project is still part of the portfolio, but the live destination is currently missing.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#work"
                className="inline-flex items-center rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
              >
                Back to portfolio
              </Link>
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
              >
                Home
              </Link>
            </div>

            <div className="mt-10 grid max-w-[560px] gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Status",
                  value: "Preview missing",
                },
                {
                  label: "Project",
                  value: "IISMA platform",
                },
                {
                  label: "Fallback",
                  value: "Portfolio route",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] border border-stone-300/70 bg-white/65 px-4 py-4 backdrop-blur-sm"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                  <p className="mt-2 text-[15px] font-medium text-stone-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute left-[8%] top-[-18px] z-20 h-8 w-8 rounded-full bg-[#d93636] shadow-[0_6px_12px_rgba(0,0,0,0.22)]" />
              <div className="absolute right-[12%] top-[22px] z-20 h-7 w-7 rounded-full bg-[#4f55d4] shadow-[0_6px_12px_rgba(0,0,0,0.22)]" />

              <div className="relative rotate-[-2deg] rounded-[34px] border border-stone-300/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(249,245,238,0.92)_100%)] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.12)]">
                <div className="rounded-[28px] border border-stone-200/80 bg-[#fbfaf7] p-4">
                  <div className="relative overflow-hidden rounded-[24px] border border-stone-200 bg-[#efe7db]">
                    <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "url(/paper-texture.jpg)", backgroundSize: "280px 280px" }} />
                    <div className="relative px-6 pb-8 pt-7">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] uppercase tracking-[0.22em] text-stone-400">Missing Destination</p>
                        <img src="/star.svg" alt="" className="h-4 w-4 opacity-50" draggable={false} />
                      </div>

                      <div className="mt-8 rounded-[22px] border border-dashed border-stone-300/90 bg-white/60 px-6 py-10 text-center">
                        <p className="font-[family-name:var(--font-mono)] text-[64px] leading-none text-stone-300">
                          404
                        </p>
                        <p className="mt-4 text-[18px] font-medium text-stone-800">
                          Preview not found
                        </p>
                        <p className="mx-auto mt-3 max-w-[280px] text-[14px] leading-7 text-stone-500">
                          The link exists in the portfolio, but the live preview itself is currently unavailable.
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between rounded-[18px] bg-white/75 px-4 py-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Suggested path</p>
                          <p className="mt-1 text-[14px] font-medium text-stone-700">Return to Work section</p>
                        </div>
                        <Link
                          href="/#work"
                          className="rounded-full border border-stone-300 bg-white px-4 py-2 text-[12px] font-medium text-stone-700 transition-colors hover:bg-stone-100"
                        >
                          Go back
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <img
                src="/cat.png?v=2"
                alt=""
                className="pointer-events-none absolute -right-8 bottom-[-24px] hidden w-[150px] rotate-[8deg] drop-shadow-[0_14px_24px_rgba(0,0,0,0.16)] lg:block"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
