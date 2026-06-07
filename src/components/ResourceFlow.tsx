import React, { useRef, useEffect } from "react";
import * as PIXI from "pixi.js";
import { ResourceFlow, MapConfig, Building } from "../types/map.d";
import { getBezierCurvePoints } from "../utils/mapCalculations";

interface ResourceFlowProps {
  app: PIXI.Application;
  resourceFlows: ResourceFlow[];
  buildings: Building[];
  mapConfig: MapConfig;
}

const ResourceFlowRenderer: React.FC<ResourceFlowProps> = ({ app, resourceFlows, buildings, mapConfig }) => {
  const graphicsRef = useRef(new PIXI.Graphics());

  useEffect(() => {
    if (!app) return;

    const graphics = graphicsRef.current;
    app.stage.addChild(graphics);

    return () => {
      app.stage.removeChild(graphics);
      graphics.destroy();
    };
  }, [app]);

  useEffect(() => {
    const graphics = graphicsRef.current;
    graphics.clear();

    resourceFlows.forEach((flow) => {
      const fromBuilding = buildings.find((b) => b.id === flow.fromBuildingId);
      const toBuilding = buildings.find((b) => b.id === flow.toBuildingId);

      if (fromBuilding && toBuilding) {
        // Calculate center points of buildings
        const startX = fromBuilding.x * mapConfig.tileSize + (fromBuilding.width * mapConfig.tileSize) / 2;
        const startY = fromBuilding.y * mapConfig.tileSize + (fromBuilding.height * mapConfig.tileSize) / 2;
        const endX = toBuilding.x * mapConfig.tileSize + (toBuilding.width * mapConfig.tileSize) / 2;
        const endY = toBuilding.y * mapConfig.tileSize + (toBuilding.height * mapConfig.tileSize) / 2;

        const startPoint = { x: startX, y: startY };
        const endPoint = { x: endX, y: endY };

        const path = getBezierCurvePoints(startPoint, endPoint);

        // Assign a color based on resource type (example)
        let lineColor = 0xffffff; // Default white
        switch (flow.resource) {
          case "iron_ore":
            lineColor = 0xc0c0c0; // Silver/Grey
            break;
          case "copper_plate":
            lineColor = 0xb87333; // Bronze
            break;
          case "power":
            lineColor = 0xffd700; // Gold
            break;
          default:
            lineColor = 0x00ff00; // Green for others
            break;
        }

        graphics.lineStyle(2 / mapConfig.scale, lineColor, 0.7);

        if (path.length >= 4) {
          graphics.moveTo(path[0].x, path[0].y);
          graphics.bezierCurveTo(path[1].x, path[1].y, path[2].x, path[2].y, path[3].x, path[3].y);
        } else if (path.length >= 2) {
          graphics.moveTo(path[0].x, path[0].y);
          graphics.lineTo(path[1].x, path[1].y);
        }

        // Optional: Add flow animation (e.g., traveling dots or dashes)
        // This would typically be handled in an animation loop, not directly in useEffect
      }
    });
  }, [resourceFlows, buildings, mapConfig]);

  return null; // This component doesn't render anything itself, it modifies the PIXI app
};

export default ResourceFlowRenderer;
