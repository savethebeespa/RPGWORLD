/**
 * Simulation server entry point.
 * Owns authoritative world state and pushes updates to all WebSocket clients.
 */

import { WebSocketServer } from 'ws';
import type { NPC, Room, ServerToClientMessage, WorldState } from '../../shared/contracts';

const PORT = 3001;

const rooms: Room[] = [
  { id: 'room_a', name: 'Entry Room' },
  { id: 'room_b', name: 'Storage Room' },
  { id: 'room_c', name: 'Observation Room' }
];

const npcs: NPC[] = [
  { id: 'npc_001', name: 'Mara', currentRoomId: 'room_a', status: 'Idle', memoryLog: ['Spawned in Entry Room'] },
  { id: 'npc_002', name: 'Tovin', currentRoomId: 'room_b', status: 'Idle', memoryLog: ['Spawned in Storage Room'] },
  { id: 'npc_003', name: 'Ellis', currentRoomId: 'room_c', status: 'Idle', memoryLog: ['Spawned in Observation Room'] }
];

const worldState: WorldState = { rooms, npcs };
const wss = new WebSocketServer({ port: PORT });

function sendMessage(socket: WebSocket, message: ServerToClientMessage): void {
  socket.send(JSON.stringify(message));
}

function broadcast(message: ServerToClientMessage): void {
  const raw = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(raw);
    }
  }
}

function randomDifferentRoom(currentRoomId: Room['id']): Room['id'] {
  const options = rooms.filter((room) => room.id !== currentRoomId);
  const index = Math.floor(Math.random() * options.length);
  return options[index].id;
}

function moveRandomNpc(): void {
  const npcIndex = Math.floor(Math.random() * worldState.npcs.length);
  const npc = worldState.npcs[npcIndex];

  const fromRoomId = npc.currentRoomId;
  const toRoomId = randomDifferentRoom(fromRoomId);

  npc.currentRoomId = toRoomId;
  npc.status = `Moved to ${toRoomId}`;
  npc.memoryLog.push(`Moved from ${fromRoomId} to ${toRoomId} at ${new Date().toISOString()}`);

  const message: ServerToClientMessage = {
    type: 'npc_moved',
    payload: {
      npcId: npc.id,
      npcName: npc.name,
      fromRoomId,
      toRoomId,
      status: npc.status,
      timestamp: new Date().toISOString()
    }
  };

  console.log(`[npc_moved] ${npc.name} (${npc.id}) ${fromRoomId} -> ${toRoomId}`);
  broadcast(message);
}

wss.on('connection', (socket) => {
  const snapshot: ServerToClientMessage = {
    type: 'world_snapshot',
    payload: worldState
  };

  // New clients get the full world state immediately.
  sendMessage(socket as WebSocket, snapshot);

  socket.on('message', () => {
    // Client messages are ignored for safety; server is authoritative.
    const errorMessage: ServerToClientMessage = {
      type: 'error',
      payload: { message: 'Client state mutation is not allowed.' }
    };
    sendMessage(socket as WebSocket, errorMessage);
  });
});

setInterval(moveRandomNpc, 3000);

console.log(`Simulation server running on ws://localhost:${PORT}`);
