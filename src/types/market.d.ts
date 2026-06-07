export interface Material {
    name: string;
    currentPrice: number;
    basePrice: number;
    supply: number;
    demand: number;
    priceTrend: "↑" | "↓" | "→";
}

export interface MarketData {
    materials: Material[];
    volatility: number;
}

export interface PlayerPortfolioItem {
    quantity: number;
    averagePrice: number;
}

export interface PlayerPortfolio {
    [materialName: string]: PlayerPortfolioItem;
}
