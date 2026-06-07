import { Material } from "../types/market";
import { eventSystem } from "./eventSystem";

interface MaterialData {
    name: string;
    basePrice: number;
    currentPrice: number;
    supply: number;
    demand: number;
    priceHistory: { timestamp: number; price: number }[];
}

interface PlayerPortfolio {
    [material: string]: { quantity: number; averagePrice: number };
}

class MarketSystem {
    private materials: Map<string, MaterialData> = new Map();
    private playerPortfolio: PlayerPortfolio = {};
    private volatilityFactor: number = 0.05; // Base volatility
    private maxPriceHistoryLength = 30; // Last 30 minutes

    constructor() {
        this.loadMarketDefaults();
        // Price fluctuation update interval
        setInterval(() => this.updateMarketPrices(), 60 * 1000); // Every minute
    }

    private async loadMarketDefaults() {
        const marketDefaults = await import('../../src/data/marketDefaults.json');
        marketDefaults.default.materials.forEach((mat: any) => {
            this.materials.set(mat.name, {
                name: mat.name,
                basePrice: mat.basePrice,
                currentPrice: mat.basePrice,
                supply: mat.supply,
                demand: mat.demand,
                priceHistory: [{ timestamp: Date.now(), price: mat.basePrice }]
            });
        });
        console.log(`Loaded ${this.materials.size} materials into the market.`);
    }

    private updateMarketPrices() {
        this.materials.forEach((mat, name) => {
            // Calculate price change based on supply/demand and volatility
            const supplyDemandRatio = mat.supply / mat.demand;
            let priceChangeFactor = 1;

            if (supplyDemandRatio > 1.2) { // Supply surplus
                priceChangeFactor = 0.98; // Price tends to decrease
            } else if (supplyDemandRatio < 0.8) { // Demand surplus
                priceChangeFactor = 1.02; // Price tends to increase
            }

            // Add random fluctuation
            const randomFluctuation = (Math.random() * 2 - 1) * this.volatilityFactor; // -volatility to +volatility
            priceChangeFactor += randomFluctuation;

            // Apply event-driven fluctuations (handled by eventSystem calling updateMaterialPrice directly)
            // For now, let's ensure prices don't go negative or ridiculously high
            let newPrice = mat.currentPrice * priceChangeFactor;
            newPrice = Math.max(0.1, newPrice); // Minimum price
            newPrice = parseFloat(newPrice.toFixed(2));

            mat.currentPrice = newPrice;
            mat.priceHistory.push({ timestamp: Date.now(), price: newPrice });
            if (mat.priceHistory.length > this.maxPriceHistoryLength) {
                mat.priceHistory.shift(); // Remove oldest entry
            }
        });
        this.emitMarketUpdate();
    }

    public updateMaterialPrice(materialName: string, percentageChange: number, isPercentage: boolean = true) {
        const mat = this.materials.get(materialName);
        if (mat) {
            let changeAmount = percentageChange;
            if (isPercentage) {
                changeAmount = mat.currentPrice * (percentageChange / 100);
            }
            mat.currentPrice = parseFloat((mat.currentPrice + changeAmount).toFixed(2));
            mat.currentPrice = Math.max(0.1, mat.currentPrice);
            mat.priceHistory.push({ timestamp: Date.now(), price: mat.currentPrice });
            if (mat.priceHistory.length > this.maxPriceHistoryLength) {
                mat.priceHistory.shift();
            }
            console.log(`Event adjusted price for ${materialName}: ${mat.currentPrice}`);
        } else {
            console.warn(`Material ${materialName} not found for price update.`);
        }
    }

    public getAllMaterials(): Material[] {
        return Array.from(this.materials.values()).map(mat => ({
            name: mat.name,
            currentPrice: mat.currentPrice,
            basePrice: mat.basePrice,
            supply: mat.supply,
            demand: mat.demand,
            priceTrend: this.getPriceTrend(mat.priceHistory)
        }));
    }

    public getPriceHistory(materialName: string): { timestamp: number; price: number }[] | undefined {
        return this.materials.get(materialName)?.priceHistory;
    }

    private getPriceTrend(history: { timestamp: number; price: number }[]): string {
        if (history.length < 2) return "→";
        const latestPrice = history[history.length - 1].price;
        const previousPrice = history[history.length - 2].price;
        if (latestPrice > previousPrice) return "↑";
        if (latestPrice < previousPrice) return "↓";
        return "→";
    }

    public trade(materialName: string, quantity: number, type: "buy" | "sell", playerId: string): boolean {
        const mat = this.materials.get(materialName);
        if (!mat) {
            console.error(`Material ${materialName} not found.`);
            return false;
        }

        const totalCost = mat.currentPrice * quantity;
        let success = false;

        // In a real game, you'd check player's money/inventory here
        if (type === "buy") {
            // Assume player has enough money for now
            this.playerPortfolio[materialName] = this.playerPortfolio[materialName] || { quantity: 0, averagePrice: 0 };
            const currentTotalValue = this.playerPortfolio[materialName].quantity * this.playerPortfolio[materialName].averagePrice;
            this.playerPortfolio[materialName].quantity += quantity;
            this.playerPortfolio[materialName].averagePrice = (currentTotalValue + totalCost) / this.playerPortfolio[materialName].quantity;
            mat.demand += quantity * 0.1; // Player buying increases demand slightly
            mat.supply -= quantity * 0.05;
            success = true;
            console.log(`${playerId} bought ${quantity} of ${materialName} for ${totalCost.toFixed(2)}.`);
        } else if (type === "sell") {
            if (this.playerPortfolio[materialName] && this.playerPortfolio[materialName].quantity >= quantity) {
                this.playerPortfolio[materialName].quantity -= quantity;
                // If quantity drops to 0, reset average price or remove entry
                if (this.playerPortfolio[materialName].quantity === 0) {
                    delete this.playerPortfolio[materialName];
                }
                mat.supply += quantity * 0.1; // Player selling increases supply slightly
                mat.demand -= quantity * 0.05;
                success = true;
                console.log(`${playerId} sold ${quantity} of ${materialName} for ${totalCost.toFixed(2)}.`);
            } else {
                console.error(`${playerId} does not have enough ${materialName} to sell.`);
            }
        }

        if (success) {
            // Add a small fluctuation due to player trading volume
            const tradeImpact = quantity * 0.001;
            this.updateMaterialPrice(materialName, (type === "buy" ? tradeImpact : -tradeImpact), false);
            this.emitMarketUpdate();
        }
        return success;
    }

    public getPlayerPortfolio(playerId: string): PlayerPortfolio {
        // In a multi-player scenario, playerId would be used to fetch specific portfolio
        return this.playerPortfolio;
    }

    private emitMarketUpdate() {
        // This method would typically push updates to connected clients via WebSockets
        // For now, it logs the update.
        // console.log("Market updated.", this.getAllMaterials());
    }
}

export const marketSystem = new MarketSystem();

// Dummy function for productionEngine to avoid circular dependency for now
export function getProductionLines() {
    return [];
}

export function updateProductionLineOutput(id: string, percentageChange: number) {
    console.log(`Updating production line ${id} output by ${percentageChange}% (dummy function)`);
}
