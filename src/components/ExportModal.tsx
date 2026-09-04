import React, { useState } from 'react';
import { Download, Share2, X, Check, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewUrl: string | null;
  getBlob: (res?: 1080 | 2048, format?: 'image/png' | 'image/jpeg') => Promise<Blob | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  previewUrl,
  getBlob,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [resolution, setResolution] = useState<1080 | 2048>(1080);
  const [fileFormat, setFileFormat] = useState<'image/png' | 'image/jpeg'>('image/png');

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

      const ext = fileFormat === 'image/jpeg' ? 'jpg' : 'png';
      const filename = `Avatar_THPT_VinhThuan_${resolution}p_${Date.now()}.${ext}`;

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

  const handleShare = async () => {
    try {
      const blob = await getBlob(1080, 'image/png');
      if (!blob) return;

      const file = new File([blob], 'Avatar_THPT_VinhThuan.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Avatar THPT Vĩnh Thuận',
          text: 'Ảnh đại diện chào năm học mới THPT Vĩnh Thuận',
          files: [file],
        });
      } else {
        alert('Trình duyệt chưa hỗ trợ chia sẻ trực tiếp file. Vui lòng bấm Tải Về!');
      }
    } catch (err) {
      console.log('Share canceled or error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-2xl overflow-hidden text-zinc-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Xuất Ảnh Đại Diện</h3>
            <p className="text-[11px] text-zinc-500 font-mono">Độ phân giải thực: {resolution} × {resolution} px</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-res Image Preview */}
        <div className="relative aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-black">
          <img
            src={previewUrl}
            alt="Preview Avatar"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Mobile in-app browser notice */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400">
          <Smartphone className="w-3.5 h-3.5 flex-shrink-0 text-zinc-500 mt-0.5" />
          <span>
            Người dùng Zalo / Facebook Mobile: Nếu không tải được, chạm giữ 2 giây vào ảnh phía trên rồi chọn <strong className="text-zinc-200">"Lưu hình ảnh"</strong>.
          </span>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
              Độ phân giải
            </label>
            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setResolution(1080)}
                className={`flex-1 py-1 rounded text-center transition cursor-pointer font-medium ${
                  resolution === 1080 ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                }`}
              >
                1080p
              </button>
              <button
                type="button"
                onClick={() => setResolution(2048)}
                className={`flex-1 py-1 rounded text-center transition cursor-pointer font-medium ${
                  resolution === 2048 ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                }`}
              >
                2K (Siêu Nét)
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
              Định dạng
            </label>
            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setFileFormat('image/png')}
                className={`flex-1 py-1 rounded text-center transition cursor-pointer font-medium ${
                  fileFormat === 'image/png' ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                }`}
              >
                PNG
              </button>
              <button
                type="button"
                onClick={() => setFileFormat('image/jpeg')}
                className={`flex-1 py-1 rounded text-center transition cursor-pointer font-medium ${
                  fileFormat === 'image/jpeg' ? 'bg-zinc-800 text-white' : 'text-zinc-500'
                }`}
              >
                JPG
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons (Titanium Studio Style) */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" /> Đã Tải Thành Công
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Tải Ảnh Về Máy
              </>
            )}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-zinc-700/60 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Chia sẻ trực tiếp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
