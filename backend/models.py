"""
Pydantic models for MediQueue.

Defines the data shapes for patients, appointments,
simulation configuration, and API responses.
"""

from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional


# ── Enums ────────────────────────────────────────────────────

class UrgencyLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


URGENCY_BASE_SCORES = {
    UrgencyLevel.CRITICAL: 100,
    UrgencyLevel.HIGH: 75,
    UrgencyLevel.MEDIUM: 50,
    UrgencyLevel.LOW: 25,
}


# ── Request Models ───────────────────────────────────────────

class PatientRegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., ge=0, le=150)
    emergency_type: str = Field(..., min_length=1, max_length=100)
    urgency: UrgencyLevel


class SimulationConfig(BaseModel):
    rate: float = Field(3.0, gt=0, le=20, description="Patients per minute")
    duration: int = Field(60, gt=0, le=600, description="Total sim time in minutes")
    distribution: dict[str, float] = Field(
        default={
            "Critical": 0.15,
            "High": 0.25,
            "Medium": 0.35,
            "Low": 0.25,
        },
        description="Percentage of each urgency level (must sum to ~1.0)",
    )


class StarvationConfig(BaseModel):
    rate: float = Field(5.0, gt=0, le=20)
    duration: int = Field(60, gt=0, le=600)


class ComparisonRequest(BaseModel):
    patient_count: int = Field(30, gt=0, le=200, description="Number of patients to generate for comparison")
    rate: float = Field(3.0, gt=0, le=20)
    distribution: dict[str, float] = Field(
        default={
            "Critical": 0.15,
            "High": 0.25,
            "Medium": 0.35,
            "Low": 0.25,
        },
    )


# ── Response helpers ─────────────────────────────────────────

class PatientResponse(BaseModel):
    patient_id: str
    name: str
    age: int
    emergency_type: str
    urgency: str
    priority_score: float
    urgency_base: int
    age_bonus: int
    wait_time_bonus: float
    registration_time: float
    arrival_order: int
    status: str  # "waiting", "scheduled", "cancelled"


class AppointmentResponse(BaseModel):
    appointment_id: str
    patient_id: str
    patient_name: str
    urgency: str
    start_time: int  # minutes from 00:00
    end_time: int
    wait_time: float  # minutes waited before being scheduled


class ScheduleStatsResponse(BaseModel):
    total_scheduled: int
    avg_wait_by_urgency: dict[str, float]
    max_wait_time: float
    starvation_count: int
    fairness_index: float
    throughput: float


class ComparisonResult(BaseModel):
    strategy_a: ScheduleStatsResponse
    strategy_b: ScheduleStatsResponse
    winner: str
    explanation: str
