import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Patient APIs ────────────────────────────────────────────

export const registerPatient = (data) =>
  API.post('/patient/register', data);

export const getPatient = (id) =>
  API.get(`/patient/${id}`);

export const deletePatient = (id) =>
  API.delete(`/patient/${id}`);

export const searchPatients = (prefix) =>
  API.get(`/patient/search/${prefix}`);

// ── Queue APIs ──────────────────────────────────────────────

export const getQueue = () =>
  API.get('/queue');

export const getNextPatient = () =>
  API.get('/queue/next');

export const processNext = () =>
  API.post('/queue/process');

export const triggerAging = () =>
  API.put('/queue/age');

// ── Scheduler APIs ──────────────────────────────────────────

export const runSchedule = () =>
  API.post('/schedule/run');

export const getSchedule = () =>
  API.get('/schedule');

export const getScheduleStats = () =>
  API.get('/schedule/stats');

// ── Simulation APIs ─────────────────────────────────────────

export const startSimulation = (config) =>
  API.post('/simulation/start', config);

export const stopSimulation = () =>
  API.post('/simulation/stop');

export const getSimulationStatus = () =>
  API.get('/simulation/status');

export const startStarvation = (config) =>
  API.post('/simulation/starvation', config);

// ── Comparison APIs ─────────────────────────────────────────

export const runComparison = (config) =>
  API.post('/compare', config);

export const getComparisonResult = () =>
  API.get('/compare/result');

// ── Utility APIs ────────────────────────────────────────────

export const getLogs = () =>
  API.get('/logs');

export const resetSystem = () =>
  API.post('/reset');

export const getHealth = () =>
  API.get('/health');

export default API;
