import React from 'react';
import type { ImageAdjustments, LogoSettings, StudentBadgeSettings, ActiveLayer, FrameTemplate } from '../types';
import { 
  RotateCw, 
  FlipHorizontal, 
  RotateCcw, 
  ZoomIn, 
  Sliders, 
  School, 
  User, 
  Tag, 
  Sun, 
  Compass,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface ControlsPanelProps {
  adjustments: ImageAdjustments;
  logoSettings: LogoSettings;
  studentBadge: StudentBadgeSettings;
  activeLayer: ActiveLayer;
  hasUserImage: boolean;
  selectedTemplate: FrameTemplate;
  setActiveLayer: (layer: ActiveLayer) => void;
  onUpdateAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  onUpdateLogoSettings: (logo: Partial<LogoSettings>) => void;
  onUpdateStudentBadge: (badge: Partial<StudentBadgeSettings>) => void;
  onResetAdjustments: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  adjustments,
  logoSettings,
  studentBadge,
  activeLayer,
  hasUserImage,
  selectedTemplate,
  setActiveLayer,
  onUpdateAdjustments,
  onUpdateLogoSettings,
  onUpdateStudentBadge,
  onResetAdjustments,
}) => {
  const snapLogo = (x: number, y: number) => {
    onUpdateLogoSettings({ x, y });
    setActiveLayer('logo');
  };

  const isEmbeddedLogo = !!selectedTemplate.hasEmbeddedLogo;

  return (
    <div className="w-full bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-xl space-y-4 text-zinc-300">
      {/* Studio Header Tabs */}
      <div className="flex border-b border-zinc-800/80 pb-2.5 gap-1.5 items-center">
        <button
          type="button"
          onClick={() => setActiveLayer('photo')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeLayer === 'photo'
              ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Chân Dung
        </button>

        <button
          type="button"
          onClick={() => !isEmbeddedLogo && setActiveLayer('logo')}
          disabled={isEmbeddedLogo}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            activeLayer === 'logo'
              ? 'bg-zinc-800 text-sky-300 border border-sky-500/30 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={isEmbeddedLogo ? 'Khung này đã có sẵn logo trường' : 'Tùy chỉnh vị trí Logo trường'}
        >
          <School className="w-3.5 h-3.5" />
          Logo Trường {isEmbeddedLogo && '(Đã in sẵn)'}
        </button>

        <button
          type="button"
          onClick={() => onUpdateStudentBadge({ enabled: !studentBadge.enabled })}
          className={`ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            studentBadge.enabled
              ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          {studentBadge.enabled ? 'Huy Hiệu Tên: Bật' : 'Huy Hiệu: Tắt'}
        </button>
      </div>

      {/* PANEL 1: PHOTO ADJUSTMENTS */}
      {activeLayer === 'photo' && (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Transform Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasUserImage}
              onClick={() => onUpdateAdjustments({ rotation: (adjustments.rotation + 90) % 360 })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              Xoay 90°
            </button>

            <button
              type="button"
              disabled={!hasUserImage}
              onClick={() => onUpdateAdjustments({ flipH: !adjustments.flipH })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              Lật Gương
            </button>

            <button
              type="button"
              disabled={!hasUserImage}
              onClick={onResetAdjustments}
              className="py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-400 disabled:opacity-40 transition cursor-pointer"
              title="Đặt lại ảnh về trung tâm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Control */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ZoomIn className="w-3.5 h-3.5 text-zinc-500" /> Tỉ lệ phóng to (Zoom)
              </span>
              <span className="font-mono text-zinc-200">{Math.round(adjustments.zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.05"
              disabled={!hasUserImage}
              value={adjustments.zoom}
              onChange={(e) => onUpdateAdjustments({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-zinc-200 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
            />
          </div>

          {/* Exposure & Tone Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-zinc-800/60">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sun className="w-3 h-3 text-zinc-500" /> Độ sáng
                </span>
                <span className="font-mono text-zinc-300">{adjustments.brightness}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                step="2"
                disabled={!hasUserImage}
                value={adjustments.brightness}
                onChange={(e) => onUpdateAdjustments({ brightness: parseInt(e.target.value, 10) })}
                className="w-full accent-zinc-200 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-zinc-500" /> Tương phản
                </span>
                <span className="font-mono text-zinc-300">{adjustments.contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="140"
                step="2"
                disabled={!hasUserImage}
                value={adjustments.contrast}
                onChange={(e) => onUpdateAdjustments({ contrast: parseInt(e.target.value, 10) })}
                className="w-full accent-zinc-200 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: FREE LOGO CONTROLS (Only when not embedded) */}
      {activeLayer === 'logo' && !isEmbeddedLogo && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={logoSettings.enabled}
                onChange={(e) => onUpdateLogoSettings({ enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-sky-500"
              />
              Hiển thị Logo THPT Vĩnh Thuận
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              {logoSettings.enabled ? 'Đang bật' : 'Đã ẩn'}
            </span>
          </div>

          {logoSettings.enabled && (
            <>
              {/* Quick Snap Alignment */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Compass className="w-3.5 h-3.5 text-zinc-500" /> Gắn nhanh vào góc (Snap)
                  </span>
                  <span className="text-[11px] text-zinc-500">hoặc chạm kéo trực tiếp trên ảnh</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => snapLogo(0.18, 0.18)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition"
                  >
                    <ArrowUpLeft className="w-3.5 h-3.5" /> Trái trên
                  </button>
                  <button
                    type="button"
                    onClick={() => snapLogo(0.82, 0.18)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Phải trên
                  </button>
                  <button
                    type="button"
                    onClick={() => snapLogo(0.18, 0.82)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Trái dưới
                  </button>
                  <button
                    type="button"
                    onClick={() => snapLogo(0.82, 0.82)}
                    className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Phải dưới
                  </button>
                </div>
              </div>

              {/* Free Coordinates Sliders */}
              <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Vị trí X (Ngang)</span>
                    <span className="font-mono text-sky-400">{Math.round(logoSettings.x * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.01"
                    value={logoSettings.x}
                    onChange={(e) => onUpdateLogoSettings({ x: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Vị trí Y (Dọc)</span>
                    <span className="font-mono text-sky-400">{Math.round(logoSettings.y * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.95"
                    step="0.01"
                    value={logoSettings.y}
                    onChange={(e) => onUpdateLogoSettings({ y: parseFloat(e.target.value) })}
                    className="w-full accent-sky-400 cursor-pointer h-1 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Size & Rotation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3 text-zinc-500" /> Cỡ logo
                    </span>
                    <span className="font-mono text-zinc-200">{logoSettings.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="5"
                    value={logoSettings.size}
                    onChange={(e) => onUpdateLogoSettings({ size: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Góc xoay</span>
                    <span className="font-mono text-zinc-200">{logoSettings.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={logoSettings.rotation}
                    onChange={(e) => onUpdateLogoSettings({ rotation: parseInt(e.target.value, 10) })}
                    className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Embedded Logo Notice if activeLayer was logo but frame has embedded logo */}
      {isEmbeddedLogo && (
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            Khung chính thức này đã tích hợp sẵn Logo THPT Vĩnh Thuận nguyên bản ở góc chân khung. Hệ thống tự động tắt logo nổi để đảm bảo bố cục chuẩn đẹp nhất.
          </span>
        </div>
      )}

      {/* STUDENT BADGE SECTION */}
      {studentBadge.enabled && (
        <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5 text-xs animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-medium text-amber-300/90 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Thông tin Huy hiệu Tên & Lớp
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Họ và Tên</label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                maxLength={28}
                value={studentBadge.fullName}
                onChange={(e) => onUpdateStudentBadge({ fullName: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Lớp</label>
                <input
                  type="text"
                  placeholder="VD: 12A1"
                  maxLength={10}
                  value={studentBadge.className}
                  onChange={(e) => onUpdateStudentBadge({ className: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Niên khóa</label>
                <input
                  type="text"
                  placeholder="VD: 2026 - 2027"
                  maxLength={15}
                  value={studentBadge.schoolYear}
                  onChange={(e) => onUpdateStudentBadge({ schoolYear: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
