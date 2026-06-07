import React, { useRef, useEffect, useState, useCallback } from "react";
import { Application, Container, Graphics, Sprite, Text, TilingSprite } from "pixi.js";
import { MapConfig, Tile, Building, ResourceFlow, PlacementState, ResourceType } from "../types/map.d";
import { getTileCoordinates, getWorldCoordinates, isTileAvailable, calculateBuildingPlacement } from "../utils/mapCalculations";
import * as PIXI from "pixi.js";

interface MapProps {
  initialMapConfig: MapConfig;
  buildings: Building[];
  resourceFlows: ResourceFlow[];
  onTileClick: (tileX: number, tileY: number) => void;
  placementState: PlacementState;
  availableBuildings: any; // Define a proper type later
  currentResources: { [key: string]: number }; // Define a proper type later
}

const Map: React.FC<MapProps> = ({
  initialMapConfig,
  buildings,
  resourceFlows,
  onTileClick,
  placementState,
  availableBuildings,
  currentResources,
}) => {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const mapContainerRef = useRef<Container | null>(null);
  const gridGraphicsRef = useRef<Graphics | null>(null);
  const placementOverlayRef = useRef<Graphics | null>(null);

  const [mapConfig, setMapConfig] = useState<MapConfig>(initialMapConfig);

  useEffect(() => {
    if (!pixiContainerRef.current) return;

    const app = new Application({
      width: pixiContainerRef.current.clientWidth,
      height: pixiContainerRef.current.clientHeight,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });
    appRef.current = app;
    pixiContainerRef.current.appendChild(app.view as HTMLCanvasElement);

    const mapContainer = new Container();
    mapContainer.interactive = true;
    mapContainer.hitArea = app.screen;
    mapContainerRef.current = mapContainer;
    app.stage.addChild(mapContainer);

    const gridGraphics = new Graphics();
    mapContainer.addChild(gridGraphics);
    gridGraphicsRef.current = gridGraphics;

    const placementOverlay = new Graphics();
    mapContainer.addChild(placementOverlay);
    placementOverlayRef.current = placementOverlay;

    // Initial render of the grid
    drawGrid(mapConfig, gridGraphics);

    // Event Listeners for panning and zooming
    let isPanning = false;
    let lastPosition = { x: 0, y: 0 };

    mapContainer.on("mousedown", (event) => {
      isPanning = true;
      lastPosition = { x: event.data.global.x, y: event.data.global.y };
    });

    mapContainer.on("mousemove", (event) => {
      if (isPanning) {
        const dx = event.data.global.x - lastPosition.x;
        const dy = event.data.global.y - lastPosition.y;
        setMapConfig((prev) => ({
          ...prev,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy,
        }));
        lastPosition = { x: event.data.global.x, y: event.data.global.y };
      }
    });

    mapContainer.on("mouseup", () => {
      isPanning = false;
    });

    mapContainer.on("mouseout", () => {
      isPanning = false;
    });

    app.view.addEventListener("wheel", (event) => {
      event.preventDefault();
      const scaleAmount = 1.1;
      const mouseX = event.clientX - pixiContainerRef.current!.getBoundingClientRect().left;
      const mouseY = event.clientY - pixiContainerRef.current!.getBoundingClientRect().top;

      const worldX = (mouseX - mapConfig.offsetX) / mapConfig.scale;
      const worldY = (mouseY - mapConfig.offsetY) / mapConfig.scale;

      let newScale = mapConfig.scale;
      if (event.deltaY < 0) {
        newScale *= scaleAmount;
      } else {
        newScale /= scaleAmount;
      }

      newScale = Math.max(0.5, Math.min(newScale, 4)); // Zoom limits

      setMapConfig((prev) => ({
        ...prev,
        scale: newScale,
        offsetX: mouseX - worldX * newScale,
        offsetY: mouseY - worldY * newScale,
      }));
    });

    mapContainer.on("click", (event) => {
      if (!isPanning && !placementState.isPlacing) {
        const { x, y } = getTileCoordinates(event.data.global.x, event.data.global.y, mapConfig);
        onTileClick(x, y);
      }
    });

    return () => {
      app.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (appRef.current && mapContainerRef.current && gridGraphicsRef.current) {
      // Update map container transform
      mapContainerRef.current.scale.set(mapConfig.scale);
      mapContainerRef.current.position.set(mapConfig.offsetX, mapConfig.offsetY);

      // Redraw grid (only if scale or offset changes significantly)
      drawGrid(mapConfig, gridGraphicsRef.current);

      // Render buildings
      renderBuildings(buildings, mapConfig, mapContainerRef.current);

      // Render resource flows
      renderResourceFlows(resourceFlows, mapConfig, mapContainerRef.current);

      // Render placement overlay
      if (placementState.isPlacing) {
        drawPlacementOverlay(placementState, mapConfig, placementOverlayRef.current!);
      } else {
        placementOverlayRef.current!.clear();
      }
    }
  }, [mapConfig, buildings, resourceFlows, placementState]);

  const drawGrid = (config: MapConfig, graphics: Graphics) => {
    graphics.clear();
    graphics.lineStyle(1 / config.scale, 0x333333, 0.5);

    const worldWidth = config.width * config.tileSize;
    const worldHeight = config.height * config.tileSize;

    // Draw vertical lines
    for (let i = 0; i <= config.width; i++) {
      graphics.moveTo(i * config.tileSize, 0);
      graphics.lineTo(i * config.tileSize, worldHeight);
    }

    // Draw horizontal lines
    for (let i = 0; i <= config.height; i++) {
      graphics.moveTo(0, i * config.tileSize);
      graphics.lineTo(worldWidth, i * config.tileSize);
    }
  };

  const renderBuildings = (buildings: Building[], config: MapConfig, container: Container) => {
    // Clear existing buildings (or implement more efficient diffing)
    container.children.forEach((child) => {
      if (child.name === "building_sprite") {
        child.destroy();
      }
    });

    buildings.forEach((building) => {
      const { x: worldX, y: worldY } = getWorldCoordinates(building.x, building.y, { ...config, scale: 1, offsetX: 0, offsetY: 0 });
      const buildingGraphics = new Graphics();
      buildingGraphics.beginFill(0x007bff, 0.5);
      buildingGraphics.drawRect(worldX, worldY, building.width * config.tileSize, building.height * config.tileSize);
      buildingGraphics.endFill();
      buildingGraphics.name = "building_sprite";
      container.addChild(buildingGraphics);
    });
  };

  const renderResourceFlows = (flows: ResourceFlow[], config: MapConfig, container: Container) => {
    // Implement resource flow rendering using Bezier curves
  };

  const drawPlacementOverlay = (placement: PlacementState, config: MapConfig, graphics: Graphics) => {
    graphics.clear();
    if (placement.isPlacing && placement.buildingType) {
      const buildingDef = availableBuildings[placement.buildingType]; // Get building definition
      if (!buildingDef) return;
      const { x: tileX, y: tileY } = calculateBuildingPlacement(placement.x, placement.y, config, buildingDef.width, buildingDef.height); // Use actual mouse position for this, not snapped tile for dynamic preview
      const { x: worldX, y: worldY } = getWorldCoordinates(tileX, tileY, { ...config, scale: 1, offsetX: 0, offsetY: 0 });

      const color = placement.isValid ? 0x00ff00 : 0xff0000;
      graphics.beginFill(color, 0.3);
      graphics.lineStyle(2 / config.scale, color, 0.8);
      graphics.drawRect(worldX, worldY, buildingDef.width * config.tileSize, buildingDef.height * config.tileSize);
      graphics.endFill();
    }
  };

  return <div ref={pixiContainerRef} style={{ width: "100%", height: "100%" }}></div>;
};

export default Map;
