'use client';
import { create } from 'zustand';
import type { Draft, Session } from '../types/neuro';
import { emptyDraft, sanitizeDraft, sanitizeSession } from '../lib/validation';
const KEY = 'neurotwin:v1';
type Store = {
  hydrated: boolean;
  consent: boolean;
  storageError: boolean;
  draft: Draft;
  sessions: Session[];
  hydrate: () => void;
  allowStorage: () => void;
  setDraft: (patch: Partial<Draft>) => void;
  saveSession: (s: Session) => void;
  resetDraft: () => void;
  removeAll: () => void;
};
export const useNeuroStore = create<Store>((set, get) => {
  const persist = () => {
    const s = get();
    if (!s.consent) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ schemaVersion: 1, consent: true, draft: s.draft, sessions: s.sessions }),
      );
      set({ storageError: false });
    } catch {
      set({ storageError: true });
    }
  };
  return {
    hydrated: false,
    consent: false,
    storageError: false,
    draft: emptyDraft(),
    sessions: [],
    hydrate: () => {
      if (get().hydrated) return;
      try {
        const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
        if (v?.schemaVersion === 1 && v.consent === true)
          set({
            consent: true,
            draft: sanitizeDraft(v.draft),
            sessions: Array.isArray(v.sessions)
              ? v.sessions
                  .map(sanitizeSession)
                  .filter((s: Session | null): s is Session => !!s)
                  .slice(0, 20)
              : [],
          });
        else localStorage.removeItem(KEY);
      } catch {
        try {
          localStorage.removeItem(KEY);
        } catch {
          set({ storageError: true });
        }
      }
      set({ hydrated: true });
    },
    allowStorage: () => {
      set({ consent: true });
      persist();
    },
    setDraft: (patch) => {
      set({ draft: { ...get().draft, ...patch } });
      persist();
    },
    saveSession: (s) => {
      set({ sessions: [s, ...get().sessions].slice(0, 20), draft: emptyDraft() });
      persist();
    },
    resetDraft: () => {
      set({ draft: emptyDraft() });
      persist();
    },
    removeAll: () => {
      set({ draft: emptyDraft(), sessions: [], consent: false, storageError: false });
      try {
        localStorage.removeItem(KEY);
      } catch {
        set({ storageError: true });
      }
    },
  };
});
