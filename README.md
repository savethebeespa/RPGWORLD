# RPGWORLD Simulation (TypeScript + React + WebSocket)

This project is a **minimal full-stack TypeScript simulation game app**:
- A Node.js WebSocket server owns the authoritative world state.
- A React client connects and renders rooms + NPCs in real time.
- Shared JSON message contracts live in a `shared` folder.

## Project structure

- `server/` — Node + TypeScript simulation server
- `client/` — React + TypeScript UI (Vite)
- `shared/` — message + world type contracts used by both

## Simulation rules implemented

- Exactly 3 rooms:
  - `room_a` = Entry Room
  - `room_b` = Storage Room
  - `room_c` = Observation Room
- Exactly 3 NPCs:
  - `npc_001` = Mara
  - `npc_002` = Tovin
  - `npc_003` = Ellis
- Every 3 seconds, the server moves one random NPC to a different random room.
- Server broadcasts `npc_moved` events to all connected clients.
- New clients always receive a full `world_snapshot` immediately on connect.
- Client mutation attempts are rejected (server remains authoritative).

## Message contracts

Defined in `shared/contracts.ts`:
- `world_snapshot`
- `npc_moved`
- `error`

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+

## Install dependencies

From repo root:

```bash
npm install
```

## Run locally (two terminals)

Terminal 1 (server):

```bash
npm run dev:server
```

Terminal 2 (client):

```bash
npm run dev:client
```

Open the client at:

- `http://localhost:5173`

The server runs at:

- `ws://localhost:3001`

## Build

```bash
npm run build
```

## Notes for beginners

- The server is the source of truth.
- The client only renders updates it receives.
- Message shapes are typed in one shared file to keep client/server aligned.
