// src/types/techTree.d.ts

export interface TechEffect {
  type: string; // e.g., "production_bonus", "energy_reduction", "unlock_building", "storage_bonus"
  value?: number; // e.g., 0.1 for 10% bonus
  buildingId?: string; // for unlock_building effect
}

export interface TechNode {
  nodeId: string;
  name: string;
  description: string;
  icon: string;
  tier: number; // 0-10
  prerequisites: string[]; // List of nodeId strings
  cost: number; // Research points
  unlockedAt: number | null; // Timestamp when unlocked, null if not unlocked
  effect: TechEffect;
}

export interface TechTree {
  Production: TechNode[];
  Efficiency: TechNode[];
  Automation: TechNode[];
  Logistics: TechNode[];
  Energy: TechNode[];
}
