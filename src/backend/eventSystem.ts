
import { Event, ActiveEvent, EventType, EventEffect } from "../types/events";
import { getAllMaterials, updateMaterialPrice } from "./marketSystem";
import { getProductionLines, updateProductionLineOutput } from "../engine/productionEngine";

class EventSystem {
    private events: Event[] = [];
    private activeEvents: ActiveEvent[] = [];
    private eventHistory: Event[] = [];
    private eventInterval: NodeJS.Timeout | null = null;
    private maxActiveEvents = 3;

    constructor() {
        this.loadEvents();
    }

    private async loadEvents() {
        // In a real application, events would be loaded from a database or a more robust data source.
        const eventData = await import('../../src/data/events.json');
        this.events = eventData.default.events;
        console.log(`Loaded ${this.events.length} events.`);
    }

    public startEventCycle() {
        if (this.eventInterval) {
            clearInterval(this.eventInterval);
        }
        this.eventInterval = setInterval(() => this.triggerRandomEvent(), 5 * 60 * 1000); // Trigger every 5-15 minutes, here set to 5 for testing
        console.log("Event cycle started.");
    }

    public stopEventCycle() {
        if (this.eventInterval) {
            clearInterval(this.eventInterval);
            this.eventInterval = null;
            console.log("Event cycle stopped.");
        }
    }

    private async triggerRandomEvent() {
        if (this.activeEvents.length >= this.maxActiveEvents) {
            console.log("Max active events reached. Skipping new event trigger.");
            return;
        }

        const availableEvents = this.events.filter(event =>
            !this.activeEvents.some(active => active.event.id === event.id)
        );

        if (availableEvents.length === 0) {
            console.log("No available events to trigger.");
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableEvents.length);
        const eventToTrigger = availableEvents[randomIndex];
        this.activateEvent(eventToTrigger);
    }

    public activateEvent(event: Event) {
        if (this.activeEvents.length >= this.maxActiveEvents) {
            console.warn(`Could not activate event ${event.name}: Max active events reached.`);
            return;
        }

        const duration = Math.floor(Math.random() * (10 - 2 + 1) + 2) * 60 * 1000; // 2-10 minutes
        const endTime = Date.now() + duration;

        const activeEvent: ActiveEvent = {
            event,
            startTime: Date.now(),
            endTime,
            duration
        };
        this.activeEvents.push(activeEvent);
        this.eventHistory.unshift(event); // Add to history, most recent first
        if (this.eventHistory.length > 50) { // Keep history manageable
            this.eventHistory.pop();
        }

        console.log(`Event "${event.name}" triggered! Duration: ${duration / 60000} minutes.`);
        this.applyEventEffects(event);

        setTimeout(() => this.deactivateEvent(event.id), duration);
    }

