"use client";

/**
 * ProjectGarden
 * ---------------------------------------------------------
 * Physics-based "island exploration" garden for the portfolio.
 *
 * Concept: each project is a floating island rendered on a Matter.js
 * physics canvas. Islands drift gently, collide with each other and the
 * garden's walls, and can be dragged around by the user. Clicking an
 * island (without dragging it) opens a Finder-style detail window.
 *
 * Matter.js only drives the physics (position / rotation / collisions).
 * All visuals are plain React elements synced to the physics body's
 * position every animation frame, so styling stays fully under Tailwind's
 * control and matches the site's existing retro-desktop / syntax-highlight
 * theme (`syn-keyword`, `syn-string`, etc).
 *
 * Integration:
 *   1. This file expects `matter-js` and `framer-motion` to already be
 *      installed (they are, per the project's package.json).
 *   2. Drop this file in `components/project-garden.tsx`.
 *   3. Replace the PROJECTS array below with your real project data,
 *      or pass a `projects` prop instead.
 *   4. Render it from your garden page/section:
 *        import ProjectGarden from "@/components/project-garden";
 *        <ProjectGarden />
 */

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";

export interface GardenProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  /** Tailwind color token from your syntax-highlight theme, e.g. "syn-keyword" */
  color: string;
  /** Island radius in px. Defaults to 60. */
  radius?: number;
}

const DEFAULT_PROJECTS: GardenProject[] = [
  {
    id: "project-1",
    title: "Project One",
    description: "Replace this with a short, honest description of what the project does and why it exists.",
    tags: ["Next.js", "TypeScript"],
    link: "https://example.com",
    color: "syn-keyword",
  },
  {
    id: "project-2",
    title: "Project Two",
    description: "Replace this with a short, honest description of what the project does and why it exists.",
    tags: ["Supabase", "React"],
    link: "https://example.com",
    color: "syn-string",
    radius: 50,
  },
  {
    id: "project-3",
    title: "Project Three",
    description: "Replace this with a short, honest description of what the project does and why it exists.",
    tags: ["Matter.js", "Canvas"],
    color: "syn-keyword",
    radius: 70,
  },
];

const WALL_THICKNESS = 60;
const DRAG_THRESHOLD_PX = 6;

interface ProjectGardenProps {
  projects?: GardenProject[];
  /** Fixed height of the garden canvas in px. Defaults to 600. */
  height?: number;
}

