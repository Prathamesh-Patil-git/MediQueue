"""
Arrival Rate Simulation Engine.

Generates patients at Poisson-distributed random intervals.
Supports normal simulation and starvation scenario mode.

Normal Mode:
    Patients arrive at configurable rate with configurable urgency distribution.

Starvation Mode:
    Floods the queue with 80% Critical patients to study starvation of
    low-priority patients.
"""

import time
import uuid
import random
import math
import threading
from backend import state
from backend.models import UrgencyLevel
from backend.scheduler import compute_priority_score

# ── Patient name pools for realistic generation ──────────────

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh",
    "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Priya", "Meera",
    "Riya", "Saanvi", "Aanya", "Kavya", "Isha", "Nisha", "Rohan",
    "Karan", "Amit", "Raj", "Neha", "Pooja", "Sneha", "Divya",
    "Rahul", "Vikram", "Suman", "Tanvi", "Deepa", "Anjali", "Swati",
]

EMERGENCY_TYPES = [
    "Chest Pain", "Fracture", "Breathing Difficulty", "High Fever",
    "Abdominal Pain", "Head Injury", "Burn", "Allergic Reaction",
    "Seizure", "Stroke Symptoms", "Laceration", "Back Pain",
    "Diabetic Emergency", "Asthma Attack", "Eye Injury",
    "Sprain", "Mild Fever", "Routine Checkup", "Follow-up", "Vaccination",
]


def _generate_random_patient(urgency: str) -> dict:
    """Create a random patient dict with the given urgency level."""
    patient_id = f"P-{uuid.uuid4().hex[:6].upper()}"
    name = random.choice(FIRST_NAMES)
    age = random.randint(1, 90)

    # Pick emergency type — more severe types for higher urgency
    if urgency in ("Critical", "High"):
        etype = random.choice(EMERGENCY_TYPES[:10])  # serious conditions
    else:
        etype = random.choice(EMERGENCY_TYPES[10:])  # milder conditions

    arrival_order = state.next_arrival_order()

    patient = {
        "patient_id": patient_id,
        "name": name,
        "age": age,
        "emergency_type": etype,
        "urgency": urgency,
        "wait_time_bonus": 0,
        "registration_time": time.time(),
        "arrival_order": arrival_order,
        "status": "waiting",
    }
    compute_priority_score(patient)
    return patient


def _register_patient(patient: dict):
    """Insert a patient into all data structures."""
    state.heap.insert(patient)
    state.registry.set(patient["patient_id"], patient)
    state.trie.insert(patient["name"], patient["patient_id"])

    state.add_log(
        "ARRIVAL",
        f"{patient['name']} (ID: {patient['patient_id']}) | "
        f"{patient['urgency']} | Score: {patient['priority_score']}"
    )


def _pick_urgency(distribution: dict[str, float]) -> str:
    """Weighted random choice based on distribution percentages."""
    r = random.random()
    cumulative = 0.0
    for level, pct in distribution.items():
        cumulative += pct
        if r <= cumulative:
            return level
    return "Low"  # fallback


def _poisson_interval(rate: float) -> float:
    """Generate an exponentially distributed inter-arrival time.
    rate = patients per minute → lambda for Poisson process."""
    if rate <= 0:
        return 1.0
    return -math.log(1.0 - random.random()) / rate


def run_simulation(config: dict):
    """Main simulation loop — runs in a background thread.

    Args:
        config: {
            "rate": float,          # patients per minute
            "duration": int,        # total sim time in minutes
            "distribution": dict,   # urgency distribution
        }
    """
    rate = config.get("rate", 3.0)
    duration = config.get("duration", 60)
    distribution = config.get("distribution", {
        "Critical": 0.15, "High": 0.25, "Medium": 0.35, "Low": 0.25
    })

    # Simulation uses compressed time: 1 real second = 1 sim minute
    sim_duration_seconds = duration
    start = time.time()

    state.simulation_start_time = start
    state.simulation_patients_generated = 0

    state.add_log("SIM_START", f"Rate={rate}/min, Duration={duration}min")

    while state.simulation_running:
        elapsed = time.time() - start
        if elapsed >= sim_duration_seconds:
            break

        # Generate a patient
        urgency = _pick_urgency(distribution)
        patient = _generate_random_patient(urgency)
        _register_patient(patient)

        with state.simulation_lock:
            state.simulation_patients_generated += 1

        # Wait for next arrival (Poisson interval, scaled to sim time)
        interval = _poisson_interval(rate)
        # Sleep in small increments so we can check simulation_running
        sleep_end = time.time() + interval
        while time.time() < sleep_end and state.simulation_running:
            time.sleep(0.05)

    state.simulation_running = False
    state.add_log("SIM_STOP", f"Generated {state.simulation_patients_generated} patients")


def start_simulation(config: dict) -> bool:
    """Start the simulation in a background thread. Returns False if already running."""
    if state.simulation_running:
        return False

    state.simulation_running = True
    t = threading.Thread(target=run_simulation, args=(config,), daemon=True)
    state.simulation_thread = t
    t.start()
    return True


def stop_simulation():
    """Signal the simulation to stop."""
    state.simulation_running = False
    state.add_log("SIM_STOP", "Simulation stopped by user")


def start_starvation_scenario(config: dict) -> bool:
    """Start a starvation scenario — floods queue with 80% Critical patients.

    This is a special simulation mode designed to show how low-priority
    patients get starved when emergencies dominate.
    """
    starvation_distribution = {
        "Critical": 0.80,
        "High": 0.10,
        "Medium": 0.05,
        "Low": 0.05,
    }
    sim_config = {
        "rate": config.get("rate", 5.0),
        "duration": config.get("duration", 60),
        "distribution": starvation_distribution,
    }
    state.add_log("STARVATION_MODE", "Flooding queue with 80% Critical patients")
    return start_simulation(sim_config)


def get_simulation_status() -> dict:
    """Return current simulation status."""
    elapsed = 0.0
    if state.simulation_start_time and state.simulation_running:
        elapsed = round(time.time() - state.simulation_start_time, 1)

    return {
        "running": state.simulation_running,
        "elapsed_seconds": elapsed,
        "patients_generated": state.simulation_patients_generated,
        "queue_size": state.heap.size(),
    }