    private applyEventEffects(event: Event) {
        event.effects.forEach(effect => {
            switch (effect.type) {
                case EventEffect.MarketPriceChange:
                    if (effect.material && effect.percentageChange) {
                        updateMaterialPrice(effect.material, effect.percentageChange, effect.isPercentage);
                        console.log(`Market effect: ${effect.material} price changed by ${effect.percentageChange}%`);
                    }
                    break;
                case EventEffect.ProductionEfficiency:
                    if (effect.material && effect.percentageChange) {
                        const productionLines = getProductionLines();
                        productionLines.forEach(line => {
                            if (line.outputMaterial === effect.material) {
                                updateProductionLineOutput(line.id, effect.percentageChange);
                                console.log(`Production effect: ${line.name} output changed by ${effect.percentageChange}%`);
                            }
                        });
                    }
                    break;
                case EventEffect.ResourceAvailability:
                    // This could affect how much raw material is available for purchase or extraction
                    console.log(`Resource availability effect: ${event.name}`);
                    break;
                case EventEffect.DemandChange:
                    // This could affect the selling price or quantity demanded by consumers
                    console.log(`Demand change effect: ${event.name}`);
                    break;
                case EventEffect.WorkerEfficiency:
                    // This could affect the overall production speed or cost
                    console.log(`Worker efficiency effect: ${event.name}`);
                    break;
                case EventEffect.EnergyCost:
                    // This could affect the operating cost of factories
                    console.log(`Energy cost effect: ${event.name}`);
                    break;
                case EventEffect.MaintenanceCost:
                    // This could affect the maintenance cost of production lines
                    console.log(`Maintenance cost effect: ${event.name}`);
                    break;
                case EventEffect.ResearchSpeed:
                    // This could affect how fast new technologies are researched
                    console.log(`Research speed effect: ${event.name}`);
                    break;
                case EventEffect.EnvironmentalImpact:
                    // This could introduce penalties or bonuses based on environmental factors
                    console.log(`Environmental impact effect: ${event.name}`);
                    break;
                case EventEffect.NewTechnology:
                    // This could unlock new production methods or materials
                    console.log(`New technology effect: ${event.name}`);
                    break;
                case EventEffect.RegulatoryChange:
                    // This could introduce new rules or restrictions on production
                    console.log(`Regulatory change effect: ${event.name}`);
                    break;
                case EventEffect.SupplyChainDisruption:
                    // This could temporarily halt or slow down material supply
                    console.log(`Supply chain disruption effect: ${event.name}`);
                    break;
                case EventEffect.GlobalEconomicBoom:
                    // This could increase overall demand and prices
                    console.log(`Global economic boom effect: ${event.name}`);
                    break;
                case EventEffect.GlobalEconomicBust:
                    // This could decrease overall demand and prices
                    console.log(`Global economic bust effect: ${event.name}`);
                    break;
                case EventEffect.NewResourceDiscovery:
                    // This could introduce new raw materials to the game
                    console.log(`New resource discovery effect: ${event.name}`);
                    break;
                default:
                    console.warn(`Unknown event effect type: ${effect.type}`);
            }
        });
    }

    private deactivateEvent(eventId: string) {
        const index = this.activeEvents.findIndex(active => active.event.id === eventId);
        if (index !== -1) {
            const [deactivatedEvent] = this.activeEvents.splice(index, 1);
            console.log(`Event "${deactivatedEvent.event.name}" ended.`);
            this.revertEventEffects(deactivatedEvent.event);
        }
    }

    private revertEventEffects(event: Event) {
        event.effects.forEach(effect => {
            switch (effect.type) {
                case EventEffect.MarketPriceChange:
                    // Revert by applying the inverse percentage change
                    if (effect.material && effect.percentageChange) {
                        const inverseChange = -effect.percentageChange; // Simply negate for now
                        updateMaterialPrice(effect.material, inverseChange, effect.isPercentage);
                        console.log(`Market effect reverted: ${effect.material} price changed by ${inverseChange}%`);
                    }
                    break;
                case EventEffect.ProductionEfficiency:
                    if (effect.material && effect.percentageChange) {
                        const inverseChange = -effect.percentageChange;
                        const productionLines = getProductionLines();
                        productionLines.forEach(line => {
                            if (line.outputMaterial === effect.material) {
                                updateProductionLineOutput(line.id, inverseChange);
                                console.log(`Production effect reverted: ${line.name} output changed by ${inverseChange}%`);
                            }
                        });
                    }
                    break;
                // Add other reversion logic as necessary
                default:
                    // For effects that don't have a direct "revert" action or are persistent
                    console.log(`No direct reversion for effect type: ${effect.type}`);
            }
        });
    }

    public getActiveEvents(): ActiveEvent[] {
        // Filter out any events that might have somehow overstayed their welcome
        this.activeEvents = this.activeEvents.filter(event => event.endTime > Date.now());
        return this.activeEvents;
    }

    public getEventHistory(): Event[] {
        return this.eventHistory;
    }
}

export const eventSystem = new EventSystem();
// Call startEventCycle somewhere in your main application initialization
// eventSystem.startEventCycle();
