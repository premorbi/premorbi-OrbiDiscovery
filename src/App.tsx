import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CloudUpload,
  Copy,
  Database,
  Download,
  Eye,
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
} from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  checkIsAdminUser,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import {
  CATEGORIES,
  KEYPAD_PHOTO,
  MOMENTS,
  OPTIONS,
  PAIN_POINTS,
  STEPS,
  TIERS,
} from './data/discoveryConfig';
import {
  analyzeDiscovery,
  buildBriefSections,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  createBlankState,
  createSampleState,
  exportBriefsToCSV,
  isPhoneValid,
  isStepZeroValid,
  recordToDiscoveryState,
  toFirestorePayload,
  type CategoryPriority,
  type DiscoveryState,
  type PipelineStatus,
  type StoredDiscoveryRecord,
} from './utils/discoveryLogic';
import { InteractiveVillaSvg } from './components/InteractiveVillaSvg';
import { FeatureCategoryCard } from './components/FeatureCategoryCard';
import { VisualDiagram } from './components/VisualDiagram';
import { AnalysisPanel } from './components/AnalysisPanel';
import { VisualGuideView } from './components/VisualGuideView';
import { SavedBriefsView } from './components/SavedBriefsView';
import { TeamDatabaseView } from './components/TeamDatabaseView';

type AppTab = 'planner' | 'visuals' | 'saved' | 'database';

const STORAGE_KEY = 'orbi-discovery-planner-v2';
const THEME_KEY = 'orbi-theme-mode';
const WA_TARGET_KEY = 'orbi-whatsapp-target';

function generateDocId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `brief_${Date.now()}_${rand}`;
}

