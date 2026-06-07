"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineProduction = void 0;
const efficiencyModifiers_1 = require("./efficiencyModifiers");
class OfflineProduction {
    constructor(productionEngine, storageSystem) {
        this.productionEngine = productionEngine;
        this.storageSystem = storageSystem;
    }
    calculateOfflineProduction(lastPlayedTime, currentTime, buildings) {
        const offlineDurationSeconds = (currentTime - lastPlayedTime) / 1000;
        if (offlineDurationSeconds <= 0) {
            return new Map();
        }
        console.log(`Calculating offline production for ${offlineDurationSeconds.toFixed(0)} seconds.`);
        const producedResources = new Map();
        buildings.forEach(building => {
            // Assume no events or tech bonuses for simplicity during offline calculation for now
            const efficiency = efficiencyModifiers_1.EfficiencyModifiers.calculateCumulativeEfficiency(building);
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
exports.OfflineProduction = OfflineProduction;