export default function ProjectGarden({
  projects = DEFAULT_PROJECTS,
  height = 600,
}: ProjectGardenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodiesRef = useRef<Record<string, Matter.Body>>({});
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number; angle: number }>
  >({});
  const [activeProject, setActiveProject] = useState<GardenProject | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;

    const engine = Matter.Engine.create();
    // No downward gravity — islands should feel like they're floating/drifting,
    // not falling.
    engine.gravity.y = 0;

    const walls = [
      Matter.Bodies.rectangle(width / 2, -WALL_THICKNESS / 2, width, WALL_THICKNESS, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(
        width / 2,
        height + WALL_THICKNESS / 2,
        width,
        WALL_THICKNESS,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(-WALL_THICKNESS / 2, height / 2, WALL_THICKNESS, height, {
        isStatic: true,
      }),
      Matter.Bodies.rectangle(
        width + WALL_THICKNESS / 2,
        height / 2,
        WALL_THICKNESS,
        height,
        { isStatic: true }
      ),
    ];

    const islandBodies = projects.map((project) => {
      const radius = project.radius ?? 60;
      const x = radius + Math.random() * (width - radius * 2);
      const y = radius + Math.random() * (height - radius * 2);
      const body = Matter.Bodies.circle(x, y, radius, {
        restitution: 0.6,
        frictionAir: 0.03,
        label: project.id,
      });
      bodiesRef.current[project.id] = body;
      return body;
    });

    Matter.World.add(engine.world, [...walls, ...islandBodies]);

    const mouse = Matter.Mouse.create(container);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.15, render: { visible: false } },
    });
    Matter.World.add(engine.world, mouseConstraint);
    // Matter hijacks the wheel event on the mouse element by default; release it
    // so page scroll still works when the cursor is over the garden.
    container.removeEventListener("wheel", (mouse as any).mousewheel);

    // Gentle random drift so islands feel alive even when untouched.
    const driftInterval = setInterval(() => {
      islandBodies.forEach((body) => {
        Matter.Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.0009,
          y: (Math.random() - 0.5) * 0.0009,
        });
      });
    }, 700);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let rafId: number;
    const syncPositions = () => {
      const next: Record<string, { x: number; y: number; angle: number }> = {};
      for (const project of projects) {
        const body = bodiesRef.current[project.id];
        if (body) {
          next[project.id] = {
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
          };
        }
      }
      setPositions(next);
      rafId = requestAnimationFrame(syncPositions);
    };
    rafId = requestAnimationFrame(syncPositions);

    // Distinguish a click (open project) from a drag (just reposition).
    const dragState = { id: null as string | null, startX: 0, startY: 0, moved: false };

    Matter.Events.on(mouseConstraint, "startdrag", (e: any) => {
      dragState.id = e.body?.label ?? null;
      dragState.startX = e.mouse.position.x;
      dragState.startY = e.mouse.position.y;
      dragState.moved = false;
    });

    Matter.Events.on(mouseConstraint, "mousemove", (e: any) => {
      if (!dragState.id) return;
      const dx = e.mouse.position.x - dragState.startX;
      const dy = e.mouse.position.y - dragState.startY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) dragState.moved = true;
    });

    Matter.Events.on(mouseConstraint, "enddrag", (e: any) => {
      const id = e.body?.label;
      if (id && !dragState.moved) {
        const project = projects.find((p) => p.id === id);
        if (project) setActiveProject(project);
      }
      dragState.id = null;
      dragState.moved = false;
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(driftInterval);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      bodiesRef.current = {};
    };
    // Re-running on project list changes keeps this simple; for a static
    // portfolio the array rarely changes at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, height]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-syn-keyword/20 bg-background"
      style={{ height }}
    >
      <div ref={containerRef} className="absolute inset-0 touch-none">
        {projects.map((project) => {
          const pos = positions[project.id];
          const radius = project.radius ?? 60;
          if (!pos) return null;
          return (
            <button
              key={project.id}
              type="button"
              aria-label={`Open ${project.title}`}
              className={`absolute flex select-none items-center justify-center rounded-full border-2 bg-background/85 text-center font-mono text-xs backdrop-blur-sm transition-shadow hover:shadow-lg border-${project.color} text-${project.color}`}
              style={{
                width: radius * 2,
                height: radius * 2,
                left: pos.x - radius,
                top: pos.y - radius,
                transform: `rotate(${pos.angle}rad)`,
                cursor: "grab",
              }}
              onClick={(e) => {
                // The physical click-vs-drag handling above already covers
                // Matter's mouse constraint; this onClick is a fallback for
                // keyboard / accessibility activation.
                if (e.detail === 0) setActiveProject(project);
              }}
            >
              <span className="px-2 leading-tight">{project.title}</span>
            </button>
          );
        })}
      </div>

      {!activeProject && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 font-mono text-xs text-syn-keyword/70 backdrop-blur-sm">
          Drag to explore · Click an island to open it
        </div>
      )}

      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setActiveProject(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-md border border-syn-keyword/30 bg-background shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label={activeProject.title}
            >
              {/* Finder-style title bar, consistent with finder-window.tsx elsewhere on the site */}
              <div className="flex items-center gap-1.5 border-b border-syn-keyword/20 px-3 py-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 truncate font-mono text-xs text-syn-keyword">
                  {activeProject.title}.project
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="ml-auto font-mono text-xs text-syn-keyword/60 hover:text-syn-keyword"
                  aria-label="Close"
                >
                  esc
                </button>
              </div>

              <div className="p-4 font-mono text-sm">
                <p className="mb-3 text-syn-string">{activeProject.description}</p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {activeProject.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-syn-keyword/10 px-2 py-0.5 text-xs text-syn-keyword"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {activeProject.link && (
                  <a
                    href={activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-syn-keyword underline underline-offset-2"
                  >
                    View project ↗
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
