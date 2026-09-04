import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { FrameTemplate, LogoSettings, StudentBadgeSettings, ImageAdjustments, ActiveLayer } from '../types';
import { SCHOOL_LOGO_PATH } from '../constants/templates';
import { Image as ImageIcon, School, Move, RotateCw, FlipHorizontal, RotateCcw, CheckCircle2 } from 'lucide-react';

interface AvatarCanvasProps {
  userImage: HTMLImageElement | null;
  selectedTemplate: FrameTemplate;
  adjustments: ImageAdjustments;
  logoSettings: LogoSettings;
  studentBadge: StudentBadgeSettings;
  activeLayer: ActiveLayer;
  setActiveLayer: (layer: ActiveLayer) => void;
  onUpdateAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  onUpdateLogoSettings: (logo: Partial<LogoSettings>) => void;
  onUploadClick: () => void;
}

export interface AvatarCanvasRef {
  exportImage: (resolution?: 1080 | 2048, format?: 'image/png' | 'image/jpeg') => string | null;
  getBlob: (resolution?: 1080 | 2048, format?: 'image/png' | 'image/jpeg') => Promise<Blob | null>;
}

export const AvatarCanvas = forwardRef<AvatarCanvasRef, AvatarCanvasProps>(({
  userImage,
  selectedTemplate,
  adjustments,
  logoSettings,
  studentBadge,
  activeLayer,
  setActiveLayer,
  onUpdateAdjustments,
  onUpdateLogoSettings,
  onUploadClick,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const [isFrameLoaded, setIsFrameLoaded] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  // Interaction tracking
  const isDragging = useRef(false);
  const dragTarget = useRef<ActiveLayer>('photo');
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPinchDist = useRef<number | null>(null);
  const initialPinchVal = useRef<number>(1);

  const isEmbeddedLogo = !!selectedTemplate.hasEmbeddedLogo;

  // 1. Load Frame template
  useEffect(() => {
    setIsFrameLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedTemplate.src;
    img.onload = () => {
      frameImgRef.current = img;
      setIsFrameLoaded(true);
    };
  }, [selectedTemplate]);

  // 2. Load School Logo
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = SCHOOL_LOGO_PATH;
    img.onload = () => {
      logoImgRef.current = img;
      setIsLogoLoaded(true);
    };
  }, []);

  // 3. Composite Drawing Function
  const drawComposite = (
    ctx: CanvasRenderingContext2D,
    size: number,
    opts: {
      userImg: HTMLImageElement | null;
      frameImg: HTMLImageElement | null;
      logoImg: HTMLImageElement | null;
      adjust: ImageAdjustments;
      logo: LogoSettings;
      badge: StudentBadgeSettings;
      hasEmbeddedLogo: boolean;
      isInteractivePreview?: boolean;
    }
  ) => {
    const center = size / 2;
    // Circular clip radius (ensures avatar fills the frame hole)
    const innerRadius = size * 0.385;

    ctx.clearRect(0, 0, size, size);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // A. Draw User Photo inside Circular Clip
    if (opts.userImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      // Brightness & Contrast
      ctx.filter = `brightness(${opts.adjust.brightness}%) contrast(${opts.adjust.contrast}%)`;

      // Matrix transform
      ctx.translate(center + (opts.adjust.panX * size) / 600, center + (opts.adjust.panY * size) / 600);
      ctx.rotate((opts.adjust.rotation * Math.PI) / 180);
      if (opts.adjust.flipH) {
        ctx.scale(-1, 1);
      }

      const uWidth = opts.userImg.width;
      const uHeight = opts.userImg.height;
      const baseScale = (innerRadius * 2) / Math.min(uWidth, uHeight);
      const drawScale = baseScale * opts.adjust.zoom;
      const dw = uWidth * drawScale;
      const dh = uHeight * drawScale;

      ctx.drawImage(opts.userImg, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    } else {
      // Clean neutral placeholder
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, innerRadius, 0, Math.PI * 2, true);
      ctx.fillStyle = '#141720';
      ctx.fill();
      ctx.restore();
    }

    // B. Draw Frame Overlay (On top of user avatar)
    if (opts.frameImg) {
      ctx.save();
      ctx.drawImage(opts.frameImg, 0, 0, size, size);
      ctx.restore();
    }

    // C. Draw Floating School Logo (Only if NOT embedded in the frame template)
    if (!opts.hasEmbeddedLogo && opts.logo.enabled && opts.logoImg) {
      ctx.save();
      const lSize = (opts.logo.size / 600) * size;
      const lx = opts.logo.x * size;
      const ly = opts.logo.y * size;

      ctx.translate(lx, ly);
      if (opts.logo.rotation) {
        ctx.rotate((opts.logo.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = opts.logo.opacity;

      // Subtle drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = size * 0.015;
      ctx.shadowOffsetY = size * 0.006;

      ctx.drawImage(opts.logoImg, -lSize / 2, -lSize / 2, lSize, lSize);

      // Draw Interactive Selection Ring (Only in edit mode when active)
      if (opts.isInteractivePreview && activeLayer === 'logo') {
        ctx.shadowColor = 'transparent';
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(0, 0, lSize / 2 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const r = lSize / 2 + 4;
        const handlePts = [
          { x: 0, y: -r },
          { x: r, y: 0 },
          { x: 0, y: r },
          { x: -r, y: 0 },
        ];
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        handlePts.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      ctx.restore();
    }

    // D. Draw Student Badge (Họ tên & Lớp)
    if (opts.badge.enabled && (opts.badge.fullName || opts.badge.className)) {
      ctx.save();
      const badgeH = size * 0.075;
      const badgeW = size * 0.58;
      const bx = center - badgeW / 2;
      const by = size * 0.835;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = size * 0.02;
      ctx.shadowOffsetY = size * 0.008;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      const rad = badgeH / 2;
      ctx.roundRect(bx, by, badgeW, badgeH, rad);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.lineWidth = Math.max(1.5, size * 0.0025);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const titleText = opts.badge.fullName.trim() || 'HỌC SINH VĨNH THUẬN';
      const subText = [opts.badge.className.trim(), opts.badge.schoolYear.trim()].filter(Boolean).join(' • ');

      if (subText) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${Math.round(size * 0.026)}px sans-serif`;
        ctx.fillText(titleText, center, by + badgeH * 0.36);

        ctx.fillStyle = '#fde68a';
        ctx.font = `${Math.round(size * 0.02)}px sans-serif`;
        ctx.fillText(subText, center, by + badgeH * 0.72);
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.font = `600 ${Math.round(size * 0.03)}px sans-serif`;
        ctx.fillText(titleText, center, by + badgeH * 0.5);
      }

      ctx.restore();
    }
  };

  // Re-render preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawComposite(ctx, canvas.width, {
      userImg: userImage,
      frameImg: frameImgRef.current,
      logoImg: logoImgRef.current,
      adjust: adjustments,
      logo: logoSettings,
      badge: studentBadge,
      hasEmbeddedLogo: isEmbeddedLogo,
      isInteractivePreview: true,
    });
  }, [userImage, isFrameLoaded, isLogoLoaded, adjustments, logoSettings, studentBadge, activeLayer, isEmbeddedLogo]);

  // Export methods
  useImperativeHandle(ref, () => ({
    exportImage: (resolution = 1080, format = 'image/png') => {
      const offscreen = document.createElement('canvas');
      offscreen.width = resolution;
      offscreen.height = resolution;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;

      drawComposite(ctx, resolution, {
        userImg: userImage,
        frameImg: frameImgRef.current,
        logoImg: logoImgRef.current,
        adjust: adjustments,
        logo: logoSettings,
        badge: studentBadge,
        hasEmbeddedLogo: isEmbeddedLogo,
        isInteractivePreview: false,
      });

      return offscreen.toDataURL(format, format === 'image/jpeg' ? 0.95 : undefined);
    },
    getBlob: (resolution = 1080, format = 'image/png') => {
      return new Promise<Blob | null>((resolve) => {
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
          logoImg: logoImgRef.current,
          adjust: adjustments,
          logo: logoSettings,
          badge: studentBadge,
          hasEmbeddedLogo: isEmbeddedLogo,
          isInteractivePreview: false,
        });

        offscreen.toBlob(
          (blob) => resolve(blob),
          format,
          format === 'image/jpeg' ? 0.95 : undefined
        );
      });
    },
  }));

  // Helper: check if pointer hit the logo
  const checkLogoHit = (canvasClientX: number, canvasClientY: number): boolean => {
    if (isEmbeddedLogo || !logoSettings.enabled || !canvasRef.current) return false;
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = (canvasClientX - rect.left) / rect.width;
    const relY = (canvasClientY - rect.top) / rect.height;

    const logoRadiusRel = (logoSettings.size / 600) / 2;
    const dist = Math.hypot(relX - logoSettings.x, relY - logoSettings.y);
    return dist <= logoRadiusRel * 1.25;
  };

  // =================== INTERACTION (Mouse & Touch) ===================
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDragging.current = true;
    dragStart.current = { x: clientX, y: clientY };

    if (!isEmbeddedLogo && checkLogoHit(clientX, clientY)) {
      dragTarget.current = 'logo';
      setActiveLayer('logo');
    } else {
      dragTarget.current = 'photo';
      setActiveLayer('photo');
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    dragStart.current = { x: clientX, y: clientY };

    if (dragTarget.current === 'logo' && !isEmbeddedLogo && logoSettings.enabled) {
      const nextX = Math.min(0.95, Math.max(0.05, logoSettings.x + dx / rect.width));
      const nextY = Math.min(0.95, Math.max(0.05, logoSettings.y + dy / rect.height));
      onUpdateLogoSettings({ x: nextX, y: nextY });
    } else if (dragTarget.current === 'photo' && userImage) {
      onUpdateAdjustments({
        panX: adjustments.panX + dx,
        panY: adjustments.panY + dy,
      });
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    if (activeLayer === 'logo' && !isEmbeddedLogo) {
      const newSize = Math.min(220, Math.max(60, logoSettings.size + (delta > 0 ? 6 : -6)));
      onUpdateLogoSettings({ size: newSize });
    } else if (userImage) {
      const newZoom = Math.min(3.0, Math.max(0.5, adjustments.zoom + delta));
      onUpdateAdjustments({ zoom: Number(newZoom.toFixed(2)) });
    }
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
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
      initialPinchVal.current = (activeLayer === 'logo' && !isEmbeddedLogo) ? logoSettings.size : adjustments.zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && initialPinchDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDist.current;
      if (activeLayer === 'logo' && !isEmbeddedLogo) {
        const nextSize = Math.min(220, Math.max(60, Math.round(initialPinchVal.current * ratio)));
        onUpdateLogoSettings({ size: nextSize });
      } else {
        const nextZoom = Math.min(3.0, Math.max(0.5, Number((initialPinchVal.current * ratio).toFixed(2))));
        onUpdateAdjustments({ zoom: nextZoom });
      }
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto space-y-2.5 select-none">
      {/* 1. LAYER SWITCHER PILL */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setActiveLayer('photo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeLayer === 'photo'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Ảnh Chân Dung
          </button>

          {!isEmbeddedLogo ? (
            <button
              type="button"
              onClick={() => setActiveLayer('logo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeLayer === 'logo'
                  ? 'bg-zinc-800 text-sky-400 shadow-sm border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              Logo Trường
            </button>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-zinc-500 font-mono">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Logo: Đã in sẵn
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
          <Move className="w-3 h-3 text-zinc-400" />
          {activeLayer === 'logo' && !isEmbeddedLogo ? 'Kéo để chỉnh vị trí Logo' : 'Kéo để căn chỉnh Ảnh'}
        </div>
      </div>

      {/* 2. STUDIO CANVAS CONTAINER */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#090a0f] border border-zinc-800 shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handlePointerUp}
        />

        {/* Empty State */}
        {!userImage && (
          <div
            onClick={onUploadClick}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-zinc-950/70 backdrop-blur-xs transition hover:bg-zinc-950/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3 shadow-md group-hover:border-zinc-700 transition">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="font-medium text-zinc-200 text-sm">Chạm để chọn ảnh chân dung</p>
            <p className="text-[11px] text-zinc-500 mt-1 max-w-[200px]">
              Tải ảnh khuôn mặt của bạn để ghép vào khung THPT Vĩnh Thuận
            </p>
          </div>
        )}
      </div>

      {/* 3. FLOATING TOOLBAR */}
      {userImage && (
        <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-xs text-zinc-400">
          <span className="text-[11px] font-mono text-zinc-500">
            {activeLayer === 'photo' || isEmbeddedLogo
              ? 'Đang căn chỉnh: Ảnh chân dung'
              : 'Đang căn chỉnh: Logo THPT Vĩnh Thuận'}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onUpdateAdjustments({ rotation: (adjustments.rotation + 90) % 360 })}
              className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition"
              title="Xoay 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdateAdjustments({ flipH: !adjustments.flipH })}
              className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition"
              title="Lật gương"
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateAdjustments({ panX: 0, panY: 0, zoom: 1.0, rotation: 0, flipH: false })
              }
              className="p-1.5 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition"
              title="Căn giữa lại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

AvatarCanvas.displayName = 'AvatarCanvas';
