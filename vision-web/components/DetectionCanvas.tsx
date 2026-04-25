"use client";

import { useEffect, useRef, useState } from "react";
import type { BoundingBox } from "@/lib/types";

interface DetectionCanvasProps {
  imageUrl: string;
  detections: BoundingBox[];
}

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

function colorFor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function DetectionCanvas({ imageUrl, detections }: DetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  function draw(highlight: number | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      const { width: cw, height: ch } = canvas;
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);

      const scaleX = cw / img.naturalWidth;
      const scaleY = ch / img.naturalHeight;

      detections.forEach((det, idx) => {
        const x = det.x1 * scaleX;
        const y = det.y1 * scaleY;
        const w = (det.x2 - det.x1) * scaleX;
        const h = (det.y2 - det.y1) * scaleY;
        const color = colorFor(det.label);
        const isActive = highlight === idx;

        ctx.strokeStyle = color;
        ctx.lineWidth = isActive ? 3 : 2;
        ctx.globalAlpha = isActive ? 1 : 0.8;
        ctx.strokeRect(x, y, w, h);

        // Fill overlay
        ctx.fillStyle = color;
        ctx.globalAlpha = isActive ? 0.18 : 0.08;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;

        // Label pill
        const label = `${det.label} ${(det.confidence * 100).toFixed(0)}%`;
        ctx.font = `${isActive ? "bold " : ""}12px Inter, sans-serif`;
        const tw = ctx.measureText(label).width;
        const ph = 20;
        const py = y > ph + 4 ? y - ph - 2 : y + h + 2;

        ctx.fillStyle = color;
        ctx.globalAlpha = 0.92;
        ctx.beginPath();
        ctx.roundRect(x, py, tw + 12, ph, 4);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + 6, py + 13);
      });
    };
  }

  useEffect(() => {
    draw(hovered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, detections, hovered]);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw(hovered);
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, detections]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden bg-black"
        style={{ aspectRatio: naturalSize.w && naturalSize.h ? `${naturalSize.w}/${naturalSize.h}` : "4/3" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Legend */}
      {detections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {detections.map((det, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all"
              style={{
                borderColor: colorFor(det.label),
                color: colorFor(det.label),
                background: hovered === idx ? `${colorFor(det.label)}20` : "transparent",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: colorFor(det.label) }}
              />
              {det.label}
              {det.stage && ` · ${det.stage}`}
              <span className="opacity-70">({(det.confidence * 100).toFixed(0)}%)</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
