import React, { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import BuildingPanel from './components/BuildingPanel';
import MapExpansionPanel from './components/MapExpansion';
import { MapConfig, Building, ResourceFlow, PlacementState, MapExpansion, ResourceType, Tile } from './types/map.d';
import './index.css'; // Ensure Tailwind CSS is imported

// Mock data for development
const initialBuildings: Building[] = [
  {
    id: "building-1",
    type: "miner",
    x: 5,
    y: 5,
    width: 2,
    height: 2,
    rotation: 0,
    tier: 1,
    produces: [{ resource: "iron_ore", rate: 1 }],
    consumes: [],
    storage: [],
    status: "active",
  },
  {
    id: "building-2",
    type: "furnace",
    x: 8,
    y: 8,
    width: 3,
    height: 3,
    rotation: 0,
    tier: 1,
    produces: [{ resource: "iron_plate", rate: 0.5 }],
    consumes: [{ resource: "iron_ore", rate: 1 }],
    storage: [],
    status: "active",
  },
];

const initialResourceFlows: ResourceFlow[] = [
  {
    id: "flow-1",
    fromBuildingId: "building-1",
    toBuildingId: "building-2",
    resource: "iron_ore",
    amount: 1,
    path: [],
  },
];

const initialMapConfig: MapConfig = {
  width: 100,
  height: 100,
  tileSize: 32,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

const initialMapExpansion: MapExpansion = {
  size: { width: 100, height: 100 },
  unlockedAreas: [],
  nextExpansionCost: [{ resource: "money", amount: 1000 }],
  nextExpansionSize: { width: 150, height: 150 },
};

const initialResources: { [key in ResourceType]: number } = {
  money: 5000,
  tech_points: 100,
  iron_ore: 500,
  copper_ore: 300,
  iron_plate: 200,
  copper_plate: 100,
  power: 1000, // Example resource
};

// Dummy data for available buildings (to be replaced by actual engine data)
const availableBuildings = {
  miner: { name: "矿工", width: 2, height: 2, cost: { money: 100 }, production: {"iron_ore": 1} },
  furnace: { name: "熔炉", width: 3, height: 3, cost: { money: 200 }, consumption: {"iron_ore": 1}, production: {"iron_plate": 0.5} },
  factory: { name: "工厂", width: 4, height: 4, cost: { money: 500 }, consumption: {"iron_plate": 1}, production: {"component": 0.2} },
};

const App: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [resourceFlows, setResourceFlows] = useState<ResourceFlow[]>(initialResourceFlows);
  const [mapConfig, setMapConfig] = useState<MapConfig>(initialMapConfig);
  const [mapExpansion, setMapExpansion] = useState<MapExpansion>(initialMapExpansion);
  const [placementState, setPlacementState] = useState<PlacementState>(
    { isPlacing: false, buildingType: null, isValid: false, x: 0, y: 0 }
  );
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [currentResources, setCurrentResources] = useState<{ [key in ResourceType]: number }>(initialResources);

  // Function to simulate game tick and resource updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentResources(prevResources => {
        const newResources = { ...prevResources };
        buildings.forEach(building => {
          if (building.status === 'active') {
            building.produces.forEach(prod => {
              newResources[prod.resource] = (newResources[prod.resource] || 0) + prod.rate;
            });
            building.consumes.forEach(cons => {
              newResources[cons.resource] = (newResources[cons.resource] || 0) - cons.rate;
            });
          }
        });
        return newResources;
      });
    }, 1000); // Every second

    return () => clearInterval(interval);
  }, [buildings]);

  const handleTileClick = useCallback((tileX: number, tileY: number) => {
    if (placementState.isPlacing && placementState.buildingType) {
      const buildingDef = availableBuildings[placementState.buildingType];
      if (buildingDef && placementState.isValid) {
        // In a real game, you'd perform server-side validation and update
        const newBuilding: Building = {
          id: `building-${buildings.length + 1}`,
          type: placementState.buildingType,
          x: tileX,
          y: tileY,
          width: buildingDef.width,
          height: buildingDef.height,
          rotation: 0,
          tier: 1,
          produces: buildingDef.production ? Object.entries(buildingDef.production).map(([resource, rate]) => ({ resource, rate: rate as number })) : [],
          consumes: buildingDef.consumption ? Object.entries(buildingDef.consumption).map(([resource, rate]) => ({ resource, rate: rate as number })) : [],
          storage: [],
          status: "active",
        };
        setBuildings((prev) => [...prev, newBuilding]);
        setPlacementState({ isPlacing: false, buildingType: null, isValid: false, x: 0, y: 0 });
        // Deduct cost from resources
        if (buildingDef.cost && buildingDef.cost.money) {
          setCurrentResources(prev => ({ ...prev, money: prev.money - buildingDef.cost.money }));
        }
      }
    } else {
      // Select building if clicked
      const clickedBuilding = buildings.find(
        (b) =>
          tileX >= b.x &&
          tileX < b.x + b.width &&
          tileY >= b.y &&
          tileY < b.y + b.height
      );
      setSelectedBuilding(clickedBuilding || null);
    }
  }, [placementState, buildings, currentResources]);

  const handlePlaceBuilding = (buildingType: string) => {
    setPlacementState({ isPlacing: true, buildingType, isValid: false, x: 0, y: 0 });
    setSelectedBuilding(null); // Deselect any building when starting placement
  };

  const handleUpgradeBuilding = (buildingId: string, upgradeType: string) => {
    console.log(`Upgrading building ${buildingId} with type ${upgradeType}`);
    // Implement upgrade logic (e.g., deducting resources, increasing tier/stats)
  };

  const handleSellBuilding = (buildingId: string) => {
    setBuildings(buildings.filter(b => b.id !== buildingId));
    setSelectedBuilding(null);
    // Refund resources
    setCurrentResources(prev => ({ ...prev, money: prev.money + 50 }));
  };

  const handleExpandMap = () => {
    console.log("Expanding map...");
    // Deduct cost, update map config and map expansion state
    setMapConfig(prev => ({
      ...prev,
      width: mapExpansion.nextExpansionSize.width,
      height: mapExpansion.nextExpansionSize.height,
    }));
    setCurrentResources(prev => ({
      ...prev, 
      money: prev.money - mapExpansion.nextExpansionCost[0].amount
    }));
    setMapExpansion(prev => ({
        ...prev,
        size: prev.nextExpansionSize,
        nextExpansionSize: {width: prev.nextExpansionSize.width + 50, height: prev.nextExpansionSize.height + 50},
        nextExpansionCost: [{ resource: "money", amount: prev.nextExpansionCost[0].amount * 2 }],
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
        <h1 className="text-2xl font-bold">Idle Factory Game</h1>
        <div className="flex space-x-4">
          {Object.entries(currentResources).map(([resourceName, amount]) => (
            <span key={resourceName} className="text-lg">
              {resourceName.replace(/_/g, ' ').toUpperCase()}: {amount.toFixed(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Building Categories/Placement Tools */}
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">建造</h2>
          {Object.entries(availableBuildings).map(([key, value]) => (
            <button
              key={key}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
              onClick={() => handlePlaceBuilding(key)}
            >
              建造 {value.name} (成本: {value.cost?.money || 0} 钱)
            </button>
          ))}
          <h2 className="text-xl font-bold mt-6 mb-4">地图</h2>
          <MapExpansionPanel
            mapExpansion={mapExpansion}
            currentResources={currentResources}
            onExpandMap={handleExpandMap}
          />
        </div>

        {/* Main Content - Map and Bottom Bar */}
        <div className="flex flex-col flex-1">
          {/* Map */} 
          <div className="flex-1 relative">
            <Map
              initialMapConfig={mapConfig}
              buildings={buildings}
              resourceFlows={resourceFlows}
              onTileClick={handleTileClick}
              placementState={placementState}
              availableBuildings={availableBuildings}
              currentResources={currentResources}
            />
          </div>

          {/* Bottom Bar - Statistics, Production Rates */}
          <div className="p-4 bg-gray-800 shadow-lg mt-auto">
            <h2 className="text-xl font-bold">统计数据</h2>
            {/* Add statistics display here */}
            <p>总生产速率: ...</p>
          </div>
        </div>

        {/* Right Panel - Building Details, Upgrade Options */}
        <BuildingPanel
          selectedBuilding={selectedBuilding}
          onUpgrade={handleUpgradeBuilding}
          onSell={handleSellBuilding}
          currentResources={currentResources}
        />
      </div>
    </div>
  );
};

export default App;
