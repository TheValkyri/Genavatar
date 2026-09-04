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

        <div className="ml-auto flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('badge')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
              activeTab === 'badge'
                ? 'bg-zinc-800 text-amber-300 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            Tên & Lớp
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const nextState = !studentBadge.enabled;
              onUpdateStudentBadge({ enabled: nextState });
              if (nextState) {
                setActiveTab('badge');
              }
            }}
            title={studentBadge.enabled ? "Bấm để tắt in Tên & Lớp" : "Bấm để bật in Tên & Lớp"}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold tracking-wide uppercase transition cursor-pointer ${
              studentBadge.enabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {studentBadge.enabled ? 'Bật' : 'Tắt'}
          </button>
        </div>
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
        <div className="space-y-3 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-amber-300 block">Huy hiệu Tên & Lớp</span>
              <span className="text-[11px] text-zinc-500">In họ tên, lớp & niên khóa ở chân avatar</span>
            </div>

            {/* iOS style toggle switch */}
            <button
              type="button"
              onClick={() => onUpdateStudentBadge({ enabled: !studentBadge.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                studentBadge.enabled ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                  studentBadge.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {studentBadge.enabled ? (
            <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  maxLength={28}
                  value={studentBadge.fullName}
                  onChange={(e) => onUpdateStudentBadge({ fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Lớp:</label>
                  <input
                    type="text"
                    placeholder="VD: 12A1"
                    maxLength={10}
                    value={studentBadge.className}
                    onChange={(e) => onUpdateStudentBadge({ className: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Niên khóa:</label>
                  <input
                    type="text"
                    placeholder="VD: 2026 - 2027"
                    maxLength={15}
                    value={studentBadge.schoolYear}
                    onChange={(e) => onUpdateStudentBadge({ schoolYear: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onUpdateStudentBadge({ enabled: false })}
                  className="text-[11px] text-zinc-400 hover:text-red-400 transition cursor-pointer py-1 px-2.5 rounded hover:bg-zinc-900 flex items-center gap-1"
                >
                  ✕ Tắt không in huy hiệu này
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-zinc-900/40 rounded-lg border border-dashed border-zinc-800 text-zinc-400 text-xs flex flex-col items-center gap-2">
              <span>Huy hiệu Tên & Lớp đang tắt (không in lên ảnh).</span>
              <button
                type="button"
                onClick={() => onUpdateStudentBadge({ enabled: true })}
                className="py-1 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-medium rounded-lg text-xs border border-amber-500/30 transition cursor-pointer"
              >
                Bật in Tên & Lớp
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
