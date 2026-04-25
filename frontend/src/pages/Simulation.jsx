import { useState, useEffect, useRef } from 'react';
import { startSimulation, stopSimulation, getSimulationStatus, startStarvation, getQueue } from '../api/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Simulation() {
  const [config, setConfig] = useState({ rate: 3, duration: 60, distribution: { Critical: 0.15, High: 0.25, Medium: 0.35, Low: 0.25 } });
  const [status, setStatus] = useState({ running: false, elapsed_seconds: 0, patients_generated: 0, queue_size: 0 });
  const [chartData, setChartData] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const [sRes, qRes] = await Promise.all([getSimulationStatus(), getQueue()]);
      setStatus(sRes.data);
      setChartData(prev => {
        const pt = { time: Math.round(sRes.data.elapsed_seconds), patients: sRes.data.patients_generated, queue: sRes.data.queue_size };
        if (prev.length > 0 && prev[prev.length - 1].time === pt.time) return prev;
        return [...prev.slice(-60), pt];
      });
      // Find at-risk patients (low/medium waiting long)
      const q = qRes.data.queue || [];
      const now = Date.now() / 1000;
      const risk = q.filter(p => (p.urgency === 'Low' || p.urgency === 'Medium') && (now - p.registration_time) / 60 > 10)
        .map(p => ({ ...p, waitMin: ((now - p.registration_time) / 60).toFixed(1) }));
      setAtRisk(risk);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 2000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleStart = async () => {
    setChartData([]);
    try { await startSimulation(config); } catch {}
  };
  const handleStop = async () => { try { await stopSimulation(); } catch {} };
  const handleStarvation = async () => {
    setChartData([]);
    try { await startStarvation({ rate: config.rate, duration: config.duration }); } catch {}
  };

  const distKeys = ['Critical', 'High', 'Medium', 'Low'];
  const distColors = { Critical: 'var(--color-critical)', High: 'var(--color-high)', Medium: 'var(--color-medium)', Low: 'var(--color-low)' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold"><span style={{ color: 'var(--color-primary-light)' }}>Arrival</span> Simulation</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Poisson-distributed patient arrival simulation</p>
      </div>

      {/* Controls */}
      <div className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Rate (patients/min): {config.rate}</label>
            <input type="range" min="1" max="15" step="0.5" value={config.rate} onChange={e => setConfig({ ...config, rate: parseFloat(e.target.value) })} className="w-full accent-[#6366f1]" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Duration (min): {config.duration}</label>
            <input type="range" min="10" max="300" step="10" value={config.duration} onChange={e => setConfig({ ...config, duration: parseInt(e.target.value) })} className="w-full accent-[#6366f1]" />
          </div>
        </div>

        {/* Distribution sliders */}
        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>Urgency Distribution</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {distKeys.map(k => (
              <div key={k}>
                <label className="text-xs font-semibold" style={{ color: distColors[k] }}>{k}: {(config.distribution[k] * 100).toFixed(0)}%</label>
                <input type="range" min="0" max="100" value={config.distribution[k] * 100}
                  onChange={e => {
                    const val = parseInt(e.target.value) / 100;
                    setConfig(prev => ({ ...prev, distribution: { ...prev.distribution, [k]: val } }));
                  }}
                  className="w-full" style={{ accentColor: distColors[k] }} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={handleStart} disabled={status.running} className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent))', color: 'white', border: 'none' }}>▶ Start Simulation</button>
          <button onClick={handleStop} disabled={!status.running} className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: 'var(--color-critical-bg)', color: 'var(--color-critical)', border: '1px solid rgba(239,68,68,0.3)' }}>⏹ Stop</button>
          <button onClick={handleStarvation} disabled={status.running} className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-high)', border: '1px solid rgba(245,158,11,0.3)' }}>🔥 Starvation Scenario</button>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Status', v: status.running ? '🟢 Running' : '⚪ Stopped', c: status.running ? 'var(--color-low)' : 'var(--color-text-muted)' },
          { l: 'Elapsed', v: `${status.elapsed_seconds.toFixed(0)}s`, c: 'var(--color-accent)' },
          { l: 'Generated', v: status.patients_generated, c: 'var(--color-primary-light)' },
          { l: 'Queue Size', v: status.queue_size, c: 'var(--color-high)' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4">
            <p className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>LIVE ARRIVAL CHART</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'var(--color-text-muted)' }} />
              <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
              <Line type="monotone" dataKey="patients" stroke="var(--color-primary-light)" strokeWidth={2} dot={false} name="Total Patients" />
              <Line type="monotone" dataKey="queue" stroke="var(--color-high)" strokeWidth={2} dot={false} name="Queue Size" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* At-risk patients */}
      {atRisk.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-critical)' }}>⚠️ STARVATION RISK ({atRisk.length} patients)</h3>
          <div className="space-y-2">{atRisk.slice(0, 10).map(p => (
            <div key={p.patient_id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <span className="text-sm font-semibold">{p.name} <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>({p.patient_id})</span></span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-critical)' }}>Waiting {p.waitMin}m</span>
            </div>
          ))}</div>
        </div>
      )}
    </div>
  );
}
