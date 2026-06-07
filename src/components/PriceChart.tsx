import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PriceData {
    timestamp: number;
    price: number;
}

interface PriceChartProps {
    materialName: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ materialName }) => {
    const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);

    const fetchPriceHistory = async () => {
        try {
            const response = await axios.get<PriceData[]>(`/api/market/history/${materialName}`);
            setPriceHistory(response.data);
        } catch (error) {
            console.error(`Error fetching price history for ${materialName}:`, error);
            setPriceHistory([]);
        }
    };

    useEffect(() => {
        fetchPriceHistory();
        const interval = setInterval(fetchPriceHistory, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, [materialName]);

    const chartData = {
        labels: priceHistory.map(data => new Date(data.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: `${materialName} 价格 ($)`,
                data: priceHistory.map(data => data.price),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white',
                }
            },
            title: {
                display: true,
                text: `${materialName} 价格历史 (过去30分钟)`,
                color: 'white',
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: $${context.formattedValue}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: 'white',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                }
            },
            y: {
                ticks: {
                    color: 'white',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                }
            },
        }
    };

    return (
        <div className="price-chart w-full h-64">
            {priceHistory.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <p className="text-center text-gray-400">加载价格历史中...</p>
            )}
        </div>
    );
};

export default PriceChart;
