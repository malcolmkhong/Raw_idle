import { Building } from './building';
import { Resource } from './resource';
import { Recipe } from './recipe';
import { GameEvent } from './eventSystem';

export interface GameState {
    buildings: Building[];
    resources: Resource[];
    recipes: Recipe[];
    activeEvents: GameEvent[];
    lastSaveTime: number; // Timestamp of last save
    lastPlayedTime: number; // Timestamp when player last played (for offline production)
    // Add other game state variables as needed (e.g., player inventory, research progress, currency, etc.)
}

export class SaveLoadSystem {
    // In a real application, this would interact with a database or local storage
    private static SAVE_KEY = 'idleFactoryGameSave';

    saveGame(state: GameState): boolean {
        try {
            const serializedState = JSON.stringify(state);
            // In a real game, this would be sent to a backend API for database storage
            // For now, we'll log it to console to simulate saving
            // localStorage.setItem(SaveLoadSystem.SAVE_KEY, serializedState);
            console.log('Game saved successfully!');
            return true;
        } catch (error) {
            console.error('Error saving game:', error);
            return false;
        }
    }

    loadGame(): GameState | null {
        try {
            // In a real game, this would fetch from a backend API or local storage
            // const serializedState = localStorage.getItem(SaveLoadSystem.SAVE_KEY);
            const serializedState = null; // Simulate no save data for now

            if (serializedState) {
                const state: GameState = JSON.parse(serializedState);
                console.log('Game loaded successfully!', state);
                return state;
            } else {
                console.log('No saved game found.');
                return null;
            }
        } catch (error) {
            console.error('Error loading game:', error);
            return null;
        }
    }

    // Method to create an initial game state if no save is found
    createInitialGameState(): GameState {
        return {
            buildings: [],
            resources: [],
            recipes: [],
            activeEvents: [],
            lastSaveTime: Date.now(),
            lastPlayedTime: Date.now(),
        };
    }

    // Utility to serialize/deserialize specific complex objects if needed
}
