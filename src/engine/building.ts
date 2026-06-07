
import { Resource } from './resource';

export interface Building {
    id: string;
    name: string;
    type: 'extractor' | 'processor' | 'manufacturer' | 'assembler' | 'generator';
    tier: number;
    efficiency: number; // 0-1 range
    baseProductionRate: number; // Resources per second
    inputs: { resource: Resource; amount: number; }[];
    outputs: { resource: Resource; amount: number; }[];
    storageCapacity: { resource: Resource; capacity: number; }[];
    currentStorage: { resource: Resource; amount: number; }[];
    energyConsumption: number; // Energy units per second
    energyProduction?: number; // Energy units per second (optional)
    connectedBuildings: string[]; // IDs of connected buildings
}
