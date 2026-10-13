import type { Draft, Intake, MemoryRound, Session } from '../types/neuro';
import { computeScores } from './scoring';
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
export function sanitizeIntake(v: unknown): Intake {
  if (!record(v)) return {};
  const out: Intake = {};
  for (const key of ['sleep', 'stress', 'focus', 'memory'] as const) {
    const n = v[key];
    if (
      typeof n === 'number' &&
      Number.isFinite(n) &&
      n >= (key === 'sleep' ? 0 : 1) &&
      n <= (key === 'sleep' ? 12 : 10)
    )
      out[key] = n;
  }
  if (['low', 'moderate', 'high'].includes(String(v.activity)))
    out.activity = v.activity as Intake['activity'];
  if (['18–24', '25–34', '35–44', '45–54', '55+', 'under18'].includes(String(v.age)))
    out.age = String(v.age);
  return out;
}
export function validTrials(v: unknown): number[] {
  return Array.isArray(v)
    ? v
        .filter(
          (n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0 && n <= 10000,
        )
        .slice(0, 5)
    : [];
}
export function validRounds(v: unknown): MemoryRound[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 5)
    .filter(
      (r): r is MemoryRound =>
        record(r) &&
        typeof r.length === 'number' &&
        Number.isInteger(r.length) &&
        r.length >= 3 &&
        r.length <= 7 &&
        typeof r.correct === 'number' &&
        Number.isInteger(r.correct) &&
        r.correct >= 0 &&
        r.correct <= r.length &&
        typeof r.complete === 'boolean' &&
        r.complete === (r.correct === r.length),
    );
}
export function sanitizeSession(v: unknown): Session | null {
  if (
    !record(v) ||
    v.schemaVersion !== 1 ||
    typeof v.id !== 'string' ||
    v.id.length > 100 ||
    typeof v.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(v.createdAt)) ||
    v.demo !== false
  )
    return null;
  const intake = sanitizeIntake(v.intake),
    reaction = validTrials(v.reaction),
    memory = validRounds(v.memory);
  return {
    schemaVersion: 1,
    id: v.id,
    createdAt: v.createdAt,
    demo: false,
    intake,
    reaction,
    memory,
    scores: computeScores(intake, reaction, memory),
  };
}
export const emptyDraft = (): Draft => ({
  step: 0,
  intake: {},
  reaction: [],
  memory: [],
  reactionSkipped: false,
  memorySkipped: false,
});
export function sanitizeDraft(v: unknown): Draft {
  if (!record(v)) return emptyDraft();
  const reaction = validTrials(v.reaction),
    memory = validRounds(v.memory);
  let step =
    typeof v.step === 'number' && Number.isInteger(v.step) ? Math.max(0, Math.min(3, v.step)) : 0;
  if (step > 1 && reaction.length !== 5 && v.reactionSkipped !== true) step = 1;
  if (step > 2 && memory.length !== 5 && v.memorySkipped !== true) step = 2;
  return {
    step,
    intake: sanitizeIntake(v.intake),
    reaction,
    memory,
    reactionSkipped: v.reactionSkipped === true,
    memorySkipped: v.memorySkipped === true,
  };
}
