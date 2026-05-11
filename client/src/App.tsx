/**
 * Main UI for viewing rooms, NPC positions, and recent movement events.
 */
import { useEffect, useMemo, useState } from 'react';
import type { NPC, Room, ServerToClientMessage } from '../../shared/contracts';

type EventItem = string;

export function App() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerToClientMessage;

      if (message.type === 'world_snapshot') {
        setRooms(message.payload.rooms);
        setNpcs(message.payload.npcs);
      }

      if (message.type === 'npc_moved') {
        setNpcs((prev) =>
          prev.map((npc) =>
            npc.id === message.payload.npcId
              ? { ...npc, currentRoomId: message.payload.toRoomId, status: message.payload.status }
              : npc
          )
        );

        const eventLine = `${message.payload.timestamp}: ${message.payload.npcName} moved ${message.payload.fromRoomId} → ${message.payload.toRoomId}`;
        setEvents((prev) => [eventLine, ...prev].slice(0, 10));
      }

      if (message.type === 'error') {
        setEvents((prev) => [`Error: ${message.payload.message}`, ...prev].slice(0, 10));
      }
    };

    return () => socket.close();
  }, []);

  const npcsByRoom = useMemo(() => {
    return rooms.map((room) => ({
      room,
      npcs: npcs.filter((npc) => npc.currentRoomId === room.id)
    }));
  }, [rooms, npcs]);

  return (
    <main className="layout">
      <h1>RPGWORLD Simulation</h1>
      <div className="grid">
        {npcsByRoom.map(({ room, npcs: roomNpcs }) => (
          <section key={room.id} className="card">
            <h2>{room.name}</h2>
            <ul>
              {roomNpcs.map((npc) => (
                <li key={npc.id}>
                  <strong>{npc.name}</strong> <span>({npc.status})</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="card log">
        <h2>Recent Events</h2>
        <ul>
          {events.map((entry, index) => (
            <li key={`${entry}-${index}`}>{entry}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
