import React, { useState, useRef } from 'react';
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
  Sparkles
} from 'lucide-react';

export function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<AvatarCanvasRef | null>(null);

  // Active Layer: 'photo' or 'logo'
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('photo');

  // Core States: DEFAULT IS NOW FRAME_TEMPLATES[0] (Khung Chính Thức)
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

  // Free Logo Positioning Settings (For frames that don't have embedded logo)
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

  // Switch Template handler
  const handleSelectTemplate = (template: FrameTemplate) => {
    setSelectedTemplate(template);
    if (template.hasEmbeddedLogo) {
      setActiveLayer('photo');
    }
  };

  // File Upload Handler
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

  // Load sample portrait for instant preview
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

      {/* REFINED EDITORIAL HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={SCHOOL_LOGO_PATH}
              alt="Logo THPT Vĩnh Thuận"
              className="w-9 h-9 object-contain rounded-full shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  THPT VĨNH THUẬN
                </span>
                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded">
                  1979
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Trình tạo ảnh đại diện chào năm học mới 2026 - 2027</p>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono hidden sm:block">
            100% Client-side Canvas
          </div>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Workspace Title */}
        <div className="text-center space-y-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100">
            Khung Ảnh Đại Diện Tựu Trường 2026 - 2027
          </h1>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Khung chính thức THPT Vĩnh Thuận đã sẵn sàng. Tải ảnh của bạn lên và căn chỉnh dễ dàng!
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Canvas Studio Artboard */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-3.5">
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
            <div className="w-full max-w-[440px] flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {userImage ? 'Đổi Ảnh Chân Dung' : 'Tải Ảnh Của Bạn Lên'}
              </button>

              {!userImage && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 font-medium transition cursor-pointer"
                  title="Thử nhanh với ảnh mẫu"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Thử Ảnh Mẫu
                </button>
              )}

              {userImage && (
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  title="Đặt lại ảnh ban đầu"
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Export Button */}
            <button
              type="button"
              onClick={handleOpenExport}
              className="w-full max-w-[440px] py-3.5 px-6 rounded-xl bg-zinc-800 hover:bg-zinc-700/90 text-white font-medium text-xs sm:text-sm border border-zinc-700/80 shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Xuất Ảnh Đại Diện HD (1080p)
            </button>
          </div>

          {/* Right: Studio Inspector & Templates */}
          <div className="lg:col-span-6 space-y-4">
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

      {/* MINIMALIST FOOTER */}
      <footer className="mt-auto border-t border-zinc-800/80 py-5 text-center text-xs text-zinc-500">
        <p>Trường THPT Vĩnh Thuận • Huyện Vĩnh Thuận, Tỉnh Kiên Giang</p>
        <p className="text-[11px] text-zinc-600 mt-0.5">Thành lập 1979 • Xử lý trực tiếp trên trình duyệt</p>
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
