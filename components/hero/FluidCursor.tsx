"use client";

import { useEffect, useRef } from "react";
import { initFluid } from "@/lib/webgl-fluid/initFluid";

export default function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    return initFluid(canvas);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1]"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        id="fluid"
        className="block h-screen w-screen bg-transparent"
      />
    </div>
  );
}
