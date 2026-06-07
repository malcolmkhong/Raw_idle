import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PriceChart from './PriceChart'; // Assuming PriceChart.tsx will be created
import { Material, PlayerPortfolio } from '../types/market';

const StockMarket: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [portfolio, setPortfolio] = useState<PlayerPortfolio>({});
    const playerId = "player1"; // Hardcoded for now, replace with actual player ID

    const fetchMarketData = useCallback(async () => {
        try {
            const response = await axios.get<Material[]>('/api/market/prices');
            setMaterials(response.data);
            if (selectedMaterial) {
                setSelectedMaterial(response.data.find(m => m.name === selectedMaterial.name) || null);
            }
        } catch (error) {
            console.error("Error fetching market data:", error);
        }
    }, [selectedMaterial]);

    const fetchPortfolio = useCallback(async () => {
        try {
            const response = await axios.get<PlayerPortfolio>(`/api/market/portfolio/${playerId}`);
            setPortfolio(response.data);
        } catch (error) {
            console.error("Error fetching portfolio:", error);
        }
    }, [playerId]);

    useEffect(() => {
        fetchMarketData();
        fetchPortfolio();

        const marketInterval = setInterval(fetchMarketData, 5000); // Update market every 5 seconds
        const portfolioInterval = setInterval(fetchPortfolio, 10000); // Update portfolio every 10 seconds

        return () => {
            clearInterval(marketInterval);
            clearInterval(portfolioInterval);
        };
    }, [fetchMarketData, fetchPortfolio]);

    const handleTrade = async (type: "buy" | "sell") => {
        if (!selectedMaterial || quantity <= 0) return;

        try {
            const response = await axios.post('/api/market/trade', {
                materialName: selectedMaterial.name,
                quantity,
                type,
                playerId,
            });
            console.log(response.data.message);
            fetchMarketData(); // Refresh market data after trade
            fetchPortfolio(); // Refresh portfolio data after trade
            setQuantity(1); // Reset quantity
        } catch (error: any) {
            console.error("Trade failed:", error.response?.data?.message || error.message);
        }
    };

    const calculateProfitLoss = (materialName: string) => {
        const portfolioItem = portfolio[materialName];
        const currentMaterial = materials.find(m => m.name === materialName);

        if (portfolioItem && currentMaterial) {
            const currentTotalValue = portfolioItem.quantity * currentMaterial.currentPrice;
            const investedTotalValue = portfolioItem.quantity * portfolioItem.averagePrice;
            const profitLoss = currentTotalValue - investedTotalValue;
            const profitLossPercentage = (profitLoss / investedTotalValue) * 100;
            return {
                value: profitLoss.toFixed(2),
                percentage: profitLossPercentage.toFixed(2),
                isProfit: profitLoss >= 0,
            };
        }
        return null;
    };

    const currentTotalPrice = selectedMaterial ? (selectedMaterial.currentPrice * quantity).toFixed(2) : '0.00';

    return (
        <div className="stock-market p-4 bg-gray-800 text-white rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="market-data">
                <h2 className="text-2xl font-bold mb-4">股票市场</h2>

                <div className="price-board mb-6">
                    <h3 className="text-xl font-semibold mb-3">材料价格板</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-700 rounded-md">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">材料</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">价格</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">趋势</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">供需比</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materials.map((mat) => (
                                    <tr key={mat.name} className="hover:bg-gray-600 cursor-pointer"
                                        onClick={() => setSelectedMaterial(mat)}>
                                        <td className="px-4 py-2 border-b border-gray-600">{mat.name}</td>
                                        <td className="px-4 py-2 border-b border-gray-600">{mat.currentPrice.toFixed(2)}</td>
                                        <td className="px-4 py-2 border-b border-gray-600">
                                            <span className={mat.priceTrend === '↑' ? 'text-green-500' :
                                                            mat.priceTrend === '↓' ? 'text-red-500' : 'text-gray-400'}>
                                                {mat.priceTrend}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-600">{(mat.supply / mat.demand).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="trading-interface mb-6 p-4 bg-gray-700 rounded-md">
                    <h3 className="text-xl font-semibold mb-3">交易界面</h3>
                    {selectedMaterial ? (
                        <div>
                            <p className="mb-2">交易: <span className="font-medium text-blue-400">{selectedMaterial.name}</span> (当前价格: {selectedMaterial.currentPrice.toFixed(2)})</p>
                            <div className="flex items-center mb-4">
                                <label htmlFor="quantity" className="mr-2">数量:</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-24 p-2 rounded-md bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500"
                                />
                                <span className="ml-4">总价: ${currentTotalPrice}</span>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => handleTrade("buy")}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                >
                                    购买
                                </button>
                                <button
                                    onClick={() => handleTrade("sell")}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                                >
                                    出售
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>请从价格板中选择一种材料进行交易。</p>
                    )}
                </div>
            </div>

            <div className="portfolio-and-charts">
                <h3 className="text-xl font-semibold mb-4">我的投资组合</h3>
                <div className="portfolio-tracker mb-6 overflow-x-auto">
                    {Object.keys(portfolio).length === 0 ? (
                        <p>您的投资组合是空的。</p>
                    ) : (
                        <table className="min-w-full bg-gray-700 rounded-md">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">材料</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">数量</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">平均价格</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">当前价值</th>
                                    <th className="px-4 py-2 border-b border-gray-600 text-left">盈亏</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(portfolio).map(([matName, item]) => {
                                    const currentMaterial = materials.find(m => m.name === matName);
                                    const pl = calculateProfitLoss(matName);
                                    return (
                                        <tr key={matName} className="hover:bg-gray-600">
                                            <td className="px-4 py-2 border-b border-gray-600">{matName}</td>
                                            <td className="px-4 py-2 border-b border-gray-600">{item.quantity}</td>
                                            <td className="px-4 py-2 border-b border-gray-600">{item.averagePrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 border-b border-gray-600">{((currentMaterial?.currentPrice || 0) * item.quantity).toFixed(2)}</td>
                                            <td className={`px-4 py-2 border-b border-gray-600 ${pl?.isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                                {pl ? `$${pl.value} (${pl.percentage}%)` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="price-chart-section p-4 bg-gray-700 rounded-md">
                    <h3 className="text-xl font-semibold mb-3">价格历史图表</h3>
                    {selectedMaterial ? (
                        <PriceChart materialName={selectedMaterial.name} />
                    ) : (
                        <p>请选择材料以查看其价格图表。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockMarket;
