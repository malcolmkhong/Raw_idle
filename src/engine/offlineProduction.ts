import { Building } from './building';
import { Resource } from './resource';
import { ProductionEngine } from './productionEngine';
import { StorageSystem } from './storageSystem';
import { EfficiencyModifiers } from './efficiencyModifiers';

export class OfflineProduction {
    private productionEngine: ProductionEngine;
    private storageSystem: StorageSystem;

    constructor(productionEngine: ProductionEngine, storageSystem: StorageSystem) {
        this.productionEngine = productionEngine;
        this.storageSystem = storageSystem;
    }

    calculateOfflineProduction(lastPlayedTime: number, currentTime: number, buildings: Map<string, Building>): Map<string, {
        resource: Resource;
        amount: number;
    }[]> {
        const offlineDurationSeconds = (currentTime - lastPlayedTime) / 1000;
        if (offlineDurationSeconds <= 0) {
            return new Map();
        }

        console.log(`Calculating offline production for ${offlineDurationSeconds.toFixed(0)} seconds.`);

        const producedResources: Map<string, { resource: Resource; amount: number; }[]> = new Map();

        buildings.forEach(building => {
            // Assume no events or tech bonuses for simplicity during offline calculation for now
            const efficiency = EfficiencyModifiers.calculateCumulativeEfficiency(building);

            // This part needs to be more sophisticated, involving recipes and input/output for each building
            // For now, a very simplified model where extractors just produce.
            if (building.type === 'extractor' && building.outputs.length > 0) {
                const outputResource = building.outputs[0].resource;
                const baseProduction = building.baseProductionRate * efficiency;
                const theoreticalProduction = baseProduction * offlineDurationSeconds;

                // Get available storage and add resources, handling overflow
                const addedAmount = this.storageSystem.addResources(building.id, outputResource, theoreticalProduction);

                if (!producedResources.has(building.id)) {
                    producedResources.set(building.id, []);
                }
                producedResources.get(building.id)?.push({ resource: outputResource, amount: addedAmount });
            }
        });

        return producedResources;
    }
}
