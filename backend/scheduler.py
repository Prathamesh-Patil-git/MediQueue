"""
Greedy Appointment Scheduler + Priority Aging logic.

Algorithm 1 — Greedy Scheduling:
    Step 1: Extract max from heap (highest priority patient)
    Step 2: Search AVL tree for next available 15-minute slot
    Step 3: Assign slot, insert appointment into AVL tree
    Step 4: Repeat until heap is empty

Algorithm 2 — Priority Aging (Anti-Starvation):
    Every 10 sim-minutes, all patients in the heap get +5 wait_time_bonus.
    Prevents low-priority patients from being permanently starved.
"""

import time
import uuid
from backend import state
from backend.models import URGENCY_BASE_SCORES, UrgencyLevel


def compute_priority_score(patient: dict) -> float:
    """Compute composite priority score.

    priority = urgency_base + age_bonus + wait_time_bonus

    urgency_base    → Critical=100, High=75, Medium=50, Low=25
    age_bonus       → +10 if patient age > 60
    wait_time_bonus → +5 for every 10 minutes waited (set externally)
    """
    urgency = UrgencyLevel(patient["urgency"])
    urgency_base = URGENCY_BASE_SCORES[urgency]
    age_bonus = 10 if patient["age"] > 60 else 0
    wait_time_bonus = patient.get("wait_time_bonus", 0)

    score = urgency_base + age_bonus + wait_time_bonus

    # Store breakdown on the patient dict for transparency
    patient["urgency_base"] = urgency_base
    patient["age_bonus"] = age_bonus
    patient["priority_score"] = score

    return score


def run_greedy_schedule() -> dict:
    """Run greedy scheduler on the current queue.

    Extracts all patients from the heap in priority order and assigns
    each to the earliest available 15-minute slot in the AVL tree.

    Returns scheduling stats.
    """
    slot_duration = 15  # minutes per appointment
    scheduled = []
    schedule_start_time = time.time()

    while not state.heap.is_empty():
        patient = state.heap.extract_max()
        if patient is None:
            break

        # Find next available slot in the AVL tree
        next_slot = state.schedule.find_next_available(0, slot_duration)

        # Compute wait time (how long patient waited before getting scheduled)
        reg_time = patient.get("registration_time", schedule_start_time)
        wait_minutes = (schedule_start_time - reg_time) / 60.0

        # Create appointment
        appointment = {
            "appointment_id": str(uuid.uuid4())[:8],
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "urgency": patient["urgency"],
            "start_time": next_slot,
            "end_time": next_slot + slot_duration,
            "wait_time": round(wait_minutes, 2),
            "priority_score": patient["priority_score"],
        }

        # Insert into AVL tree
        state.schedule.insert(appointment)

        # Update patient status in registry
        reg_patient = state.registry.get(patient["patient_id"])
        if reg_patient:
            reg_patient["status"] = "scheduled"
            reg_patient["appointment_id"] = appointment["appointment_id"]
            reg_patient["scheduled_time"] = next_slot

        scheduled.append(appointment)

        state.add_log(
            "SCHEDULED",
            f"{patient['name']} ({patient['urgency']}) -> slot {next_slot}-{next_slot + slot_duration}min, "
            f"wait={appointment['wait_time']}min"
        )

    # Compute stats
    stats = compute_schedule_stats(scheduled)
    state.last_schedule_stats = stats

    state.add_log(
        "SCHEDULE_COMPLETE",
        f"Scheduled {len(scheduled)} patients | "
        f"Fairness={stats['fairness_index']:.2f} | "
        f"Starvation={stats['starvation_count']}"
    )

    return {
        "scheduled": scheduled,
        "stats": stats,
    }


def compute_schedule_stats(appointments: list[dict]) -> dict:
    """Compute metrics for a set of scheduled appointments.

    Returns: avg_wait_by_urgency, max_wait_time, starvation_count,
             fairness_index, throughput, total_scheduled.
    """
    if not appointments:
        return {
            "total_scheduled": 0,
            "avg_wait_by_urgency": {},
            "max_wait_time": 0.0,
            "starvation_count": 0,
            "fairness_index": 1.0,
            "throughput": 0.0,
        }

    # Group wait times by urgency
    waits_by_urgency: dict[str, list[float]] = {}
    all_waits = []

    for appt in appointments:
        urg = appt["urgency"]
        w = appt["wait_time"]
        waits_by_urgency.setdefault(urg, []).append(w)
        all_waits.append(w)

    avg_wait_by_urgency = {
        urg: round(sum(ws) / len(ws), 2)
        for urg, ws in waits_by_urgency.items()
    }

    max_wait = max(all_waits) if all_waits else 0.0

    # Starvation: patients who waited > 45 minutes
    starvation_count = sum(1 for w in all_waits if w > 45)

    # Fairness Index — Jain's Formula
    fairness_index = compute_fairness_index(all_waits)

    # Throughput: patients per hour (based on total schedule span)
    if appointments:
        total_span_minutes = max(a["end_time"] for a in appointments)
        throughput = round(len(appointments) / (total_span_minutes / 60.0), 2) if total_span_minutes > 0 else 0.0
    else:
        throughput = 0.0

    return {
        "total_scheduled": len(appointments),
        "avg_wait_by_urgency": avg_wait_by_urgency,
        "max_wait_time": round(max_wait, 2),
        "starvation_count": starvation_count,
        "fairness_index": round(fairness_index, 4),
        "throughput": throughput,
    }


def compute_fairness_index(wait_times: list[float]) -> float:
    """Jain's Fairness Index: F = (sum(x_i))^2 / (n * sum(x_i^2))

    F = 1.0 → perfectly fair
    F → 0   → very unfair
    """
    n = len(wait_times)
    if n == 0:
        return 1.0
    # Offset all waits by 1 to avoid division by zero when all waits are 0
    adjusted = [w + 1 for w in wait_times]
    sum_x = sum(adjusted)
    sum_x2 = sum(x * x for x in adjusted)
    if sum_x2 == 0:
        return 1.0
    return (sum_x ** 2) / (n * sum_x2)


def run_aging_pass():
    """Priority aging — anti-starvation mechanism.

    Adds +5 wait_time_bonus to every patient currently in the heap.
    Called periodically (every 10 simulation seconds).
    """
    patients = state.heap.get_all()
    aged_count = 0

    for p in patients:
        old_bonus = p.get("wait_time_bonus", 0)
        new_bonus = old_bonus + 5
        p["wait_time_bonus"] = new_bonus
        new_score = compute_priority_score(p)
        state.heap.update_priority(p["patient_id"], new_score)

        # Also update in registry
        reg = state.registry.get(p["patient_id"])
        if reg:
            reg["wait_time_bonus"] = new_bonus
            reg["priority_score"] = new_score

        aged_count += 1

    if aged_count > 0:
        state.add_log("AGING", f"Aged {aged_count} patients (+5 wait bonus each)")

    return aged_count
