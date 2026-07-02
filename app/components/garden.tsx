"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface WorldItem {
  id: number;
  x: number;
  z: number;
  type: "tree" | "rock" | "flower";
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

// ── 3D Projection Helpers ──
interface Camera {
  cx: number;
  cy: number;
  cz: number;
  theta: number;
  phi: number;
  F: number;
  centerX: number;
  centerY: number;
}

function projectPoint(wx: number, wy: number, wz: number, camera: Camera) {
  const dx = wx - camera.cx;
  const dy = wy - camera.cy;
  const dz = wz - camera.cz;
  
  // Yaw rotation (horizontal angle)
  const rx = dx * Math.sin(camera.theta) - dz * Math.cos(camera.theta);
  const rz = dx * Math.cos(camera.theta) + dz * Math.sin(camera.theta);
  const ry = dy;
  
  // Pitch rotation (looking up/down)
  const ry2 = ry * Math.cos(camera.phi) + rz * Math.sin(camera.phi);
  const rz2 = -ry * Math.sin(camera.phi) + rz * Math.cos(camera.phi);
  
  if (rz2 <= 0.1) return null; // Behind near plane
  
  const s = camera.F / rz2;
  return {
    x: camera.centerX + rx * s,
    y: camera.centerY - ry2 * s,
    depth: rz2
  };
}

function draw3DLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  camera: Camera,
  color: string,
  w: number
) {
  const dx1 = x1 - camera.cx;
  const dy1 = y1 - camera.cy;
  const dz1 = z1 - camera.cz;
  const rx1 = dx1 * Math.sin(camera.theta) - dz1 * Math.cos(camera.theta);
  const rz1 = dx1 * Math.cos(camera.theta) + dz1 * Math.sin(camera.theta);
  const ry1_2 = dy1 * Math.cos(camera.phi) + rz1 * Math.sin(camera.phi);
  const rz1_2 = -dy1 * Math.sin(camera.phi) + rz1 * Math.cos(camera.phi);

  const dx2 = x2 - camera.cx;
  const dy2 = y2 - camera.cy;
  const dz2 = z2 - camera.cz;
  const rx2 = dx2 * Math.sin(camera.theta) - dz2 * Math.cos(camera.theta);
  const rz2 = dx2 * Math.cos(camera.theta) + dz2 * Math.sin(camera.theta);
  const ry2_2 = dy2 * Math.cos(camera.phi) + rz2 * Math.sin(camera.phi);
  const rz2_2 = -dy2 * Math.sin(camera.phi) + rz2 * Math.cos(camera.phi);

  let cx1 = rx1, cy1 = ry1_2, cz1 = rz1_2;
  let cx2 = rx2, cy2 = ry2_2, cz2 = rz2_2;

  if (cz1 < 0.25 && cz2 < 0.25) return;

  if (cz1 < 0.25) {
    const t = (0.25 - cz1) / (cz2 - cz1);
    cx1 = cx1 + t * (cx2 - cx1);
    cy1 = cy1 + t * (cy2 - cy1);
    cz1 = 0.25;
  } else if (cz2 < 0.25) {
    const t = (0.25 - cz2) / (cz1 - cz2);
    cx2 = cx2 + t * (cx1 - cx2);
    cy2 = cy2 + t * (cy1 - cy2);
    cz2 = 0.25;
  }

  // Grid fade based on average depth
  const avgDepth = (cz1 + cz2) / 2;
  const maxFadeRange = 90;
  const alpha = Math.max(1.0 - avgDepth / maxFadeRange, 0);
  if (alpha <= 0) return;

  const s1 = camera.F / cz1;
  const sx1 = camera.centerX + cx1 * s1;
  const sy1 = camera.centerY - cy1 * s1;

  const s2 = camera.F / cz2;
  const sx2 = camera.centerX + cx2 * s2;
  const sy2 = camera.centerY - cy2 * s2;

  ctx.beginPath();
  ctx.moveTo(sx1, sy1);
  ctx.lineTo(sx2, sy2);
  
  // Custom transparent stroke matching grid
  ctx.strokeStyle = `rgba(197, 203, 183, ${alpha})`;
  ctx.lineWidth = w;
  ctx.stroke();
}

