"""
Global in-memory state for MediQueue.

All four custom data structures are instantiated here and shared
across the application. This module also holds counters and logs.
"""

from backend.structures.max_heap import MaxHeap
from backend.structures.hash_table import HashTable
from backend.structures.avl_tree import AVLTree
from backend.structures.trie import Trie
import threading

# ── Core Data Structures ─────────────────────────────────────

heap = MaxHeap()          # DS 1 — Priority Queue
registry = HashTable()    # DS 2 — Patient Registry
schedule = AVLTree()      # DS 3 — Appointment Schedule
trie = Trie()             # DS 4 — Name Search / Autocomplete

# ── Counters ─────────────────────────────────────────────────

arrival_counter = 0               # monotonic counter for tie-breaking
arrival_counter_lock = threading.Lock()

# ── Activity Log ─────────────────────────────────────────────

activity_log: list[dict] = []     # {"time": ..., "event": ..., "details": ...}
LOG_MAX = 200                     # keep last 200 events

# ── Simulation State ─────────────────────────────────────────

simulation_running = False
simulation_thread = None
simulation_start_time = None
simulation_patients_generated = 0
simulation_lock = threading.Lock()

# ── Last Comparison Result ───────────────────────────────────

last_comparison_result = None

# ── Last Schedule Stats ──────────────────────────────────────

last_schedule_stats = None


def next_arrival_order() -> int:
    """Thread-safe monotonic counter."""
    global arrival_counter
    with arrival_counter_lock:
        arrival_counter += 1
        return arrival_counter


def add_log(event: str, details: str = ""):
    """Append an event to the activity log (capped at LOG_MAX)."""
    import time
    activity_log.append({
        "time": time.time(),
        "event": event,
        "details": details,
    })
    if len(activity_log) > LOG_MAX:
        activity_log.pop(0)


def reset_all():
    """Clear all data structures and counters."""
    global arrival_counter, simulation_running, simulation_patients_generated
    global last_comparison_result, last_schedule_stats
    heap.clear()
    registry.clear()
    schedule.clear()
    trie.clear()
    arrival_counter = 0
    activity_log.clear()
    simulation_running = False
    simulation_patients_generated = 0
    last_comparison_result = None
    last_schedule_stats = None
