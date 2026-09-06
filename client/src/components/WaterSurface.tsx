import { useEffect, useRef } from "react";

type WaterSurfaceProps = {
  className?: string;
};

/**
 * A small spring-damper surface simulation used as a lighting layer over the
 * photographic hero. It is deliberately soft: the waves are broad filled
 * bands, not decorative lines, so the texture still reads as real water.
 */
export default function WaterSurface({ className = "" }: WaterSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let density = 0;
    let displacement = new Float32Array(0);
    let velocity = new Float32Array(0);
    let frame = 0;
    let lastPointer = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const nextWidth = Math.max(1, bounds.width);
      const nextHeight = Math.max(1, bounds.height);
      const nextDensity = Math.max(28, Math.ceil(nextWidth / 13));
      const pixelWidth = Math.round(nextWidth * ratio);
      const pixelHeight = Math.round(nextHeight * ratio);

      // ResizeObserver can fire while fonts and layout settle. Keep the
      // existing wave state so the surface never snaps back to its origin.
      if (pixelWidth === canvas.width && pixelHeight === canvas.height && nextDensity === density) return;

      const previousDisplacement = displacement;
      const previousVelocity = velocity;
      width = nextWidth;
      height = nextHeight;
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      density = nextDensity;
      displacement = new Float32Array(density);
      velocity = new Float32Array(density);
      const copyLength = Math.min(density, previousDisplacement.length);
      displacement.set(previousDisplacement.subarray(0, copyLength));
      velocity.set(previousVelocity.subarray(0, copyLength));
    };

    const kick = (clientX: number, clientY: number) => {
      if (Date.now() - lastPointer < 130) return;
      const bounds = canvas.getBoundingClientRect();
      if (clientY < bounds.top || clientY > bounds.bottom) return;
      const index = Math.round(((clientX - bounds.left) / Math.max(bounds.width, 1)) * (density - 1));
      if (index < 0 || index >= density) return;
      lastPointer = Date.now();
      for (let offset = -3; offset <= 3; offset += 1) {
        const target = index + offset;
        if (target >= 0 && target < density) velocity[target] += (1 - Math.abs(offset) / 4) * 1.8;
      }
    };

    const draw = (time: number) => {
      const dark = document.documentElement.dataset.theme === "dark";
      const waveColor = dark ? "rgba(169, 225, 220," : "rgba(255, 255, 255,";
      const warmColor = dark ? "rgba(238, 157, 127," : "rgba(235, 126, 94,";
      const seconds = time / 1000;

      context.clearRect(0, 0, width, height);
      const horizon = height * 0.43;

      for (let index = 0; index < density; index += 1) {
        const target = Math.sin(index * 0.17 + seconds * 1.15) * 1.4 + Math.sin(index * 0.047 - seconds * 0.62) * 2.1;
        const spring = (target - displacement[index]) * 0.023;
        velocity[index] = (velocity[index] + spring) * 0.956;
        displacement[index] += velocity[index];
      }

      const fillBand = (level: number, amplitude: number, alpha: number, phase: number, color: string) => {
        const gradient = context.createLinearGradient(0, horizon + level - 30, 0, height);
        gradient.addColorStop(0, color + (alpha * 1.3).toFixed(3) + ")");
        gradient.addColorStop(1, color + "0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(0, height);
        for (let x = 0; x <= width + 18; x += 18) {
          const index = Math.min(density - 1, Math.round((x / Math.max(width, 1)) * (density - 1)));
          const y = horizon + level + displacement[index] * amplitude + Math.sin(x * 0.018 + seconds * 0.7 + phase) * 2.2;
          context.lineTo(x, y);
        }
        context.lineTo(width, height);
        context.closePath();
        context.fill();
      };

      fillBand(15, 1.3, 0.08, 0, waveColor);
      fillBand(78, 1.05, 0.045, 1.8, waveColor);
      fillBand(150, 0.8, 0.035, 3.6, warmColor);

      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = dark ? 0.18 : 0.15;
      context.filter = "blur(11px)";
      context.strokeStyle = waveColor + "0.9)";
      context.lineWidth = 16;
      context.lineCap = "round";
      context.beginPath();
      for (let x = 0; x <= width + 18; x += 18) {
        const index = Math.min(density - 1, Math.round((x / Math.max(width, 1)) * (density - 1)));
        const y = horizon + 30 + displacement[index] * 1.6 + Math.sin(x * 0.012 + seconds * 0.55) * 5;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
      context.restore();

      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    const onPointerMove = (event: PointerEvent) => kick(event.clientX, event.clientY);
    resizeObserver.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frame = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className={"home-clean-water-surface " + className} aria-hidden="true" />;
}
