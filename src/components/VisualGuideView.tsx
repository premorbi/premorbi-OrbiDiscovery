import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CATEGORIES, KEYPAD_PHOTO, PAIN_POINTS } from '../data/discoveryConfig';
import type { CategoryPriority } from '../utils/discoveryLogic';
import { VisualDiagram } from './VisualDiagram';

interface VisualGuideViewProps {
  cats: Record<string, CategoryPriority>;
  onSetPriority: (catId: string, priority: CategoryPriority) => void;
  onStartQuestionnaire: () => void;
}

export const VisualGuideView: React.FC<VisualGuideViewProps> = ({
  cats,
  onSetPriority,
  onStartQuestionnaire,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'selected'>('all');

  const visibleCats =
    filterMode === 'selected'
      ? CATEGORIES.filter((c) => (cats[c.id] || 0) > 0)
      : CATEGORIES;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--orbi-line)] pb-6">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--orbi-ink)] text-balance">
            Visual Smart Home Guide
          </h1>
          <p className="text-[var(--orbi-mute)] text-base leading-relaxed">
            Explore real residential installations and technical diagrams so you can see exactly how each automation system fits into daily life before selecting your priorities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--orbi-surface)] border border-[var(--orbi-line)]">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                filterMode === 'all'
                  ? 'bg-[var(--orbi-card)] text-[var(--orbi-ink)] shadow-xs'
                  : 'text-[var(--orbi-mute)] hover:text-[var(--orbi-ink)]'
              }`}
            >
              All 12 Systems
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('selected')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                filterMode === 'selected'
                  ? 'bg-[var(--orbi-card)] text-[var(--orbi-ink)] shadow-xs'
                  : 'text-[var(--orbi-mute)] hover:text-[var(--orbi-ink)]'
              }`}
            >
              Selected ({CATEGORIES.filter((c) => (cats[c.id] || 0) > 0).length})
            </button>
          </div>
          <button
            type="button"
            onClick={onStartQuestionnaire}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer whitespace-nowrap"
          >
            Back to Questionnaire
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keypad + Wiring Readiness Spotlight */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] overflow-hidden flex flex-col">
          <div className="aspect-[4/3] bg-[var(--orbi-surface)] overflow-hidden">
            <img
              src={KEYPAD_PHOTO.src}
              alt={KEYPAD_PHOTO.alt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-[var(--orbi-ink)]">
              Why scene keypads replace switch clutter
            </h2>
            <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
              Instead of guessing across 10 identical rocker switches, engraved glass or brushed metal keypads trigger whole-room moods in a single press.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-lg font-semibold text-[var(--orbi-ink)]">
              Wired KNX vs Wireless Retrofit — how your home stage decides
            </h2>
            <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
              If walls are still open during construction or renovation, we run dedicated bus cables for lifetime reliability. If walls are already painted, compact wireless modules hide cleanly behind your existing switches.
            </p>
          </div>
          <VisualDiagram diagramId="wiring" />
        </div>
      </div>

      {/* 12 Visual Systems Grid */}
      {visibleCats.length === 0 ? (
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-10 text-center space-y-3">
          <p className="text-base font-medium text-[var(--orbi-ink)]">No systems selected yet.</p>
          <p className="text-sm text-[var(--orbi-mute)]">
            Switch to All 12 Systems to mark Must-have or Nice-to-have features.
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="px-4 py-2 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
          >
            Show all 12 systems
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCats.map((cat) => {
            const p = cats[cat.id];
            const solves = PAIN_POINTS.filter((pp) => pp.relatedCategories.includes(cat.id));
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-[var(--orbi-surface)] border-b border-[var(--orbi-line)] overflow-hidden relative">
                  {cat.visual.kind === 'photo' && !failedImages[cat.id] ? (
                    <img
                      src={cat.visual.src}
                      alt={cat.visual.alt}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={() => setFailedImages((prev) => ({ ...prev, [cat.id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : cat.visual.kind === 'diagram' ? (
                    <VisualDiagram diagramId={cat.visual.diagramId} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-xs text-[var(--orbi-mute)]">
                      {cat.visual.caption}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-[var(--orbi-ink)]">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-[var(--orbi-mute)] mt-1">{cat.description}</p>
                  </div>

                  {solves.length > 0 && (
                    <div className="text-xs text-[var(--orbi-ink)]/85 bg-[var(--orbi-surface)] rounded-lg p-3 border border-[var(--orbi-line)] space-y-1">
                      <span className="font-semibold text-[var(--orbi-teal)] block">
                        Pain points solved:
                      </span>
                      <span>{solves.map((s) => s.title).join(' · ')}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSetPriority(cat.id, p === 2 ? 0 : 2)}
                      className={`flex-1 min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                        p === 2
                          ? 'bg-[var(--orbi-teal)] border-[var(--orbi-teal)] text-[var(--orbi-onteal)]'
                          : 'bg-transparent border-[var(--orbi-line)] text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)]'
                      }`}
                    >
                      {p === 2 && <Check className="w-3.5 h-3.5" />}
                      Must have
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetPriority(cat.id, p === 1 ? 0 : 1)}
                      className={`flex-1 min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                        p === 1
                          ? 'bg-[var(--orbi-navy)] border-[var(--orbi-navy)] text-white dark:bg-[var(--orbi-ink)] dark:text-[var(--orbi-bg)]'
                          : 'bg-transparent border-[var(--orbi-line)] text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)]'
                      }`}
                    >
                      {p === 1 && <Check className="w-3.5 h-3.5" />}
                      Nice to have
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
