// src/backend/researchApi.ts

import { ResearchQueueItem, ResearchState } from '../types/research';
import { TechNode } from '../types/techTree';
import { techTreeApi } from './techTreeApi';

class ResearchAPI {
  private researchState: ResearchState = {
    researchPoints: 0,
    researchPerSecond: 1, // Default research point generation
    researchQueue: [],
    unlockedTechs: [],
  };

  private maxQueueSize: number = 2; // Default queue size

  constructor() {
    // Load initial state if available from storage
    // For now, it's an empty initial state
  }

  public getResearchState(): ResearchState {
    return { ...this.researchState };
  }

  public addResearchPoints(points: number): void {
    this.researchState.researchPoints += points;
  }

  public spendResearchPoints(points: number): boolean {
    if (this.researchState.researchPoints >= points) {
      this.researchState.researchPoints -= points;
      return true;
    }
    return false;
  }

  public startResearch(nodeId: string): { success: boolean; message?: string } {
    const techNode = techTreeApi.getTechNode(nodeId);

    if (!techNode) {
      return { success: false, message: 'Technology not found.' };
    }
    if (this.researchState.unlockedTechs.includes(nodeId)) {
      return { success: false, message: 'Technology already unlocked.' };
    }
    if (this.researchState.researchQueue.some(item => item.nodeId === nodeId)) {
      return { success: false, message: 'Technology already in research queue.' };
    }
    if (this.researchState.researchQueue.length >= this.maxQueueSize) {
      return { success: false, message: `Research queue is full. Max size: ${this.maxQueueSize}` };
    }

    // Check prerequisites
    for (const prereqId of techNode.prerequisites) {
      if (!this.researchState.unlockedTechs.includes(prereqId)) {
        return { success: false, message: `Prerequisite "${techTreeApi.getTechNode(prereqId)?.name || prereqId}" not met.` };
      }
    }

    const newItem: ResearchQueueItem = {
      nodeId: nodeId,
      startTime: Date.now(),
      progress: 0,
      totalCost: techNode.cost,
      timeToCompletion: techNode.cost / this.researchState.researchPerSecond, // Initial estimate
    };

    this.researchState.researchQueue.push(newItem);
    return { success: true, message: `Started research for "${techNode.name}".` };
  }

  public cancelResearch(nodeId: string): { success: boolean; message?: string } {
    const index = this.researchState.researchQueue.findIndex(item => item.nodeId === nodeId);
    if (index > -1) {
      const cancelledItem = this.researchState.researchQueue[index];
      // Refund partial research points - for simplicity, refund all accumulated progress
      this.researchState.researchPoints += cancelledItem.progress;
      this.researchState.researchQueue.splice(index, 1);
      return { success: true, message: `Cancelled research for "${techTreeApi.getTechNode(nodeId)?.name || nodeId}".` };
    }
    return { success: false, message: 'Technology not found in research queue.' };
  }

  public updateResearch(deltaTime: number): void {
    const researchPointsGenerated = deltaTime * this.researchState.researchPerSecond;
    this.researchState.researchPoints += researchPointsGenerated;

    if (this.researchState.researchQueue.length > 0) {
      let pointsToDistribute = Math.min(this.researchState.researchPoints, researchPointsGenerated);

      // Distribute points to research queue items
      for (let i = 0; i < this.researchState.researchQueue.length && pointsToDistribute > 0; i++) {
        const item = this.researchState.researchQueue[i];
        const techNode = techTreeApi.getTechNode(item.nodeId);
        if (!techNode) {
          // Should not happen, but handle it
          this.researchState.researchQueue.splice(i, 1);
          i--;
          continue;
        }

        const remainingCost = item.totalCost - item.progress;
        const pointsApplied = Math.min(pointsToDistribute, remainingCost);

        item.progress += pointsApplied;
        this.researchState.researchPoints -= pointsApplied; // Consume earned points
        pointsToDistribute -= pointsApplied;

        item.timeToCompletion = (item.totalCost - item.progress) / this.researchState.researchPerSecond;

        if (item.progress >= item.totalCost) {
          this.unlockTech(item.nodeId);
          this.researchState.researchQueue.splice(i, 1);
          i--; // Adjust index due to removal
        }
      }
    }
  }

  private unlockTech(nodeId: string): void {
    if (!this.researchState.unlockedTechs.includes(nodeId)) {
      this.researchState.unlockedTechs.push(nodeId);
      const techNode = techTreeApi.getTechNode(nodeId);
      if (techNode) {
        console.log(`Technology "${techNode.name}" unlocked! Applying effects...`);
        // TODO: Apply effects to the game engine
        // This would involve calling other APIs or updating game state directly
        // Based on techNode.effect
      }
    }
  }

  public setResearchPerSecond(rps: number): void {
    this.researchState.researchPerSecond = rps;
  }

  public incrementMaxQueueSize(): void {
    this.maxQueueSize++;
  }
}

export const researchApi = new ResearchAPI();
