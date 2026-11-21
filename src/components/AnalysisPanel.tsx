import React from 'react';
import { TIERS, TIER_GUIDE } from '../data/discoveryConfig';
import {
  analyzeDiscovery,
  formatFollowUpText,
  type DiscoveryState,
} from '../utils/discoveryLogic';

interface AnalysisPanelProps {
  state: DiscoveryState;
  compact?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ state, compact = false }) => {
  const analysis = analyzeDiscovery(state);

  const tempStyle =
    analysis.temp === 'Hot'
      ? 'text-amber-700 dark:text-amber-400'
      : analysis.temp === 'Warm'
        ? 'text-[var(--orbi-teal)]'
        : 'text-[var(--orbi-mute)]';

  return (
    <section
      aria-label="Orbi Team Lead & Technical Analysis"
      className={`rounded-2xl border-2 border-[var(--orbi-teal)] bg-[var(--orbi-card)] ${
        compact ? 'p-5' : 'p-6 md:p-7'
      } space-y-5`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--orbi-teal)]">Orbi team consultation brief</p>
          <div className="flex items-baseline gap-3 mt-1">
            <span className={`font-display text-3xl font-bold ${tempStyle}`}>
              {analysis.temp}
            </span>
            <span className="text-sm text-[var(--orbi-mute)] font-mono-tabular">
              Lead score {analysis.score}/100
            </span>
          </div>
        </div>
        <div className="text-xs text-[var(--orbi-mute)] font-mono-tabular">
          Scope: {TIERS[analysis.scope]}
          {analysis.bt != null ? ` · Budget: ${TIERS[analysis.bt]}` : ' · Budget: Not specified'}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-[var(--orbi-surface)] overflow-hidden">
        <div
          className="h-full bg-[var(--orbi-teal)] transition-all duration-300"
          style={{ width: `${analysis.score}%` }}
        />
      </div>

      {/* Wish list vs Budget Ladder */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">Wish list against budget</h3>
        <div className="grid grid-cols-5 gap-1.5 items-center text-xs">
          <span />
          {TIER_GUIDE.map((guide) => (
            <span key={guide} className="text-center text-[var(--orbi-mute)] font-mono-tabular">
              {guide}
            </span>
          ))}
          <span className="font-medium text-[var(--orbi-mute)]">Wish list</span>
          {TIERS.map((tier, idx) => (
            <div
              key={`scope-${tier}`}
              className={`h-8 rounded-md flex items-center justify-center text-center px-1 ${
                idx === analysis.scope
                  ? 'bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] font-semibold'
                  : 'bg-[var(--orbi-surface)] text-[var(--orbi-mute)]'
              }`}
            >
              {tier}
            </div>
          ))}
          <span className="font-medium text-[var(--orbi-mute)]">Budget</span>
          {analysis.bt != null ? (
            TIERS.map((tier, idx) => (
              <div
                key={`budget-${tier}`}
                className={`h-8 rounded-md flex items-center justify-center text-center px-1 ${
                  idx === analysis.bt
                    ? 'bg-[var(--orbi-navy)] text-white dark:bg-[var(--orbi-ink)] dark:text-[var(--orbi-bg)] font-semibold'
                    : 'bg-[var(--orbi-surface)] text-[var(--orbi-mute)]'
                }`}
              >
                {tier}
              </div>
            ))
          ) : (
            <div className="col-span-4 h-8 rounded-md bg-[var(--orbi-surface)] text-[var(--orbi-mute)] flex items-center justify-center">
              Not specified yet
            </div>
          )}
        </div>
      </div>

      {/* Platform Architecture Recommendation */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">Recommended platform</h3>
        <p className="text-sm text-[var(--orbi-ink)]/90 leading-relaxed">{analysis.platform}</p>
      </div>

      {/* Pain Points Matched to Solutions */}
      {analysis.painPointMatches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">
            Pain points to address in demo
          </h3>
          <ul className="space-y-1.5 text-sm text-[var(--orbi-ink)]/90 list-disc pl-5">
            {analysis.painPointMatches.map((pp) => (
              <li key={pp.id}>
                <span className="font-semibold">{pp.title}:</span> {pp.solutionHint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Must-haves */}
      {analysis.must.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">Lead with their must-haves</h3>
          <ul className="space-y-1.5 text-sm text-[var(--orbi-ink)]/90 list-disc pl-5">
            {analysis.must.map((c) => {
              const fu = formatFollowUpText(state, c.id);
              return (
                <li key={c.id}>
                  <span className="font-semibold">{c.name}.</span>{' '}
                  {fu && <span className="italic text-[var(--orbi-teal)]">They said: {fu}. </span>}
                  {c.leadTip}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Points to plan around */}
      {analysis.flags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">Points to plan around</h3>
          <ul className="space-y-1.5 text-sm text-[var(--orbi-ink)]/90 list-disc pl-5">
            {analysis.flags.map((flag, i) => (
              <li key={i}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ask next */}
      {analysis.asks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">Ask on the next call</h3>
          <ul className="space-y-1.5 text-sm text-[var(--orbi-ink)]/90 list-disc pl-5">
            {analysis.asks.map((ask, i) => (
              <li key={i}>{ask}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
