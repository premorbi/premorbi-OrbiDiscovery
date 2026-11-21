import React, { useMemo, useState } from 'react';
import {
  Download,
  FileUp,
  LogIn,
  MessageCircle,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  CATEGORIES,
  PAIN_POINTS,
  PIPELINE_STATUSES,
  TIERS,
} from '../data/discoveryConfig';
import {
  buildBriefSections,
  buildWhatsAppUrl,
  decodeOrbiRef,
  exportBriefsToCSV,
  optionLabel,
  recordToDiscoveryState,
  type DiscoveryState,
  type PipelineStatus,
  type StoredDiscoveryRecord,
} from '../utils/discoveryLogic';
import { AnalysisPanel } from './AnalysisPanel';

interface TeamDatabaseViewProps {
  user: User | null;
  isAdmin: boolean;
  records: StoredDiscoveryRecord[];
  loading: boolean;
  onSignIn: () => void;
  onUpdateRecordMeta: (
    briefId: string,
    status: PipelineStatus,
    advisorNotes: string
  ) => Promise<void>;
  onDeleteRecord: (briefId: string) => Promise<void>;
  onImportToDatabase: (state: DiscoveryState) => Promise<void>;
  onLoadIntoPlanner: (rec: StoredDiscoveryRecord) => void;
}

