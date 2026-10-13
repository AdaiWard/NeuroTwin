import type { Session } from '../types/neuro';
import { computeScores } from './scoring';
const intake = { sleep: 7.5, focus: 8, memory: 7, stress: 4, activity: 'moderate' as const };
const reaction = [243, 281, 256, 267, 249];
const memory = [
  { length: 3, correct: 3, complete: true },
  { length: 4, correct: 4, complete: true },
  { length: 5, correct: 5, complete: true },
  { length: 6, correct: 4, complete: false },
  { length: 7, correct: 4, complete: false },
];
export const demoSession: Session = {
  schemaVersion: 1,
  id: 'demo',
  createdAt: '2026-01-01T12:00:00.000Z',
  demo: true,
  intake,
  reaction,
  memory,
  scores: computeScores(intake, reaction, memory),
};
