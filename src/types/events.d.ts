export type EventId = string;

export enum EventEffect {
    MarketPriceChange = "MarketPriceChange",
    ProductionEfficiency = "ProductionEfficiency",
    ResourceAvailability = "ResourceAvailability",
    DemandChange = "DemandChange",
    WorkerEfficiency = "WorkerEfficiency",
    EnergyCost = "EnergyCost",
    MaintenanceCost = "MaintenanceCost",
    ResearchSpeed = "ResearchSpeed",
    EnvironmentalImpact = "EnvironmentalImpact",
    NewTechnology = "NewTechnology",
    RegulatoryChange = "RegulatoryChange",
    SupplyChainDisruption = "SupplyChainDisruption",
    GlobalEconomicBoom = "GlobalEconomicBoom",
    GlobalEconomicBust = "GlobalEconomicBust",
    NewResourceDiscovery = "NewResourceDiscovery",
}

export enum EventType {
    MarketCrash = "Market Crash",
    MaterialShortage = "Material Shortage",
    DemandSpike = "Demand Spike",
    NaturalDisaster = "Natural Disaster",
    WorkerStrike = "Worker Strike",
    TechnicalBreakthrough = "Technical Breakthrough",
    RegulatoryChange = "Regulatory Change",
    SupplyAbundance = "Supply Abundance",
    EnergyCrisis = "Energy Crisis",
    EconomicBoom = "Economic Boom",
    TechnicalDisaster = "Technical Disaster", // Added Tech disaster
    ResearchBreakthrough = "Research Breakthrough", // Added Research Breakthrough
    NewResourceDiscovery = "New Resource Discovery",
    SupplyChainOptimization = "Supply Chain Optimization",
    GlobalTradeAgreement = "Global Trade Agreement",
}

export interface Effect {
    type: EventEffect;
    material?: string; // e.g., "iron", "all"
    percentageChange: number;
    isPercentage: boolean; // true if percentageChange is a percentage, false if absolute
}

export interface Event {
    id: EventId;
    name: string;
    description: string;
    type: EventType;
    effects: Effect[];
}

export interface ActiveEvent {
    event: Event;
    startTime: number;
    endTime: number;
    duration: number;
}
