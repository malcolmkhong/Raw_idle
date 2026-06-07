import { Router, Request, Response } from 'express';
import { eventSystem } from './eventSystem';
import { Event } from "../types/events";

const router = Router();

// GET /api/events/active - Current active events
router.get('/active', (req: Request, res: Response) => {
    try {
        const activeEvents = eventSystem.getActiveEvents();
        res.json(activeEvents);
    } catch (error: any) {
        res.status(500).json({ message: "Error getting active events", error: error.message });
    }
});

// GET /api/events/history - Past events
router.get('/history', (req: Request, res: Response) => {
    try {
        const eventHistory = eventSystem.getEventHistory();
        res.json(eventHistory);
    } catch (error: any) {
        res.status(500).json({ message: "Error getting event history", error: error.message });
    }
});

// POST /api/events/trigger - Trigger event (for testing/admin)
router.post('/trigger', (req: Request, res: Response) => {
    try {
        const { event }: { event: Event } = req.body;
        if (!event) {
            return res.status(400).json({ message: "Event data is required." });
        }
        eventSystem.activateEvent(event);
        res.status(200).json({ message: `Event '${event.name}' triggered successfully.` });
    } catch (error: any) {
        res.status(500).json({ message: "Error triggering event", error: error.message });
    }
});

export default router;
