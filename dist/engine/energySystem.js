"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergySystem = void 0;
class EnergySystem {
    constructor(buildings) {
        this.buildings = buildings;
    }
    calculateTotalEnergyProduction() {
        let totalProduction = 0;
        this.buildings.forEach(building => {
            // Assume energy generation is a type of building with defined output
            if (building.type === 'extractor' && building.outputs.some(output => output.resource.id === 'energy')) { // Simplified check
                totalProduction += building.baseProductionRate * building.efficiency;
            }
        });
        return totalProduction;
    }
    calculateTotalEnergyConsumption() {
        let totalConsumption = 0;
        this.buildings.forEach(building => {
            totalConsumption += building.energyConsumption;
        });
        return totalConsumption;
    }
    applyPowerShortageEffects() {
        const totalProduction = this.calculateTotalEnergyProduction();
        const totalConsumption = this.calculateTotalEnergyConsumption();
        if (totalConsumption > totalProduction) {
            const shortageRatio = totalProduction / totalConsumption;
            this.buildings.forEach(building => {
                // Reduce efficiency based on power shortage
                // This is a simplified model, might need more nuanced application
                building.efficiency *= shortageRatio;
            });
            console.warn(`Power shortage detected! Production efficiency reduced by ${((1 - shortageRatio) * 100).toFixed(2)}%.`);
        }
        else {
            // Reset efficiency if power is sufficient
            this.buildings.forEach(building => {
                if (building.efficiency < 1) { // Assuming efficiency starts at 1 (100%) and can be modified upwards
                    // This reset logic might need to be more sophisticated depending on how efficiency is managed
                    // For now, assuming a simple reset if it was previously reduced due to power shortage.
                    // A better approach would be to track base efficiency and apply multipliers.
                    building.efficiency = 1;
                }
            });
        }
    }
}
exports.EnergySystem = EnergySystem;
