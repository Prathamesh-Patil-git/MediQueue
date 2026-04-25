"""
Strategy Comparison Engine.

Compares two scheduling strategies on the exact same patient set:

Strategy A — Pure Greedy (Strict Urgency):
    Patients are scheduled purely by urgency score with no aging bonus.
    High-priority patients always go first regardless of wait time.

Strategy B — Aging-Based Greedy:
    Priority scores increase with wait time (+5 per 10 sim-minutes).
    Balances urgency with fairness — low-priority patients gradually rise.

Both strategies are run independently on a cloned patient set, and their
metrics are compared side-by-side.
"""

import copy
import time
import uuid
import random
from backend.structures.max_heap import MaxHeap
from backend.structures.avl_tree import AVLTree
from backend.models import URGENCY_BASE_SCORES, UrgencyLevel
from backend.scheduler import compute_schedule_stats
from backend.simulation import _generate_random_patient
from backend import state


def _build_patient_set(count: int, rate: float, distribution: dict) -> list[dict]:
    """Generate a fixed set of patients for comparison.

    Patients are given staggered registration times to simulate
    realistic arrival patterns.
    """
    patients = []
    current_time = time.time()

    for i in range(count):
        # Pick urgency from distribution
        r = random.random()
        cumulative = 0.0
        urgency = "Low"
        for level, pct in distribution.items():
            cumulative += pct
            if r <= cumulative:
                urgency = level
                break

        patient = _generate_random_patient(urgency)
        # Stagger registration times to simulate arrivals
        patient["registration_time"] = current_time + (i / rate) * 60.0
        patients.append(patient)

    return patients


def _run_strategy_a(patients: list[dict]) -> list[dict]:
    """Strategy A — Pure Greedy (strict urgency, NO aging).

    Uses only urgency_base + age_bonus. wait_time_bonus is zeroed out.
    """
    heap = MaxHeap()
    avl = AVLTree()
    slot_duration = 15
    schedule_time = time.time()

    # Insert patients with zeroed wait_time_bonus
    for p in patients:
        patient = copy.deepcopy(p)
        patient["wait_time_bonus"] = 0
        urgency = UrgencyLevel(patient["urgency"])
        urgency_base = URGENCY_BASE_SCORES[urgency]
        age_bonus = 10 if patient["age"] > 60 else 0
        patient["urgency_base"] = urgency_base
        patient["age_bonus"] = age_bonus
        patient["priority_score"] = urgency_base + age_bonus
        heap.insert(patient)

    # Schedule greedily
    scheduled = []
    while not heap.is_empty():
        patient = heap.extract_max()
        if patient is None:
            break
        next_slot = avl.find_next_available(0, slot_duration)
        wait_minutes = (schedule_time - patient["registration_time"]) / 60.0
        appointment = {
            "appointment_id": str(uuid.uuid4())[:8],
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "urgency": patient["urgency"],
            "start_time": next_slot,
            "end_time": next_slot + slot_duration,
            "wait_time": round(max(0, wait_minutes), 2),
            "priority_score": patient["priority_score"],
        }
        avl.insert(appointment)
        scheduled.append(appointment)

    return scheduled


