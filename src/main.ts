// src/main.ts

import { techTreeApi } from './backend/techTreeApi';
import { researchApi } from './backend/researchApi';
import { TechNode } from './types/techTree';

console.log("Starting Idle Factory Game Simulation...");

// Initialize tech tree and research API
techTreeApi; // This will load the tech tree on instantiation
researchApi; // This will initialize the research API

researchApi.setResearchPerSecond(10); // Set to 10 research points per second for faster simulation

// --- Simulation Setup ---
let gameTickInterval: NodeJS.Timeout;
let lastTickTime = Date.now();
const TICK_RATE = 100; // milliseconds per tick (0.1 second)

function gameLoop() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastTickTime) / 1000; // in seconds
  lastTickTime = currentTime;

  // --- Research System Update ---
  researchApi.updateResearch(deltaTime);

  // --- Display Game State (simplified) ---
  console.log("\n--- Game State Update ---");
  const researchState = researchApi.getResearchState();
  console.log(`Research Points: ${researchState.researchPoints.toFixed(2)}`);
  console.log(`Research Per Second: ${researchState.researchPerSecond.toFixed(2)}`);
  console.log("Research Queue:");
  if (researchState.researchQueue.length === 0) {
    console.log("  (Empty)");
  }
  else {
    researchState.researchQueue.forEach(item => {
      const node = techTreeApi.getTechNode(item.nodeId);
      console.log(`  - ${node?.name || item.nodeId}: Progress ${(item.progress / item.totalCost * 100).toFixed(2)}% (ETA: ${item.timeToCompletion.toFixed(1)}s)`);
    });
  }
  console.log("Unlocked Technologies:");
  if (researchState.unlockedTechs.length === 0) {
    console.log("  (None)");
  }
  else {
    researchState.unlockedTechs.forEach(nodeId => {
      const node = techTreeApi.getTechNode(nodeId);
      console.log(`  - ${node?.name || nodeId}`);
    });
  }

  // --- Example Actions (Programmatic for simulation) ---
  // Start research for prod_1 if not already in queue or unlocked
  const prod1 = techTreeApi.getTechNode("prod_1");
  if (prod1 && !researchState.unlockedTechs.includes(prod1.nodeId) && !researchState.researchQueue.some(item => item.nodeId === prod1.nodeId)) {
    console.log(`Attempting to start research for ${prod1.name}`);
    const result = researchApi.startResearch(prod1.nodeId);
    console.log(result.message);
  }

  // Start research for eff_1 if prod_1 is unlocked and eff_1 is not
  const eff1 = techTreeApi.getTechNode("eff_1");
  if (prod1 && researchState.unlockedTechs.includes(prod1.nodeId) && eff1 && !researchState.unlockedTechs.includes(eff1.nodeId) && !researchState.researchQueue.some(item => item.nodeId === eff1.nodeId)) {
    console.log(`Attempting to start research for ${eff1.name}`);
    const result = researchApi.startResearch(eff1.nodeId);
    console.log(result.message);
  }

  // Start research for prod_2 if prod_1 is unlocked and prod_2 is not
  const prod2 = techTreeApi.getTechNode("prod_2");
  if (prod1 && researchState.unlockedTechs.includes(prod1.nodeId) && prod2 && !researchState.unlockedTechs.includes(prod2.nodeId) && !researchState.researchQueue.some(item => item.nodeId === prod2.nodeId)) {
    console.log(`Attempting to start research for ${prod2.name}`);
    const result = researchApi.startResearch(prod2.nodeId);
    console.log(result.message);
  }

  // Stop simulation after some time for demonstration
  if (researchState.unlockedTechs.length >= 3) { // Example condition
    console.log("\nSimulation complete. All demo techs unlocked.");
    clearInterval(gameTickInterval);
  }
}

// Start the game loop
gameTickInterval = setInterval(gameLoop, TICK_RATE);
