"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageSystem = void 0;
class StorageSystem {
    constructor(buildings) {
        this.unlimitedStorageTier = 9; // Tier at which unlimited storage is granted
        this.buildings = buildings;
    }
    getAvailableStorage(buildingId, resource) {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }
        // Check for unlimited storage
        if (building.tier >= this.unlimitedStorageTier) {
            return Infinity;
        }
        const capacityInfo = building.storageCapacity.find(s => s.resource.id === resource.id);
        const currentStorageInfo = building.currentStorage.find(s => s.resource.id === resource.id);
        const currentAmount = currentStorageInfo ? currentStorageInfo.amount : 0;
        const capacity = capacityInfo ? capacityInfo.capacity : 0;
        return capacity - currentAmount;
    }
    addResources(buildingId, resource, amount) {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }
        let currentStorageInfo = building.currentStorage.find(s => s.resource.id === resource.id);
        if (!currentStorageInfo) {
            currentStorageInfo = { resource: resource, amount: 0 };
            building.currentStorage.push(currentStorageInfo);
        }
        // Handle unlimited storage
        if (building.tier >= this.unlimitedStorageTier) {
            currentStorageInfo.amount += amount;
            return amount; // All added
        }
        const capacityInfo = building.storageCapacity.find(s => s.resource.id === resource.id);
        const capacity = capacityInfo ? capacityInfo.capacity : 0;
        const spaceAvailable = capacity - currentStorageInfo.amount;
        const actualAdded = Math.min(amount, spaceAvailable);
        currentStorageInfo.amount += actualAdded;
        if (actualAdded < amount) {
            console.warn(`Building ${building.name} storage full for ${resource.name}. ${amount - actualAdded} wasted.`);
        }
        return actualAdded;
    }
    removeResources(buildingId, resource, amount) {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }
        let currentStorageInfo = building.currentStorage.find(s => s.resource.id === resource.id);
        if (!currentStorageInfo) {
            return 0; // No resources to remove
        }
        const actualRemoved = Math.min(amount, currentStorageInfo.amount);
        currentStorageInfo.amount -= actualRemoved;
        return actualRemoved;
    }
    upgradeStorage(buildingId, resource, newCapacity, cost) {
        const building = this.buildings.get(buildingId);
        if (!building) {
            throw new Error(`Building with ID ${buildingId} not found.`);
        }
        const capacityInfo = building.storageCapacity.find(s => s.resource.id === resource.id);
        if (capacityInfo) {
            capacityInfo.capacity = newCapacity;
            // TODO: Deduct cost from player inventory
            console.log(`Storage for ${resource.name} in ${building.name} upgraded to ${newCapacity}.`);
            return true;
        }
        else {
            building.storageCapacity.push({ resource: resource, capacity: newCapacity });
            console.log(`Storage for ${resource.name} added to ${building.name} with capacity ${newCapacity}.`);
            return true;
        }
    }
}
exports.StorageSystem = StorageSystem;
