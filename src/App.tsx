import React, { useState, useRef, useEffect } from 'react';
import { AvatarCanvas } from './components/AvatarCanvas';
import type { AvatarCanvasRef } from './components/AvatarCanvas';
import { ExportModal } from './components/ExportModal';
import { SCHOOL_LOGO_PATH } from './constants/templates';
import type { ImageAdjustments } from './types';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Download, 
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<AvatarCanvasRef | null>(null);

  // Detect In-App Browser and Device OS
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'other'>('other');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isAndroidDevice = /android/i.test(ua);
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua);

    if (isAndroidDevice) {
      setDeviceType('android');
    } else if (isIOSDevice) {
      setDeviceType('ios');
    }

    if (/zalo|fbav|fban|messenger|instagram|tiktok|threads|micromessenger/i.test(ua)) {
      setIsInAppBrowser(true);

      // On Android: Attempt automatic Chrome intent redirect
      if (isAndroidDevice && !window.location.hash.includes('inapp')) {
        try {
          const currentUrl = window.location.href.replace(/https?:\/\//, '');
          window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
        } catch (e) {
          console.log('Auto intent redirect not triggered:', e);
        }
      }
    }
  }, []);

  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Image Adjustments: only zoom and pan
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: 1.0,
    rotation: 0,
    flipH: false,
    panX: 0,
    panY: 0,
    brightness: 100,
    contrast: 100,
  });

  // Export Modal state for in-app browser fallback
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setAdjustments({
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          flipH: false,
          brightness: 100,
          contrast: 100,
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load student sample portrait
  const handleLoadSample = () => {
    const img = new Image();
    img.onload = () => {
      setUserImage(img);
      setAdjustments({
        zoom: 1.0,
        panX: 0,
        panY: 0,
        rotation: 0,
        flipH: false,
        brightness: 100,
        contrast: 100,
      });
    };
    img.src = '/samples/sample_avatar.jpg';
  };

  const handleUpdateAdjustments = (newAdj: Partial<ImageAdjustments>) => {
    setAdjustments((prev) => ({ ...prev, ...newAdj }));
  };

  const handleResetAdjustments = () => {
    setAdjustments({
      zoom: 1.0,
      rotation: 0,
      flipH: false,
      panX: 0,
      panY: 0,
      brightness: 100,
      contrast: 100,
    });
  };

  const handleOpenExternalBrowser = () => {
    const currentUrl = window.location.href.replace(/https?:\/\//, '');
    if (deviceType === 'android') {
      window.location.href = `intent://${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (deviceType === 'ios') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      try {
        window.location.href = `googlechromes://${currentUrl}`;
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Instant 2048px Ultra HD Download or Fallback Modal for Zalo
  const handleDownloadOrExport = async () => {
    if (!canvasRef.current) return;

    if (isInAppBrowser) {
      // 1. First attempt native Web Share API with file:
      // If the mobile OS supports saving directly without 3 dots, this triggers the native Save Image sheet!
      try {
        const blob = await canvasRef.current.getBlob(2048, 'image/png');
        if (blob && typeof navigator !== 'undefined' && navigator.canShare) {
          const file = new File([blob], `Avatar_THPT_VinhThuan_${Date.now()}.png`, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'Avatar THPT Vĩnh Thuận',
              text: 'Ảnh đại diện chào năm học mới THPT Vĩnh Thuận 2026 - 2027',
              files: [file],
            });
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 4000);
            return;
          }
        }
      } catch (shareErr) {
        console.log('Direct share not supported or dismissed:', shareErr);
      }

      // 2. If share not supported or dismissed: open the prominent 3-dots guide modal
      const dataUrl = canvasRef.current.exportImage(2048, 'image/png');
      if (dataUrl) {
        setExportedImageUrl(dataUrl);
        setIsExportOpen(true);
      }
      return;
    }

    // Normal browser: Direct instant file download
    try {
      setIsDownloading(true);
      const blob = await canvasRef.current.getBlob(2048, 'image/png');
      if (!blob) return;

      const filename = `Avatar_THPT_VinhThuan_2026_${Date.now()}.png`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#38bdf8', '#fbbf24', '#ffffff', '#4f46e5'],
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
      const dataUrl = canvasRef.current.exportImage(2048, 'image/png');
      if (dataUrl) {
        setExportedImageUrl(dataUrl);
        setIsExportOpen(true);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const getExportBlob = (resolution = 2048, format = 'image/png') => {
    if (!canvasRef.current) return Promise.resolve(null);
    return canvasRef.current.getBlob(resolution, format);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ZALO / IN-APP BROWSER PROMINENT NOTIFICATION BANNER */}
      {isInAppBrowser && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-zinc-950 px-3.5 py-3 shadow-xl sticky top-0 z-50 border-b-2 border-amber-300">
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-full bg-black/20 text-white flex-shrink-0 mt-0.5 animate-bounce">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between font-black tracking-wide text-zinc-950 uppercase text-[11px] mb-0.5">
                  <span>Chú Ý: Đang Mở Bằng Zalo</span>
                  <span className="font-mono text-white bg-black/30 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                    Góc Trên Phải ↗️
                  </span>
                </div>
                <p className="text-zinc-950 font-medium text-[11.5px] leading-tight">
                  {deviceType === 'android' ? (
                    <>Để tải ảnh về máy không bị lỗi, bạn có thể <strong>bấm nút mở Chrome bên dưới</strong> hoặc ấn <strong>dấu 3 chấm (...) góc trên phải</strong> ➔ "Mở bằng trình duyệt".</>
                  ) : (
                    <>iPhone trên Zalo cần ấn vào <strong>dấu 3 chấm (...) ở góc trên cùng bên phải màn hình</strong> ➔ Chọn <strong>"Mở bằng trình duyệt"</strong> (Safari) để lưu ảnh!</>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInAppBrowser(false)}
                className="text-[11px] font-bold text-black/70 hover:text-black flex-shrink-0 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Action Buttons inside Banner */}
            <div className="flex items-center gap-2 pt-0.5">
              {deviceType === 'android' ? (
                <button
                  type="button"
                  onClick={handleOpenExternalBrowser}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-950 text-white font-bold text-[11px] shadow-sm hover:bg-zinc-900 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  Mở Thẳng Bằng Google Chrome
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenExternalBrowser}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-950 text-white font-bold text-[11px] shadow-sm hover:bg-zinc-900 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-300" />}
                  {copiedLink ? 'Đã Chép! Mở Safari Dán Vào' : 'Sao Chép Link Để Dán Vào Safari'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REFINED HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={SCHOOL_LOGO_PATH}
              alt="Logo THPT Vĩnh Thuận"
              className="w-7 h-7 object-contain rounded-full shadow-xs"
            />
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-none">
                THPT VĨNH THUẬN
              </h1>
              <p className="text-[10px] text-zinc-400 mt-0.5">Khung Tựu Trường 2026 - 2027</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full bg-amber-500/10 font-semibold">
            Khung Gốc
          </span>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <main className="max-w-md mx-auto px-3 sm:px-4 py-4 flex-1 w-full flex flex-col items-center justify-center space-y-3.5">
        {/* Canvas Component */}
        <AvatarCanvas
          ref={canvasRef}
          userImage={userImage}
          adjustments={adjustments}
          onUpdateAdjustments={handleUpdateAdjustments}
          onUploadClick={() => fileInputRef.current?.click()}
          onResetAdjustments={handleResetAdjustments}
        />

        {/* State 1: Before Upload */}
        {!userImage ? (
          <div className="w-full space-y-2 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition cursor-pointer active:scale-[0.99]"
            >
              <Upload className="w-4 h-4" />
              TẢI ẢNH CỦA BẠN LÊN
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Thử Nhanh Với Ảnh Mẫu
            </button>
          </div>
        ) : (
          /* State 2: Upload Complete - Ready to Download */
          <div className="w-full space-y-2.5 pt-1 animate-fade-in">
            {/* Completion Status Alert */}
            <div className="flex items-start gap-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-snug">
                <span className="font-semibold text-emerald-200 block">Đã ghép khung hoàn tất!</span>
                <span className="text-[11px] text-emerald-300/80">
                  Kéo để căn góc • Lăn chuột hoặc chụm 2 ngón để phóng to/thu nhỏ.
                </span>
              </div>
            </div>

            {/* Prominent Zalo Warning inside workspace */}
            {isInAppBrowser && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    LƯU Ý KHI TẢI ẢNH TRÊN ZALO
                  </span>
                  <span className="text-amber-400 text-[11px] font-mono animate-pulse">↗️ Dấu (...)</span>
                </div>
                <p className="text-[11.5px] text-amber-100 leading-relaxed">
                  Zalo chặn tải file. Vui lòng bấm vào <strong>dấu 3 chấm (...) ở góc trên cùng bên phải</strong> ➔ chọn <strong>"Mở bằng trình duyệt"</strong> (Safari/Chrome) để lưu ảnh HD!
                </p>
                {deviceType === 'android' ? (
                  <button
                    type="button"
                    onClick={handleOpenExternalBrowser}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tự Động Mở Bằng Google Chrome (Android)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenExternalBrowser}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300 font-medium text-xs hover:bg-zinc-800 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Đã chép link! Hãy mở Safari dán vào' : 'Sao Chép Link (Để dán vào Safari)'}
                  </button>
                )}
              </div>
            )}

            {/* Success Download Toast (temporary) */}
            {downloadSuccess && (
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs text-center font-medium animate-fade-in">
                🎉 Đã tải ảnh avatar chất lượng cao thành công về máy!
              </div>
            )}

            {/* Main Download CTA (Highest 2K Quality) */}
            <button
              type="button"
              onClick={handleDownloadOrExport}
              disabled={isDownloading}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xuất ảnh Ultra HD...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  TẢI VỀ AVATAR (CHẤT LƯỢNG CAO NHẤT)
                </>
              )}
            </button>

            {/* Change Photo & Reset Row */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Đổi Ảnh Khác
              </button>

              <button
                type="button"
                onClick={handleResetAdjustments}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                title="Căn giữa ảnh lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt Lại
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/60 py-2.5 text-center text-[10px] text-zinc-500">
        Trường THPT Vĩnh Thuận • Tỉnh Kiên Giang (1979)
      </footer>

      {/* EXPORT MODAL (For In-App Browser like Zalo / Facebook) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        previewUrl={exportedImageUrl}
        getBlob={getExportBlob}
        isInAppBrowser={isInAppBrowser}
      />
    </div>
  );
}

export default App;
