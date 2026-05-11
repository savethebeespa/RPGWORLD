"""
Minimal NPC simulation prototype.

This module provides the first simulation layer for RPGWORLD:
- data containers for NPC state
- room definitions
- a simple tick-based simulation controller
"""

from __future__ import annotations

from dataclasses import dataclass, field
import random
from typing import List


# -----------------------------
# Room data
# -----------------------------
# Kept intentionally simple as a static list for now.
ROOMS = ["Lobby", "Kitchen", "Bedroom", "Storage"]


@dataclass
class NPC:
    """Represents a single NPC with movement/state tracking data."""

    id: int
    name: str
    currentRoom: str
    previousRoom: str | None = None
    movementHistory: List[str] = field(default_factory=list)
    state: str = "idle"
    energy: float = 100.0
    mood: str = "neutral"

    def move_to(self, new_room: str) -> None:
        """Move NPC to a new room and update all required fields."""
        if new_room == self.currentRoom:
            return

        old_room = self.currentRoom
        self.state = "moving"

        # Room transition updates.
        self.previousRoom = old_room
        self.currentRoom = new_room

        # Record move for debugging/analytics later.
        self.movementHistory.append(f"{old_room} -> {new_room}")

        # Basic resource drain and derived mood.
        self.energy = max(0.0, self.energy - 2.5)
        self._update_mood_from_energy()

        # For this prototype, movement completes in the same tick.
        self.state = "idle"

    def _update_mood_from_energy(self) -> None:
        """Very simple mood model based on current energy."""
        if self.energy >= 70:
            self.mood = "good"
        elif self.energy >= 35:
            self.mood = "okay"
        else:
            self.mood = "tired"


class SimulationManager:
    """Runs tick updates and coordinates NPC decisions/actions."""

    def __init__(self, npcs: List[NPC], rooms: List[str], move_chance: float = 0.65) -> None:
        self.npcs = npcs
        self.rooms = rooms
        self.move_chance = move_chance
        self.tick_count = 0

    def run_tick(self) -> None:
        """Advance simulation by one tick and print NPC states."""
        self.tick_count += 1
        print(f"\n=== Tick {self.tick_count} ===")

        for npc in self.npcs:
            # Each tick, each NPC has a chance to move.
            if random.random() < self.move_chance:
                available_rooms = [r for r in self.rooms if r != npc.currentRoom]
                chosen_room = random.choice(available_rooms)
                npc.move_to(chosen_room)

            self._log_npc(npc)

    @staticmethod
    def _log_npc(npc: NPC) -> None:
        """Structured printout of NPC data for observation."""
        print(
            {
                "id": npc.id,
                "name": npc.name,
                "currentRoom": npc.currentRoom,
                "previousRoom": npc.previousRoom,
                "movementHistory": npc.movementHistory,
                "state": npc.state,
                "energy": round(npc.energy, 1),
                "mood": npc.mood,
            }
        )


def create_default_npcs() -> List[NPC]:
    """Factory for the 3 required NPCs."""
    return [
        NPC(id=1, name="Aria", currentRoom="Lobby"),
        NPC(id=2, name="Bram", currentRoom="Kitchen"),
        NPC(id=3, name="Cyra", currentRoom="Bedroom"),
    ]


def main() -> None:
    """Entry point for quickly running the prototype."""
    random.seed(7)  # Fixed seed for reproducible demo output.

    npcs = create_default_npcs()
    sim = SimulationManager(npcs=npcs, rooms=ROOMS)

    # Run a few ticks to observe data changes over time.
    for _ in range(5):
        sim.run_tick()


if __name__ == "__main__":
    main()
