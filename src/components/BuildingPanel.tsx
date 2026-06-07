import React from 'react';
import { Building, ResourceType } from '../types/map.d';

interface BuildingPanelProps {
  selectedBuilding: Building | null;
  onUpgrade: (buildingId: string, upgradeType: string) => void;
  onSell: (buildingId: string) => void;
  currentResources: { [key in ResourceType]?: number }; // Resource amounts
}

const BuildingPanel: React.FC<BuildingPanelProps> = ({
  selectedBuilding,
  onUpgrade,
  onSell,
  currentResources,
}) => {
  if (!selectedBuilding) {
    return (
      <div className="p-4 bg-gray-800 text-white w-80 flex-shrink-0">
        <p className="text-center">选择一个建筑查看详情</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-white w-80 flex-shrink-0 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">建筑详情: {selectedBuilding.type}</h2>
      <p>ID: {selectedBuilding.id}</p>
      <p>坐标: ({selectedBuilding.x}, {selectedBuilding.y})</p>
      <p>等级: {selectedBuilding.tier}</p>
      <p>状态: {selectedBuilding.status}</p>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">生产</h3>
        {selectedBuilding.produces.length > 0 ? (
          <ul>
            {selectedBuilding.produces.map((prod, index) => (
              <li key={index}>{prod.resource}: {prod.rate}/s</li>
            ))}
          </ul>
        ) : (
          <p>不生产任何资源</p>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">消耗</h3>
        {selectedBuilding.consumes.length > 0 ? (
          <ul>
            {selectedBuilding.consumes.map((cons, index) => (
              <li key={index}>{cons.resource}: {cons.rate}/s</li>
            ))}
          </ul>
        ) : (
          <p>不消耗任何资源</p>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">存储</h3>
        {selectedBuilding.storage.length > 0 ? (
          <ul>
            {selectedBuilding.storage.map((store, index) => (
              <li key={index}>{store.resource}: {store.amount} / {store.capacity}</li>
            ))}
          </ul>
        ) : (
          <p>无存储空间</p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">升级选项</h3>
        {/* Example Upgrade Button */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2"
          onClick={() => onUpgrade(selectedBuilding.id, 'speed')}
        >
          升级速度 (成本: 100 钱)
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 mb-2"
          onClick={() => onUpgrade(selectedBuilding.id, 'efficiency')}
        >
          升级效率 (成本: 50 科技点)
        </button>
        {/* Add more upgrade options as needed */}
      </div>

      <div className="mt-6">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={() => onSell(selectedBuilding.id)}
        >
          出售建筑 (获得: 50 钱)
        </button>
      </div>
    </div>
  );
};

export default BuildingPanel;
