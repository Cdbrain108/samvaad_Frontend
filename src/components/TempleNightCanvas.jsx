import React, { useRef, useEffect } from 'react';
import heroNightTemple from '../assets/hero-night-temple.webp';

/* Lamps: pixel-detected warm cores, kept ONLY if they pass a contrast test
   (bright point vs darker 32px ring), so golden carvings never get one.
   u/v are image fractions. */

const TEMPLE_LAMPS = [
  { u: 0.7623, v: 0.5146, r: 2.4 },
  { u: 0.7348, v: 0.5169, r: 2.3 },
  { u: 0.7019, v: 0.5253, r: 2.5 },
  { u: 0.7645, v: 0.5309, r: 4.0 },
  { u: 0.7543, v: 0.5392, r: 2.5 },
  { u: 0.6942, v: 0.541, r: 3.8 },
  { u: 0.6757, v: 0.5441, r: 3.0 },
  { u: 0.688, v: 0.5443, r: 2.6 },
  { u: 0.6659, v: 0.5474, r: 2.6 },
  { u: 0.672, v: 0.5521, r: 2.3 },
  { u: 0.681, v: 0.553, r: 2.2 },
  { u: 0.825, v: 0.6126, r: 2.8 },
  { u: 0.0948, v: 0.6137, r: 2.2 },
  { u: 0.6477, v: 0.6158, r: 2.5 },
  { u: 0.831, v: 0.6196, r: 2.2 },
  { u: 0.5333, v: 0.6199, r: 3.0 },
  { u: 0.599, v: 0.6209, r: 4.1 },
  { u: 0.5924, v: 0.6224, r: 2.4 },
  { u: 0.1886, v: 0.6242, r: 2.2 },
  { u: 0.1693, v: 0.6251, r: 2.2 },
  { u: 0.8169, v: 0.6315, r: 3.2 },
  { u: 0.2239, v: 0.6337, r: 2.2 },
  { u: 0.5797, v: 0.6339, r: 3.0 },
  { u: 0.2745, v: 0.6394, r: 2.2 },
  { u: 0.3444, v: 0.662, r: 5 },
  { u: 0.3323, v: 0.6676, r: 2.2 },
  { u: 0.3449, v: 0.6718, r: 3.2 },
  { u: 0.3403, v: 0.6819, r: 2.6 },
  { u: 0.349, v: 0.6819, r: 2.8 },
  { u: 0.0921, v: 0.6909, r: 2.9 },
  { u: 0.3439, v: 0.6931, r: 3.8 },
  { u: 0.3335, v: 0.7098, r: 2.3 },
  { u: 0.3439, v: 0.7101, r: 4.2 },
  { u: 0.579, v: 0.7207, r: 2.3 },
  { u: 0.344, v: 0.7228, r: 4.2 },
  { u: 0.3353, v: 0.7235, r: 2.4 },
  { u: 0.1623, v: 0.737, r: 2.3 },
  { u: 0.648, v: 0.7402, r: 2.3 },
  { u: 0.8172, v: 0.7425, r: 2.3 },
  { u: 0.1663, v: 0.7468, r: 2.6 },
  { u: 0.3386, v: 0.7479, r: 5 },
  { u: 0.3519, v: 0.7484, r: 3.8 },
  { u: 0.6473, v: 0.7496, r: 3.3 },
  { u: 0.344, v: 0.7615, r: 5 },
  { u: 0.8262, v: 0.7653, r: 2.2 },
  { u: 0.8262, v: 0.7734, r: 2.2 },
  { u: 0.3518, v: 0.7776, r: 2.8 },
  { u: 0.3422, v: 0.7789, r: 5 },
  { u: 0.357, v: 0.7803, r: 3.0 },
  { u: 0.7544, v: 0.7838, r: 2.3 },
  { u: 0.3368, v: 0.7894, r: 3.8 },
  { u: 0.7542, v: 0.7933, r: 2.6 },
  { u: 0.3405, v: 0.7978, r: 3.0 },
  { u: 0.3484, v: 0.7985, r: 4.8 },
  { u: 0.7552, v: 0.8041, r: 2.8 },
  { u: 0.6464, v: 0.8118, r: 2.2 },
  { u: 0.3462, v: 0.8147, r: 3.6 },
  { u: 0.826, v: 0.8157, r: 2.2 },
  { u: 0.3315, v: 0.8159, r: 2.2 },
  { u: 0.3525, v: 0.8162, r: 3.3 },
  { u: 0.9218, v: 0.8238, r: 2.2 },
  { u: 0.922, v: 0.8428, r: 2.3 },
  { u: 0.3517, v: 0.843, r: 2.3 },
  { u: 0.8247, v: 0.8434, r: 2.2 },
  { u: 0.3519, v: 0.8958, r: 3.3 },
];

