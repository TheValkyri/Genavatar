import React, { useState } from 'react';
import type { FrameTemplate, FrameCategory } from '../types';
import { FRAME_TEMPLATES } from '../constants/templates';
import { Check, Star } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: FrameTemplate;
  onSelectTemplate: (template: FrameTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  const officialTemplate = FRAME_TEMPLATES[0]; // Khung chính thức
  const otherTemplates = FRAME_TEMPLATES.slice(1);

  const [activeCategory, setActiveCategory] = useState<FrameCategory>('student');

  const filteredOtherTemplates = otherTemplates.filter((t) => t.category === activeCategory);

  const isOfficialSelected = selectedTemplate.id === officialTemplate.id;

  return (
    <div className="w-full bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 shadow-xl space-y-3.5">
      {/* 1. HERO OFFICIAL FRAME (Khung Chính Thức Nổi Bật) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Khung Chính Thức THPT Vĩnh Thuận
          </span>
          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
            Mặc định
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelectTemplate(officialTemplate)}
          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition duration-150 cursor-pointer text-left ${
            isOfficialSelected
              ? 'bg-zinc-800/90 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
              : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
          }`}
        >
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800 flex items-center justify-center">
            <img
              src={officialTemplate.src}
              alt={officialTemplate.name}
              className="w-full h-full object-contain p-0.5"
            />
            {isOfficialSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                {officialTemplate.name}
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
              {officialTemplate.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                ✓ Đã có sẵn Logo trường
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">2026 - 2027</span>
            </div>
          </div>
        </button>
      </div>

      {/* 2. OTHER TEMPLATES (Mẫu Khung Tham Khảo Khác) */}
      <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-medium">
            Các Mẫu Tham Khảo Khác
          </span>

          <div className="flex p-0.5 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('student')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                activeCategory === 'student'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700/80'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Học Sinh 2D (6)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('ceremony')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                activeCategory === 'ceremony'
                  ? 'bg-zinc-800 text-amber-300 shadow-xs border border-amber-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Trang Trọng (2)
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {filteredOtherTemplates.map((template) => {
            const isSelected = template.id === selectedTemplate.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate(template)}
                className={`flex-shrink-0 w-24 text-left rounded-xl p-1.5 border transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800/90 border-zinc-400/60 shadow-md ring-1 ring-white/20 scale-[1.02]'
                    : 'bg-zinc-950/60 border-zinc-800/70 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="relative aspect-square rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800 mb-1.5 flex items-center justify-center">
                  <img
                    src={template.src}
                    alt={template.name}
                    className="w-full h-full object-contain p-1"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-medium text-zinc-200 truncate">{template.name}</p>
                <span className="text-[9px] text-zinc-500 block truncate font-mono">{template.badgeText}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
