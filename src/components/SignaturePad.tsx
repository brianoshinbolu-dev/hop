"use client";

import { useRef, useState, useEffect } from "react";

interface SignaturePadProps {
  onSave: (dataUrl: string | null) => void;
  initialData?: string | null;
}

export default function SignaturePad({ onSave, initialData }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHasContent(true);
        setSigned(true);
      };
      img.src = initialData;
    }
  }, [initialData]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasContent(true);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
    if (hasContent) {
      setSigned(true);
      onSave(canvasRef.current?.toDataURL() ?? null);
    }
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    setSigned(false);
    onSave(null);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Signature</label>
      <div className="relative rounded-lg border border-gray-300 bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="w-full touch-none rounded-lg"
          style={{ cursor: "crosshair" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasContent && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Sign above
          </p>
        )}
      </div>
      {signed && (
        <button type="button" onClick={clear}
          className="text-xs text-red-600 hover:text-red-700 underline">
          Clear signature
        </button>
      )}
    </div>
  );
}
