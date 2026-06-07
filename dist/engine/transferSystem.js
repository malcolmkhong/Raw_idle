"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferSystem = void 0;
class TransferSystem {
    constructor(buildings) {
        this.buildings = buildings;
    }
    // Simplified transfer logic for now
    // This will be expanded to include connection logic, bottleneck detection, smart routing, transfer efficiency
    transferResources(fromBuildingId, toBuildingId, resource, amount) {
        const fromBuilding = this.buildings.get(fromBuildingId);
        const toBuilding = this.buildings.get(toBuildingId);
        if (!fromBuilding) {
            throw new Error(`Source building with ID ${fromBuildingId} not found.`);
        }
        if (!toBuilding) {
            throw new Error(`Destination building with ID ${toBuildingId} not found.`);
        }
        // Find resource in source building's storage
        const fromStorage = fromBuilding.currentStorage.find(s => s.resource.id === resource.id);
        if (!fromStorage || fromStorage.amount < amount) {
            console.warn(`Not enough ${resource.name} in building ${fromBuilding.name} for transfer.`);
            return false;
        }
        // Find resource in destination building's storage
        let toStorage = toBuilding.currentStorage.find(s => s.resource.id === resource.id);
        if (!toStorage) {
            // If resource not in destination storage, add it
            toStorage = { resource: resource, amount: 0 };
            toBuilding.currentStorage.push(toStorage);
        }
        // Check if destination has capacity
        const toCapacity = toBuilding.storageCapacity.find(s => s.resource.id === resource.id);
        if (!toCapacity) {
            console.warn(`No defined capacity for ${resource.name} in building ${toBuilding.name}.`);
            return false;
        }
        const transferableAmount = Math.min(amount, toCapacity.capacity - toStorage.amount);
        if (transferableAmount <= 0) {
            console.warn(`Destination building ${toBuilding.name} is full for ${resource.name}.`);
            return false;
        }
        // Perform transfer
        fromStorage.amount -= transferableAmount;
        toStorage.amount += transferableAmount;
        console.log(`Transferred ${transferableAmount} of ${resource.name} from ${fromBuilding.name} to ${toBuilding.name}.`);
        return true;
    }
}
exports.TransferSystem = TransferSystem;
