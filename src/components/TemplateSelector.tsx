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
  const [filter, setFilter] = useState<'all' | FrameCategory>('all');

  const filteredTemplates = filter === 'all'
    ? FRAME_TEMPLATES
    : FRAME_TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="w-full bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800 shadow-lg space-y-2.5">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-300">
          Chọn Khung Avatar
        </span>

        <div className="flex p-0.5 bg-zinc-950 rounded-lg border border-zinc-800/80 text-[11px]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              filter === 'all'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilter('student')}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              filter === 'student'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Học sinh 2D
          </button>
          <button
            type="button"
            onClick={() => setFilter('ceremony')}
            className={`px-2 py-1 rounded transition cursor-pointer ${
              filter === 'ceremony'
                ? 'bg-zinc-800 text-amber-300 font-medium shadow-xs'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Trang trọng
          </button>
        </div>
      </div>

      {/* Frame cards carousel */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredTemplates.map((template) => {
          const isSelected = template.id === selectedTemplate.id;
          const isOfficial = !!template.isOfficial;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template)}
              className={`flex-shrink-0 w-24 text-left rounded-xl p-1.5 border transition duration-150 cursor-pointer ${
                isSelected
                  ? isOfficial
                    ? 'bg-zinc-800 border-amber-400/80 ring-1 ring-amber-400/40 shadow-md'
                    : 'bg-zinc-800 border-zinc-400/70 ring-1 ring-white/20 shadow-md'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
              }`}
            >
              <div className="relative aspect-square rounded-lg bg-zinc-900 overflow-hidden border border-zinc-800 mb-1 flex items-center justify-center">
                <img
                  src={template.src}
                  alt={template.name}
                  className="w-full h-full object-contain p-0.5"
                  loading="lazy"
                />
                {isOfficial && (
                  <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-amber-500 text-zinc-950 font-bold text-[8px] flex items-center gap-0.5 shadow">
                    <Star className="w-2 h-2 fill-zinc-950" /> Gốc
                  </div>
                )}
                {isSelected && (
                  <div className={`absolute top-1 right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow ${
                    isOfficial ? 'bg-amber-400 text-zinc-950' : 'bg-white text-zinc-950'
                  }`}>
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
  );
};
