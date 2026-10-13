import type { MemoryRound } from '../types/neuro';

export type ReactionPhase = 'idle' | 'waiting' | 'ready' | 'result' | 'early' | 'done';
export type ReactionState = { phase: ReactionPhase; trials: number[] };
export type ReactionEvent = { type: 'start' | 'cue' | 'reset' } | { type: 'hit'; ms?: number };
export function reactionReducer(s: ReactionState, e: ReactionEvent): ReactionState {
  if (e.type === 'reset') return { phase: 'idle', trials: [] };
  if (e.type === 'start' && ['idle', 'early', 'result'].includes(s.phase))
    return { ...s, phase: 'waiting' };
  if (e.type === 'cue' && s.phase === 'waiting') return { ...s, phase: 'ready' };
  if (e.type === 'hit' && s.phase === 'waiting') return { ...s, phase: 'early' };
  if (
    e.type === 'hit' &&
    s.phase === 'ready' &&
    e.ms !== undefined &&
    Number.isFinite(e.ms) &&
    e.ms > 0 &&
    e.ms <= 10000
  ) {
    const trials = [...s.trials, e.ms];
    return { trials, phase: trials.length === 5 ? 'done' : 'result' };
  }
  return s;
}
export function evaluateSequence(sequence: number[], input: number[]) {
  const correct = sequence.reduce((n, tile, i) => n + (tile === input[i] ? 1 : 0), 0);
  return {
    length: sequence.length,
    correct,
    complete: input.length === sequence.length && correct === sequence.length,
  };
}

export type MemoryState = {
  phase: 'idle' | 'playback' | 'input' | 'finished';
  sequence: number[];
  input: number[];
  result: MemoryRound | null;
};
export type MemoryEvent =
  | { type: 'start'; sequence: number[] }
  | { type: 'playbackEnd' | 'reset' }
  | { type: 'tile'; tile: number };
export const emptyMemoryState = (): MemoryState => ({
  phase: 'idle',
  sequence: [],
  input: [],
  result: null,
});
export function memoryReducer(state: MemoryState, event: MemoryEvent): MemoryState {
  if (event.type === 'reset') return emptyMemoryState();
  if (
    event.type === 'start' &&
    event.sequence.length >= 3 &&
    event.sequence.length <= 7 &&
    event.sequence.every((n) => Number.isInteger(n) && n >= 0 && n <= 8)
  )
    return { phase: 'playback', sequence: [...event.sequence], input: [], result: null };
  if (event.type === 'playbackEnd' && state.phase === 'playback')
    return { ...state, phase: 'input' };
  if (
    event.type === 'tile' &&
    state.phase === 'input' &&
    Number.isInteger(event.tile) &&
    event.tile >= 0 &&
    event.tile <= 8
  ) {
    const input = [...state.input, event.tile];
    if (input.length === state.sequence.length)
      return {
        ...state,
        phase: 'finished',
        input,
        result: evaluateSequence(state.sequence, input),
      };
    return { ...state, input };
  }
  return state;
}