/* Stars auto-placed INSIDE the true sky region only: dark+blue pixels
   flood-filled from the top of the frame (so temple/trees can never leak in),
   then eroded 10px away from every silhouette edge + texture-checked. */
const SKY_STARS = [
  { u: 0.3553, v: 0.3152, r: 1.6 },
  { u: 0.3313, v: 0.3266, r: 1.3 },
  { u: 0.0599, v: 0.5444, r: 1.1 },
  { u: 0.8663, v: 0.3954, r: 1.3 },
  { u: 0.0838, v: 0.5673, r: 1.5 },
  { u: 0.7705, v: 0.0745, r: 1.3 },
  { u: 0.3872, v: 0.1318, r: 1.0 },
  { u: 0.0359, v: 0.6017, r: 1.4 },
  { u: 0.515, v: 0.5444, r: 1.7 },
  { u: 0.515, v: 0.5788, r: 1.5 },
  { u: 0.4351, v: 0.5788, r: 1.0 },
  { u: 0.7864, v: 0.0172, r: 1.6 },
  { u: 0.7066, v: 0.0516, r: 0.9 },
  { u: 0.7465, v: 0.2006, r: 1.4 },
  { u: 0.515, v: 0.2464, r: 1.3 },
  { u: 0.5389, v: 0.1777, r: 1.3 },
  { u: 0.2036, v: 0.5788, r: 1.1 },
  { u: 0.0439, v: 0.0172, r: 1.4 },
  { u: 0.5629, v: 0.3152, r: 1.4 },
  { u: 0.3792, v: 0.2808, r: 1.7 },
  { u: 0.523, v: 0.212, r: 1.2 },
  { u: 0.4591, v: 0.2006, r: 1.3 },
  { u: 0.7385, v: 0.0287, r: 1.0 },
  { u: 0.6427, v: 0.0974, r: 1.2 },
  { u: 0.8263, v: 0.2235, r: 1.2 },
  { u: 0.012, v: 0.0172, r: 1.1 },
  { u: 0.523, v: 0.3266, r: 1.2 },
  { u: 0.4511, v: 0.6017, r: 1.2 },
  { u: 0.6267, v: 0.063, r: 1.4 },
  { u: 0.6108, v: 0.1777, r: 1.5 },
  { u: 0.8503, v: 0.212, r: 1.2 },
  { u: 0.7864, v: 0.235, r: 1.2 },
];

// Open water begins around 65-70% down the artwork (reflections live below it)
const WATER_LINE_V = 0.68;

