// src/backend/techTreeApi.ts

import * as fs from 'fs';
import { TechTree, TechNode } from '../types/techTree';

const TECH_TREE_CONFIG_PATH = '/workspace/Raw_idle/tech_tree.json';

class TechTreeAPI {
  private techTree: TechTree | null = null;
  private techNodesMap: Map<string, TechNode> = new Map();

  constructor() {
    this.loadTechTree();
  }

  private loadTechTree(): void {
    try {
      const data = fs.readFileSync(TECH_TREE_CONFIG_PATH, 'utf8');
      this.techTree = JSON.parse(data) as TechTree;
      this.buildTechNodesMap();
      console.log('Tech tree loaded successfully.');
    } catch (error) {
      console.error('Failed to load tech tree:', error);
      this.techTree = null;
    }
  }

  private buildTechNodesMap(): void {
    if (this.techTree) {
      Object.values(this.techTree).forEach(branch => {
        branch.forEach((node: TechNode) => {
          this.techNodesMap.set(node.nodeId, node);
        });
      });
    }
  }

  public getTechTree(): TechTree | null {
    return this.techTree;
  }

  public getTechNode(nodeId: string): TechNode | undefined {
    return this.techNodesMap.get(nodeId);
  }

  public getAllTechNodes(): TechNode[] {
    return Array.from(this.techNodesMap.values());
  }
}

export const techTreeApi = new TechTreeAPI();
