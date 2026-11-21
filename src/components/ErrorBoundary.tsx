import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--orbi-bg)] text-[var(--orbi-ink)]">
          <div className="max-w-lg w-full rounded-2xl border border-[var(--orbi-line)] bg-[var(--orbi-card)] p-8 space-y-4">
            <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-xl font-semibold">Something interrupted your session</h2>
            </div>
            <p className="text-sm text-[var(--orbi-mute)] leading-relaxed">
              Your local questionnaire progress is safely preserved in your browser. You can reload to continue seamlessly.
            </p>
            <pre className="text-xs font-mono-tabular p-3 rounded-lg bg-[var(--orbi-surface)] border border-[var(--orbi-line)] overflow-x-auto text-[var(--orbi-mute)]">
              {this.state.errorMessage}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--orbi-teal)] text-[var(--orbi-onteal)] text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
