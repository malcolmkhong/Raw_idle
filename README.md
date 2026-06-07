# Idle Factory Game Core Engine

This repository contains the core game engine for an Idle Factory Game, built using TypeScript and Node.js. It includes the foundational systems required for a factory simulation game.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Game Mechanics Documentation](#game-mechanics-documentation)

## Features

The core engine implements the following systems:

1.  **Production Calculation Engine**
    -   Raw Extraction
    -   Material Processing
    -   Component Manufacturing
    -   Product Assembly
    -   Production Queue (basic implementation started)

2.  **Resource Transfer System**
    -   Basic transfer logic
    -   (To be expanded: Connection Logic, Bottleneck Detection, Smart Routing, Transfer Efficiency)

3.  **Storage System**
    -   Limited Storage with capacity
    -   Overflow Handling
    -   Unlimited Storage (at Tier 9+)
    -   (To be expanded: Storage Upgrade Mechanics)

4.  **Energy System**
    -   Energy Consumption calculation
    -   Power Shortage Effects (efficiency reduction)
    -   (To be expanded: Energy Generation, Distribution)

5.  **Efficiency & Modifiers**
    -   Building Efficiency (base and upgrade mechanisms)
    -   Cumulative calculation of modifiers (event, tech bonus placeholders)

6.  **Event System**
    -   Definition of various `GameEvent` types
    -   Random event triggering
    -   Event duration management and active modifier calculation

7.  **Offline Production Calculation**
    -   Calculates accumulated production during player's absence.

8.  **Save/Load System**
    -   Serializes and deserializes game state to JSON.
    -   Automatic saves.

9.  **WebSocket Real-time Updates**
    -   Node.js WebSocket server for live updates to the frontend.

10. **Performance Optimization**
    -   Initial structure laid out for efficient calculations, further optimization will be an ongoing process for large factory setups.

## Tech Stack

-   **TypeScript**: For type safety and better code organization.
-   **Node.js**: For backend calculations and server logic.
-   **ws**: WebSocket library for real-time communication.

## Project Structure

-   `src/engine/`: Contains the core game logic and systems.
    -   `building.ts`: Defines building interfaces and related logic.
    -   `resource.ts`: Defines resource types and related logic.
    -   `recipe.ts`: Defines manufacturing recipes.
    -   `productionEngine.ts`: Handles all production calculations.
    -   `transferSystem.ts`: Manages resource transfers between buildings.
    -   `storageSystem.ts`: Manages building storage capacities and overflow.
    -   `energySystem.ts`: Handles energy generation, consumption, and distribution.
    -   `efficiencyModifiers.ts`: Manages and applies various efficiency bonuses and penalties.
    -   `eventSystem.ts`: Implements game events, their effects, and duration.
    -   `offlineProduction.ts`: Calculates production that occurred while the player was offline.
    -   `saveLoadSystem.ts`: Manages saving and loading the game state.
    -   `index.ts`: Exports all modules from the engine.
-   `src/server/`: Contains the server-side application logic.
    -   `server.ts`: The main entry point for the WebSocket server and game loop.
-   `dist/`: Compiled JavaScript output.
-   `package.json`: Project dependencies and scripts.
-   `tsconfig.json`: TypeScript compiler configuration.

## Getting Started

To set up and run the server:

1.  **Clone the repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd Raw_idle
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the TypeScript project:**
    ```bash
    npm run build
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```
    The WebSocket server will start on port `8080`.

## Game Mechanics Documentation

### Buildings

Buildings are the primary units of production. Each building has a `type` (extractor, processor, manufacturer, assembler), `tier`, `efficiency`, `baseProductionRate`, and defines its `inputs` and `outputs`. They also have `storageCapacity` for resources and consume `energy`.

### Resources

Resources are classified into `raw`, `processed`, `component`, and `product`. They are consumed and produced by buildings according to `recipes`.

### Recipes

Recipes define what `inputs` are required and what `outputs` are produced, along with the `time` it takes for one production cycle.

### Production Flow

1.  **Raw Extraction**: `extractor` buildings gather raw resources.
2.  **Material Processing**: `processor` buildings convert raw resources into processed materials.
3.  **Component Manufacturing**: `manufacturer` buildings assemble processed materials into components.
4.  **Product Assembly**: `assembler` buildings create final products from components.

### Resource Transfer

Resources are transferred between `connectedBuildings`. The `TransferSystem` currently implements basic transfer logic. Future enhancements will include proximity-based connections, logistics infrastructure, and smart routing to prevent bottlenecks.

### Storage

Buildings have limited storage. When storage is full, production of that resource halts or resources are wasted (`Overflow Handling`). At Tier 9+, buildings gain unlimited storage for all resources. Storage upgrades will scale costs exponentially.

### Energy

Buildings `consume` energy. Currently, there are no energy-generating buildings defined beyond a simplified example in `EnergySystem` that assumes some `extractor` type buildings can produce energy. If energy `production` is less than `consumption`, building `efficiency` will drop (`Power Shortage Effects`).

### Efficiency & Modifiers

Building production rates are affected by:
-   **Base Efficiency**: Starts at 100% and can be upgraded (currently capped at 200%+ in comments).
-   **Tier Multipliers**: Higher tier buildings might have inherent production bonuses.
-   **Event Modifiers**: Temporary positive or negative modifiers from game events.
-   **Tech Tree Bonuses**: Permanent bonuses from research.
All modifiers are cumulatively calculated.

### Event System

Dynamic events (e.g., market crashes, demand spikes, breakthroughs) occur randomly, lasting 5-15 minutes, and apply modifiers to production rates or market prices. Players are notified of active events.

### Offline & Save System

The game calculates `offline production` to account for resources generated while the player is not actively playing. The game state is `automatically saved` every 30 seconds and serialized to JSON for persistence.

### Real-time Updates

Using WebSockets, the server pushes game state updates to connected clients in real-time, enabling a dynamic and responsive frontend experience.
