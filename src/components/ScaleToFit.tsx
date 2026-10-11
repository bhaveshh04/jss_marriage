"use client";
import { useEffect, useRef, useState } from "react";
import { SHEET_H, SHEET_W } from "./BioDataSheet";

/**
 * Renders a fixed-size A4 sheet scaled to its container.
 * mode="width"   -> fits container width (page preview, grows downward)
 * mode="contain" -> fits both width and height (full-screen display)
 */
export default function ScaleToFit({ children, mode = "width", className = "" }: { children: React.ReactNode; mode?: "width" | "contain"; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth / SHEET_W;
      const h = el.clientHeight / SHEET_H;
      setScale(mode === "contain" ? Math.min(w, h) : w);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  const w = SHEET_W * scale, h = SHEET_H * scale;
  return (
    <div ref={box} className={`${className} ${mode === "contain" ? "flex items-center justify-center" : ""}`} style={mode === "width" ? { height: h } : undefined}>
      <div className="sheet-frame relative shrink-0" style={{ width: w, height: h }}>
        <div className="sheet-scale absolute left-0 top-0 origin-top-left" style={{ width: SHEET_W, height: SHEET_H, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
