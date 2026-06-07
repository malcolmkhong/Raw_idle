"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductionEngine = void 0;
class ProductionEngine {
    constructor() {
        this.buildings = new Map();
        this.recipes = new Map();
        this.resources = new Map();
    }
    registerBuilding(building) {
        this.buildings.set(building.id, building);
    }
    registerRecipe(recipe) {
        this.recipes.set(recipe.id, recipe);
    }
    registerResource(resource) {
        this.resources.set(resource.id, resource);
    }
    calculateProduction(buildingId, tickRate) {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }
        // Simplified production calculation for now
        // This will be expanded to include recipes, efficiency, tiers, events etc.
        const produced = [];
        const consumed = [];
        // For demonstration, assume a simple extractor that produces a raw resource
        if (building.type === 'extractor' && building.outputs.length > 0) {
            const output = building.outputs[0];
            const amountProduced = building.baseProductionRate * building.efficiency * tickRate;
            produced.push({ resource: output.resource, amount: amountProduced });
        }
        // In a real scenario, you'd match building type to recipes and calculate based on inputs/outputs
        return { produced, consumed };
    }
    getBuilding(buildingId) {
        return this.buildings.get(buildingId);
    }
}
exports.ProductionEngine = ProductionEngine;
