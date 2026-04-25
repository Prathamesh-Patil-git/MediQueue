import { useState } from 'react';
import { runComparison } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FairnessGauge from '../components/FairnessGauge';

export default function Comparison() {
  const [config, setConfig] = useState({ patient_count: 30, rate: 3, distribution: { Critical: 0.15, High: 0.25, Medium: 0.35, Low: 0.25 } });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await runComparison(config);
      setResult(res.data);
    } catch {}
    setLoading(false);
  };

  // Build chart data from avg_wait_by_urgency
  const chartData = result ? ['Critical', 'High', 'Medium', 'Low']
    .filter(u => result.strategy_a.avg_wait_by_urgency[u] != null || result.strategy_b.avg_wait_by_urgency[u] != null)
    .map(u => ({
      urgency: u,
      'Strategy A': result.strategy_a.avg_wait_by_urgency[u] || 0,
      'Strategy B': result.strategy_b.avg_wait_by_urgency[u] || 0,
    })) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold"><span style={{ color: 'var(--color-primary-light)' }}>Strategy</span> Comparison</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Pure Urgency (A) vs Aging-Based (B) on identical patient sets</p>
      </div>

      <div className="glass-card p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Patients: {config.patient_count}</label>
            <input type="range" min="10" max="100" step="5" value={config.patient_count} onChange={e => setConfig({ ...config, patient_count: parseInt(e.target.value) })} className="w-full accent-[#6366f1]" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>Rate: {config.rate}/min</label>
            <input type="range" min="1" max="10" step="0.5" value={config.rate} onChange={e => setConfig({ ...config, rate: parseFloat(e.target.value) })} className="w-full accent-[#6366f1]" />
          </div>
        </div>
        <button onClick={handleRun} disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-accent))', color: 'white', border: 'none' }}>
          {loading ? 'Comparing...' : '⚖️ Run Comparison'}
        </button>
      </div>

      {result && (
        <>
          {/* Winner Banner */}
          <div className="glass-card p-5 text-center" style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>WINNER</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-low)' }}>🏆 {result.winner}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>{result.explanation}</p>
          </div>

          {/* Side-by-side metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { key: 'strategy_a', label: 'Strategy A — Pure Urgency', desc: 'No aging bonus, strict urgency order', color: 'var(--color-high)' },
              { key: 'strategy_b', label: 'Strategy B — Aging-Based', desc: '+5 bonus per 10min wait', color: 'var(--color-accent)' },
            ].map(s => {
              const d = result[s.key];
              return (
                <div key={s.key} className="glass-card p-6">
                  <h3 className="text-lg font-bold mb-1" style={{ color: s.color }}>{s.label}</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{s.desc}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{d.total_scheduled}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Scheduled</p></div>
                    <div><p className="text-xl font-bold" style={{ color: d.max_wait_time > 45 ? 'var(--color-critical)' : 'var(--color-low)' }}>{d.max_wait_time.toFixed(1)}m</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Max Wait</p></div>
                    <div><p className="text-xl font-bold" style={{ color: d.starvation_count > 0 ? 'var(--color-critical)' : 'var(--color-low)' }}>{d.starvation_count}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Starvation</p></div>
                    <div><p className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>{d.throughput}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Patients/hr</p></div>
                  </div>
                  <div className="flex justify-center"><FairnessGauge value={d.fairness_index} label={`${s.key === 'strategy_a' ? 'A' : 'B'} Fairness`} /></div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart */}
          {chartData.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>AVG WAIT TIME COMPARISON</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="urgency" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 11 }} label={{ value: 'Wait (min)', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                  <Legend />
                  <Bar dataKey="Strategy A" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Strategy B" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
