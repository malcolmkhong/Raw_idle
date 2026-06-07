
declare namespace MapTypes {
  // Tile definition
  export type Tile = {
    x: number;
    y: number;
    buildingId: string | null;
    resource: ResourceType | null; // e.g., for natural resource nodes
    isLocked: boolean;
  };

  // Building definition (simplified for map display)
  export type Building = {
    id: string;
    type: string; // e.g., "miner", "furnace", "factory"
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // 0, 90, 180, 270
    tier: number;
    produces: { resource: ResourceType; rate: number }[];
    consumes: { resource: ResourceType; rate: number }[];
    storage: { resource: ResourceType; amount: number; capacity: number }[];
    status: 'active' | 'idle' | 'low_storage' | 'no_power';
    // Add other properties needed for display, e.g., current production, efficiency
  };

  // Resource type (can be extended from existing ResourceType in engine)
  export type ResourceType = string; // e.g., "iron_ore", "copper_plate", "power"

  // Resource Flow definition
  export type ResourceFlow = {
    id: string;
    fromBuildingId: string;
    toBuildingId: string;
    resource: ResourceType;
    amount: number; // Current flow rate or amount
    path: { x: number; y: number }[]; // Points for Bezier curve
  };

  // Map configuration
  export type MapConfig = {
    width: number; // in tiles
    height: number; // in tiles
    tileSize: number; // in pixels
    scale: number; // current zoom level
    offsetX: number; // pan offset X
    offsetY: number; // pan offset Y
  };

  // UI state for building placement
  export type PlacementState = {
    isPlacing: boolean;
    buildingType: string | null;
    isValid: boolean;
    x: number; // snapped tile x
    y: number; // snapped tile y
  };

  // Map Expansion state
  export type MapExpansion = {
    size: { width: number; height: number };
    unlockedAreas: { x: number; y: number; width: number; height: number }[];
    nextExpansionCost: { resource: ResourceType; amount: number }[];
    nextExpansionSize: { width: number; height: number };
  };
}