export const TeamDatabaseView: React.FC<TeamDatabaseViewProps> = ({
  user,
  isAdmin,
  records,
  loading,
  onSignIn,
  onUpdateRecordMeta,
  onDeleteRecord,
  onImportToDatabase,
  onLoadIntoPlanner,
}) => {
  const [search, setSearch] = useState('');
  const [tempFilter, setTempFilter] = useState<'all' | 'Hot' | 'Warm' | 'Early stage'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PipelineStatus>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRaw, setImportRaw] = useState('');
  const [importErr, setImportErr] = useState('');
  const [importing, setImporting] = useState(false);

  const [draftStatus, setDraftStatus] = useState<PipelineStatus>('new');
  const [draftNotes, setDraftNotes] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((rec) => {
      if (tempFilter !== 'all' && rec.leadTemp !== tempFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (!q) return true;
      const painText = (rec.painPoints || [])
        .map((id) => PAIN_POINTS[id]?.title || '')
        .join(' ')
        .toLowerCase();
      return (
        rec.customerName.toLowerCase().includes(q) ||
        rec.customerPhone.toLowerCase().includes(q) ||
        (rec.area || '').toLowerCase().includes(q) ||
        (rec.painPointNotes || '').toLowerCase().includes(q) ||
        painText.includes(q)
      );
    });
  }, [records, search, tempFilter, statusFilter]);

  const selectedRecord = useMemo(() => {
    const found = filtered.find((r) => r.id === selectedId) || filtered[0] || null;
    return found;
  }, [filtered, selectedId]);

  const handleSelectRecord = (rec: StoredDiscoveryRecord) => {
    setSelectedId(rec.id);
    setDraftStatus(rec.status);
    setDraftNotes(rec.advisorNotes || '');
    setSaveMsg('');
  };

  // Sync draft editor when first record auto-selects
  React.useEffect(() => {
    if (selectedRecord && selectedRecord.id !== selectedId) {
      setSelectedId(selectedRecord.id);
      setDraftStatus(selectedRecord.status);
      setDraftNotes(selectedRecord.advisorNotes || '');
    }
  }, [selectedRecord, selectedId]);

  const stats = useMemo(() => {
    const total = records.length;
    const hot = records.filter((r) => r.leadTemp === 'Hot').length;
    const avgScore = total
      ? Math.round(records.reduce((acc, r) => acc + (r.leadScore || 0), 0) / total)
      : 0;
    const painCounts: Record<number, number> = {};
    records.forEach((r) => {
      (r.painPoints || []).forEach((id) => {
        painCounts[id] = (painCounts[id] || 0) + 1;
      });
    });
    const topPainId = Object.entries(painCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topPain = topPainId != null ? PAIN_POINTS[Number(topPainId)]?.title : '—';
    return { total, hot, avgScore, topPain };
  }, [records]);

  const handleDownloadCsv = () => {
    const csv = exportBriefsToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbi-discovery-database-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = filtered.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      area: r.area,
      leadTemp: r.leadTemp,
      leadScore: r.leadScore,
      status: r.status,
      scopeTier: TIERS[r.scopeTier],
      budget: optionLabel('budget', r.budgetIndex),
      painPoints: (r.painPoints || []).map((id) => PAIN_POINTS[id]?.title).filter(Boolean),
      painPointNotes: r.painPointNotes,
      mustHave: CATEGORIES.filter((c) => r.cats?.[c.id] === 2).map((c) => c.name),
      niceToHave: CATEGORIES.filter((c) => r.cats?.[c.id] === 1).map((c) => c.name),
      advisorNotes: r.advisorNotes,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbi-discovery-database-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async () => {
    setImportErr('');
    try {
      const decoded = decodeOrbiRef(importRaw);
      if (!decoded.name.trim()) decoded.name = 'Imported WhatsApp Lead';
      if (!decoded.phone.trim()) decoded.phone = '0000000000';
      setImporting(true);
      await onImportToDatabase(decoded);
      setImportRaw('');
      setImportOpen(false);
    } catch (err) {
      setImportErr(err instanceof Error ? err.message : 'Could not decode ORBI-REF message.');
    } finally {
      setImporting(false);
    }
  };

  const handleSaveMeta = async () => {
    if (!selectedRecord) return;
    setSavingMeta(true);
    setSaveMsg('');
    try {
      await onUpdateRecordMeta(selectedRecord.id, draftStatus, draftNotes);
      setSaveMsg('Saved to centralized database.');
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSavingMeta(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-8 space-y-4">
          <h1 className="font-display text-2xl font-semibold text-[var(--orbi-ink)]">
            Orbi Team Centralised Database
          </h1>
          <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
            Sign in with your authorized Orbi team Google account to view all customer discovery briefs, track pain points across leads, and export CSV/JSON reports.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-8 space-y-3">
          <h1 className="font-display text-2xl font-semibold text-[var(--orbi-ink)]">
            Team access restricted
          </h1>
          <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
            Signed in as <span className="font-medium text-[var(--orbi-ink)]">{user.email}</span>. The full multi-customer database is restricted to authorized Orbi advisors; your own submitted briefs are available under Saved Briefs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Header + Action Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--orbi-line)] pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--orbi-ink)]">
            Centralised Customer Discovery Database
          </h1>
          <p className="text-sm text-[var(--orbi-mute)] mt-1">
            Live Firestore repository of customer briefs, pain points, qualification scores, and WhatsApp imports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setImportOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-xs font-semibold text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)] cursor-pointer whitespace-nowrap"
          >
            <FileUp className="w-3.5 h-3.5" />
            Import WhatsApp ORBI-REF
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-xs font-semibold cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filtered.length})
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-xs font-semibold text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)] cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Import Drawer */}
      {importOpen && (
        <div className="rounded-2xl border-2 border-[var(--orbi-teal)] bg-[var(--orbi-card)] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-[var(--orbi-ink)]">
              Import a customer&apos;s WhatsApp brief into the database
            </h2>
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="text-xs text-[var(--orbi-mute)] hover:text-[var(--orbi-ink)] cursor-pointer"
            >
              Close
            </button>
          </div>
          <textarea
            value={importRaw}
            onChange={(e) => setImportRaw(e.target.value)}
            rows={4}
            placeholder="Paste the full WhatsApp message sent by the customer (including the ORBI-REF: line at the bottom)."
            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] p-3 text-sm text-[var(--orbi-ink)]"
          />
          {importErr && <p className="text-xs text-red-600 dark:text-red-400">{importErr}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={importing || !importRaw.trim()}
              onClick={handleImportSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {importing ? 'Importing...' : 'Decode & Save to Database'}
            </button>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-4">
          <span className="text-xs text-[var(--orbi-mute)]">Total Discovery Briefs</span>
          <p className="font-display text-2xl font-bold text-[var(--orbi-ink)] font-mono-tabular mt-1">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-4">
          <span className="text-xs text-[var(--orbi-mute)]">Hot Leads (Score 70+)</span>
          <p className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400 font-mono-tabular mt-1">
            {stats.hot}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-4">
          <span className="text-xs text-[var(--orbi-mute)]">Average Lead Score</span>
          <p className="font-display text-2xl font-bold text-[var(--orbi-teal)] font-mono-tabular mt-1">
            {stats.avgScore}/100
          </p>
        </div>
        <div className="rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-4">
          <span className="text-xs text-[var(--orbi-mute)]">Top Reported Pain Point</span>
          <p className="font-display text-base font-semibold text-[var(--orbi-ink)] mt-1.5 truncate" title={stats.topPain}>
            {stats.topPain}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--orbi-mute)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, area, or pain point..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-sm text-[var(--orbi-ink)]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--orbi-surface)] border border-[var(--orbi-line)]">
          {(['all', 'Hot', 'Warm', 'Early stage'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTempFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                tempFilter === t
                  ? 'bg-[var(--orbi-card)] text-[var(--orbi-ink)]'
                  : 'text-[var(--orbi-mute)] hover:text-[var(--orbi-ink)]'
              }`}
            >
              {t === 'all' ? 'All Temps' : t}
            </button>
          ))}
        </div>

        <select
          aria-label="Filter by pipeline status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | PipelineStatus)}
          className="px-3.5 py-2.5 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-xs font-semibold text-[var(--orbi-ink)]"
        >
          <option value="all">All Statuses</option>
          {PIPELINE_STATUSES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split Table + Inspector */}
      {loading ? (
        <div className="h-72 rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-surface)] animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-12 text-center space-y-2">
          <p className="text-base font-semibold text-[var(--orbi-ink)]">No matching customer records</p>
          <p className="text-sm text-[var(--orbi-mute)]">
            Try clearing your search filter, importing a WhatsApp ORBI-REF message, or submitting a discovery brief.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Table */}
          <div className="lg:col-span-5 rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] overflow-hidden divide-y divide-[var(--orbi-line)]">
            {filtered.map((rec) => {
              const active = selectedRecord?.id === rec.id;
              const painCount = (rec.painPoints || []).length;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => handleSelectRecord(rec)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer ${
                    active ? 'bg-[var(--orbi-surface)]' : 'hover:bg-[var(--orbi-surface)]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--orbi-ink)] truncate">
                        {rec.customerName}
                      </p>
                      <p className="text-xs text-[var(--orbi-mute)] mt-0.5 truncate">
                        {rec.customerPhone}
                        {rec.area ? ` · ${rec.area}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold font-mono-tabular shrink-0 ${
                        rec.leadTemp === 'Hot'
                          ? 'text-amber-700 dark:text-amber-400'
                          : rec.leadTemp === 'Warm'
                            ? 'text-[var(--orbi-teal)]'
                            : 'text-[var(--orbi-mute)]'
                      }`}
                    >
                      {rec.leadTemp} · {rec.leadScore}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--orbi-mute)]">
                    <span className="capitalize font-medium text-[var(--orbi-ink)]">
                      {rec.status.replace('_', ' ')}
                    </span>
                    <span>·</span>
                    <span>{TIERS[rec.scopeTier]}</span>
                    {painCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{painCount} pain points</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Inspector */}
          {selectedRecord && (
            <div className="lg:col-span-7 space-y-5">
              {(() => {
                const state = recordToDiscoveryState(selectedRecord);
                const sections = buildBriefSections(state);
                const customerDigits = selectedRecord.customerPhone.replace(/\D/g, '');
                const waReplyHref = `https://wa.me/${
                  customerDigits.length === 10 ? `91${customerDigits}` : customerDigits
                }?text=${encodeURIComponent(
                  `Hi ${selectedRecord.customerName.split(' ')[0]}, thank you for sharing your smart home brief with Orbi Automatify. I have reviewed your requirements and would love to walk you through tailored options.`
                )}`;

                return (
                  <>
                    <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-6 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--orbi-line)] pb-4">
                        <div>
                          <h2 className="font-display text-2xl font-semibold text-[var(--orbi-ink)]">
                            {selectedRecord.customerName}
                          </h2>
                          <p className="text-sm text-[var(--orbi-mute)] mt-0.5">
                            {selectedRecord.customerPhone}
                            {selectedRecord.customerEmail ? ` · ${selectedRecord.customerEmail}` : ''}
                            {selectedRecord.area ? ` · ${selectedRecord.area}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={waReplyHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f9d55] text-white text-xs font-semibold"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Reply on WhatsApp
                          </a>
                          <a
                            href={buildWhatsAppUrl(state)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--orbi-line)] text-xs font-semibold text-[var(--orbi-ink)]"
                          >
                            Forward Brief
                          </a>
                          <button
                            type="button"
                            onClick={() => onLoadIntoPlanner(selectedRecord)}
                            className="px-3.5 py-2 rounded-xl border border-[var(--orbi-line)] text-xs font-semibold text-[var(--orbi-ink)] cursor-pointer"
                          >
                            Edit in Planner
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRecord(selectedRecord.id)}
                            className="p-2 rounded-xl border border-[var(--orbi-line)] text-[var(--orbi-mute)] hover:text-red-600 cursor-pointer"
                            aria-label="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Advisor Pipeline Editor */}
                      <div className="grid sm:grid-cols-12 gap-4 items-start bg-[var(--orbi-surface)] p-4 rounded-xl border border-[var(--orbi-line)]">
                        <div className="sm:col-span-4 space-y-1.5">
                          <label className="block text-xs font-semibold text-[var(--orbi-ink)]">
                            Pipeline status
                          </label>
                          <select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value as PipelineStatus)}
                            className="w-full rounded-lg border border-[var(--orbi-line)] bg-[var(--orbi-card)] px-3 py-2 text-sm text-[var(--orbi-ink)]"
                          >
                            {PIPELINE_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-8 space-y-1.5">
                          <label className="block text-xs font-semibold text-[var(--orbi-ink)]">
                            Advisor follow-up notes
                          </label>
                          <textarea
                            rows={2}
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            placeholder="Record site visit notes, architect details, or quote numbers..."
                            className="w-full rounded-lg border border-[var(--orbi-line)] bg-[var(--orbi-card)] px-3 py-2 text-sm text-[var(--orbi-ink)]"
                          />
                        </div>
                        <div className="sm:col-span-12 flex items-center justify-between gap-3">
                          <span className="text-xs text-[var(--orbi-teal)]">{saveMsg}</span>
                          <button
                            type="button"
                            disabled={savingMeta}
                            onClick={handleSaveMeta}
                            className="px-4 py-2 rounded-lg bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-xs font-semibold cursor-pointer disabled:opacity-50"
                          >
                            {savingMeta ? 'Saving...' : 'Update Pipeline & Notes'}
                          </button>
                        </div>
                      </div>

                      {/* Full Structured Summary */}
                      <div className="space-y-4">
                        {sections.map(([heading, rows]) => {
                          const filled = rows.filter(([, v]) => Boolean(v && v.trim()));
                          if (!filled.length) return null;
                          return (
                            <div key={heading} className="space-y-1.5">
                              <h3 className="text-sm font-semibold text-[var(--orbi-ink)]">
                                {heading}
                              </h3>
                              <dl className="grid sm:grid-cols-12 gap-x-4 gap-y-1.5 text-sm">
                                {filled.map(([label, val]) => (
                                  <React.Fragment key={label}>
                                    <dt className="sm:col-span-4 text-[var(--orbi-mute)]">{label}</dt>
                                    <dd className="sm:col-span-8 text-[var(--orbi-ink)]">{val}</dd>
                                  </React.Fragment>
                                ))}
                              </dl>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <AnalysisPanel state={state} compact />
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
