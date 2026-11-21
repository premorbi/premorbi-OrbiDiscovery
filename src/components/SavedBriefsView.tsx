import React from 'react';
import { FileEdit, LogIn, MessageCircle, Trash2 } from 'lucide-react';
import type { User } from 'firebase/auth';
import { CATEGORIES, PAIN_POINTS, TIERS } from '../data/discoveryConfig';
import {
  buildWhatsAppUrl,
  optionLabel,
  recordToDiscoveryState,
  type StoredDiscoveryRecord,
} from '../utils/discoveryLogic';

interface SavedBriefsViewProps {
  user: User | null;
  briefs: StoredDiscoveryRecord[];
  loading: boolean;
  onSignIn: () => void;
  onLoadBrief: (record: StoredDiscoveryRecord) => void;
  onDeleteBrief: (briefId: string) => void;
  onStartNew: () => void;
  whatsappTarget: string;
}

export const SavedBriefsView: React.FC<SavedBriefsViewProps> = ({
  user,
  briefs,
  loading,
  onSignIn,
  onLoadBrief,
  onDeleteBrief,
  onStartNew,
  whatsappTarget,
}) => {
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-8 space-y-4">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--orbi-ink)]">
            Your saved discovery briefs
          </h1>
          <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
            Sign in with Google to access briefs you have saved to the centralized Orbi database, edit requirements anytime, or re-share on WhatsApp.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              Sign in with Google
            </button>
            <button
              type="button"
              onClick={onStartNew}
              className="px-5 py-2.5 rounded-xl border border-[var(--orbi-line)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer"
            >
              Continue questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--orbi-line)] pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--orbi-ink)]">
            Saved Discovery Briefs
          </h1>
          <p className="text-sm text-[var(--orbi-mute)] mt-1">
            Signed in as {user.email} · Synced with centralized database
          </p>
        </div>
        <button
          type="button"
          onClick={onStartNew}
          className="px-4 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
        >
          New discovery brief
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-surface)] animate-pulse"
            />
          ))}
        </div>
      ) : briefs.length === 0 ? (
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-10 text-center space-y-3">
          <h2 className="font-display text-xl font-semibold text-[var(--orbi-ink)]">
            No saved briefs yet
          </h2>
          <p className="text-sm text-[var(--orbi-mute)] max-w-md mx-auto">
            Complete the smart home questionnaire and click &ldquo;Save to Orbi Database&rdquo; on the final step to store your requirements here.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="mt-2 px-4 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
          >
            Start discovery questionnaire
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {briefs.map((rec) => {
            const state = recordToDiscoveryState(rec);
            const mustNames = CATEGORIES.filter((c) => state.cats[c.id] === 2).map((c) => c.name);
            const painTitles = (rec.painPoints || [])
              .map((id) => PAIN_POINTS[id]?.title)
              .filter(Boolean);
            const updatedStr =
              rec.updatedAt && typeof rec.updatedAt.toDate === 'function'
                ? rec.updatedAt.toDate().toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Just now';

            return (
              <div
                key={rec.id}
                className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-[var(--orbi-ink)]">
                      {rec.customerName}
                    </h2>
                    <p className="text-xs text-[var(--orbi-mute)] mt-0.5">
                      {[
                        optionLabel('size', rec.sizeIndex),
                        optionLabel('ptype', rec.propertyTypeIndex),
                        rec.area,
                      ]
                        .filter(Boolean)
                        .join(' · ') || rec.customerPhone}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--orbi-teal)] capitalize font-mono-tabular">
                    {rec.status.replace('_', ' ')} · {updatedStr}
                  </span>
                </div>

                <div className="text-xs text-[var(--orbi-mute)] space-y-1">
                  <div>
                    <span className="font-semibold text-[var(--orbi-ink)]">Scope:</span>{' '}
                    {TIERS[rec.scopeTier]}
                    {rec.budgetIndex != null
                      ? ` · Budget: ${optionLabel('budget', rec.budgetIndex)}`
                      : ''}
                  </div>
                  {mustNames.length > 0 && (
                    <div>
                      <span className="font-semibold text-[var(--orbi-ink)]">Must have:</span>{' '}
                      {mustNames.join(', ')}
                    </div>
                  )}
                  {painTitles.length > 0 && (
                    <div>
                      <span className="font-semibold text-[var(--orbi-ink)]">Pain points:</span>{' '}
                      {painTitles.join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-[var(--orbi-line)] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadBrief(rec)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-xs font-semibold cursor-pointer"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Open &amp; Edit
                  </button>
                  <a
                    href={buildWhatsAppUrl(state, whatsappTarget)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f9d55] text-white text-xs font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  {rec.status === 'new' && (
                    <button
                      type="button"
                      onClick={() => onDeleteBrief(rec.id)}
                      className="ml-auto inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-[var(--orbi-line)] text-xs text-[var(--orbi-mute)] hover:text-red-600 cursor-pointer"
                      aria-label={`Delete brief for ${rec.customerName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
