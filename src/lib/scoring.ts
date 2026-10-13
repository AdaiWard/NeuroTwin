import type { Intake, MemoryRound, Scores } from '../types/neuro';
export const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
export function rating(v?: number): number | null {
  return v === undefined || !Number.isFinite(v) ? null : ((clamp(v, 1, 10) - 1) / 9) * 100;
}
export function median(values: number[]): number | null {
  const a = values.filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
export function reactionIndex(values: number[]): number | null {
  if (values.length !== 5 || values.some((v) => !Number.isFinite(v) || v <= 0 || v > 10000))
    return null;
  const m = median(values);
  return m === null ? null : clamp((100 * (600 - m)) / 420);
}
export function memoryEvidence(rounds: MemoryRound[]) {
  const valid = rounds.filter(
    (r) =>
      Number.isFinite(r.length) && r.length >= 3 && r.length <= 7 && Number.isFinite(r.correct),
  );
  const total = valid.reduce((n, r) => n + r.length, 0);
  const correct = valid.reduce((n, r) => n + clamp(r.correct, 0, r.length), 0);
  const span = valid.reduce(
    (n, r) => (r.complete && r.correct === r.length ? Math.max(n, r.length) : n),
    0,
  );
  const accuracy = total ? correct / total : 0;
  return { accuracy, span, index: total ? clamp(100 * (0.6 * accuracy + (0.4 * span) / 7)) : null };
}
export function weighted(parts: [number | null, number][]): number | null {
  const available = parts.filter(([v]) => v !== null && Number.isFinite(v));
  const weight = available.reduce((s, [, w]) => s + w, 0);
  return weight ? available.reduce((s, [v, w]) => s + (v ?? 0) * w, 0) / weight : null;
}
export function computeScores(intake: Intake, reaction: number[], memory: MemoryRound[]): Scores {
  const attention = weighted([
    [rating(intake.focus), 0.45],
    [reactionIndex(reaction), 0.55],
  ]);
  const memoryScore = weighted([
    [rating(intake.memory), 0.35],
    [memoryEvidence(memory).index, 0.65],
  ]);
  const activity = intake.activity ? { low: 25, moderate: 60, high: 100 }[intake.activity] : null;
  const composite = weighted([
    [attention, 0.45],
    [memoryScore, 0.45],
    [activity, 0.1],
  ]);
  const penalty = intake.stress === undefined ? 0 : 10 * clamp((intake.stress - 5) / 5, 0, 1);
  const sleep =
    intake.sleep === undefined || !Number.isFinite(intake.sleep)
      ? null
      : clamp(((8 - clamp(intake.sleep, 0, 12)) / 4) * 100);
  const rounded = (v: number | null) => (v === null ? null : Math.round(clamp(v)));
  return {
    attention: rounded(attention),
    memory: rounded(memoryScore),
    executive: rounded(composite === null ? null : composite - penalty),
    stress: rounded(
      weighted([
        [rating(intake.stress), 0.75],
        [sleep, 0.25],
      ]),
    ),
  };
}
