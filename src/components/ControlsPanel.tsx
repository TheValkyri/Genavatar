import React, { useState } from 'react';
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
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
  Maximize2
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
  activeLayer: _activeLayer,
  hasUserImage,
  selectedTemplate,
  setActiveLayer,
  onUpdateAdjustments,
  onUpdateLogoSettings,
  onUpdateStudentBadge,
  onResetAdjustments,
}) => {
  const isEmbeddedLogo = !!selectedTemplate.hasEmbeddedLogo;
  const [activeTab, setActiveTab] = useState<'adjust' | 'logo' | 'badge'>('adjust');

  const snapLogo = (x: number, y: number) => {
    onUpdateLogoSettings({ x, y });
    setActiveLayer('logo');
  };

  return (
    <div className="w-full bg-zinc-900/90 rounded-2xl p-3 sm:p-4 border border-zinc-800 shadow-lg space-y-3 text-zinc-300">
      {/* Studio Header Tabs */}
      <div className="flex border-b border-zinc-800/80 pb-2 gap-1.5 items-center text-xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('adjust');
            setActiveLayer('photo');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'adjust'
              ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Chỉnh Ảnh
        </button>

        {!isEmbeddedLogo && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('logo');
              setActiveLayer('logo');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'logo'
                ? 'bg-zinc-800 text-sky-300 border border-sky-500/30 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Logo Trường
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setActiveTab('badge');
            if (!studentBadge.enabled) onUpdateStudentBadge({ enabled: true });
          }}
          className={`ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
            activeTab === 'badge' || studentBadge.enabled
              ? 'bg-zinc-800 text-amber-300 border border-amber-500/30'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          {studentBadge.enabled ? 'Tên & Lớp: Bật' : 'Tên & Lớp'}
        </button>
      </div>

      {/* TAB 1: CHỈNH ẢNH (Transform + Tone) */}
      {activeTab === 'adjust' && (
        <div className="space-y-3 animate-fade-in">
          {/* Quick Action Row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!hasUserImage}
              onClick={() => onUpdateAdjustments({ rotation: (adjustments.rotation + 90) % 360 })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              Xoay 90°
            </button>

            <button
              type="button"
              disabled={!hasUserImage}
              onClick={() => onUpdateAdjustments({ flipH: !adjustments.flipH })}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 disabled:opacity-40 transition cursor-pointer"
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              Lật Gương
            </button>

            <button
              type="button"
              disabled={!hasUserImage}
              onClick={onResetAdjustments}
              className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-400 disabled:opacity-40 transition cursor-pointer"
              title="Đặt lại ảnh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-zinc-500" /> Phóng to (Zoom)
              </span>
              <span className="font-mono text-zinc-300">{Math.round(adjustments.zoom * 100)}%</span>
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

          {/* Brightness & Contrast 2-col */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
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

      {/* TAB 2: LOGO TRƯỜNG (Chỉ khi khung chưa có logo) */}
      {activeTab === 'logo' && !isEmbeddedLogo && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={logoSettings.enabled}
                onChange={(e) => onUpdateLogoSettings({ enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-sky-500"
              />
              Bật Logo Trường
            </label>
            <span className="text-[10px] text-zinc-500">Kéo tự do trên ảnh</span>
          </div>

          {logoSettings.enabled && (
            <>
              {/* Quick Snap Corners */}
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => snapLogo(0.18, 0.18)}
                  className="py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 flex items-center justify-center gap-0.5"
                >
                  <ArrowUpLeft className="w-3 h-3" /> Trái trên
                </button>
                <button
                  type="button"
                  onClick={() => snapLogo(0.82, 0.18)}
                  className="py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 flex items-center justify-center gap-0.5"
                >
                  <ArrowUpRight className="w-3 h-3" /> Phải trên
                </button>
                <button
                  type="button"
                  onClick={() => snapLogo(0.18, 0.82)}
                  className="py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 flex items-center justify-center gap-0.5"
                >
                  <ArrowDownLeft className="w-3 h-3" /> Trái dưới
                </button>
                <button
                  type="button"
                  onClick={() => snapLogo(0.82, 0.82)}
                  className="py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 flex items-center justify-center gap-0.5"
                >
                  <ArrowDownRight className="w-3 h-3" /> Phải dưới
                </button>
              </div>

              {/* Size Slider */}
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
                  max="180"
                  step="5"
                  value={logoSettings.size}
                  onChange={(e) => onUpdateLogoSettings({ size: parseInt(e.target.value, 10) })}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: TÊN & LỚP (Student Badge) */}
      {activeTab === 'badge' && (
        <div className="space-y-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-medium text-amber-300 cursor-pointer">
              <input
                type="checkbox"
                checked={studentBadge.enabled}
                onChange={(e) => onUpdateStudentBadge({ enabled: e.target.checked })}
                className="w-4 h-4 rounded accent-amber-500"
              />
              In Tên & Lớp lên ảnh
            </label>
          </div>

          {studentBadge.enabled && (
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <input
                type="text"
                placeholder="Họ và Tên (VD: Nguyễn Văn A)"
                maxLength={28}
                value={studentBadge.fullName}
                onChange={(e) => onUpdateStudentBadge({ fullName: e.target.value })}
                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Lớp (VD: 12A1)"
                  maxLength={10}
                  value={studentBadge.className}
                  onChange={(e) => onUpdateStudentBadge({ className: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
                <input
                  type="text"
                  placeholder="Niên khóa"
                  maxLength={15}
                  value={studentBadge.schoolYear}
                  onChange={(e) => onUpdateStudentBadge({ schoolYear: e.target.value })}
                  className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
