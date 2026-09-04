import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { ImageAdjustments } from '../types';
import { Image as ImageIcon, Plus, Minus, RotateCcw } from 'lucide-react';

interface AvatarCanvasProps {
  userImage: HTMLImageElement | null;
  adjustments: ImageAdjustments;
  onUpdateAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  onUploadClick: () => void;
  onResetAdjustments: () => void;
}

export interface AvatarCanvasRef {
  exportImage: (resolution?: number, format?: string) => string | null;
  getBlob: (resolution?: number, format?: string) => Promise<Blob | null>;
}

const OFFICIAL_FRAME_SRC = '/frames/frame_0_vinh_thuan_chinh_thuc.png';

export const AvatarCanvas = forwardRef<AvatarCanvasRef, AvatarCanvasProps>(({
  userImage,
  adjustments,
  onUpdateAdjustments,
  onUploadClick,
  onResetAdjustments,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  // Interaction tracking for dragging and pinch-zoom
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchVal = useRef<number>(1);

  // 1. Preload Official School Frame
  useEffect(() => {
    setIsFrameLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = OFFICIAL_FRAME_SRC;
    img.onload = () => {
      frameImgRef.current = img;
      setIsFrameLoaded(true);
    };
  }, []);

  // 2. High Quality Composite Drawing Function
  const drawComposite = (
    ctx: CanvasRenderingContext2D,
    size: number,
    opts: {
      userImg: HTMLImageElement | null;
      frameImg: HTMLImageElement | null;
      adjust: ImageAdjustments;
    }
  ) => {
    // Exact center coordinates of the golden circle portal in the official frame
    const portalX = size * 0.5097;
    const portalY = size * 0.5329;
    const portalRadius = size * 0.2542;

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // A. Draw User Photo inside Circular Mask
    if (opts.userImg) {
      ctx.save();
      // Clip to circular region covering the portal
      ctx.beginPath();
      ctx.arc(portalX, portalY, size * 0.45, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Pan & Zoom relative to portal center
      const panXScaled = (opts.adjust.panX * size) / 600;
      const panYScaled = (opts.adjust.panY * size) / 600;
      ctx.translate(portalX + panXScaled, portalY + panYScaled);

      const uWidth = opts.userImg.width;
      const uHeight = opts.userImg.height;
      // Scale photo to fully fill portal with zero transparent margins
      const baseScale = (portalRadius * 2.15) / Math.min(uWidth, uHeight);
      const drawScale = baseScale * opts.adjust.zoom;
      const dw = uWidth * drawScale;
      const dh = uHeight * drawScale;

      ctx.drawImage(opts.userImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      // Empty placeholder circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(portalX, portalY, portalRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.restore();
    }

    // B. Draw Official School Frame Overlay on top
    if (opts.frameImg) {
      ctx.save();
      ctx.drawImage(opts.frameImg, 0, 0, size, size);
      ctx.restore();
    }
  };

  // 3. Render Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawComposite(ctx, canvas.width, {
      userImg: userImage,
      frameImg: frameImgRef.current,
      adjust: adjustments,
    });
  }, [userImage, isFrameLoaded, adjustments]);

  // 4. Expose Export Methods at High Resolution (2048 x 2048)
  useImperativeHandle(ref, () => ({
    exportImage: (resolution = 2048, format = 'image/png') => {
      const offscreen = document.createElement('canvas');
      offscreen.width = resolution;
      offscreen.height = resolution;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      drawComposite(ctx, resolution, {
        userImg: userImage,
        frameImg: frameImgRef.current,
        adjust: adjustments,
      });

      return offscreen.toDataURL(format, 1.0);
    },
    getBlob: (resolution = 2048, format = 'image/png') => {
      return new Promise((resolve) => {
        const offscreen = document.createElement('canvas');
        offscreen.width = resolution;
        offscreen.height = resolution;
        const ctx = offscreen.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        drawComposite(ctx, resolution, {
          userImg: userImage,
          frameImg: frameImgRef.current,
          adjust: adjustments,
        });

        offscreen.toBlob((blob) => resolve(blob), format, 1.0);
      });
    },
  }));

  // Pointer & Touch Events (Drag to Move & Scroll/Pinch to Zoom)
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!userImage) return;
    isDragging.current = true;
    dragStart.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !userImage) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    dragStart.current = { x: clientX, y: clientY };

    onUpdateAdjustments({
      panX: adjustments.panX + dx,
      panY: adjustments.panY + dy,
    });
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!userImage) return;
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const nextZoom = Math.min(3.5, Math.max(0.6, adjustments.zoom + delta));
    onUpdateAdjustments({ zoom: Number(nextZoom.toFixed(2)) });
  };

  // Touch gesture handling: 1 finger to pan, 2 fingers to pinch-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    if (e.touches.length === 1) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
      initialPinchDist.current = null;
    } else if (e.touches.length === 2) {
      isDragging.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDist.current = dist;
      initialPinchVal.current = adjustments.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      onUpdateAdjustments({
        panX: adjustments.panX + dx,
        panY: adjustments.panY + dy,
      });
    } else if (e.touches.length === 2 && initialPinchDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDist.current;
      const nextZoom = Math.min(3.5, Math.max(0.6, Number((initialPinchVal.current * ratio).toFixed(2))));
      onUpdateAdjustments({ zoom: nextZoom });
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto select-none">
      {/* Canvas Artboard */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#090a0f] border border-zinc-800 shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className={`w-full h-full block touch-none ${
            userImage ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
          }`}
          onClick={() => {
            if (!userImage) onUploadClick();
          }}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Empty State Overlay */}
        {!userImage && (
          <div
            onClick={onUploadClick}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-zinc-950/50 backdrop-blur-[2px] transition hover:bg-zinc-950/30"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 flex items-center justify-center mb-2.5 shadow-lg">
              <ImageIcon className="w-6 h-6 text-sky-400" />
            </div>
            <p className="font-semibold text-white text-sm sm:text-base mb-1">
              Chạm để chọn ảnh đại diện
            </p>
            <span className="text-xs text-zinc-400">
              Hỗ trợ ảnh từ điện thoại & máy tính
            </span>
          </div>
        )}

        {/* Floating Minimalist Zoom Controls (Corner pills) */}
        {userImage && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2 py-1 rounded-full border border-zinc-700/80 shadow-xl">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateAdjustments({ zoom: Math.max(0.6, Number((adjustments.zoom - 0.15).toFixed(2))) });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
              title="Thu nhỏ"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-zinc-200 min-w-[38px] text-center font-semibold">
              {Math.round(adjustments.zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateAdjustments({ zoom: Math.min(3.5, Number((adjustments.zoom + 0.15).toFixed(2))) });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition cursor-pointer"
              title="Phóng to"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-zinc-700 mx-0.5" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResetAdjustments();
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
              title="Căn giữa lại ảnh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

AvatarCanvas.displayName = 'AvatarCanvas';
