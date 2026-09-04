import React, { useState } from 'react';
import { Download, Share2, X, Check, AlertTriangle, Copy, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  getBlob: (res?: 1080 | 2048, format?: 'image/png' | 'image/jpeg') => Promise<Blob | null>;
  isInAppBrowser?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  previewUrl,
  getBlob,
  isInAppBrowser = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resolution] = useState<1080 | 2048>(2048);
  const [fileFormat] = useState<'image/png' | 'image/jpeg'>('image/png');

  if (!isOpen || !previewUrl) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#ffffff', '#38bdf8', '#fbbf24', '#f43f5e'],
    });
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await getBlob(resolution, fileFormat);
      if (!blob) return;

      const ext = 'png';
      const filename = `Avatar_THPT_VinhThuan_${Date.now()}.${ext}`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setDownloadSuccess(true);
      triggerConfetti();
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Try Native Web Share API to directly save to Photos/Gallery without external browser
  const handleShare = async () => {
    try {
      setIsDownloading(true);
      const blob = await getBlob(2048, 'image/png');
      if (!blob) return;

      const file = new File([blob], `Avatar_THPT_VinhThuan_${Date.now()}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Avatar THPT Vĩnh Thuận',
          text: 'Ảnh đại diện chào năm học mới THPT Vĩnh Thuận',
          files: [file],
        });
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.log('Share error or canceled:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Try Android Intent to trigger external Chrome directly
  const handleOpenAndroidBrowser = () => {
    const isAndroid = /android/i.test(navigator.userAgent);
    if (isAndroid) {
      const url = window.location.href.replace(/https?:\/\//, '');
      window.location.href = `intent://${url}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
    } else {
      handleCopyLink();
    }
  };

  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden text-zinc-200 space-y-3.5 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <div>
            <h3 className="text-sm font-semibold text-white">Xuất Ảnh Đại Diện</h3>
            <p className="text-[11px] text-zinc-500 font-mono">2048 × 2048 px (Ultra HD)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-res Image Preview (Protected from long-press crashing Zalo) */}
        <div className="relative aspect-square max-w-[220px] mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-black">
          <img
            src={previewUrl}
            alt="Preview Avatar"
            className="w-full h-full object-contain pointer-events-none select-none"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* ZALO / IN-APP BROWSER PROMINENT GUIDE BANNER */}
        {isInAppBrowser ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-xs space-y-2 relative overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between font-bold text-amber-300">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
                HƯỚNG DẪN TẢI ẢNH TRÊN ZALO
              </span>
              <span className="text-amber-400 font-bold animate-pulse text-xs font-mono">↗️ Góc trên cùng</span>
            </div>

            <p className="text-amber-100 text-[11.5px] leading-relaxed">
              Zalo chặn lưu file trực tiếp. Để ảnh lưu vào máy sắc nét, bạn thực hiện <strong>2 bước</strong> sau:
            </p>

            <div className="space-y-1.5 bg-black/50 p-2.5 rounded-xl text-[11.5px] border border-amber-500/30">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <span className="text-amber-100">Bấm vào <strong>dấu 3 chấm (...)</strong> ở góc trên cùng bên phải màn hình Zalo.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <span className="text-amber-100">Chọn <strong>"Mở bằng trình duyệt"</strong> (Safari trên iPhone hoặc Chrome trên Android).</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-300/80 italic text-center">
              ⚠️ Không đè giữ ảnh để tránh bị văng ứng dụng Zalo.
            </p>
          </div>
        ) : (
          /* Normal Browser Auto Quality Indicator */
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Độ nét xuất file:
            </span>
            <span className="font-mono text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              2048 × 2048 px (Gốc)
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Main Action based on browser environment */}
          {isInAppBrowser ? (
            <>
              {/* Button: Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Đã chép link! Dán vào Safari/Chrome' : '1. Sao Chép Link (Để dán vào Safari/Chrome)'}
              </button>

              {/* Android Intent Quick Launch (if Android) */}
              {isAndroid && (
                <button
                  type="button"
                  onClick={handleOpenAndroidBrowser}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  2. Mở Thẳng Bằng Google Chrome
                </button>
              )}

              {/* Try Native Share Sheet */}
              <button
                type="button"
                onClick={handleShare}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition cursor-pointer disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                Thử Lưu Ảnh Qua Menu Chia Sẻ
              </button>
            </>
          ) : (
            /* Normal Browser Direct Download */
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" /> Đã Tải Thành Công!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Tải Ảnh Về Máy (2048px)
                </>
              )}
            </button>
          )}

          {!isInAppBrowser && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Đã chép link' : 'Sao chép link'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Chia sẻ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
