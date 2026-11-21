import React, { useState } from 'react';
import { FOLLOW_UPS, type CategoryDef } from '../data/discoveryConfig';
import type { CategoryPriority, DiscoveryState } from '../utils/discoveryLogic';
import { getFollowUpValue } from '../utils/discoveryLogic';
import { VisualDiagram } from './VisualDiagram';

interface FeatureCategoryCardProps {
  category: CategoryDef;
  priority: CategoryPriority | undefined;
  state: DiscoveryState;
  isHighlighted?: boolean;
  onSetPriority: (catId: string, priority: CategoryPriority) => void;
  onToggleFollowUp: (catId: string, qIdx: number, mode: 'one' | 'many', optIdx: number) => void;
}

export const FeatureCategoryCard: React.FC<FeatureCategoryCardProps> = ({
  category,
  priority,
  state,
  isHighlighted = false,
  onSetPriority,
  onToggleFollowUp,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const followUps = FOLLOW_UPS[category.id] || [];
  const isMustHave = priority === 2;

  const borderClass =
    priority === 2
      ? 'border-[var(--orbi-teal)] ring-1 ring-[var(--orbi-teal)] md:col-span-2'
      : priority === 1
        ? 'border-[var(--orbi-teal)] border-dashed'
        : priority === 0
          ? 'border-[var(--orbi-line)] opacity-65'
          : 'border-[var(--orbi-line)]';

  return (
    <div
      id={`cat-card-${category.id}`}
      className={`rounded-2xl border bg-[var(--orbi-card)] overflow-hidden transition-all duration-200 ${borderClass} ${
        isHighlighted ? 'ring-2 ring-[var(--orbi-teal)]' : ''
      }`}
    >
      <div className={isMustHave ? 'grid md:grid-cols-12' : 'flex flex-col h-full'}>
        {/* Left / Top Visual + Core Priority Selector */}
        <div className={isMustHave ? 'md:col-span-5 flex flex-col border-b md:border-b-0 md:border-r border-[var(--orbi-line)]' : 'flex flex-col h-full'}>
          {/* Visual Media Header */}
          <div className="relative aspect-[4/3] w-full bg-[var(--orbi-surface)] border-b border-[var(--orbi-line)] overflow-hidden">
            {category.visual.kind === 'photo' && !imgFailed ? (
              <>
                <img
                  src={category.visual.src}
                  alt={category.visual.alt}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 py-2.5">
                  <p className="text-[11.5px] leading-snug text-white/95 font-medium">
                    {category.visual.caption}
                  </p>
                </div>
              </>
            ) : category.visual.kind === 'diagram' ? (
              <div className="w-full h-full flex flex-col justify-between">
                <VisualDiagram diagramId={category.visual.diagramId} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-[var(--orbi-mute)]">
                {category.visual.caption}
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4 flex flex-col flex-1 gap-2.5">
            <div>
              <h3 className="text-lg font-semibold text-[var(--orbi-ink)]">{category.name}</h3>
              <p className="text-sm text-[var(--orbi-mute)] mt-1 leading-relaxed">
                {category.description}
              </p>
            </div>
            <p className="text-xs text-[var(--orbi-ink)]/85 bg-[var(--orbi-surface)] rounded-lg px-3 py-2 border border-[var(--orbi-line)]">
              Example: {category.example}
            </p>

            {/* 3-State Segmented Priority Control */}
            <div
              className="mt-auto pt-2 grid grid-cols-3 rounded-xl border border-[var(--orbi-line)] overflow-hidden"
              role="group"
              aria-label={`Priority for ${category.name}`}
            >
              {([
                ['Must have', 2],
                ['Nice to have', 1],
                ['Not needed', 0],
              ] as const).map(([label, val], idx) => {
                const active = priority === val;
                return (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSetPriority(category.id, val)}
                    className={`min-h-[42px] px-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      idx > 0 ? 'border-l border-[var(--orbi-line)]' : ''
                    } ${
                      active
                        ? 'bg-[var(--orbi-teal)] text-[var(--orbi-onteal)]'
                        : 'bg-transparent text-[var(--orbi-ink)] hover:bg-[var(--orbi-surface)]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Conditional Follow-Up Panel when Must Have is selected */}
        {isMustHave && (
          <div className="md:col-span-7 p-5 bg-[var(--orbi-surface)]/55 flex flex-col gap-4" aria-live="polite">
            <div className="flex items-center justify-between gap-2 border-b border-dashed border-[var(--orbi-line)] pb-2.5">
              <p className="text-xs font-semibold text-[var(--orbi-teal)]">
                Quick sizing details for {category.name} (optional)
              </p>
              <span className="text-xs text-[var(--orbi-mute)]">Helps us quote accurately</span>
            </div>

            {followUps.map((q, qIdx) => {
              const current = getFollowUpValue(state, category.id, qIdx);
              return (
                <div key={q.question} role="group" aria-label={q.question} className="space-y-2">
                  <span className="block text-sm font-semibold text-[var(--orbi-ink)]">
                    {q.question}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, optIdx) => {
                      const pressed = Array.isArray(current)
                        ? current.includes(optIdx)
                        : current === optIdx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => onToggleFollowUp(category.id, qIdx, q.mode, optIdx)}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            pressed
                              ? 'bg-[var(--orbi-teal)] border-[var(--orbi-teal)] text-[var(--orbi-onteal)]'
                              : 'bg-[var(--orbi-card)] border-[var(--orbi-line)] text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