// Retro boxy muscle car vertex transformer (scaled up 1.5x for visibility)
function getCarVertices(px: number, py: number, pz: number, alpha: number) {
  const local = [
    // Chassis bottom
    { x: -1.34, y: 0.1, z: 2.8 },   // 0: front-left-bottom
    { x:  1.34, y: 0.1, z: 2.8 },   // 1: front-right-bottom
    { x:  1.18, y: 0.1, z: -2.0 },  // 2: back-right-bottom
    { x: -1.18, y: 0.1, z: -2.0 },  // 3: back-left-bottom
    // Chassis top
    { x: -1.16, y: 0.54, z: 2.2 },   // 4: front-left-mid
    { x:  1.16, y: 0.54, z: 2.2 },   // 5: front-right-mid
    { x:  1.02, y: 0.74, z: -1.75 }, // 6: back-right-mid
    { x: -1.02, y: 0.74, z: -1.75 }, // 7: back-left-mid
    
    // Cabin base
    { x: -0.96, y: 0.7, z: 1.0 },    // 8: cabin-front-left-base
    { x:  0.96, y: 0.7, z: 1.0 },    // 9: cabin-front-right-base
    { x:  0.74, y: 0.7, z: -0.95 },  // 10: cabin-back-right-base
    { x: -0.74, y: 0.7, z: -0.95 },  // 11: cabin-back-left-base
    // Cabin top
    { x: -0.7, y: 1.1, z: 0.42 },   // 12: cabin-front-left-top
    { x:  0.7, y: 1.1, z: 0.42 },   // 13: cabin-front-right-top
    { x:  0.42, y: 0.96, z: -0.9 }, // 14: cabin-back-right-top
    { x: -0.42, y: 0.96, z: -0.9 }, // 15: cabin-back-left-top
  ];
  
  return local.map((v) => {
    const wx = px + v.x * Math.cos(alpha) - v.z * Math.sin(alpha);
    const wy = py + v.y;
    const wz = pz + v.x * Math.sin(alpha) + v.z * Math.cos(alpha);
    return { x: wx, y: wy, z: wz };
  });
}

// ── Web Audio Synth System ──
class SoundSystem {
  ctx: AudioContext | null = null;
  engineOsc: OscillatorNode | null = null;
  engineGain: GainNode | null = null;
  isMuted: boolean = true;

  constructor() {}

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch (e) {
      console.warn("Web Audio not supported", e);
    }
  }

  startEngine() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    if (this.engineOsc) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();

    this.engineOsc.type = "sawtooth";
    this.engineOsc.frequency.setValueAtTime(32, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start(0);
  }

  updateEngine(speed: number, maxSpeed: number) {
    if (!this.engineOsc || this.isMuted || !this.ctx) return;
    const absSpeed = Math.abs(speed);
    const speedRatio = absSpeed / maxSpeed;
    
    const targetFreq = 30 + speedRatio * 90;
    const targetVolume = 0.012 + speedRatio * 0.015;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.engineGain!.gain.setTargetAtTime(targetVolume, this.ctx.currentTime, 0.1);
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    if (this.engineGain) {
      this.engineGain.disconnect();
      this.engineGain = null;
    }
  }

  playCollect() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(783.99, now + 0.08); // G5
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCollision() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    osc.start(now);
    osc.stop(now + 0.25);
  }
}

