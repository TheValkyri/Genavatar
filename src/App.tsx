import React, { useState, useRef, useEffect } from 'react';
import { AvatarCanvas } from './components/AvatarCanvas';
import type { AvatarCanvasRef } from './components/AvatarCanvas';
import { TemplateSelector } from './components/TemplateSelector';
import { ControlsPanel } from './components/ControlsPanel';
import { ExportModal } from './components/ExportModal';
import { FRAME_TEMPLATES, SCHOOL_LOGO_PATH } from './constants/templates';
import type { FrameTemplate, ImageAdjustments, LogoSettings, StudentBadgeSettings, ActiveLayer } from './types';
import { 
  Upload, 
  Download, 
  RotateCcw,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<AvatarCanvasRef | null>(null);

  // Detect Zalo or In-App Browser
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/zalo|fbav|fban|messenger/i.test(ua)) {
      setIsInAppBrowser(true);
    }
  }, []);

  // Active Layer: 'photo' or 'logo'
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('photo');

  // Core States: DEFAULT IS FRAME_TEMPLATES[0] (Khung Chính Thức)
  const [selectedTemplate, setSelectedTemplate] = useState<FrameTemplate>(FRAME_TEMPLATES[0]);
  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);

  // Image Adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    zoom: 1.0,
    rotation: 0,
    flipH: false,
    panX: 0,
    panY: 0,
    brightness: 100,
    contrast: 100,
  });

  // Free Logo Positioning Settings
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    enabled: true,
    x: 0.18,
    y: 0.18,
    size: 95,
    rotation: 0,
    opacity: 1.0,
  });

  // Student Badge Settings
  const [studentBadge, setStudentBadge] = useState<StudentBadgeSettings>({
    enabled: false,
    fullName: '',
    className: '12A1',
    schoolYear: '2026 - 2027',
  });

  // Export Modal state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);

  const handleSelectTemplate = (template: FrameTemplate) => {
    setSelectedTemplate(template);
    if (template.hasEmbeddedLogo) {
      setActiveLayer('photo');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setActiveLayer('photo');
        setAdjustments((prev) => ({
          ...prev,
          zoom: 1.0,
          panX: 0,
          panY: 0,
          rotation: 0,
          flipH: false,
        }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load new fresh student sample portrait
  const handleLoadSample = () => {
    const img = new Image();
    img.onload = () => {
      setUserImage(img);
      setActiveLayer('photo');
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

  const handleUpdateLogoSettings = (newLogo: Partial<LogoSettings>) => {
    setLogoSettings((prev) => ({ ...prev, ...newLogo }));
  };

  const handleUpdateStudentBadge = (newBadge: Partial<StudentBadgeSettings>) => {
    setStudentBadge((prev) => ({ ...prev, ...newBadge }));
  };

  const handleOpenExport = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.exportImage(1080, 'image/png');
    if (dataUrl) {
      setExportedImageUrl(dataUrl);
      setIsExportOpen(true);
    }
  };

  const getExportBlob = (resolution: 1080 | 2048 = 1080, format: 'image/png' | 'image/jpeg' = 'image/png') => {
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

      {/* ZALO / IN-APP BROWSER ALERT BANNER */}
      {isInAppBrowser && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-2 text-amber-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">
              Đang mở trên Zalo: Bấm <strong>(...)</strong> góc trên ➔ Chọn <strong>"Mở bằng trình duyệt"</strong> để tải ảnh!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsInAppBrowser(false)}
            className="text-[10px] text-amber-400 hover:text-white flex-shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* REFINED COMPACT HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={SCHOOL_LOGO_PATH}
              alt="Logo THPT Vĩnh Thuận"
              className="w-7 h-7 object-contain rounded-full shadow-xs"
            />
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-white">
              THPT VĨNH THUẬN
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full bg-zinc-900/60">
            2026 - 2027
          </span>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-4 flex-1 w-full space-y-4">
        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left: Canvas Studio */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-2.5">
            <AvatarCanvas
              ref={canvasRef}
              userImage={userImage}
              selectedTemplate={selectedTemplate}
              adjustments={adjustments}
              logoSettings={logoSettings}
              studentBadge={studentBadge}
              activeLayer={activeLayer}
              setActiveLayer={setActiveLayer}
              onUpdateAdjustments={handleUpdateAdjustments}
              onUpdateLogoSettings={handleUpdateLogoSettings}
              onUploadClick={() => fileInputRef.current?.click()}
            />

            {/* Quick Action Toolbar */}
            <div className="w-full max-w-[420px] flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {userImage ? 'Đổi Ảnh' : 'Tải Ảnh Lên'}
              </button>

              <button
                type="button"
                onClick={handleLoadSample}
                className="flex items-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium transition cursor-pointer"
                title="Thử nhanh với ảnh mẫu"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Ảnh Mẫu
              </button>

              {userImage && (
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  title="Đặt lại ảnh"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Export CTA */}
            <button
              type="button"
              onClick={handleOpenExport}
              className="w-full max-w-[420px] py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Tải Avatar HD (1080p)
            </button>
          </div>

          {/* Right: Frames & Controls */}
          <div className="lg:col-span-6 space-y-3">
            {/* 1. Template Selector */}
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
            />

            {/* 2. Controls Panel */}
            <ControlsPanel
              adjustments={adjustments}
              logoSettings={logoSettings}
              studentBadge={studentBadge}
              activeLayer={activeLayer}
              hasUserImage={!!userImage}
              selectedTemplate={selectedTemplate}
              setActiveLayer={setActiveLayer}
              onUpdateAdjustments={handleUpdateAdjustments}
              onUpdateLogoSettings={handleUpdateLogoSettings}
              onUpdateStudentBadge={handleUpdateStudentBadge}
              onResetAdjustments={handleResetAdjustments}
            />
          </div>
        </div>
      </main>

      {/* COMPACT FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/60 py-3 text-center text-[11px] text-zinc-500">
        Trường THPT Vĩnh Thuận • Tỉnh Kiên Giang (1979)
      </footer>

      {/* EXPORT MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        previewUrl={exportedImageUrl}
        getBlob={getExportBlob}
      />
    </div>
  );
}

export default App;