export default function TempleNightCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let isLoaded = false;
    const bgCache = { canvas: document.createElement('canvas'), img: null, key: '' };

    // Assign unique flicker parameters for each lamp — smooth layered waves
    // (random jitter jumps read as strobing, so they are gone)
    const lampFlickers = TEMPLE_LAMPS.map((lamp, i) => ({
      ...lamp,
      freq1: 1.4 + (i % 5) * 0.35 + Math.random() * 0.25,
      freq2: 2.6 + (i % 7) * 0.28 + Math.random() * 0.3,
      phase1: (i * 1.37) % (Math.PI * 2),
      phase2: (i * 2.19) % (Math.PI * 2),
    }));

    // Twinkle parameters — every 5th star holds still so the sky feels calm,
    // the rest breathe slowly instead of hard-blinking
    const starTwinkles = SKY_STARS.map((star, i) => ({
      ...star,
      still: i % 5 === 0,
      freq: 0.5 + (i % 7) * 0.22 + Math.random() * 0.25,
      phase: (i * 1.73) % (Math.PI * 2),
      baseBrightness: 0.55 + Math.random() * 0.3,
    }));

    const img = new Image();
    const onImageReady = () => {
      isLoaded = true;
      bgCache.img = img;
      render();
    };

    img.onload = onImageReady;
    img.onerror = (e) => console.error('Error loading temple image:', e);
    img.src = heroNightTemple;
    if (img.complete && img.naturalWidth > 0) {
      onImageReady();
    }

    function getBgLayer(cw, ch) {
      if (!bgCache.img || !bgCache.img.naturalWidth) {
        return { canvas: bgCache.canvas, dx: 0, dy: 0, dw: cw, dh: ch, img: null };
      }
      const imgRatio = bgCache.img.naturalWidth / bgCache.img.naturalHeight;
      const canvasRatio = cw / ch;
      let dw, dh, dx, dy;

      if (canvasRatio > imgRatio) {
        dw = cw;
        dh = cw / imgRatio;
        dx = 0;
        // Position gracefully near the top to reveal the night sky above the temple spires
        dy = Math.max(ch - dh, (ch - dh) * 0.12);
      } else {
        dh = ch;
        dw = ch * imgRatio;
        dy = 0;
        dx = (cw - dw) * 0.5;
      }

      const key = cw + 'x' + ch + '@' + Math.round(dx) + ',' + Math.round(dy);
      if (bgCache.key !== key) {
        bgCache.canvas.width = cw;
        bgCache.canvas.height = ch;
        const bctx = bgCache.canvas.getContext('2d');
        if (bctx) {
          bctx.drawImage(bgCache.img, dx, dy, dw, dh);
        }
        bgCache.key = key;
      }
      return { canvas: bgCache.canvas, dx, dy, dw, dh, img: bgCache.img };
    }

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);
    resizeCanvas();

    // --- PERF FIX 2 (cont): pause rendering when hero scrolls out of viewport ---
    render.visible = true;
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      render.visible = entry.isIntersecting;
    }, { threshold: 0 });
    visibilityObserver.observe(canvas);

    // Lamp intensity for a given time — shared by glow + reflection so they pulse
    // together. Smooth layered sines, clamped so a flame never nearly dies out.
    function lampIntensity(lamp, t) {
      const wave1 = Math.sin(t * lamp.freq1 + lamp.phase1);
      const wave2 = Math.cos(t * lamp.freq2 + lamp.phase2);
      return Math.min(1, Math.max(0.55, 0.78 + 0.13 * wave1 + 0.09 * wave2));
    }

    function starBrightness(star, t) {
      if (star.still) return Math.min(1, star.baseBrightness + 0.05);
      const twinkle = Math.sin(t * star.freq + star.phase);
      const b = star.baseBrightness + 0.16 * twinkle + 0.08 * Math.cos(t * star.freq * 1.7 + star.phase * 0.6);
      return Math.max(0.38, Math.min(1, b));
    }

    function render(now) {
      if (!isLoaded || !canvas || !ctx) return;

      // --- PERF FIX 1: throttle to ~30fps (visually identical for flame/star flicker,
      //     halves GPU work vs 60fps) ---
      if (!render.lastTs) render.lastTs = 0;
      if (now - render.lastTs < 33) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      render.lastTs = now;

      // --- PERF FIX 2: pause entirely when hero is scrolled out of view ---
      if (!render.visible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, cw, ch);

      // 1. Blit cached background (no re-decode per frame)
      const bg = getBgLayer(cw, ch);
      if (!bg || !bg.img || !bg.canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      ctx.drawImage(bg.canvas, 0, 0);

      const t = performance.now() / 1000;
      const scale = bg.dw / bg.img.naturalWidth;
      const waterY = bg.dy + WATER_LINE_V * bg.dh;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const star of starTwinkles) {
        const sx = bg.dx + star.u * bg.dw;
        const sy = bg.dy + star.v * bg.dh;
        const r = Math.max(1, star.r * scale);
        const b = starBrightness(star, t);

        // soft halo
        const haloGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
        haloGrad.addColorStop(0, `rgba(255, 252, 240, ${b})`);
        haloGrad.addColorStop(0.3, `rgba(255, 246, 216, ${b * 0.6})`);
        haloGrad.addColorStop(0.6, `rgba(200, 210, 255, ${b * 0.2})`);
        haloGrad.addColorStop(1, 'rgba(200, 210, 255, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // bright core
        const coreGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        coreGrad.addColorStop(0, `rgba(255, 255, 255, ${b * 0.95})`);
        coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 3. Flickering flame glows on the real lamp positions
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const lamp of lampFlickers) {
        const intensity = lampIntensity(lamp, t);

        const lx = bg.dx + lamp.u * bg.dw;
        const ly = bg.dy + lamp.v * bg.dh;
        const baseR = lamp.r * scale;
        const currentR = Math.max(4, baseR * (0.85 + intensity * 0.45));

        // tight warm halo — subtle diya glow, not a new light source
        const outerGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, currentR * 2.2);
        outerGrad.addColorStop(0, `rgba(255, 170, 40, ${0.28 * intensity})`);
        outerGrad.addColorStop(0.45, `rgba(255, 120, 0, ${0.12 * intensity})`);
        outerGrad.addColorStop(1, 'rgba(255, 70, 0, 0)');

        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, currentR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // small flame core
        const innerGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, currentR * 0.9);
        innerGrad.addColorStop(0, `rgba(255, 252, 220, ${0.9 * intensity})`);
        innerGrad.addColorStop(0.35, `rgba(255, 230, 90, ${0.7 * intensity})`);
        innerGrad.addColorStop(0.7, `rgba(255, 160, 30, ${0.35 * intensity})`);
        innerGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(lx, ly, currentR * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 4. Water reflections: shimmering pillars of light under lamps above the waterline.
      //    Lamps on the ghat steps / bank sit at the water's edge — the artwork already
      //    paints their reflections, so they are skipped here.
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      for (const lamp of lampFlickers) {
        const intensity = lampIntensity(lamp, t);
        const lx = bg.dx + lamp.u * bg.dw;
        const ly = bg.dy + lamp.v * bg.dh;
        if (ly >= waterY - 4) continue;

        const reflR = Math.max(3, lamp.r * scale * 0.8);
        const streakH = Math.max(30 * scale, (ch - waterY) * 0.9);
        const rippleShift = Math.sin(t * 1.5 + lamp.phase1 * 2) * 3 * scale;
        const rx = lx + rippleShift;

        // warm pool where the light meets the water
        const poolGrad = ctx.createRadialGradient(rx, waterY, 0, rx, waterY, reflR * 4);
        poolGrad.addColorStop(0, `rgba(255, 140, 20, ${0.25 * intensity})`);
        poolGrad.addColorStop(0.4, `rgba(255, 90, 0, ${0.12 * intensity})`);
        poolGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');

        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.arc(rx, waterY, reflR * 4, 0, Math.PI * 2);
        ctx.fill();

        // elongated streak running down toward the viewer
        const streakGrad = ctx.createRadialGradient(rx, waterY, 0, rx, waterY, streakH);
        streakGrad.addColorStop(0, `rgba(255, 220, 80, ${0.18 * intensity})`);
        streakGrad.addColorStop(0.3, `rgba(255, 160, 40, ${0.08 * intensity})`);
        streakGrad.addColorStop(1, 'rgba(255, 100, 20, 0)');

        ctx.fillStyle = streakGrad;
        ctx.beginPath();
        ctx.ellipse(rx, waterY + streakH * 0.4, reflR * 1.5, streakH, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // reflect the brighter stars as faint glints on the water
      for (let i = 0; i < starTwinkles.length; i += 3) {
        const star = starTwinkles[i];
        const sx = bg.dx + star.u * bg.dw;
        const b = starBrightness(star, t) * 0.4;
        const rippleShift = Math.sin(t * 0.8 + star.phase * 1.5) * 2 * scale;
        const r = Math.max(1, star.r * scale * 0.7);

        const glintGrad = ctx.createRadialGradient(sx + rippleShift, waterY, 0, sx + rippleShift, waterY, r * 2.5);
        glintGrad.addColorStop(0, `rgba(255, 252, 240, ${b})`);
        glintGrad.addColorStop(0.4, `rgba(200, 220, 255, ${b * 0.3})`);
        glintGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');

        ctx.fillStyle = glintGrad;
        ctx.beginPath();
        ctx.arc(sx + rippleShift, waterY, r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 5. Subtle animated ripple lines (throttled count for perf)
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      const shimmerH = ch - waterY;
      if (shimmerH > 0) {
        const step = Math.max(6, 8 * scale); // wider spacing = fewer lines
        for (let y = 0; y < shimmerH; y += step) {
          const shimmerOpacity = 0.02 + 0.015 * Math.sin(t * 0.6 + y * 0.05);
          if (shimmerOpacity <= 0) continue;
          ctx.strokeStyle = `rgba(255, 220, 140, ${shimmerOpacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const lineY = waterY + y;
          for (let x = 0; x < cw; x += 16) {
            const wave = Math.sin(t * 1.2 + x * 0.008 + y * 0.03) * 2 * scale;
            if (x === 0) ctx.moveTo(x, lineY + wave);
            else ctx.lineTo(x, lineY + wave);
          }
          ctx.stroke();
        }
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-bg-canvas ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}
