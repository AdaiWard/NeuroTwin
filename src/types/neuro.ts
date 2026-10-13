export type Region = 'attention' | 'memory' | 'executive' | 'stress';
export type Intake = {
  age?: string;
  sleep?: number;
  stress?: number;
  focus?: number;
  memory?: number;
  activity?: 'low' | 'moderate' | 'high';
};
export type MemoryRound = { length: number; correct: number; complete: boolean };
export type Draft = {
  step: number;
  intake: Intake;
  reaction: number[];
  memory: MemoryRound[];
  reactionSkipped: boolean;
  memorySkipped: boolean;
};
export type Scores = Record<Region, number | null>;
export type Session = {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  demo: boolean;
  intake: Intake;
  reaction: number[];
  memory: MemoryRound[];
  scores: Scores;
};
