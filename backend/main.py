"""
MediQueue — FastAPI Application.

All REST API endpoints for the Emergency-Aware Hospital Scheduling System.
Handles patient registration, queue management, scheduling, simulation,
and strategy comparison.
"""

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend import state
from backend.models import (
    PatientRegisterRequest,
    SimulationConfig,
    StarvationConfig,
    ComparisonRequest,
    UrgencyLevel,
    URGENCY_BASE_SCORES,
)
from backend.scheduler import (
    compute_priority_score,
    run_greedy_schedule,
    run_aging_pass,
)
from backend.simulation import (
    start_simulation,
    stop_simulation,
    start_starvation_scenario,
    get_simulation_status,
)
from backend.comparison import run_comparison


# ── Lifespan (startup / shutdown) ────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    state.add_log("SYSTEM", "MediQueue server started")
    yield
    stop_simulation()
    state.add_log("SYSTEM", "MediQueue server shutting down")


app = FastAPI(
    title="MediQueue API",
    description="Emergency-Aware Hospital Scheduling System",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════
#  PATIENT APIs
# ══════════════════════════════════════════════════════════════

@app.post("/patient/register")
def register_patient(req: PatientRegisterRequest):
    """Register a new patient → inserts into Heap + HashTable + Trie."""
    patient_id = f"P-{uuid.uuid4().hex[:6].upper()}"
    arrival_order = state.next_arrival_order()

    urgency = req.urgency
    urgency_base = URGENCY_BASE_SCORES[urgency]
    age_bonus = 10 if req.age > 60 else 0
    wait_time_bonus = 0
    priority_score = urgency_base + age_bonus + wait_time_bonus

    patient = {
        "patient_id": patient_id,
        "name": req.name,
        "age": req.age,
        "emergency_type": req.emergency_type,
        "urgency": urgency.value,
        "urgency_base": urgency_base,
        "age_bonus": age_bonus,
        "wait_time_bonus": wait_time_bonus,
        "priority_score": priority_score,
        "registration_time": time.time(),
        "arrival_order": arrival_order,
        "status": "waiting",
    }

    # Insert into all data structures
    state.heap.insert(patient)
    state.registry.set(patient_id, patient)
    state.trie.insert(req.name, patient_id)

    state.add_log(
        "REGISTERED",
        f"{req.name} (ID: {patient_id}) | {urgency.value} | Score: {priority_score}"
    )

    return {
        "message": "Patient registered successfully",
        "patient": patient,
        "score_breakdown": {
            "urgency_base": urgency_base,
            "age_bonus": age_bonus,
            "wait_time_bonus": wait_time_bonus,
            "total": priority_score,
        },
    }


@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    """Lookup patient by ID → Hash Table O(1)."""
    patient = state.registry.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.delete("/patient/{patient_id}")
def delete_patient(patient_id: str):
    """Remove patient from all data structures."""
    patient = state.registry.get(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    state.heap.remove_by_id(patient_id)
    state.registry.delete(patient_id)
    state.trie.delete(patient["name"], patient_id)

    # Also remove from schedule if they have an appointment
    if "scheduled_time" in patient:
        state.schedule.delete(patient["scheduled_time"])

    state.add_log("CANCELLED", f"{patient['name']} (ID: {patient_id}) removed")

    return {"message": f"Patient {patient_id} removed", "patient": patient}


@app.get("/patient/search/{prefix}")
def search_patients(prefix: str):
    """Trie prefix search → autocomplete suggestions."""
    results = state.trie.search(prefix)
    # Enrich with full patient data from registry
    enriched = []
    for r in results:
        patient = state.registry.get(r["patient_id"])
        if patient:
            enriched.append(patient)
    return {"prefix": prefix, "results": enriched, "count": len(enriched)}


# ══════════════════════════════════════════════════════════════
#  QUEUE APIs
# ══════════════════════════════════════════════════════════════

@app.get("/queue")
def get_queue():
    """Return current heap state ordered by priority (highest first)."""
    sorted_patients = state.heap.to_sorted_list()
    return {
        "queue": sorted_patients,
        "size": state.heap.size(),
    }


@app.get("/queue/next")
def get_next_patient():
    """Peek at the top of the heap — who is next."""
    patient = state.heap.peek()
    if not patient:
        return {"message": "Queue is empty", "patient": None}
    return {"patient": patient}


@app.post("/queue/process")
def process_next():
    """Extract the highest-priority patient from the heap (manual process)."""
    patient = state.heap.extract_max()
    if not patient:
        raise HTTPException(status_code=404, detail="Queue is empty")

    # Update status in registry
    reg = state.registry.get(patient["patient_id"])
    if reg:
        reg["status"] = "processed"

    state.add_log("PROCESSED", f"{patient['name']} ({patient['urgency']}) manually processed")

    return {"message": "Patient processed", "patient": patient}


@app.put("/queue/age")
def trigger_aging():
    """Manually trigger one priority aging pass (+5 to all patients)."""
    count = run_aging_pass()
    return {"message": f"Aged {count} patients", "aged_count": count}


# ══════════════════════════════════════════════════════════════
#  SCHEDULER APIs
# ══════════════════════════════════════════════════════════════

@app.post("/schedule/run")
def run_schedule():
    """Run greedy scheduler on current queue → assigns appointments."""
    if state.heap.is_empty():
        raise HTTPException(status_code=400, detail="Queue is empty — nothing to schedule")
    result = run_greedy_schedule()
    return result


@app.get("/schedule")
def get_schedule():
    """Return full schedule from AVL tree (in-order = time-sorted)."""
    appointments = state.schedule.in_order()
    return {"schedule": appointments, "count": len(appointments)}


@app.get("/schedule/stats")
def get_schedule_stats():
    """Return stats from the last scheduling run."""
    if state.last_schedule_stats is None:
        return {"message": "No scheduling run yet", "stats": None}
    return {"stats": state.last_schedule_stats}


# ══════════════════════════════════════════════════════════════
#  SIMULATION APIs
# ══════════════════════════════════════════════════════════════

@app.post("/simulation/start")
def sim_start(config: SimulationConfig):
    """Start arrival rate simulation with configurable parameters."""
    success = start_simulation(config.model_dump())
    if not success:
        raise HTTPException(status_code=409, detail="Simulation already running")
    return {"message": "Simulation started", "config": config.model_dump()}


@app.post("/simulation/stop")
def sim_stop():
    """Stop running simulation."""
    stop_simulation()
    return {"message": "Simulation stopped"}


@app.get("/simulation/status")
def sim_status():
    """Get current simulation status."""
    return get_simulation_status()


@app.post("/simulation/starvation")
def sim_starvation(config: StarvationConfig):
    """Start starvation scenario — floods queue with 80% Critical."""
    success = start_starvation_scenario(config.model_dump())
    if not success:
        raise HTTPException(status_code=409, detail="Simulation already running")
    return {"message": "Starvation scenario started (80% Critical)"}


# ══════════════════════════════════════════════════════════════
#  COMPARISON APIs
# ══════════════════════════════════════════════════════════════

@app.post("/compare")
def compare_strategies(config: ComparisonRequest):
    """Run Strategy A vs Strategy B comparison on same patient set."""
    result = run_comparison(config.model_dump())
    # Remove full scheduled lists from response to keep it manageable
    return {
        "strategy_a": result["strategy_a"],
        "strategy_b": result["strategy_b"],
        "winner": result["winner"],
        "explanation": result["explanation"],
        "patient_count": result["patient_count"],
    }


@app.get("/compare/result")
def get_comparison_result():
    """Return the last comparison result."""
    if state.last_comparison_result is None:
        return {"message": "No comparison run yet", "result": None}
    r = state.last_comparison_result
    return {
        "strategy_a": r["strategy_a"],
        "strategy_b": r["strategy_b"],
        "winner": r["winner"],
        "explanation": r["explanation"],
        "patient_count": r["patient_count"],
    }


# ══════════════════════════════════════════════════════════════
#  UTILITY APIs
# ══════════════════════════════════════════════════════════════

@app.get("/logs")
def get_logs():
    """Return the activity log (last 200 events)."""
    return {"logs": list(reversed(state.activity_log)), "count": len(state.activity_log)}


@app.post("/reset")
def reset_system():
    """Reset all data structures and state."""
    stop_simulation()
    state.reset_all()
    state.add_log("SYSTEM", "System reset")
    return {"message": "System reset complete"}


@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "queue_size": state.heap.size(),
        "registry_size": state.registry.size(),
        "schedule_size": state.schedule.size(),
    }