def _run_strategy_b(patients: list[dict]) -> list[dict]:
    """Strategy B — Aging-Based Greedy.

    Simulates aging passes: every 10 sim-minutes, all patients get +5 bonus.
    Then schedules greedily.
    """
    heap = MaxHeap()
    avl = AVLTree()
    slot_duration = 15
    schedule_time = time.time()

    # Insert patients with initial scores
    for p in patients:
        patient = copy.deepcopy(p)
        urgency = UrgencyLevel(patient["urgency"])
        urgency_base = URGENCY_BASE_SCORES[urgency]
        age_bonus = 10 if patient["age"] > 60 else 0
        patient["urgency_base"] = urgency_base
        patient["age_bonus"] = age_bonus

        # Compute aging based on how long ago they "arrived"
        elapsed_minutes = (schedule_time - patient["registration_time"]) / 60.0
        aging_passes = max(0, int(elapsed_minutes / 10))
        wait_time_bonus = aging_passes * 5
        patient["wait_time_bonus"] = wait_time_bonus
        patient["priority_score"] = urgency_base + age_bonus + wait_time_bonus
        heap.insert(patient)

    # Schedule greedily
    scheduled = []
    while not heap.is_empty():
        patient = heap.extract_max()
        if patient is None:
            break
        next_slot = avl.find_next_available(0, slot_duration)
        wait_minutes = (schedule_time - patient["registration_time"]) / 60.0
        appointment = {
            "appointment_id": str(uuid.uuid4())[:8],
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "urgency": patient["urgency"],
            "start_time": next_slot,
            "end_time": next_slot + slot_duration,
            "wait_time": round(max(0, wait_minutes), 2),
            "priority_score": patient["priority_score"],
        }
        avl.insert(appointment)
        scheduled.append(appointment)

    return scheduled


def run_comparison(config: dict) -> dict:
    """Run Strategy A vs Strategy B on the same patient set.

    Args:
        config: {
            "patient_count": int,
            "rate": float,
            "distribution": dict
        }

    Returns comparison result with metrics for both strategies.
    """
    count = config.get("patient_count", 30)
    rate = config.get("rate", 3.0)
    distribution = config.get("distribution", {
        "Critical": 0.15, "High": 0.25, "Medium": 0.35, "Low": 0.25
    })

    # Generate one patient set
    patients = _build_patient_set(count, rate, distribution)

    # Run both strategies
    scheduled_a = _run_strategy_a(patients)
    scheduled_b = _run_strategy_b(patients)

    stats_a = compute_schedule_stats(scheduled_a)
    stats_b = compute_schedule_stats(scheduled_b)

    # Determine winner
    winner, explanation = _determine_winner(stats_a, stats_b)

    result = {
        "strategy_a": stats_a,
        "strategy_b": stats_b,
        "scheduled_a": scheduled_a,
        "scheduled_b": scheduled_b,
        "winner": winner,
        "explanation": explanation,
        "patient_count": count,
    }

    state.last_comparison_result = result
    state.add_log("COMPARISON", f"Winner: {winner}")

    return result


def _determine_winner(stats_a: dict, stats_b: dict) -> tuple[str, str]:
    """Compare two strategy stats and pick the better one."""
    fi_a = stats_a["fairness_index"]
    fi_b = stats_b["fairness_index"]
    starv_a = stats_a["starvation_count"]
    starv_b = stats_b["starvation_count"]
    max_w_a = stats_a["max_wait_time"]
    max_w_b = stats_b["max_wait_time"]

    score_a, score_b = 0, 0

    # Fairness index (higher is better)
    if fi_b > fi_a + 0.02:
        score_b += 2
    elif fi_a > fi_b + 0.02:
        score_a += 2

    # Starvation count (lower is better)
    if starv_a > starv_b:
        score_b += 2
    elif starv_b > starv_a:
        score_a += 2

    # Max wait time (lower is better)
    if max_w_a > max_w_b + 1:
        score_b += 1
    elif max_w_b > max_w_a + 1:
        score_a += 1

    parts = []
    if fi_a != fi_b:
        parts.append(f"Fairness: A={fi_a:.2f} vs B={fi_b:.2f}")
    if starv_a != starv_b:
        parts.append(f"Starvation: A={starv_a} vs B={starv_b}")
    parts.append(f"Max Wait: A={max_w_a:.1f}min vs B={max_w_b:.1f}min")

    explanation = " | ".join(parts)

    if score_b > score_a:
        return "Strategy B (Aging-Based)", explanation
    elif score_a > score_b:
        return "Strategy A (Pure Urgency)", explanation
    else:
        return "Tie", explanation
