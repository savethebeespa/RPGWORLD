/**
 * Shared TypeScript contracts used by both server and client.
 * Keeping contracts in one file helps prevent message shape drift.
 */

export type RoomId = 'room_a' | 'room_b' | 'room_c';

export interface Room {
  id: RoomId;
  name: string;
}

export interface NPC {
  id: 'npc_001' | 'npc_002' | 'npc_003';
  name: string;
  currentRoomId: RoomId;
  status: string;
  memoryLog: string[];
}

export interface WorldState {
  rooms: Room[];
  npcs: NPC[];
}

export interface WorldSnapshotMessage {
  type: 'world_snapshot';
  payload: WorldState;
}

export interface NpcMovedMessage {
  type: 'npc_moved';
  payload: {
    npcId: NPC['id'];
    npcName: string;
    fromRoomId: RoomId;
    toRoomId: RoomId;
    status: string;
    timestamp: string;
  };
}

export interface ErrorMessage {
  type: 'error';
  payload: {
    message: string;
  };
}

export type ServerToClientMessage =
  | WorldSnapshotMessage
  | NpcMovedMessage
  | ErrorMessage;
