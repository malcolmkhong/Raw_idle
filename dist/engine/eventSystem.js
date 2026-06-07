"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventSystem = void 0;
class EventSystem {
    constructor() {
        this.activeEvents = [];
        this.eventTypes = []; // Predefined list of possible events
        this.initializeEventTypes();
    }
    initializeEventTypes() {
        // Define 15-20 event types here
        this.eventTypes.push({ id: 'marketcrash', name: 'Market Crash', description: 'Product demand drops.', effect: { type: 'market', modifier: -0.2 }, duration: 300, startTime: 0 }, { id: 'materialshortage', name: 'Material Shortage', description: 'Raw material production reduced.', effect: { type: 'production', modifier: -0.15, resourceId: 'raw_material_A' }, duration: 450, startTime: 0 }, { id: 'demandspike', name: 'Demand Spike', description: 'Product demand increases.', effect: { type: 'market', modifier: 0.3 }, duration: 300, startTime: 0 }, { id: 'breakthrough', name: 'Technological Breakthrough', description: 'Temporary production boost for all buildings.', effect: { type: 'production', modifier: 0.2, resourceId: 'all' }, duration: 600, startTime: 0 });
    }
    triggerRandomEvent() {
        if (this.eventTypes.length === 0)
            return;
        const randomIndex = Math.floor(Math.random() * this.eventTypes.length);
        const eventToTrigger = { ...this.eventTypes[randomIndex], startTime: Date.now() / 1000 }; // Clone and set start time
        this.activeEvents.push(eventToTrigger);
        console.log(`Event triggered: ${eventToTrigger.name} - ${eventToTrigger.description}`);
        // Notify frontend about the new event
    }
    updateEvents() {
        const currentTime = Date.now() / 1000;
        this.activeEvents = this.activeEvents.filter(event => {
            const isActive = (currentTime - event.startTime) < event.duration;
            if (!isActive) {
                console.log(`Event ended: ${event.name}`);
                // Notify frontend about the event ending
            }
            return isActive;
        });
    }
    getActiveProductionModifiers(resourceId) {
        let totalModifier = 1.0;
        this.activeEvents.forEach(event => {
            if (event.effect.type === 'production') {
                if (event.effect.resourceId === 'all' || event.effect.resourceId === resourceId) {
                    totalModifier += event.effect.modifier;
                }
            }
        });
        return totalModifier;
    }
}
exports.EventSystem = EventSystem;
