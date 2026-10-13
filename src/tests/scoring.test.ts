import { describe, expect, it } from 'vitest';
import {
  computeScores,
  median,
  memoryEvidence,
  rating,
  reactionIndex,
  weighted,
} from '../lib/scoring';
import { sanitizeDraft, sanitizeIntake, sanitizeSession } from '../lib/validation';
import {
  reactionReducer,
  evaluateSequence,
  memoryReducer,
  emptyMemoryState,
  type ReactionState,
} from '../lib/tasks';
describe('transparent scoring', () => {
  it('normalizes endpoints and clamps extremes', () => {
    expect(rating(1)).toBe(0);
    expect(rating(10)).toBe(100);
    expect(rating(-50)).toBe(0);
    expect(rating(1000)).toBe(100);
    expect(rating(NaN)).toBeNull();
    expect(rating()).toBeNull();
  });
  it('uses a median and excludes non-finite values', () => {
    expect(median([200, 1000, 250, 230, 260])).toBe(250);
    expect(median([2, 4])).toBe(3);
    expect(median([NaN, -2])).toBeNull();
  });
  it('requires five legitimate trials and maps the documented endpoints', () => {
    expect(reactionIndex([180, 180, 180, 180, 180])).toBe(100);
    expect(reactionIndex([600, 600, 600, 600, 600])).toBe(0);
    expect(reactionIndex([20, 30, 40, 50, 60])).toBe(100);
    expect(reactionIndex([200])).toBeNull();
    expect(reactionIndex([200, 200, 0, 200, 200])).toBeNull();
    expect(reactionIndex([200, 200, Infinity, 200, 200])).toBeNull();
  });
  it('computes the exact normal case', () => {
    expect(
      computeScores(
        { focus: 10, memory: 10, stress: 1, sleep: 8, activity: 'high' },
        [180, 180, 180, 180, 180],
        [3, 4, 5, 6, 7].map((length) => ({ length, correct: length, complete: true })),
      ),
    ).toEqual({ attention: 100, memory: 100, executive: 100, stress: 0 });
  });
  it('renormalizes missing components without fabricating observations', () => {
    expect(computeScores({}, [], [])).toEqual({
      attention: null,
      memory: null,
      executive: null,
      stress: null,
    });
    expect(computeScores({ focus: 10 }, [], [])).toEqual({
      attention: 100,
      memory: null,
      executive: 100,
      stress: null,
    });
    expect(
      weighted([
        [null, 0.45],
        [80, 0.55],
      ]),
    ).toBe(80);
    expect(computeScores({ sleep: 6 }, [], []).stress).toBe(50);
  });
  it('bounds extreme stress, sleep and penalty', () => {
    const s = computeScores(
      { focus: 1, memory: 1, stress: 10, sleep: 0, activity: 'low' },
      [9000, 9000, 9000, 9000, 9000],
      [3, 4, 5, 6, 7].map((length) => ({ length, correct: 0, complete: false })),
    );
    expect(s).toEqual({ attention: 0, memory: 0, executive: 0, stress: 100 });
    expect(computeScores({ sleep: 12, stress: 1 }, [], []).stress).toBe(0);
  });
  it('does not award full memory index for one trivial round', () => {
    const m = memoryEvidence([{ length: 3, correct: 3, complete: true }]);
    expect(m.accuracy).toBe(1);
    expect(m.index).toBeCloseTo(77.142857);
    expect(m.span).toBe(3);
    expect(memoryEvidence([]).index).toBeNull();
    expect(memoryEvidence([{ length: 0, correct: 0, complete: true }]).index).toBeNull();
  });
  it('includes errors in the accuracy denominator and separates achieved span', () => {
    const m = memoryEvidence([
      { length: 3, correct: 3, complete: true },
      { length: 4, correct: 2, complete: false },
    ]);
    expect(m.accuracy).toBe(5 / 7);
    expect(m.span).toBe(3);
  });
});
describe('persistence validation', () => {
  it('rejects unknown versions, demo contamination and malformed sessions', () => {
    expect(sanitizeSession({ schemaVersion: 2 })).toBeNull();
    expect(sanitizeSession({ schemaVersion: 1, demo: true })).toBeNull();
    expect(sanitizeSession(null)).toBeNull();
  });
  it('sanitizes ranges and recomputes scores rather than trusting stored scores', () => {
    expect(
      sanitizeIntake({ focus: 11, sleep: -1, stress: '7', activity: 'extreme', memory: 7 }),
    ).toEqual({ memory: 7 });
    const s = sanitizeSession({
      schemaVersion: 1,
      id: 'x',
      createdAt: '2026-01-01',
      demo: false,
      intake: { focus: 10 },
      reaction: [],
      memory: [],
      scores: { attention: 999 },
    });
    expect(s?.scores.attention).toBe(100);
  });
  it('repairs draft steps whose prerequisite tasks are missing', () => {
    expect(sanitizeDraft({ step: 3 }).step).toBe(1);
    expect(sanitizeDraft({ step: 3, reactionSkipped: true, memorySkipped: true }).step).toBe(3);
    expect(sanitizeDraft({ step: NaN }).step).toBe(0);
  });
});
describe('mini-task transitions', () => {
  it('blocks memory input during playback, prevents over-entry and resets without leaking a result', () => {
    const playing = memoryReducer(emptyMemoryState(), { type: 'start', sequence: [2, 4, 6] });
    expect(memoryReducer(playing, { type: 'tile', tile: 2 })).toEqual(playing);
    let answering = memoryReducer(playing, { type: 'playbackEnd' });
    answering = memoryReducer(answering, { type: 'tile', tile: 2 });
    expect(answering.result).toBeNull();
    answering = memoryReducer(answering, { type: 'tile', tile: 4 });
    const done = memoryReducer(answering, { type: 'tile', tile: 6 });
    expect(done.phase).toBe('finished');
    expect(done.result).toEqual({ length: 3, correct: 3, complete: true });
    expect(memoryReducer(done, { type: 'tile', tile: 0 })).toEqual(done);
    expect(memoryReducer(done, { type: 'reset' })).toEqual(emptyMemoryState());
  });
  it('excludes false starts and ignores double hits', () => {
    const waiting: ReactionState = { phase: 'waiting', trials: [] };
    const early = reactionReducer(waiting, { type: 'hit', ms: 100 });
    expect(early).toEqual({ phase: 'early', trials: [] });
    expect(reactionReducer(early, { type: 'cue' })).toEqual(early);
    const result = reactionReducer({ phase: 'ready', trials: [] }, { type: 'hit', ms: 240 });
    expect(result).toEqual({ phase: 'result', trials: [240] });
    expect(reactionReducer(result, { type: 'hit', ms: 1 })).toEqual(result);
  });
  it('completes only on the fifth valid trial and resets cleanly', () => {
    const done = reactionReducer(
      { phase: 'ready', trials: [210, 220, 230, 240] },
      { type: 'hit', ms: 250 },
    );
    expect(done.phase).toBe('done');
    expect(reactionReducer(done, { type: 'start' }).phase).toBe('done');
    expect(reactionReducer(done, { type: 'reset' })).toEqual({ phase: 'idle', trials: [] });
  });
  it('rejects invalid latency', () => {
    const ready: ReactionState = { phase: 'ready', trials: [] };
    expect(reactionReducer(ready, { type: 'hit', ms: -1 })).toEqual(ready);
  });
  it('checks each memory position and requires a complete exact sequence', () => {
    expect(evaluateSequence([1, 2, 3], [1, 5, 3])).toEqual({
      length: 3,
      correct: 2,
      complete: false,
    });
    expect(evaluateSequence([1, 2, 3], [1, 2, 3])).toEqual({
      length: 3,
      correct: 3,
      complete: true,
    });
    expect(evaluateSequence([1, 2, 3], [1])).toEqual({ length: 3, correct: 1, complete: false });
  });
});
