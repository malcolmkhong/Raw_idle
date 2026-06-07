import { WebSocketServer, WebSocket } from 'ws';
import { GameState, SaveLoadSystem } from '../engine/saveLoadSystem';
import { ProductionEngine } from '../engine/productionEngine';
import { TransferSystem } from '../engine/transferSystem';
import { StorageSystem } from '../engine/storageSystem';
import { EnergySystem } from '../engine/energySystem';
import { EventSystem } from '../engine/eventSystem';
import { OfflineProduction } from '../engine/offlineProduction';
import { Building } from '../engine/building';
import { Resource } from '../engine/resource';

const wss = new WebSocketServer({ port: 8080 });
console.log('WebSocket server started on port 8080');

const saveLoadSystem = new SaveLoadSystem();
let gameState: GameState = saveLoadSystem.createInitialGameState();

// Initialize game systems (these will need actual buildings, resources, recipes loaded from config/data)
const buildingsMap = new Map<string, Building>(); // This will be populated from gameState.buildings
// Example initial building (for testing purposes)
const wood: Resource = { id: 'wood', name: 'Wood', type: 'raw' };
const basicExtractor: Building = {
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

const productionEngine = new ProductionEngine();
const storageSystem = new StorageSystem(buildingsMap);
const energySystem = new EnergySystem(buildingsMap);
const eventSystem = new EventSystem();
const offlineProduction = new OfflineProduction(productionEngine, storageSystem);
const transferSystem = new TransferSystem(buildingsMap);

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
        if (client.readyState === WebSocket.OPEN) {
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
