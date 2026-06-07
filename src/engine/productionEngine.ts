import { Building } from './building';
import { Recipe } from './recipe';
import { Resource } from './resource';

export class ProductionEngine {
    private buildings: Map<string, Building>;
    private recipes: Map<string, Recipe>;
    private resources: Map<string, Resource>;

    constructor() {
        this.buildings = new Map();
        this.recipes = new Map();
        this.resources = new Map();
    }

    registerBuilding(building: Building) {
        this.buildings.set(building.id, building);
    }

    registerRecipe(recipe: Recipe) {
        this.recipes.set(recipe.id, recipe);
    }

    registerResource(resource: Resource) {
        this.resources.set(resource.id, resource);
    }

    calculateProduction(buildingId: string, tickRate: number): { produced: { resource: Resource; amount: number; }[], consumed: { resource: Resource; amount: number; }[] } {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }

        // Simplified production calculation for now
        // This will be expanded to include recipes, efficiency, tiers, events etc.
        const produced: { resource: Resource; amount: number; }[] = [];
        const consumed: { resource: Resource; amount: number; }[] = [];

        // For demonstration, assume a simple extractor that produces a raw resource
        if (building.type === 'extractor' && building.outputs.length > 0) {
            const output = building.outputs[0];
            const amountProduced = building.baseProductionRate * building.efficiency * tickRate;
            produced.push({ resource: output.resource, amount: amountProduced });
        }

        // In a real scenario, you'd match building type to recipes and calculate based on inputs/outputs

        return { produced, consumed };
    }

    getBuilding(buildingId: string): Building | undefined {
        return this.buildings.get(buildingId);
    }

    // Other production-related methods like handling production queues, multi-step recipes etc.
}
