import { Router, Request, Response } from 'express';
import { marketSystem } from './marketSystem';
import { Material } from "../types/market";

const router = Router();

// GET /api/market/prices - Current prices
router.get('/prices', (req: Request, res: Response) => {
    try {
        const prices = marketSystem.getAllMaterials();
        res.json(prices);
    } catch (error: any) {
        res.status(500).json({ message: "Error getting market prices", error: error.message });
    }
});

// GET /api/market/history/:materialName - Price history for a material
router.get('/history/:materialName', (req: Request, res: Response) => {
    try {
        const { materialName } = req.params;
        const history = marketSystem.getPriceHistory(materialName);
        if (history) {
            res.json(history);
        } else {
            res.status(404).json({ message: `Material ${materialName} not found.` });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Error getting price history", error: error.message });
    }
});

// POST /api/market/trade - Buy/Sell resources
router.post('/trade', (req: Request, res: Response) => {
    try {
        const { materialName, quantity, type, playerId } = req.body; // playerId would come from session/auth in real app
        if (!materialName || !quantity || !type || !playerId) {
            return res.status(400).json({ message: "Missing materialName, quantity, type, or playerId." });
        }
        const success = marketSystem.trade(materialName, quantity, type, playerId);
        if (success) {
            res.status(200).json({ message: "Trade successful." });
        } else {
            res.status(400).json({ message: "Trade failed. Check console for details." });
        }
    } catch (error: any) {
        res.status(500).json({ message: "Error during trade", error: error.message });
    }
});

// GET /api/market/portfolio - Player holdings
router.get('/portfolio/:playerId', (req: Request, res: Response) => {
    try {
        const { playerId } = req.params;
        const portfolio = marketSystem.getPlayerPortfolio(playerId);
        res.json(portfolio);
    } catch (error: any) {
        res.status(500).json({ message: "Error getting player portfolio", error: error.message });
    }
});

export default router;
