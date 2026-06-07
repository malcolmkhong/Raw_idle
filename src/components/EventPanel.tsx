import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Effect {
    type: string;
    material?: string;
    percentageChange: number;
    isPercentage: boolean;
}

interface Event {
    id: string;
    name: string;
    description: string;
    type: string;
    effects: Effect[];
}

interface ActiveEvent {
    event: Event;
    startTime: number;
    endTime: number;
    duration: number;
}

const EventPanel: React.FC = () => {
    const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([]);
    const [eventHistory, setEventHistory] = useState<Event[]>([]);

    useEffect(() => {
        fetchActiveEvents();
        fetchEventHistory();

        const activeEventsInterval = setInterval(fetchActiveEvents, 5000); // Poll active events every 5 seconds
        const historyInterval = setInterval(fetchEventHistory, 30000); // Poll history every 30 seconds

        return () => {
            clearInterval(activeEventsInterval);
            clearInterval(historyInterval);
        };
    }, []);

    const fetchActiveEvents = async () => {
        try {
            const response = await axios.get<ActiveEvent[]>('/api/events/active');
            setActiveEvents(response.data);
        } catch (error) {
            console.error("Error fetching active events:", error);
        }
    };

    const fetchEventHistory = async () => {
        try {
            const response = await axios.get<Event[]>('/api/events/history');
            setEventHistory(response.data);
        } catch (error) {
            console.error("Error fetching event history:", error);
        }
    };

    const formatTimeRemaining = (endTime: number) => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) return "结束";
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="event-panel p-4 bg-gray-800 text-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">事件面板</h2>

            <section className="mb-6">
                <h3 className="text-xl font-semibold mb-3">当前活跃事件 ({activeEvents.length})</h3>
                {activeEvents.length === 0 ? (
                    <p>目前没有活跃事件。</p>
                ) : (
                    <div className="space-y-4">
                        {activeEvents.map((activeEv) => (
                            <div key={activeEv.event.id} className="bg-gray-700 p-3 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-lg">📢 {activeEv.event.name}</span>
                                    <span className="text-sm text-yellow-400">剩余: {formatTimeRemaining(activeEv.endTime)}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">{activeEv.event.description}</p>
                                <div className="text-xs text-blue-300">
                                    <strong>影响:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {activeEv.event.effects.map((effect, index) => (
                                            <li key={index}>
                                                {effect.type}: {effect.material ? `${effect.material} ` : ''}
                                                {effect.percentageChange > 0 ? '+' : ''}{effect.percentageChange}{effect.isPercentage ? '%' : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">事件历史 (最近 {eventHistory.length} 条)</h3>
                {eventHistory.length === 0 ? (
                    <p>没有历史事件。</p>
                ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thumb-gray-500 scrollbar-track-gray-700 scrollbar-thin">
                        {eventHistory.map((ev) => (
                            <div key={ev.id} className="bg-gray-700 p-2 text-sm rounded-md opacity-80">
                                <span className="font-medium">过去事件: {ev.name}</span>
                                <p className="text-gray-400 text-xs mt-1">{ev.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Event notifications (popup/toast) - This would typically be a separate global component */}
            {/* Event calendar/forecast (next 5 events) - Requires more sophisticated forecasting logic */}
        </div>
    );
};

export default EventPanel;
