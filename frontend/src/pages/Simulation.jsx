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
      const now = Date.now() / 1000;
      const risk = (qRes.data.queue || []).filter(p => (p.urgency === 'Low' || p.urgency === 'Medium') && (now - p.registration_time) / 60 > 10)
        .map(p => ({ ...p, waitMin: ((now - p.registration_time) / 60).toFixed(1) }));
      setAtRisk(risk);
    } catch {}
  };

  useEffect(() => { fetchStatus(); pollRef.current = setInterval(fetchStatus, 2000); return () => clearInterval(pollRef.current); }, []);

  const handleStart = async () => { setChartData([]); try { await startSimulation(config); } catch {} };
  const handleStop = async () => { try { await stopSimulation(); } catch {} };
  const handleStarvation = async () => { setChartData([]); try { await startStarvation({ rate: config.rate, duration: config.duration }); } catch {} };

  const dKeys = ['Critical', 'High', 'Medium', 'Low'];
  const dLabels = { Critical: 'Critical', High: 'High Urgency', Medium: 'Medium', Low: 'Low/Minor' };
  const dRaw = { Critical: '#dc2626', High: '#d97706', Medium: '#2563eb', Low: '#74777f' };
  const total = Object.values(config.distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Row — Controls + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left — Flow Parameters + Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Flow Parameters */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0058bc' }}>tune</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Flow Parameters</span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Arrival Rate</label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0058bc' }}>{config.rate} pts/min</span>
              </div>
              <input type="range" min="1" max="15" step="0.5" value={config.rate}
                onChange={e => setConfig({ ...config, rate: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#0058bc' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>1 p/m</span><span>10 p/m</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Simulation Duration</label>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0058bc' }}>{config.duration} min</span>
              </div>
              <input type="range" min="10" max="300" step="10" value={config.duration}
                onChange={e => setConfig({ ...config, duration: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: '#0058bc' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                <span>10m</span><span>120m</span>
              </div>
            </div>
          </div>

          {/* Acuity Distribution */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0058bc' }}>dashboard_customize</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Acuity Distribution</span>
            </div>
            {dKeys.map(k => (
              <div key={k} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dRaw[k] }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{dLabels[k]}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-muted)' }}>{(config.distribution[k] * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0" max="100" value={config.distribution[k] * 100}
                  onChange={e => setConfig(prev => ({ ...prev, distribution: { ...prev.distribution, [k]: parseInt(e.target.value) / 100 } }))}
                  style={{ width: '100%', accentColor: dRaw[k] }} />
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Total Distribution</span>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                background: Math.abs(total - 1) < 0.05 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                color: Math.abs(total - 1) < 0.05 ? '#16a34a' : '#dc2626',
              }}>
                {(total * 100).toFixed(0)}% {Math.abs(total - 1) < 0.05 ? 'Balanced' : 'Unbalanced'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleStart} disabled={status.running} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_arrow</span> Start Sim
              </button>
              <button onClick={handleStop} disabled={!status.running} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>stop</span> Stop Sim
              </button>
            </div>
            <button onClick={handleStarvation} disabled={status.running}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                cursor: status.running ? 'not-allowed' : 'pointer', border: 'none',
                background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: status.running ? 0.4 : 1, textTransform: 'uppercase', letterSpacing: '0.04em',
                fontFamily: 'var(--font-sans)',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>local_fire_department</span>
              Starvation Scenario
            </button>
          </div>
        </div>

        {/* Right — Chart */}
        <div className="card" style={{ padding: '24px', minHeight: '400px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>Arrival Velocity</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Real-time projection of patient influx vs resource capacity</p>
          </div>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                <XAxis dataKey="time" stroke="#74777f" tick={{ fontSize: 11 }} />
                <YAxis stroke="#74777f" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 8, fontSize: '13px' }} />
                <Line type="monotone" dataKey="patients" stroke="#0058bc" strokeWidth={2.5} dot={false} name="Arrivals" />
                <Line type="monotone" dataKey="queue" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Capacity Cap" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <div style={{ textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', display: 'block', marginBottom: '8px', opacity: 0.3 }}>show_chart</span>
                Start simulation to view arrival data
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Est. Waiting Time</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)' }}>{status.elapsed_seconds > 0 ? Math.round(status.elapsed_seconds / 60) : '—'}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>mins</span>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Arrivals</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)' }}>{status.patients_generated}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>patients</span>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Resource Pressure</div>
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--color-border)', marginTop: '12px', marginBottom: '6px' }}>
            <div style={{
              width: `${Math.min(100, status.queue_size * 5)}%`, height: '100%', borderRadius: '4px',
              background: status.queue_size > 15 ? '#dc2626' : status.queue_size > 8 ? '#d97706' : '#0058bc',
              transition: 'all 0.5s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{Math.min(100, status.queue_size * 5)}% Utilized</span>
            <span style={{ fontWeight: 700, color: status.queue_size > 15 ? '#dc2626' : status.queue_size > 8 ? '#d97706' : '#16a34a' }}>
              {status.queue_size > 15 ? 'CRITICAL' : status.queue_size > 8 ? 'WARNING' : 'NORMAL'}
            </span>
          </div>
        </div>
      </div>

      {/* System Event Log */}
      {atRisk.length > 0 && (
        <div style={{
          borderRadius: '12px', overflow: 'hidden',
          background: 'linear-gradient(135deg, #001F3F, #0a2d5e)',
          padding: '24px', color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#adc6ff' }}>terminal</span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>System Event Log</span>
          </div>
          {atRisk.slice(0, 5).map((p, i) => (
            <div key={p.patient_id} style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '4px 0',
              opacity: 0.7, display: 'flex', gap: '12px',
            }}>
              <span style={{ color: '#dc2626' }}>[ALERT]</span>
              <span>{p.name} ({p.patient_id}) — waiting {p.waitMin}m — starvation risk</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
