import React from 'react';
import { MapExpansion, ResourceType } from '../types/map.d';

interface MapExpansionPanelProps {
  mapExpansion: MapExpansion;
  currentResources: { [key in ResourceType]?: number };
  onExpandMap: () => void;
}

const MapExpansionPanel: React.FC<MapExpansionPanelProps> = ({
  mapExpansion,
  currentResources,
  onExpandMap,
}) => {
  const canExpand = mapExpansion.nextExpansionCost.every(cost =>
    (currentResources[cost.resource] || 0) >= cost.amount
  );

  return (
    <div className="p-4 bg-gray-800 text-white w-80 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">地图扩张</h2>
      <p>当前大小: {mapExpansion.size.width}x{mapExpansion.size.height}</p>
      <p className="mb-2">下一次扩张将解锁: {mapExpansion.nextExpansionSize.width}x{mapExpansion.nextExpansionSize.height}</p>
      <h3 className="text-lg font-semibold mb-2">扩张成本:</h3>
      <ul>
        {mapExpansion.nextExpansionCost.map((cost, index) => (
          <li key={index}>
            {cost.resource}: {cost.amount} / {(currentResources[cost.resource] || 0)}
          </li>
        ))}
      </ul>
      <button
        className={`mt-4 w-full py-2 px-4 rounded font-bold ${canExpand ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
        onClick={onExpandMap}
        disabled={!canExpand}
      >
        扩张地图
      </button>
    </div>
  );
};

export default MapExpansionPanel;