function sortRecordsByUpdatedDesc(list: StoredDiscoveryRecord[]): StoredDiscoveryRecord[] {
  return [...list].sort((a, b) => {
    const tA = a.updatedAt && typeof a.updatedAt.toMillis === 'function' ? a.updatedAt.toMillis() : 0;
    const tB = b.updatedAt && typeof b.updatedAt.toMillis === 'function' ? b.updatedAt.toMillis() : 0;
    return tB - tA;
  });
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('planner');
  const [step, setStep] = useState<number>(0);
  const [state, setState] = useState<DiscoveryState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Partial<DiscoveryState>; step?: number };
        if (parsed.state) {
          return { ...createBlankState(), ...parsed.state };
        }
      }
    } catch {
      // ignore storage errors
    }
    return createBlankState();
  });

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecordStatus, setEditingRecordStatus] = useState<PipelineStatus>('new');
  const [editingAdvisorNotes, setEditingAdvisorNotes] = useState<string>('');
  const [highlightedCat, setHighlightedCat] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });
  const [advisorMode, setAdvisorMode] = useState<boolean>(false);
  const [whatsappTarget, setWhatsappTarget] = useState<string>(() => {
    try {
      return localStorage.getItem(WA_TARGET_KEY) || '';
    } catch {
      return '';
    }
  });

  // Auth + Firestore state
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [myBriefs, setMyBriefs] = useState<StoredDiscoveryRecord[]>([]);
  const [myBriefsLoading, setMyBriefsLoading] = useState<boolean>(false);
  const [allBriefs, setAllBriefs] = useState<StoredDiscoveryRecord[]>([]);
  const [allBriefsLoading, setAllBriefsLoading] = useState<boolean>(false);

  // Validation & feedback
  const [step0Errors, setStep0Errors] = useState<{ name?: string; phone?: string }>({});
  const [saveState, setSaveState] = useState<{ saving: boolean; savedId: string | null; message: string; error: string }>({
    saving: false,
    savedId: null,
    message: '',
    error: '',
  });
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  // Persist planner draft locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, step }));
    } catch {
      // ignore
    }
  }, [state, step]);

  useEffect(() => {
    try {
      localStorage.setItem(WA_TARGET_KEY, whatsappTarget);
    } catch {
      // ignore
    }
  }, [whatsappTarget]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const adminFlag = await checkIsAdminUser(u);
        setIsAdmin(adminFlag);
        if (adminFlag) setAdvisorMode(true);
      } else {
        setIsAdmin(false);
        setMyBriefs([]);
        setAllBriefs([]);
      }
    });
    return () => unsub();
  }, []);

  // User's own saved briefs subscription
  useEffect(() => {
    if (!user || !user.emailVerified) {
      setMyBriefs([]);
      return;
    }
    setMyBriefsLoading(true);
    const q = query(collection(db, 'discoveries'), where('ownerId', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredDiscoveryRecord, 'id'>),
        }));
        setMyBriefs(sortRecordsByUpdatedDesc(docs));
        setMyBriefsLoading(false);
      },
      (error) => {
        setMyBriefsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'discoveries');
      }
    );
    return () => unsub();
  }, [user]);

  // Admin full centralized database subscription
  useEffect(() => {
    if (!user || !user.emailVerified || !isAdmin) {
      setAllBriefs([]);
      return;
    }
    setAllBriefsLoading(true);
    const unsub = onSnapshot(
      collection(db, 'discoveries'),
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<StoredDiscoveryRecord, 'id'>),
        }));
        setAllBriefs(sortRecordsByUpdatedDesc(docs));
        setAllBriefsLoading(false);
      },
      (error) => {
        setAllBriefsLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'discoveries');
      }
    );
    return () => unsub();
  }, [user, isAdmin]);

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setActiveTab('planner');
  };

  const visitedStep = (i: number): boolean => {
    if (i === 0) return isStepZeroValid(state);
    if (i === 1) return [state.ptype, state.size, state.stage, state.elec, state.own].some((v) => v != null);
    if (i === 2) return state.people.length > 0 || state.painPoints.length > 0 || state.tech != null || state.decider != null;
    if (i === 3) return Object.keys(state.cats).length > 0;
    if (i === 4) return state.moments.length > 0;
    if (i === 5) return state.rooms.length > 0 || state.control.length > 0 || state.keypad != null || state.existing.length > 0;
    if (i === 6) return [state.budget, state.emi, state.phase, state.timeline, state.designer, state.consult].some((v) => v != null);
    return false;
  };

  const completedSectionsCount = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].filter((i) => visitedStep(i)).length,
    [state]
  );

  const goToStep = (target: number) => {
    if (target > 0 && !isStepZeroValid(state)) {
      const errs: { name?: string; phone?: string } = {};
      if (!state.name.trim()) errs.name = 'Please add your name.';
      if (!isPhoneValid(state.phone)) errs.phone = 'Please enter a valid 10-digit mobile number.';
      setStep0Errors(errs);
      setStep(0);
      return;
    }
    setStep(Math.max(0, Math.min(7, target)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMulti = (
    key: 'people' | 'painPoints' | 'moments' | 'rooms' | 'control' | 'existing',
    idx: number
  ) => {
    setState((prev) => {
      const arr = [...prev[key]];
      const found = arr.indexOf(idx);
      if (found >= 0) {
        arr.splice(found, 1);
      } else {
        if (key === 'existing' && idx === 5) {
          arr.length = 0;
        } else if (key === 'existing') {
          const noneIdx = arr.indexOf(5);
          if (noneIdx >= 0) arr.splice(noneIdx, 1);
        }
        arr.push(idx);
      }
      return { ...prev, [key]: arr };
    });
  };

  const toggleSingle = (
    key:
      | 'src'
      | 'ptype'
      | 'size'
      | 'stage'
      | 'elec'
      | 'own'
      | 'tech'
      | 'decider'
      | 'keypad'
      | 'budget'
      | 'emi'
      | 'phase'
      | 'timeline'
      | 'designer'
      | 'consult',
    idx: number
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: prev[key] === idx ? undefined : idx,
    }));
  };

  const handleSetCategoryPriority = (catId: string, priority: CategoryPriority) => {
    setState((prev) => {
      const nextCats = { ...prev.cats };
      if (nextCats[catId] === priority) {
        delete nextCats[catId];
      } else {
        nextCats[catId] = priority;
      }
      return { ...prev, cats: nextCats };
    });
  };

  const handleToggleFollowUp = (
    catId: string,
    qIdx: number,
    mode: 'one' | 'many',
    optIdx: number
  ) => {
    setState((prev) => {
      const nextFu = { ...prev.fu };
      const catFu = { ...(nextFu[catId] || {}) };
      if (mode === 'many') {
        const existingArr = Array.isArray(catFu[qIdx]) ? [...(catFu[qIdx] as number[])] : [];
        const pos = existingArr.indexOf(optIdx);
        if (pos >= 0) existingArr.splice(pos, 1);
        else existingArr.push(optIdx);
        catFu[qIdx] = existingArr;
      } else {
        if (catFu[qIdx] === optIdx) delete catFu[qIdx];
        else catFu[qIdx] = optIdx;
      }
      nextFu[catId] = catFu;
      return { ...prev, fu: nextFu };
    });
  };

  const handleVillaZoneClick = (categoryId: string) => {
    setActiveTab('planner');
    setStep(3);
    setHighlightedCat(categoryId);
    setTimeout(() => {
      const el = document.getElementById(`cat-card-${categoryId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    setTimeout(() => setHighlightedCat(null), 1800);
  };

  const handleSaveToDatabase = async (overrideState?: DiscoveryState) => {
    const targetState = overrideState || state;
    if (!isStepZeroValid(targetState)) {
      setStep0Errors({
        name: !targetState.name.trim() ? 'Please add your name.' : undefined,
        phone: !isPhoneValid(targetState.phone) ? 'Please enter a 10-digit mobile number.' : undefined,
      });
      setStep(0);
      return;
    }

    setSaveState({ saving: true, savedId: null, message: '', error: '' });
    try {
      let activeUser = auth.currentUser;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      const isNew = !editingRecordId || Boolean(overrideState);
      const docId = isNew ? generateDocId() : editingRecordId!;
      const docPath = `discoveries/${docId}`;
      const payload = toFirestorePayload(targetState, activeUser, {
        isNew,
        status: isNew ? 'new' : editingRecordStatus,
        advisorNotes: isNew ? '' : editingAdvisorNotes,
      });

      try {
        if (isNew) {
          await setDoc(doc(db, 'discoveries', docId), payload);
        } else {
          await updateDoc(doc(db, 'discoveries', docId), payload);
        }
      } catch (err) {
        handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, docPath);
      }

      if (!overrideState) {
        setEditingRecordId(docId);
      }
      setSaveState({
        saving: false,
        savedId: docId,
        message: isNew
          ? 'Saved to the centralized Orbi database.'
          : 'Updated record in the centralized Orbi database.',
        error: '',
      });
    } catch (err) {
      setSaveState({
        saving: false,
        savedId: null,
        message: '',
        error: err instanceof Error ? err.message : 'Failed to save brief.',
      });
    }
  };

  const handleUpdateRecordMeta = async (
    briefId: string,
    status: PipelineStatus,
    advisorNotes: string
  ) => {
    const docPath = `discoveries/${briefId}`;
    try {
      await updateDoc(doc(db, 'discoveries', briefId), {
        status,
        advisorNotes: advisorNotes.slice(0, 2000),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, docPath);
    }
  };

  const handleDeleteRecord = async (briefId: string) => {
    const docPath = `discoveries/${briefId}`;
    try {
      await deleteDoc(doc(db, 'discoveries', briefId));
      if (editingRecordId === briefId) {
        setEditingRecordId(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  const handleLoadRecord = (rec: StoredDiscoveryRecord) => {
    setState(recordToDiscoveryState(rec));
    setEditingRecordId(rec.id);
    setEditingRecordStatus(rec.status);
    setEditingAdvisorNotes(rec.advisorNotes || '');
    setSaveState({ saving: false, savedId: rec.id, message: '', error: '' });
    setActiveTab('planner');
    setStep(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setState(createBlankState());
    setEditingRecordId(null);
    setEditingRecordStatus('new');
    setEditingAdvisorNotes('');
    setSaveState({ saving: false, savedId: null, message: '', error: '' });
    setStep0Errors({});
    setStep(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleCopyBrief = async () => {
    const text = buildWhatsAppMessage(state);
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied full brief + ORBI-REF token. Ready to paste into WhatsApp or email.');
    } catch {
      setCopyFeedback('Select the message text below and copy manually.');
    }
  };

  const handleDownloadSingleJson = () => {
    const analysis = analyzeDiscovery(state);
    const data = {
      exportedAt: new Date().toISOString(),
      ...state,
      analysis: {
        leadScore: analysis.score,
        leadTemp: analysis.temp,
        scopeTier: TIERS[analysis.scope],
        platformRecommendation: analysis.platform,
        painPoints: analysis.painPointMatches.map((p) => p.title),
        flags: analysis.flags,
        asks: analysis.asks,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbi-brief-${(state.name || 'customer').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleCsv = () => {
    const mockRec: StoredDiscoveryRecord = {
      id: editingRecordId || 'draft',
      ownerId: user?.uid || 'local',
      ownerEmail: user?.email || '',
      customerName: state.name,
      customerPhone: state.phone,
      customerEmail: state.email,
      area: state.area,
      sourceIndex: state.src,
      propertyTypeIndex: state.ptype,
      sizeIndex: state.size,
      stageIndex: state.stage,
      electricalIndex: state.elec,
      ownershipIndex: state.own,
      people: state.people,
      techComfortIndex: state.tech,
      deciderIndex: state.decider,
      painPoints: state.painPoints,
      painPointNotes: state.painPointNotes,
      cats: state.cats,
      followUps: {},
      moments: state.moments,
      rooms: state.rooms,
      control: state.control,
      keypadIndex: state.keypad,
      existing: state.existing,
      budgetIndex: state.budget,
      emiIndex: state.emi,
      phaseIndex: state.phase,
      timelineIndex: state.timeline,
      designerIndex: state.designer,
      designerName: state.designerName,
      consultIndex: state.consult,
      notes: state.notes,
      leadScore: analysis.score,
      leadTemp: analysis.temp,
      scopeTier: analysis.scope,
      budgetTier: analysis.bt == null ? -1 : analysis.bt,
      status: editingRecordStatus,
      advisorNotes: editingAdvisorNotes,
      orbiRef: '',
    };
    const csv = exportBriefsToCSV([mockRec]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbi-brief-${(state.name || 'customer').toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const analysis = useMemo(() => analyzeDiscovery(state), [state]);
  const mustCategories = useMemo(
    () => CATEGORIES.filter((c) => state.cats[c.id] === 2),
    [state.cats]
  );
  const niceCategories = useMemo(
    () => CATEGORIES.filter((c) => state.cats[c.id] === 1),
    [state.cats]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--orbi-bg)] text-[var(--orbi-ink)]">
      {/* Top Bar Contract: Strictly 3 zones — Wordmark/Logo | 4 Single-line Links | 1 Primary Auth Action */}
      <header className="sticky top-0 z-30 bg-[var(--orbi-card)]/95 backdrop-blur-sm border-b border-[var(--orbi-line)]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: ORBi Automatify Brand Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className="flex items-center shrink-0 cursor-pointer rounded-lg bg-white px-2 py-1"
            aria-label="ORBi Automatify Home"
          >
            <img
              src="/assets/aistudio/Orbi_Logo_Blue_Gold_a341e18b.png"
              alt="ORBi Automatify — Engineered to Upscale"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none" aria-label="Primary navigation">
            {([
              ['planner', 'Discovery Form'],
              ['visuals', 'Visual Guide'],
              ['saved', 'Saved Briefs'],
              ['database', 'Team Database'],
            ] as const).map(([tabId, label]) => {
              const active = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'border-[var(--orbi-gold)] text-[var(--orbi-ink)] font-semibold'
                      : 'border-transparent text-[var(--orbi-mute)] hover:text-[var(--orbi-ink)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--orbi-line)] text-xs font-semibold text-[var(--orbi-ink)] hover:border-[var(--orbi-teal)] cursor-pointer whitespace-nowrap shrink-0"
                title={`Signed in as ${user.email}`}
              >
                <span className="max-w-[130px] truncate hidden sm:inline">
                  {user.displayName || user.email}
                </span>
                <LogOut className="w-3.5 h-3.5" />
                <span className="sm:hidden">Sign out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {authError && (
        <div className="bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-6 py-2 text-xs text-red-700 dark:text-red-300 text-center">
          {authError}
        </div>
      )}

      {/* Active View */}
      <main className="flex-1">
        {activeTab === 'visuals' && (
          <VisualGuideView
            cats={state.cats}
            onSetPriority={handleSetCategoryPriority}
            onStartQuestionnaire={() => {
              setActiveTab('planner');
              setStep(3);
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedBriefsView
            user={user}
            briefs={myBriefs}
            loading={myBriefsLoading}
            onSignIn={handleSignIn}
            onLoadBrief={handleLoadRecord}
            onDeleteBrief={handleDeleteRecord}
            onStartNew={() => {
              handleReset();
              setActiveTab('planner');
            }}
            whatsappTarget={whatsappTarget}
          />
        )}

        {activeTab === 'database' && (
          <TeamDatabaseView
            user={user}
            isAdmin={isAdmin}
            records={allBriefs}
            loading={allBriefsLoading}
            onSignIn={handleSignIn}
            onUpdateRecordMeta={handleUpdateRecordMeta}
            onDeleteRecord={handleDeleteRecord}
            onImportToDatabase={(importedState) => handleSaveToDatabase(importedState)}
            onLoadIntoPlanner={handleLoadRecord}
          />
        )}

        {activeTab === 'planner' && (
          <>
            {/* Orbi Royal Navy & Gold Hero + Step Rail */}
            <section className="bg-gradient-to-br from-[#061a3b] via-[#082452] to-[#0b3675] text-white px-4 sm:px-8 py-6 border-b-2 border-[#c4932b]/70">
              <div className="max-w-[1240px] mx-auto space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <h1 className="font-display text-3xl sm:text-5xl font-semibold text-white text-balance">
                      Plan your smart home around how you live
                    </h1>
                    <p className="text-sm sm:text-base text-[#d2dff2] leading-relaxed">
                      Tell us what frustrates you in your current home and what daily comforts matter most. We design around your lifestyle, save your brief to the Orbi database, and format it cleanly for WhatsApp.
                    </p>
                  </div>

                  {/* Workspace Utility Controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDarkMode((d) => !d)}
                      aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2b4d82] text-xs font-medium text-[#dbe7f8] hover:border-[#e0b44c] cursor-pointer"
                    >
                      {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      {darkMode ? 'Light' : 'Dark'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvisorMode((a) => !a)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                        advisorMode
                          ? 'bg-[#d4a441] border-[#d4a441] text-[#061a3b] font-semibold'
                          : 'border-[#2b4d82] text-[#dbe7f8] hover:border-[#e0b44c]'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Advisor Insights
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setState(createSampleState());
                        setEditingRecordId(null);
                        setStep(7);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2b4d82] text-xs font-medium text-[#dbe7f8] hover:border-[#e0b44c] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Load Sample
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2b4d82] text-xs font-medium text-[#dbe7f8] hover:border-[#e0b44c] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Step Navigation */}
                <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Discovery steps">
                  {STEPS.map((st, idx) => {
                    const isCurrent = idx === step;
                    const isDone = idx !== step && visitedStep(idx);
                    return (
                      <button
                        key={st.title}
                        type="button"
                        onClick={() => goToStep(idx)}
                        aria-current={isCurrent ? 'step' : undefined}
                        className={`flex-none min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                          isCurrent
                            ? 'bg-white text-[#061a3b] border-[#d4a441] font-semibold'
                            : isDone
                              ? 'border-[#d4a441]/80 text-white'
                              : 'border-[#2b4d82] text-[#dbe7f8] hover:border-[#5b82bf]'
                        }`}
                      >
                        {isDone && <span className="text-[#e0b44c] mr-1">✓</span>}
                        {idx + 1}. {st.title}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </section>

            {/* Main 2-Column Workspace */}
            <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-7 pb-28 grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Form Area */}
              <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-5 sm:p-8 space-y-7"
                >
                  {step < 7 && (
                    <div className="space-y-1.5 border-b border-[var(--orbi-line)] pb-5">
                      <span className="text-xs font-semibold text-[var(--orbi-teal)] font-mono-tabular">
                        Step {step + 1} of {STEPS.length}
                      </span>
                      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--orbi-ink)]">
                        {STEPS[step].title}
                      </h2>
                      <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
                        {STEPS[step].subtitle}
                      </p>
                    </div>
                  )}

                  {/* STEP 0: About you */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="f-name" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Your name *
                          </label>
                          <input
                            id="f-name"
                            type="text"
                            autoComplete="name"
                            value={state.name}
                            onChange={(e) => {
                              setState((p) => ({ ...p, name: e.target.value }));
                              setStep0Errors((er) => ({ ...er, name: undefined }));
                            }}
                            placeholder="e.g., Ananya Rao"
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-base text-[var(--orbi-ink)]"
                          />
                          {step0Errors.name && (
                            <p className="text-xs text-red-600 dark:text-red-400">{step0Errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="f-phone" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Mobile number (WhatsApp) *
                          </label>
                          <input
                            id="f-phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={state.phone}
                            onChange={(e) => {
                              setState((p) => ({ ...p, phone: e.target.value }));
                              setStep0Errors((er) => ({ ...er, phone: undefined }));
                            }}
                            placeholder="e.g., 98450 12345"
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-base text-[var(--orbi-ink)] font-mono-tabular"
                          />
                          {step0Errors.phone && (
                            <p className="text-xs text-red-600 dark:text-red-400">{step0Errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label htmlFor="f-email" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Email <span className="font-normal text-[var(--orbi-mute)]">(optional)</span>
                          </label>
                          <input
                            id="f-email"
                            type="email"
                            autoComplete="email"
                            value={state.email}
                            onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                            placeholder="name@example.com"
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-base text-[var(--orbi-ink)]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="f-area" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Where is the home? <span className="font-normal text-[var(--orbi-mute)]">(area and city)</span>
                          </label>
                          <input
                            id="f-area"
                            type="text"
                            value={state.area}
                            onChange={(e) => setState((p) => ({ ...p, area: e.target.value }))}
                            placeholder="e.g., Indiranagar, Bengaluru"
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-base text-[var(--orbi-ink)]"
                          />
                        </div>
                      </div>

                      <ChipQuestion
                        label="How did you hear about Orbi?"
                        options={OPTIONS.src}
                        selected={state.src}
                        onSelect={(idx) => toggleSingle('src', idx)}
                      />
                    </div>
                  )}

                  {/* STEP 1: Your home */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <ChipQuestion
                        label="What kind of property?"
                        options={OPTIONS.ptype}
                        selected={state.ptype}
                        onSelect={(idx) => toggleSingle('ptype', idx)}
                      />
                      <ChipQuestion
                        label="Property size"
                        options={OPTIONS.size}
                        selected={state.size}
                        onSelect={(idx) => toggleSingle('size', idx)}
                      />
                      <ChipQuestion
                        label="Where is construction right now?"
                        options={OPTIONS.stage}
                        selected={state.stage}
                        onSelect={(idx) => toggleSingle('stage', idx)}
                      />

                      <div className="space-y-3">
                        <ChipQuestion
                          label="Where is the electrical wiring?"
                          options={OPTIONS.elec}
                          selected={state.elec}
                          onSelect={(idx) => toggleSingle('elec', idx)}
                        />
                        <div className="rounded-xl border border-[var(--orbi-line)] overflow-hidden bg-[var(--orbi-surface)] p-3">
                          <VisualDiagram diagramId="wiring" />
                        </div>
                      </div>

                      <ChipQuestion
                        label="Do you own or rent?"
                        options={OPTIONS.own}
                        selected={state.own}
                        onSelect={(idx) => toggleSingle('own', idx)}
                      />
                    </div>
                  )}

                  {/* STEP 2: Household & Pain Points */}
                  {step === 2 && (
                    <div className="space-y-7">
                      <ChipQuestion
                        label="Who is at home?"
                        hint="pick all that apply"
                        options={OPTIONS.people}
                        selectedMulti={state.people}
                        onSelect={(idx) => toggleMulti('people', idx)}
                      />

                      <div className="grid sm:grid-cols-2 gap-6">
                        <ChipQuestion
                          label="How comfortable is everyone with technology?"
                          options={OPTIONS.tech}
                          selected={state.tech}
                          onSelect={(idx) => toggleSingle('tech', idx)}
                        />
                        <ChipQuestion
                          label="Who decides on this project?"
                          options={OPTIONS.decider}
                          selected={state.decider}
                          onSelect={(idx) => toggleSingle('decider', idx)}
                        />
                      </div>

                      {/* Pain Points Tracker */}
                      <div className="space-y-3 pt-4 border-t border-[var(--orbi-line)]">
                        <div>
                          <span className="block text-base font-semibold text-[var(--orbi-ink)]">
                            What frustrates you in your home today?{' '}
                            <small className="font-normal text-[var(--orbi-mute)]">
                              (select all pain points to track)
                            </small>
                          </span>
                          <p className="text-xs text-[var(--orbi-mute)] mt-1">
                            Each pain point automatically highlights proven automation fixes in your discovery brief.
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {PAIN_POINTS.map((pp) => {
                            const active = state.painPoints.includes(pp.id);
                            return (
                              <button
                                key={pp.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() => toggleMulti('painPoints', pp.id)}
                                className={`text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                                  active
                                    ? 'border-[var(--orbi-teal)] bg-[var(--orbi-surface)] ring-1 ring-[var(--orbi-teal)]'
                                    : 'border-[var(--orbi-line)] bg-[var(--orbi-card)] hover:border-[var(--orbi-teal)]'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-display font-semibold text-sm text-[var(--orbi-ink)]">
                                    {pp.title}
                                  </span>
                                  {active && <Check className="w-4 h-4 text-[var(--orbi-teal)] shrink-0" />}
                                </div>
                                <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">
                                  {pp.symptom}
                                </p>
                                {active && (
                                  <p className="text-xs text-[var(--orbi-teal)] font-medium pt-1">
                                    Fix: {pp.solutionHint}
                                  </p>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="pt-2 space-y-1.5">
                          <label htmlFor="f-pain-notes" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Any other specific pain points or recurring issues?{' '}
                            <span className="font-normal text-[var(--orbi-mute)]">(optional)</span>
                          </label>
                          <textarea
                            id="f-pain-notes"
                            rows={3}
                            value={state.painPointNotes}
                            onChange={(e) => setState((p) => ({ ...p, painPointNotes: e.target.value }))}
                            placeholder="e.g., Dining switches are behind the cabinet; basement gets zero mobile/Wi-Fi signal; parents forget to switch off the geyser..."
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-sm text-[var(--orbi-ink)]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: What's possible (12 Visual Feature Cards) */}
                  {step === 3 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {CATEGORIES.map((cat) => (
                        <FeatureCategoryCard
                          key={cat.id}
                          category={cat}
                          priority={state.cats[cat.id]}
                          state={state}
                          isHighlighted={highlightedCat === cat.id}
                          onSetPriority={handleSetCategoryPriority}
                          onToggleFollowUp={handleToggleFollowUp}
                        />
                      ))}
                    </div>
                  )}

                  {/* STEP 4: Daily moments */}
                  {step === 4 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {MOMENTS.map(([title, desc], idx) => {
                        const active = state.moments.includes(idx);
                        return (
                          <button
                            key={title}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleMulti('moments', idx)}
                            className={`text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                              active
                                ? 'border-[var(--orbi-teal)] bg-[var(--orbi-surface)] ring-1 ring-[var(--orbi-teal)]'
                                : 'border-[var(--orbi-line)] bg-[var(--orbi-card)] hover:border-[var(--orbi-teal)]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-display font-semibold text-base text-[var(--orbi-ink)]">
                                {title}
                              </span>
                              {active && <Check className="w-4 h-4 text-[var(--orbi-teal)] shrink-0" />}
                            </div>
                            <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">{desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* STEP 5: Rooms & control (with Smart Wall Keypad photo) */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <ChipQuestion
                        label="Which rooms should be included?"
                        hint="pick all that apply"
                        options={OPTIONS.rooms}
                        selectedMulti={state.rooms}
                        onSelect={(idx) => toggleMulti('rooms', idx)}
                      />

                      <ChipQuestion
                        label="How would you like to control things?"
                        hint="pick all that apply"
                        options={OPTIONS.control}
                        selectedMulti={state.control}
                        onSelect={(idx) => toggleMulti('control', idx)}
                      />

                      <div className="grid md:grid-cols-12 gap-5 items-center rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-surface)] p-4">
                        <div className="md:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-[var(--orbi-line)] bg-[var(--orbi-card)]">
                          <img
                            src={KEYPAD_PHOTO.src}
                            alt={KEYPAD_PHOTO.alt}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:col-span-7 space-y-3">
                          <ChipQuestion
                            label="Switches on the wall"
                            options={OPTIONS.keypad}
                            selected={state.keypad}
                            onSelect={(idx) => toggleSingle('keypad', idx)}
                          />
                          <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">
                            {KEYPAD_PHOTO.caption}
                          </p>
                        </div>
                      </div>

                      <ChipQuestion
                        label="Already have any of these at home?"
                        options={OPTIONS.existing}
                        selectedMulti={state.existing}
                        onSelect={(idx) => toggleMulti('existing', idx)}
                      />
                    </div>
                  )}

                  {/* STEP 6: Budget & timeline */}
                  {step === 6 && (
                    <div className="space-y-6">
                      <ChipQuestion
                        label="Rough budget for smart home automation"
                        options={OPTIONS.budget}
                        selected={state.budget}
                        onSelect={(idx) => toggleSingle('budget', idx)}
                      />
                      <div className="grid sm:grid-cols-2 gap-6">
                        <ChipQuestion
                          label="Interested in easy EMI options?"
                          options={OPTIONS.emi}
                          selected={state.emi}
                          onSelect={(idx) => toggleSingle('emi', idx)}
                        />
                        <ChipQuestion
                          label="How would you like to roll it out?"
                          options={OPTIONS.phase}
                          selected={state.phase}
                          onSelect={(idx) => toggleSingle('phase', idx)}
                        />
                      </div>
                      <ChipQuestion
                        label="When do you want this ready?"
                        options={OPTIONS.timeline}
                        selected={state.timeline}
                        onSelect={(idx) => toggleSingle('timeline', idx)}
                      />
                      <div className="grid sm:grid-cols-2 gap-5 items-start">
                        <ChipQuestion
                          label="Is an architect or interior designer involved?"
                          options={OPTIONS.designer}
                          selected={state.designer}
                          onSelect={(idx) => toggleSingle('designer', idx)}
                        />
                        <div className="space-y-1.5">
                          <label htmlFor="f-designer-name" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                            Their name or studio <span className="font-normal text-[var(--orbi-mute)]">(optional)</span>
                          </label>
                          <input
                            id="f-designer-name"
                            type="text"
                            value={state.designerName}
                            onChange={(e) => setState((p) => ({ ...p, designerName: e.target.value }))}
                            placeholder="e.g., Studio Kaya"
                            className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-2.5 text-sm text-[var(--orbi-ink)]"
                          />
                        </div>
                      </div>
                      <ChipQuestion
                        label="What would you like as the next step?"
                        options={OPTIONS.consult}
                        selected={state.consult}
                        onSelect={(idx) => toggleSingle('consult', idx)}
                      />
                      <div className="space-y-1.5">
                        <label htmlFor="f-notes" className="block text-sm font-semibold text-[var(--orbi-ink)]">
                          Anything else we should know? <span className="font-normal text-[var(--orbi-mute)]">(optional)</span>
                        </label>
                        <textarea
                          id="f-notes"
                          rows={3}
                          value={state.notes}
                          onChange={(e) => setState((p) => ({ ...p, notes: e.target.value }))}
                          placeholder="Specific lighting brands, elder accessibility needs, false ceiling timelines..."
                          className="w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-bg)] px-4 py-3 text-sm text-[var(--orbi-ink)]"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 7: Brief, Centralised DB Export & WhatsApp */}
                  {step === 7 && (
                    <div className="space-y-7">
                      {advisorMode && <AnalysisPanel state={state} />}

                      <div className="space-y-4">
                        <div>
                          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--orbi-ink)]">
                            {state.name ? `${state.name.split(' ')[0]}, here is your discovery brief` : 'Your discovery brief'}
                          </h2>
                          <p className="text-sm text-[var(--orbi-mute)] mt-1">
                            Save your findings to the centralized Orbi database or share the complete structured brief directly over WhatsApp.
                          </p>
                        </div>

                        {/* Export to Centralised Database + WhatsApp Action Box */}
                        <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-surface)] p-5 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              disabled={saveState.saving}
                              onClick={() => handleSaveToDatabase()}
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer disabled:opacity-60 whitespace-nowrap"
                            >
                              <CloudUpload className="w-4 h-4" />
                              {saveState.saving
                                ? 'Saving to Database...'
                                : editingRecordId
                                  ? 'Update in Orbi Database'
                                  : 'Save to Orbi Database'}
                            </button>

                            <a
                              href={buildWhatsAppUrl(state, whatsappTarget)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1f9d55] text-white text-sm font-semibold whitespace-nowrap"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Send on WhatsApp
                            </a>

                            <button
                              type="button"
                              onClick={handleCopyBrief}
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer whitespace-nowrap"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Brief
                            </button>

                            <button
                              type="button"
                              onClick={handleDownloadSingleCsv}
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer whitespace-nowrap"
                            >
                              <Download className="w-4 h-4" />
                              CSV
                            </button>

                            <button
                              type="button"
                              onClick={handleDownloadSingleJson}
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer whitespace-nowrap"
                            >
                              JSON
                            </button>
                          </div>

                          {/* Optional Target WhatsApp Number */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--orbi-line)]">
                            <label htmlFor="wa-target" className="text-xs font-medium text-[var(--orbi-mute)]">
                              Orbi advisor WhatsApp number (optional):
                            </label>
                            <input
                              id="wa-target"
                              type="tel"
                              value={whatsappTarget}
                              onChange={(e) => setWhatsappTarget(e.target.value)}
                              placeholder="e.g. 919845012345 (leave blank to pick contact)"
                              className="flex-1 min-w-[220px] max-w-xs rounded-lg border border-[var(--orbi-line)] bg-[var(--orbi-card)] px-3 py-1.5 text-xs text-[var(--orbi-ink)] font-mono-tabular"
                            />
                          </div>

                          {saveState.message && (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--orbi-teal)] font-medium">
                              <span>
                                ✓ {saveState.message}
                                {saveState.savedId ? ` (Ref: ${saveState.savedId})` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveTab(isAdmin ? 'database' : 'saved')}
                                className="inline-flex items-center gap-1 underline font-semibold cursor-pointer"
                              >
                                <Database className="w-3.5 h-3.5" />
                                View in {isAdmin ? 'Team Database' : 'Saved Briefs'}
                              </button>
                            </div>
                          )}
                          {saveState.error && (
                            <p className="text-xs text-red-600 dark:text-red-400">{saveState.error}</p>
                          )}
                          {copyFeedback && (
                            <p className="text-xs text-[var(--orbi-teal)] font-medium">{copyFeedback}</p>
                          )}
                        </div>

                        {/* Structured Sections Display */}
                        <div className="divide-y divide-[var(--orbi-line)]">
                          {buildBriefSections(state).map(([heading, rows]) => {
                            const filled = rows.filter(([, val]) => Boolean(val && val.trim()));
                            if (!filled.length) return null;
                            return (
                              <div key={heading} className="py-4 space-y-2">
                                <h3 className="font-display text-lg font-semibold text-[var(--orbi-ink)]">
                                  {heading}
                                </h3>
                                <dl className="grid sm:grid-cols-12 gap-x-4 gap-y-1.5 text-sm">
                                  {filled.map(([k, v]) => (
                                    <React.Fragment key={k}>
                                      <dt className="sm:col-span-4 text-[var(--orbi-mute)]">{k}</dt>
                                      <dd className="sm:col-span-8 text-[var(--orbi-ink)]">{v}</dd>
                                    </React.Fragment>
                                  ))}
                                </dl>
                              </div>
                            );
                          })}
                        </div>

                        <details className="pt-2">
                          <summary className="cursor-pointer text-sm font-medium text-[var(--orbi-teal)]">
                            Preview exact WhatsApp message &amp; ORBI-REF code
                          </summary>
                          <textarea
                            readOnly
                            rows={10}
                            value={buildWhatsAppMessage(state)}
                            className="mt-3 w-full rounded-xl border border-[var(--orbi-line)] bg-[var(--orbi-surface)] p-4 text-xs font-mono-tabular text-[var(--orbi-ink)]"
                          />
                        </details>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Sticky Interactive House + Live Summary */}
              <aside className="lg:col-span-4 lg:sticky lg:top-20 space-y-4 order-1 lg:order-2">
                <InteractiveVillaSvg
                  cats={state.cats}
                  onSelectCategory={handleVillaZoneClick}
                  compact={false}
                />

                <div className="rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-5 space-y-4 hidden lg:block">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <h3 className="font-display font-semibold text-[var(--orbi-ink)]">Your brief so far</h3>
                      <span className="text-xs text-[var(--orbi-mute)] font-mono-tabular">
                        {completedSectionsCount}/7 sections
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--orbi-surface)] overflow-hidden mt-2">
                      <div
                        className="h-full bg-[var(--orbi-teal)] transition-all duration-300"
                        style={{ width: `${Math.round((completedSectionsCount / 7) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {state.painPoints.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-[var(--orbi-ink)]">
                        Pain points captured ({state.painPoints.length})
                      </h4>
                      <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">
                        {state.painPoints.map((id) => PAIN_POINTS[id]?.title).filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}

                  {mustCategories.length > 0 || niceCategories.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-[var(--orbi-ink)]">
                        Lighting up your home
                      </h4>
                      {mustCategories.length > 0 && (
                        <p className="text-xs text-[var(--orbi-teal)] font-medium leading-relaxed">
                          Must have: {mustCategories.map((c) => c.name).join(' · ')}
                        </p>
                      )}
                      {niceCategories.length > 0 && (
                        <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">
                          Nice to have: {niceCategories.map((c) => c.name).join(' · ')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--orbi-mute)] leading-relaxed">
                      Tap any part of the home illustration or choose features in Step 4 to watch your home light up.
                    </p>
                  )}

                  {advisorMode && (
                    <div className="pt-3 border-t border-[var(--orbi-line)] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[var(--orbi-ink)]">
                          Lead: {analysis.temp}
                        </span>
                        <span className="font-mono-tabular text-[var(--orbi-teal)] font-semibold">
                          {analysis.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-[var(--orbi-mute)]">
                        Scope: {TIERS[analysis.scope]}
                        {analysis.bt != null ? ` · Budget: ${TIERS[analysis.bt]}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              </aside>
            </div>

            {/* Bottom Step Navigation Bar (Compact for <=15% Mobile Sticky Cap) */}
            <div className="fixed bottom-0 inset-x-0 z-20 bg-[var(--orbi-card)]/95 backdrop-blur-sm border-t border-[var(--orbi-line)] px-4 sm:px-8 py-2.5">
              <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
                <button
                  type="button"
                  hidden={step === 0}
                  onClick={() => goToStep(step - 1)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--orbi-line)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
                <span className="text-xs sm:text-sm text-[var(--orbi-mute)] font-mono-tabular mx-auto">
                  Step {step + 1} of {STEPS.length}
                </span>
                {step < 7 ? (
                  <button
                    type="button"
                    onClick={() => goToStep(step + 1)}
                    className="px-5 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer whitespace-nowrap"
                  >
                    {step === 6 ? 'See my brief' : 'Next'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl border border-[var(--orbi-line)] text-sm font-semibold text-[var(--orbi-ink)] cursor-pointer whitespace-nowrap"
                  >
                    Start new brief
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

interface ChipQuestionProps {
  label: string;
  hint?: string;
  options: string[];
  selected?: number;
  selectedMulti?: number[];
  onSelect: (idx: number) => void;
}

const ChipQuestion: React.FC<ChipQuestionProps> = ({
  label,
  hint,
  options,
  selected,
  selectedMulti,
  onSelect,
}) => {
  return (
    <div className="space-y-2.5" role="group" aria-label={label}>
      <span className="block text-sm font-semibold text-[var(--orbi-ink)]">
        {label}{' '}
        {hint && <small className="font-normal text-[var(--orbi-mute)]">({hint})</small>}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, idx) => {
          const pressed = selectedMulti ? selectedMulti.includes(idx) : selected === idx;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={pressed}
              onClick={() => onSelect(idx)}
              className={`min-h-[42px] px-4 py-2 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
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
};
