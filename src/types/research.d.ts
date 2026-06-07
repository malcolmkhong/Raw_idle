// src/types/research.d.ts

export interface ResearchQueueItem {
  nodeId: string;
  startTime: number; // Timestamp when research started
  progress: number; // Current research points accumulated for this item
  totalCost: number; // Total research points required
  timeToCompletion: number; // Estimated time in seconds
}

export interface ResearchState {
  researchPoints: number; // Current available research points
  researchPerSecond: number; // How many research points generated per second
  researchQueue: ResearchQueueItem[];
  unlockedTechs: string[]; // List of nodeId strings of unlocked technologies
}
