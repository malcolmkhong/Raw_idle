import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import techTreeApi from '../backend/techTreeApi';
import researchApi from '../backend/researchApi';
import eventApi from '../backend/eventApi'; // Import the new event API
import marketApi from '../backend/marketApi'; // Import the new market API
import { eventSystem } from '../backend/eventSystem'; // Import eventSystem to start the cycle

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../public')));

app.use('/api/tech-tree', techTreeApi);
app.use('/api/research', researchApi);
app.use('/api/events', eventApi); // Use event API
app.use('/api/market', marketApi); // Use market API

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    eventSystem.startEventCycle(); // Start the event cycle when the server starts
});
