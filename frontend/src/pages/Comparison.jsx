import { useState } from 'react';
import { runComparison } from '../api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Comparison() {
  const [config, setConfig] = useState({ patient_count: 30, rate: 3, distribution: { Critical: 0.15, High: 0.25, Medium: 0.35, Low: 0.25 } });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => { setLoading(true); try { const res = await runComparison(config); setResult(res.data); } catch {} setLoading(false); };

  const chartData = result ? ['Critical', 'High', 'Medium', 'Low']
    .filter(u => result.strategy_a.avg_wait_by_urgency[u] != null || result.strategy_b.avg_wait_by_urgency[u] != null)
    .map(u => ({ urgency: u, 'Strategy A': result.strategy_a.avg_wait_by_urgency[u] || 0, 'Strategy B': result.strategy_b.avg_wait_by_urgency[u] || 0 })) : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>Strategy Comparison Analysis</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', maxWidth: '600px' }}>
          Benchmarking clinical queuing algorithms: Comparing pure urgency-based triage against aging-weighted fairness models for emergency department throughput optimization.
        </p>
      </div>

      {/* Config */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Patients: <span style={{ color: '#0058bc', fontWeight: 700 }}>{config.patient_count}</span>
            </label>
            <input type="range" min="10" max="100" step="5" value={config.patient_count}
              onChange={e => setConfig({ ...config, patient_count: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#0058bc' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Rate: <span style={{ color: '#0058bc', fontWeight: 700 }}>{config.rate}/min</span>
            </label>
            <input type="range" min="1" max="10" step="0.5" value={config.rate}
              onChange={e => setConfig({ ...config, rate: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: '#0058bc' }} />
          </div>
          <button onClick={handleRun} disabled={loading} className="btn-primary" style={{ height: '42px' }}>
            {loading ? 'Running...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Side-by-Side Strategy Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Strategy A — Baseline */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'rgba(217,119,6,0.1)', color: '#d97706', letterSpacing: '0.04em' }}>BASELINE STRATEGY</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#d97706' }}>priority_high</span>
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2px' }}>Strategy A (Pure Urgency)</div>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Starvation Count</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0058bc' }}>{result.strategy_a.starvation_count}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Patients / 24h</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Fairness Index</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#0058bc' }}>{result.strategy_a.fairness_index.toFixed(2)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Jain's Score</div>
                </div>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Wait Per Urgency (Mins)</div>
                {['Critical', 'High', 'Medium', 'Low'].map(u => {
                  const val = result.strategy_a.avg_wait_by_urgency[u] || 0;
                  const max = result.strategy_a.max_wait_time || 1;
                  return (
                    <div key={u} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Level {u === 'Critical' ? '1 (Critical)' : u === 'High' ? '2 (Urgent)' : u === 'Medium' ? '3 (Standard)' : '5 (Non-Urgent)'}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{val.toFixed(0)}m</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--color-border)' }}>
                        <div style={{ width: `${(val / max) * 100}%`, height: '100%', borderRadius: '3px', background: '#0058bc' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Overall Throughput</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{result.strategy_a.throughput} pts/hr</span>
                </div>
              </div>
            </div>

            {/* Strategy B — Optimized */}
            <div className="card" style={{ overflow: 'hidden', border: '2px solid #0058bc' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: 'rgba(0,88,188,0.1)', color: '#0058bc', letterSpacing: '0.04em' }}>OPTIMIZED STRATEGY</span>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', background: '#16a34a', color: 'white' }}>RECOMMENDED</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16a34a', marginLeft: 'auto' }}>check_circle</span>
              </div>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Strategy B (Aging-Based)</div>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Starvation Count</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{result.strategy_b.starvation_count}</div>
                  {result.strategy_b.starvation_count < result.strategy_a.starvation_count && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                      ↓ {Math.round((1 - result.strategy_b.starvation_count / Math.max(1, result.strategy_a.starvation_count)) * 100)}%
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Fairness Index</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{result.strategy_b.fairness_index.toFixed(2)}</div>
                  {result.strategy_b.fairness_index > result.strategy_a.fairness_index && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a' }}>
                      ↑ +{((result.strategy_b.fairness_index - result.strategy_a.fairness_index) / result.strategy_a.fairness_index * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg Wait Per Urgency (Mins)</div>
                {['Critical', 'High', 'Medium', 'Low'].map(u => {
                  const val = result.strategy_b.avg_wait_by_urgency[u] || 0;
                  const max = result.strategy_b.max_wait_time || 1;
                  return (
                    <div key={u} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Level {u === 'Critical' ? '1 (Critical)' : u === 'High' ? '2 (Urgent)' : u === 'Medium' ? '3 (Standard)' : '5 (Non-Urgent)'}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{val.toFixed(0)}m</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--color-border)' }}>
                        <div style={{ width: `${(val / max) * 100}%`, height: '100%', borderRadius: '3px', background: '#16a34a' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Overall Throughput</span>
                  <span style={{ fontWeight: 700, color: '#16a34a' }}>{result.strategy_b.throughput} pts/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>Throughput Distribution Analysis</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Normalized patient processing volume comparison</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                  <XAxis dataKey="urgency" stroke="#74777f" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#74777f" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="Strategy A" fill="#001F3F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Strategy B" fill="#0058bc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bottom: Recommendation + Performance Delta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Clinical Recommendation */}
            <div style={{
              borderRadius: '12px', overflow: 'hidden',
              background: 'linear-gradient(135deg, #001F3F, #0a2d5e)',
              padding: '24px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#adc6ff' }}>psychology</span>
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Clinical Recommendation</span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.7, opacity: 0.8, marginBottom: '20px' }}>
                {result.explanation}
              </p>
              <button style={{
                padding: '12px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                background: '#0058bc', color: 'white', border: 'none', cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'var(--font-sans)',
              }}>
                Deploy {result.winner}
              </button>
            </div>

            {/* Performance Delta Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Detailed Performance Delta</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="table-header">
                    {['Metric', 'Strategy A', 'Strategy B', 'Delta'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'Max Wait', a: `${result.strategy_a.max_wait_time.toFixed(1)}m`, b: `${result.strategy_b.max_wait_time.toFixed(1)}m`, d: result.strategy_b.max_wait_time - result.strategy_a.max_wait_time },
                    { m: 'Starvation', a: result.strategy_a.starvation_count, b: result.strategy_b.starvation_count, d: result.strategy_b.starvation_count - result.strategy_a.starvation_count },
                    { m: 'Fairness', a: result.strategy_a.fairness_index.toFixed(2), b: result.strategy_b.fairness_index.toFixed(2), d: ((result.strategy_b.fairness_index - result.strategy_a.fairness_index) / result.strategy_a.fairness_index * 100) },
                    { m: 'Throughput', a: `${result.strategy_a.throughput}`, b: `${result.strategy_b.throughput}`, d: ((result.strategy_b.throughput - result.strategy_a.throughput) / Math.max(1, result.strategy_a.throughput) * 100) },
                  ].map((r, i) => (
                    <tr key={i} className="table-row">
                      <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>{r.m}</td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{r.a}</td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{r.b}</td>
                      <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: 700, color: r.d <= 0 ? '#16a34a' : '#dc2626' }}>
                        {r.d > 0 ? '+' : ''}{typeof r.d === 'number' ? (Math.abs(r.d) < 10 ? r.d.toFixed(1) : `${r.d.toFixed(1)}%`) : r.d}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
