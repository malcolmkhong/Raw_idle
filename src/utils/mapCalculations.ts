
import { MapConfig, Tile, Building } from '../types/map.d';

export const getTileCoordinates = (mouseX: number, mouseY: number, mapConfig: MapConfig): { x: number; y: number } => {
  const worldX = (mouseX - mapConfig.offsetX) / mapConfig.scale;
  const worldY = (mouseY - mapConfig.offsetY) / mapConfig.scale;
  const tileX = Math.floor(worldX / mapConfig.tileSize);
  const tileY = Math.floor(worldY / mapConfig.tileSize);
  return { x: tileX, y: tileY };
};

export const getWorldCoordinates = (tileX: number, tileY: number, mapConfig: MapConfig): { x: number; y: number } => {
  const worldX = tileX * mapConfig.tileSize * mapConfig.scale + mapConfig.offsetX;
  const worldY = tileY * mapConfig.tileSize * mapConfig.scale + mapConfig.offsetY;
  return { x: worldX, y: worldY };
};

export const isTileAvailable = (tileX: number, tileY: number, map: Tile[][], buildingWidth: number, buildingHeight: number, mapConfig: MapConfig): boolean => {
  if (tileX < 0 || tileY < 0 || tileX + buildingWidth > mapConfig.width || tileY + buildingHeight > mapConfig.height) {
    return false; // Out of bounds
  }
  for (let x = tileX; x < tileX + buildingWidth; x++) {
    for (let y = tileY; y < tileY + buildingHeight; y++) {
      if (map[y] && map[y][x] && map[y][x].buildingId !== null) {
        return false; // Tile already occupied
      }
    }
  }
  return true;
};

export const calculateBuildingPlacement = (mouseX: number, mouseY: number, mapConfig: MapConfig, buildingWidth: number, buildingHeight: number): { x: number; y: number } => {
  const { x: tileX, y: tileY } = getTileCoordinates(mouseX, mouseY, mapConfig);
  return { x: tileX, y: tileY };
};

export const getBuildingTiles = (building: Building): { x: number; y: number }[] => {
  const tiles: { x: number; y: number }[] = [];
  for (let x = building.x; x < building.x + building.width; x++) {
    for (let y = building.y; y < building.y + building.height; y++) {
      tiles.push({ x, y });
    }
  }
  return tiles;
};

export const getBezierCurvePoints = (start: { x: number; y: number }, end: { x: number; y: number }): { x: number; y: number }[] => {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Control points for a smooth curve
  const cp1 = { x: start.x, y: midY };
  const cp2 = { x: end.x, y: midY };

  return [start, cp1, cp2, end];
};