export function Garden({ isMobile = false }: { isMobile?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sounds = useRef<SoundSystem>(new SoundSystem());

  // Game States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [score, setScore] = useState(0);
  const [dbStatus, setDbStatus] = useState<string>("");

  // Input states
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mobileInputs = useRef({ left: false, right: false, forward: false, reverse: false });

  // Game values refs
  const px = useRef(0);
  const pz = useRef(0);
  const carAngle = useRef(0);
  const speed = useRef(0);
  const steer = useRef(0);
  const screenShake = useRef(0);
  const scoreRef = useRef(0);
  const flowerSpin = useRef(0);

  // Camera settings
  const cx = useRef(0);
  const cy = useRef(5);
  const cz = useRef(-9);

  // Physics constants
  const maxSpeed = 0.55;
  const accel = 0.015;
  const friction = 0.95;
  const py = 0; // Flat ground coordinate constant

  // World objects
  const worldItems = useRef<WorldItem[]>([]);
  const particles = useRef<Particle[]>([]);

  // Initialize objects once
  useEffect(() => {
    const items: WorldItem[] = [];
    let idCounter = 0;

    // 20 Trees
    for (let i = 0; i < 20; i++) {
      let tx = (Math.random() - 0.5) * 130;
      let tz = (Math.random() - 0.5) * 130;
      while (Math.sqrt(tx * tx + tz * tz) < 12) {
        tx = (Math.random() - 0.5) * 130;
        tz = (Math.random() - 0.5) * 130;
      }
      items.push({ id: idCounter++, x: tx, z: tz, type: "tree" });
    }

    // 12 Rocks
    for (let i = 0; i < 12; i++) {
      let rx = (Math.random() - 0.5) * 130;
      let rz = (Math.random() - 0.5) * 130;
      while (Math.sqrt(rx * rx + rz * rz) < 12) {
        rx = (Math.random() - 0.5) * 130;
        rz = (Math.random() - 0.5) * 130;
      }
      items.push({ id: idCounter++, x: rx, z: rz, type: "rock" });
    }

    // 8 Flowers
    const flowerColors = ["#ec4899", "#ef4444", "#eab308", "#a855f7", "#3b82f6", "#10b981", "#c26f51", "#ec4899"];
    for (let i = 0; i < 8; i++) {
      items.push({
        id: idCounter++,
        x: (Math.random() - 0.5) * 140,
        z: (Math.random() - 0.5) * 140,
        type: "flower",
        color: flowerColors[i % flowerColors.length],
      });
    }

    worldItems.current = items;
  }, []);

  // Sync volume state
  useEffect(() => {
    sounds.current.isMuted = isMuted;
    if (isMuted) {
      sounds.current.stopEngine();
    } else if (isPlaying) {
      sounds.current.startEngine();
    }
  }, [isMuted, isPlaying]);

  // Audio Context auto-cleanup
  useEffect(() => {
    return () => {
      sounds.current.stopEngine();
    };
  }, []);

  // Database insert helper
  const plantToDatabase = useCallback(async (flowerColor: string) => {
    try {
      setDbStatus("Planting...");
      const rx = Math.random() * 100;
      const ry = Math.random() * 100;
      const flower_type = Math.floor(Math.random() * 6);

      const { error } = await supabase
        .from("flowers")
        .insert({ x: rx, y: ry, flower_type, color: flowerColor });

      if (error) throw error;

      setDbStatus("🌸 Seed planted in DB!");
      setTimeout(() => setDbStatus(""), 2000);
    } catch (e) {
      console.error(e);
      setDbStatus("⚠️ DB Offline (saved locally)");
      setTimeout(() => setDbStatus(""), 2000);
    }
  }, []);

  // Start drive button handler
  const handleStartGame = () => {
    setIsPlaying(true);
    setIsMuted(false);
    sounds.current.isMuted = false;
    sounds.current.startEngine();
  };

  // Keyboard events (Corrected case matching arrow keys to prevent scrolling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      // Correctly identify key strings regardless of uppercase letters
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Canvas Resize logic
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Game loop effect
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      const dt = Math.min((timestamp - lastTime) / 16.666, 3);
      lastTime = timestamp;

      // ── 1. Physics Update ──
      if (isPlaying) {
        const isUp = keysPressed.current["w"] || keysPressed.current["arrowup"] || mobileInputs.current.forward;
        const isDown = keysPressed.current["s"] || keysPressed.current["arrowdown"] || mobileInputs.current.reverse;
        const isLeft = keysPressed.current["a"] || keysPressed.current["arrowleft"] || mobileInputs.current.left;
        const isRight = keysPressed.current["d"] || keysPressed.current["arrowright"] || mobileInputs.current.right;

        if (isUp) {
          speed.current += accel * dt;
        } else if (isDown) {
          speed.current -= accel * 0.8 * dt;
        } else {
          speed.current *= Math.pow(friction, dt);
        }

        if (speed.current > maxSpeed) speed.current = maxSpeed;
        if (speed.current < -maxSpeed * 0.4) speed.current = -maxSpeed * 0.4;

        const steerTarget = isLeft ? 0.45 : isRight ? -0.45 : 0;
        steer.current += (steerTarget - steer.current) * 0.15 * dt;

        carAngle.current += steer.current * (speed.current / maxSpeed) * 0.08 * dt;
        px.current += speed.current * Math.cos(carAngle.current) * dt;
        pz.current += speed.current * Math.sin(carAngle.current) * dt;

        sounds.current.updateEngine(speed.current, maxSpeed);

        if (Math.abs(speed.current) > 0.1 && Math.random() < 0.18 * dt) {
          const backX = px.current - 1.5 * Math.cos(carAngle.current);
          const backZ = pz.current - 1.5 * Math.sin(carAngle.current);
          particles.current.push({
            x: backX + (Math.random() - 0.5) * 1.0,
            y: 0.15,
            z: backZ + (Math.random() - 0.5) * 1.0,
            vx: (Math.random() - 0.5) * 0.05 - speed.current * Math.cos(carAngle.current) * 0.2,
            vy: Math.random() * 0.05 + 0.02,
            vz: (Math.random() - 0.5) * 0.05 - speed.current * Math.sin(carAngle.current) * 0.2,
            color: "rgba(224, 215, 203, 0.45)",
            size: Math.random() * 0.45 + 0.2,
            life: 30,
            maxLife: 30
          });
        }

        const bounds = 80;
        if (Math.abs(px.current) > bounds) {
          px.current = Math.sign(px.current) * bounds;
          speed.current = -speed.current * 0.3;
          screenShake.current = 5;
          sounds.current.playCollision();
        }
        if (Math.abs(pz.current) > bounds) {
          pz.current = Math.sign(pz.current) * bounds;
          speed.current = -speed.current * 0.3;
          screenShake.current = 5;
          sounds.current.playCollision();
        }

        worldItems.current.forEach((item) => {
          const dx = px.current - item.x;
          const dz = pz.current - item.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (item.type === "flower") {
            if (dist < 2.5) {
              sounds.current.playCollect();
              setScore((s) => {
                const next = s + 1;
                scoreRef.current = next;
                return next;
              });

              const pColor = item.color || "#ec4899";
              for (let p = 0; p < 12; p++) {
                particles.current.push({
                  x: item.x,
                  y: 0.8,
                  z: item.z,
                  vx: (Math.random() - 0.5) * 0.25,
                  vy: Math.random() * 0.25 + 0.1,
                  vz: (Math.random() - 0.5) * 0.25,
                  color: pColor,
                  size: Math.random() * 0.25 + 0.15,
                  life: 40,
                  maxLife: 40
                });
              }

              plantToDatabase(pColor);

              item.x = (Math.random() - 0.5) * 140;
              item.z = (Math.random() - 0.5) * 140;
            }
          } else {
            // Larger collision bounding check
            const colDist = item.type === "tree" ? 2.8 : 2.6;
            if (dist < colDist) {
              const overlap = colDist - dist;
              const pushX = (dx / dist) * overlap;
              const pushZ = (dz / dist) * overlap;

              px.current += pushX;
              pz.current += pushZ;

              speed.current = -speed.current * 0.4;
              screenShake.current = 7;
              sounds.current.playCollision();

              for (let p = 0; p < 4; p++) {
                particles.current.push({
                  x: px.current + (Math.random() - 0.5) * 2.0,
                  y: 0.3,
                  z: pz.current + (Math.random() - 0.5) * 2.0,
                  vx: (Math.random() - 0.5) * 0.15,
                  vy: Math.random() * 0.1 + 0.05,
                  vz: (Math.random() - 0.5) * 0.15,
                  color: "#857d76",
                  size: Math.random() * 0.18 + 0.08,
                  life: 20,
                  maxLife: 20
                });
              }
            }
          }
        });
      }

      flowerSpin.current = (flowerSpin.current + 0.04 * dt) % (Math.PI * 2);

      particles.current = particles.current.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy -= 0.006 * dt;
        p.life -= dt;
        if (p.y < 0) {
          p.y = 0;
          p.vx *= 0.8;
          p.vz *= 0.8;
        }
        return p.life > 0;
      });

      // ── 2. Camera Chase Logic (Brings camera closer for better scale visibility) ──
      const followDist = 5.2;
      const followHeight = 2.4;
      let targetCx, targetCz;
      
      if (isPlaying) {
        targetCx = px.current - followDist * Math.cos(carAngle.current);
        targetCz = pz.current - followDist * Math.sin(carAngle.current);
      } else {
        const spinTime = timestamp * 0.0006;
        targetCx = px.current - 7 * Math.cos(spinTime);
        targetCz = pz.current - 7 * Math.sin(spinTime);
      }
      
      const targetCy = py + followHeight;

      cx.current += (targetCx - cx.current) * 0.09 * dt;
      cy.current += (targetCy - cy.current) * 0.09 * dt;
      cz.current += (targetCz - cz.current) * 0.09 * dt;

      const dx = px.current - cx.current;
      const dz = pz.current - cz.current;
      const yaw = Math.atan2(dz, dx);
      const dist2D = Math.sqrt(dx * dx + dz * dz);
      const pitch = Math.atan2(cy.current - py, dist2D);

      const camera: Camera = {
        cx: cx.current,
        cy: cy.current,
        cz: cz.current,
        theta: yaw,
        phi: pitch,
        F: 320,
        centerX: width / 2,
        centerY: height / 2 + 10,
      };

      // ── 3. Screen Shake ──
      ctx.save();
      if (screenShake.current > 0.1) {
        const shakeX = (Math.random() - 0.5) * screenShake.current;
        const shakeY = (Math.random() - 0.5) * screenShake.current;
        ctx.translate(shakeX, shakeY);
        screenShake.current *= Math.pow(0.85, dt);
      }

      // ── 4. Render Background & Sky ──
      ctx.clearRect(0, 0, width, height);
      const horizonY = camera.centerY - Math.tan(camera.phi) * camera.F;

      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#fcf7f2");
      skyGrad.addColorStop(0.7, "#fed7aa");
      skyGrad.addColorStop(1, "#fdba74");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, Math.max(horizonY, 0));

      const sunProj = projectPoint(px.current + 80 * Math.cos(carAngle.current + 0.4), 16, pz.current + 80 * Math.sin(carAngle.current + 0.4), camera);
      if (sunProj) {
        ctx.beginPath();
        ctx.arc(sunProj.x, sunProj.y, 25, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 237, 213, 0.9)";
        ctx.shadowBlur = 35;
        ctx.shadowColor = "#fde047";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = "#e2e8d5";
      ctx.fillRect(0, Math.max(horizonY, 0), width, height - Math.max(horizonY, 0));

      // ── 5. Draw 3D Infinite Grid ──
      const gridStep = 8;
      const gridRange = 120;
      
      const startGridX = Math.floor(px.current / gridStep) * gridStep - gridRange;
      const endGridX = Math.floor(px.current / gridStep) * gridStep + gridRange;
      const startGridZ = Math.floor(pz.current / gridStep) * gridStep - gridRange;
      const endGridZ = Math.floor(pz.current / gridStep) * gridStep + gridRange;

      for (let x = startGridX; x <= endGridX; x += gridStep) {
        draw3DLine(ctx, x, 0, startGridZ, x, 0, endGridZ, camera, "#c5cbb7", 0.6);
      }
      for (let z = startGridZ; z <= endGridZ; z += gridStep) {
        draw3DLine(ctx, startGridX, 0, z, endGridX, 0, z, camera, "#c5cbb7", 0.6);
      }

      // ── 6. Build Scene Polygons ──
      interface Poly3D {
        pts: { x: number; y: number }[];
        avgDepth: number;
        color: string;
        strokeColor: string;
        isWireframeOnly?: boolean;
      }
      let scenePolys: Poly3D[] = [];
      const vehicleAngle = carAngle.current - Math.PI / 2;

      worldItems.current.forEach((item) => {
        let verts: { x: number; y: number; z: number }[] = [];
        let faces: { indices: number[]; color: string; stroke: string }[] = [];

        if (item.type === "tree") {
          verts = [
            { x: item.x - 0.25, y: 0, z: item.z - 0.25 },
            { x: item.x + 0.25, y: 0, z: item.z - 0.25 },
            { x: item.x + 0.25, y: 0, z: item.z + 0.25 },
            { x: item.x - 0.25, y: 0, z: item.z + 0.25 },
            { x: item.x - 0.25, y: 1.1, z: item.z - 0.25 },
            { x: item.x + 0.25, y: 1.1, z: item.z - 0.25 },
            { x: item.x + 0.25, y: 1.1, z: item.z + 0.25 },
            { x: item.x - 0.25, y: 1.1, z: item.z + 0.25 },
            { x: item.x - 1.2, y: 1.1, z: item.z - 1.2 },
            { x: item.x + 1.2, y: 1.1, z: item.z - 1.2 },
            { x: item.x + 1.2, y: 1.1, z: item.z + 1.2 },
            { x: item.x - 1.2, y: 1.1, z: item.z - 1.2 },
            { x: item.x, y: 3.8, z: item.z },
          ];

          faces = [
            { indices: [0, 1, 5, 4], color: "#78350f", stroke: "#5f2b0d" },
            { indices: [1, 2, 6, 5], color: "#78350f", stroke: "#5f2b0d" },
            { indices: [2, 3, 7, 6], color: "#78350f", stroke: "#5f2b0d" },
            { indices: [3, 0, 4, 7], color: "#78350f", stroke: "#5f2b0d" },
            { indices: [8, 11, 10, 9], color: "#14532d", stroke: "#14532d" },
            { indices: [8, 9, 12], color: "#16a34a", stroke: "#15803d" },
            { indices: [9, 10, 12], color: "#15803d", stroke: "#166534" },
            { indices: [10, 11, 12], color: "#16a34a", stroke: "#15803d" },
            { indices: [11, 8, 12], color: "#14532d", stroke: "#14532d" },
          ];
        } else if (item.type === "rock") {
          verts = [
            { x: item.x - 0.7, y: 0, z: item.z - 0.7 },
            { x: item.x + 0.7, y: 0, z: item.z - 0.6 },
            { x: item.x + 0.6, y: 0, z: item.z + 0.7 },
            { x: item.x - 0.6, y: 0, z: item.z + 0.6 },
            { x: item.x - 0.9, y: 0.6, z: item.z - 0.8 },
            { x: item.x + 0.8, y: 0.7, z: item.z - 0.6 },
            { x: item.x + 0.7, y: 0.5, z: item.z + 0.8 },
            { x: item.x - 0.8, y: 0.6, z: item.z + 0.7 },
            { x: item.x - 0.25, y: 1.1, z: item.z - 0.25 },
            { x: item.x + 0.25, y: 1.2, z: item.z + 0.25 },
          ];

          faces = [
            { indices: [0, 1, 5, 4], color: "#78716c", stroke: "#57534e" },
            { indices: [1, 2, 6, 5], color: "#57534e", stroke: "#44403c" },
            { indices: [2, 3, 7, 6], color: "#78716c", stroke: "#57534e" },
            { indices: [3, 0, 4, 7], color: "#44403c", stroke: "#292524" },
            { indices: [4, 5, 9, 8], color: "#878076", stroke: "#78716c" },
            { indices: [5, 6, 9], color: "#78716c", stroke: "#57534e" },
            { indices: [6, 7, 8, 9], color: "#78716c", stroke: "#57534e" },
            { indices: [7, 4, 8], color: "#57534e", stroke: "#44403c" },
          ];
        } else if (item.type === "flower") {
          const angle = flowerSpin.current + item.id;
          
          verts = [
            { x: item.x, y: 0, z: item.z },
            { x: item.x, y: 0.7, z: item.z },
          ];
          
          const p1 = projectPoint(verts[0].x, verts[0].y, verts[0].z, camera);
          const p2 = projectPoint(verts[1].x, verts[1].y, verts[1].z, camera);
          
          if (p1 && p2) {
            scenePolys.push({
              pts: [p1, p2],
              avgDepth: (p1.depth + p2.depth) / 2,
              color: "#15803d",
              strokeColor: "#15803d",
              isWireframeOnly: true
            });
          }

          const r = 0.28;
          const cyVal = 0.8;
          verts = [];
          for (let k = 0; k < 5; k++) {
            const rad = (k * Math.PI * 2) / 5 + angle;
            verts.push({
              x: item.x + r * Math.cos(rad),
              y: cyVal + r * Math.sin(rad),
              z: item.z
            });
          }

          const ptsProj = verts.map(v => projectPoint(v.x, v.y, v.z, camera));
          const hasUnprojected = ptsProj.some(p => p === null);

          if (!hasUnprojected) {
            const validPts = ptsProj as { x: number; y: number; depth: number }[];
            const sumDepth = validPts.reduce((acc, p) => acc + p.depth, 0);
            scenePolys.push({
              pts: validPts,
              avgDepth: sumDepth / 5,
              color: item.color || "#ec4899",
              strokeColor: "#ffffff"
            });
          }

          const cenProj = projectPoint(item.x, cyVal, item.z, camera);
          if (cenProj) {
            scenePolys.push({
              pts: [{ x: cenProj.x - 3, y: cenProj.y - 3 }, { x: cenProj.x + 3, y: cenProj.y - 3 }, { x: cenProj.x + 3, y: cenProj.y + 3 }, { x: cenProj.x - 3, y: cenProj.y + 3 }],
              avgDepth: cenProj.depth - 0.05,
              color: "#facc15",
              strokeColor: "#eab308"
            });
          }
          return;
        }

        faces.forEach((face) => {
          const pts = face.indices.map((idx) => projectPoint(verts[idx].x, verts[idx].y, verts[idx].z, camera));
          if (pts.some((p) => p === null)) return;

          const validPts = pts as { x: number; y: number; depth: number }[];
          const sumZ = validPts.reduce((acc, p) => acc + p.depth, 0);

          scenePolys.push({
            pts: validPts,
            avgDepth: sumZ / validPts.length,
            color: face.color,
            strokeColor: face.stroke
          });
        });
      });

      // B. Populate Particles
      particles.current.forEach((p) => {
        const pt = projectPoint(p.x, p.y, p.z, camera);
        if (!pt) return;

        const drawSize = (p.size * camera.F) / pt.depth;
        if (drawSize < 0.5) return;

        scenePolys.push({
          pts: [
            { x: pt.x - drawSize, y: pt.y - drawSize },
            { x: pt.x + drawSize, y: pt.y - drawSize },
            { x: pt.x + drawSize, y: pt.y + drawSize },
            { x: pt.x - drawSize, y: pt.y + drawSize },
          ],
          avgDepth: pt.depth,
          color: p.color,
          strokeColor: "transparent"
        });
      });

      // C. Populate Car Model (Utilizes 1.5x larger scale dimensions)
      const cVerts = getCarVertices(px.current, py, pz.current, vehicleAngle);
      
      const cFaces = [
        { indices: [0, 3, 2, 1], color: "#1c1917", stroke: "#1c1917" },
        { indices: [0, 1, 5, 4], color: "#ca6642", stroke: "#8f3f27" },
        { indices: [2, 3, 7, 6], color: "#7d301f", stroke: "#5f2417" },
        { indices: [3, 0, 4, 7], color: "#b54f2d", stroke: "#8f3f27" },
        { indices: [1, 2, 6, 5], color: "#9a3e28", stroke: "#6f2f1f" },
        { indices: [4, 5, 9, 8], color: "#d6764f", stroke: "#a24f38" },
        { indices: [10, 11, 7, 6], color: "#8b3926", stroke: "#6f2f1f" },
        { indices: [8, 9, 13, 12], color: "#cfefff", stroke: "#ffffff" },
        { indices: [10, 11, 15, 14], color: "#eaf6ff", stroke: "#ffffff" },
        { indices: [11, 8, 12, 15], color: "#be5a3a", stroke: "#8f3f27" },
        { indices: [9, 10, 14, 13], color: "#a94a2f", stroke: "#6f2f1f" },
        { indices: [12, 13, 14, 15], color: "#f4d0c4", stroke: "#ffffff" },
      ];

      cFaces.forEach((face) => {
        const pts = face.indices.map((idx) => projectPoint(cVerts[idx].x, cVerts[idx].y, cVerts[idx].z, camera));
        if (pts.some((p) => p === null)) return;

        const validPts = pts as { x: number; y: number; depth: number }[];
        const sumZ = validPts.reduce((acc, p) => acc + p.depth, 0);

        scenePolys.push({
          pts: validPts,
          avgDepth: sumZ / validPts.length,
          color: face.color,
          strokeColor: face.stroke
        });
      });

      // Shadow below the car
      const shadowPts: { x: number; y: number }[] = [];
      const steps = 8;
      for (let s = 0; s < steps; s++) {
        const ang = (s * Math.PI * 2) / steps;
        const radX = 1.5;
        const radZ = 2.5;
        const sx = px.current + radX * Math.cos(ang) * Math.cos(vehicleAngle) - radZ * Math.sin(ang) * Math.sin(vehicleAngle);
        const sz = pz.current + radX * Math.cos(ang) * Math.sin(vehicleAngle) + radZ * Math.sin(ang) * Math.cos(vehicleAngle);
        const pt = projectPoint(sx, 0.02, sz, camera);
        if (pt) shadowPts.push(pt);
      }
      if (shadowPts.length === steps) {
        const avgD = (shadowPts as any[]).reduce((sum, p) => sum + p.depth, 0) / steps;
        scenePolys.push({
          pts: shadowPts,
          avgDepth: avgD + 0.1,
          color: "rgba(35, 45, 30, 0.3)",
          strokeColor: "transparent"
        });
      }

      // Wheels (Adjusted dimensions for 1.5x scale model)
      const wWidth = 0.38;
      const wRadius = 0.54;
      const wheelOffsets = [
        { x: -1.14, z: 1.42 },
        { x:  1.14, z: 1.42 },
        { x: -1.14, z: -1.2 },
        { x:  1.14, z: -1.2 },
      ];

      wheelOffsets.forEach((wo) => {
        const wx = px.current + wo.x * Math.cos(vehicleAngle) - wo.z * Math.sin(vehicleAngle);
        const wz = pz.current + wo.x * Math.sin(vehicleAngle) + wo.z * Math.cos(vehicleAngle);
        const wy = wRadius;

        const localW = [
          { x: -wWidth/2, y: -wRadius, z:  wRadius },
          { x: -wWidth/2, y:  wRadius, z:  wRadius },
          { x: -wWidth/2, y:  wRadius, z: -wRadius },
          { x: -wWidth/2, y: -wRadius, z: -wRadius },
          { x:  wWidth/2, y: -wRadius, z:  wRadius },
          { x:  wWidth/2, y:  wRadius, z:  wRadius },
          { x:  wWidth/2, y:  wRadius, z: -wRadius },
          { x:  wWidth/2, y: -wRadius, z: -wRadius },
        ];

        const wVerts = localW.map((v) => {
          let rotateAngle = vehicleAngle;
          if (wo.z > 0) {
            rotateAngle += steer.current * 0.7;
          }
          const rotX = wx + v.x * Math.cos(rotateAngle) - v.z * Math.sin(rotateAngle);
          const rotZ = wz + v.x * Math.sin(rotateAngle) + v.z * Math.cos(rotateAngle);
          return { x: rotX, y: wy + v.y, z: rotZ };
        });

        const wFaces = [
          { indices: [0, 1, 5, 4], color: "#1c1917", stroke: "#1c1917" },
          { indices: [1, 2, 6, 5], color: "#1c1917", stroke: "#1c1917" },
          { indices: [2, 3, 7, 6], color: "#1c1917", stroke: "#1c1917" },
          { indices: [3, 0, 4, 7], color: "#1c1917", stroke: "#1c1917" },
          { indices: [0, 3, 7, 4], color: "#292524", stroke: "#1c1917" },
          { indices: [1, 2, 6, 5], color: "#292524", stroke: "#1c1917" },
        ];

        wFaces.forEach((face) => {
          const pts = face.indices.map((idx) => projectPoint(wVerts[idx].x, wVerts[idx].y, wVerts[idx].z, camera));
          if (pts.some((p) => p === null)) return;

          const validPts = pts as { x: number; y: number; depth: number }[];
          const sumZ = validPts.reduce((acc, p) => acc + p.depth, 0);

          scenePolys.push({
            pts: validPts,
            avgDepth: sumZ / validPts.length,
            color: face.color,
            strokeColor: face.stroke
          });
        });
      });

      // Painter sorting
      scenePolys.sort((a, b) => b.avgDepth - a.avgDepth);

      scenePolys.forEach((p) => {
        if (p.pts.length < 2) return;

        if (p.isWireframeOnly) {
          ctx.beginPath();
          ctx.moveTo(p.pts[0].x, p.pts[0].y);
          ctx.lineTo(p.pts[1].x, p.pts[1].y);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.stroke();
          return;
        }

        ctx.beginPath();
        ctx.moveTo(p.pts[0].x, p.pts[0].y);
        for (let i = 1; i < p.pts.length; i++) {
          ctx.lineTo(p.pts[i].x, p.pts[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.strokeColor !== "transparent") {
          ctx.strokeStyle = p.strokeColor;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      });

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div ref={containerRef} className="h-full flex flex-col relative select-none">
      
      {/* HUD Header */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <div>
          <div className="text-[12px] text-stone-400 uppercase tracking-[0.2em] font-[family-name:var(--font-courier-prime)]">3D Garden Tour</div>
          <div className="text-[13px] text-stone-500 font-[family-name:var(--font-noto)] mt-0.5">
            Drive, collect flowers & auto-plant them in the community garden!
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dbStatus && (
            <span className="text-[11px] font-bold bg-[#efe5d7] text-[#c26f51] px-2.5 py-1 rounded-full animate-pulse font-[family-name:var(--font-courier-prime)] border border-[#c26f51]/20">
              {dbStatus}
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-stone-700 bg-[#fffdfa] border border-stone-200/80 px-3.5 py-1 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)] font-[family-name:var(--font-courier-prime)]">
              🌸 Collected: {score}
            </span>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-[16px] text-stone-600 hover:text-stone-800 bg-[#fffdfa] border border-stone-200/80 p-1.5 rounded-full hover:bg-stone-50 shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex items-center justify-center transition-all"
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Canvas container */}
      <div className="flex-1 relative mx-3 mb-3 rounded-[22px] border border-stone-200/80 shadow-[0_12px_28px_rgba(0,0,0,0.06)] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block bg-[#e2e8d5]"
        />

        {/* Start Game Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#1c1917]/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
            {/* Spinning Title card */}
            <div className="relative overflow-hidden rounded-[26px] border border-stone-200/80 bg-[#fffdfa] shadow-[0_14px_30px_rgba(0,0,0,0.25)] max-w-sm w-full p-6 rotate-[-1deg]">
              <div className="absolute inset-0 opacity-[0.16] pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(120,113,108,0.35) 1px, transparent 0)",
                backgroundSize: "12px 12px",
              }} />
              <div className="absolute inset-x-0 top-0 h-[34%] bg-[linear-gradient(180deg,rgba(214,120,91,0.12),rgba(214,120,91,0))] pointer-events-none" />

              <h2 className="text-[26px] font-bold text-stone-800 tracking-tight font-[family-name:var(--font-noto)]">
                Car Driving 3D 🚗
              </h2>
              <p className="mt-2 text-stone-500 font-[family-name:var(--font-noto)] text-[13px] leading-relaxed">
                Explore the low-poly garden! Drive around, collect spinning pixel flowers, and plant them in the database!
              </p>

              <div className="mt-4 flex flex-col gap-2 bg-[#f4efe8]/60 border border-stone-200/50 rounded-xl p-3 text-[11px] text-stone-500 text-left font-[family-name:var(--font-courier-prime)]">
                <div>⌨️ <strong className="text-stone-700">W, A, S, D</strong> or <strong className="text-stone-700">Arrow keys</strong> to drive.</div>
                <div>🌸 Collect flowers to earn points.</div>
                <div>🔊 Web Audio Synth engine hums as you rev!</div>
              </div>

              <button
                onClick={handleStartGame}
                className="mt-6 w-full py-3 bg-[#c26f51] hover:bg-[#a65338] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-[family-name:var(--font-courier-prime)] flex items-center justify-center gap-2"
              >
                Start Engine & Drive
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile controls overlay */}
        {isPlaying && (isMobile || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) && (
          <div className="absolute inset-x-0 bottom-4 flex justify-between px-6 z-20 pointer-events-none">
            {/* Steering Left/Right */}
            <div className="flex gap-3 pointer-events-auto">
              <button
                onTouchStart={() => { mobileInputs.current.left = true; }}
                onTouchEnd={() => { mobileInputs.current.left = false; }}
                className="w-14 h-14 bg-white/70 active:bg-white/95 rounded-full shadow-lg border border-stone-200/60 flex items-center justify-center backdrop-blur-sm select-none"
              >
                <span className="material-symbols-outlined text-stone-700 text-[26px]">arrow_back</span>
              </button>
              <button
                onTouchStart={() => { mobileInputs.current.right = true; }}
                onTouchEnd={() => { mobileInputs.current.right = false; }}
                className="w-14 h-14 bg-white/70 active:bg-white/95 rounded-full shadow-lg border border-stone-200/60 flex items-center justify-center backdrop-blur-sm select-none"
              >
                <span className="material-symbols-outlined text-stone-700 text-[26px]">arrow_forward</span>
              </button>
            </div>

            {/* Acceleration Pedals */}
            <div className="flex gap-3 pointer-events-auto">
              <button
                onTouchStart={() => { mobileInputs.current.reverse = true; }}
                onTouchEnd={() => { mobileInputs.current.reverse = false; }}
                className="w-14 h-14 bg-red-100/70 active:bg-red-200/90 rounded-full shadow-lg border border-red-200/60 flex items-center justify-center backdrop-blur-sm select-none"
              >
                <span className="material-symbols-outlined text-red-700 text-[26px]">navigation</span>
                {/* rotated down */}
                <style jsx>{`
                  span { transform: rotate(180deg); }
                `}</style>
              </button>
              <button
                onTouchStart={() => { mobileInputs.current.forward = true; }}
                onTouchEnd={() => { mobileInputs.current.forward = false; }}
                className="w-16 h-16 bg-[#ecfdf5]/85 active:bg-[#d1fae5] rounded-full shadow-xl border border-emerald-300 flex items-center justify-center backdrop-blur-sm select-none -translate-y-2"
              >
                <span className="material-symbols-outlined text-emerald-700 text-[32px]">navigation</span>
              </button>
            </div>
          </div>
        )}

        {/* Keyboard hints bottom overlay */}
        {isPlaying && !isMobile && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-2 pointer-events-none bg-[#fffdfa]/80 backdrop-blur-xs border border-stone-200/60 px-3 py-2 rounded-xl shadow-xs font-[family-name:var(--font-courier-prime)] text-[10px] text-stone-500">
            <span>Controls:</span>
            <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">▲ W</span>
            <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">◀ A</span>
            <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">▼ S</span>
            <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700">▶ D</span>
          </div>
        )}
      </div>
    </div>
  );
}
