"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const saveLoadSystem_1 = require("../engine/saveLoadSystem");
const productionEngine_1 = require("../engine/productionEngine");
const transferSystem_1 = require("../engine/transferSystem");
const storageSystem_1 = require("../engine/storageSystem");
const energySystem_1 = require("../engine/energySystem");
const eventSystem_1 = require("../engine/eventSystem");
const offlineProduction_1 = require("../engine/offlineProduction");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log('WebSocket server started on port 8080');
const saveLoadSystem = new saveLoadSystem_1.SaveLoadSystem();
let gameState = saveLoadSystem.createInitialGameState();
// Initialize game systems (these will need actual buildings, resources, recipes loaded from config/data)
const buildingsMap = new Map(); // This will be populated from gameState.buildings
// Example initial building (for testing purposes)
const wood = { id: 'wood', name: 'Wood', type: 'raw' };
const basicExtractor = {
    id: 'extractor-001',
    name: 'Basic Wood Extractor',
    type: 'extractor',
    tier: 1,
    efficiency: 1.0,
    baseProductionRate: 10, // 10 wood per second
    inputs: [],
    outputs: [{ resource: wood, amount: 1 }],
    storageCapacity: [{ resource: wood, capacity: 1000 }],
    currentStorage: [{ resource: wood, amount: 0 }],
    energyConsumption: 5,
    connectedBuildings: [],
};
buildingsMap.set(basicExtractor.id, basicExtractor);
gameState.buildings.push(basicExtractor);
gameState.resources.push(wood);
const productionEngine = new productionEngine_1.ProductionEngine();
const storageSystem = new storageSystem_1.StorageSystem(buildingsMap);
const energySystem = new energySystem_1.EnergySystem(buildingsMap);
const eventSystem = new eventSystem_1.EventSystem();
const offlineProduction = new offlineProduction_1.OfflineProduction(productionEngine, storageSystem);
const transferSystem = new transferSystem_1.TransferSystem(buildingsMap);
// Register initial resources and buildings with the production engine
gameState.resources.forEach(res => productionEngine.registerResource(res));
gameState.buildings.forEach(b => productionEngine.registerBuilding(b));
// Game loop settings
const TICK_RATE_MS = 1000; // 1 second per tick
const AUTOSAVE_INTERVAL_MS = 30 * 1000; // 30 seconds
const EVENT_TRIGGER_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let lastTickTime = Date.now();
let lastAutosaveTime = Date.now();
let lastEventTriggerTime = Date.now();
// Function to send game state to all connected clients
function broadcastGameState() {
    wss.clients.forEach(client => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'gameState', payload: gameState }));
        }
    });
}
// Main game loop
function gameLoop() {
    const currentTime = Date.now();
    const deltaTimeSeconds = (currentTime - lastTickTime) / 1000;
    lastTickTime = currentTime;
    // 1. Process Offline Production on load (or first tick if coming back).
    // This should ideally happen once when a user connects or when the server starts up and loads state.
    // For multi-user, this might be calculated per-user upon connection.
    // Here, we'll simulate a global offline calculation when the server starts or resets.
    if (gameState.lastPlayedTime < currentTime - TICK_RATE_MS) { // Check if there was significant offline time
        console.log('Calculating offline production...');
        const offlineProduced = offlineProduction.calculateOfflineProduction(gameState.lastPlayedTime, currentTime, buildingsMap);
        // Apply offline produced resources to buildings
        offlineProduced.forEach((resources, buildingId) => {
            resources.forEach(res => {
                // storageSystem.addResources(buildingId, res.resource, res.amount); // Already handled in calculateOfflineProduction
            });
        });
    }
    gameState.lastPlayedTime = currentTime;
    // 2. Update Events
    eventSystem.updateEvents();
    // Trigger new events randomly
    if (currentTime - lastEventTriggerTime > EVENT_TRIGGER_INTERVAL_MS) {
        eventSystem.triggerRandomEvent();
        lastEventTriggerTime = currentTime;
    }
    // 3. Energy Consumption and Production
    energySystem.applyPowerShortageEffects();
    // 4. Production Calculation
    buildingsMap.forEach(building => {
        const productionResult = productionEngine.calculateProduction(building.id, deltaTimeSeconds);
        productionResult.produced.forEach(item => {
            storageSystem.addResources(building.id, item.resource, item.amount);
        });
        // TODO: Handle consumed resources
    });
    // 5. Resource Transfers (simplified for now)
    // Example: Try to transfer wood from basicExtractor to some other imagined building if it existed
    // transferSystem.transferResources('extractor-001', 'some-other-building', wood, 5);
    // 6. Autosave
    if (currentTime - lastAutosaveTime > AUTOSAVE_INTERVAL_MS) {
        gameState.lastSaveTime = currentTime;
        saveLoadSystem.saveGame(gameState);
        lastAutosaveTime = currentTime;
    }
    broadcastGameState(); // Send updated state to clients
}
// Start game loop
setInterval(gameLoop, TICK_RATE_MS);
wss.on('connection', ws => {
    console.log('Client connected');
    // Send initial game state to new client
    ws.send(JSON.stringify({ type: 'gameState', payload: gameState }));
    ws.on('message', message => {
        console.log(`Received message: ${message}`);
        // Handle incoming messages from clients (e.g., player actions)
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});
