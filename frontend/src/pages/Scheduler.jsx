import { useState } from 'react';
import { runSchedule, getSchedule } from '../api/api';
import UrgencyBadge from '../components/UrgencyBadge';
import FairnessGauge from '../components/FairnessGauge';

export default function Scheduler() {
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => { setError(''); setLoading(true); try { const res = await runSchedule(); setSchedule(res.data.scheduled); setStats(res.data.stats); } catch (err) { setError(err.response?.data?.detail || 'Failed'); } setLoading(false); };
  const handleLoad = async () => { try { const res = await getSchedule(); setSchedule(res.data.schedule); } catch {} };
  const fmt = (m) => {
    const h = Math.floor(m / 60);
    const mi = m % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2,'0')}:${String(mi).padStart(2,'0')} ${ampm}`;
  };
  const wc = (w) => w > 45 ? '#dc2626' : w > 20 ? '#d97706' : '#16a34a';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>Dynamic Patient Allocation</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Optimize treatment sequences based on real-time triage urgency and staff availability.
          </p>
        </div>
        <button onClick={handleRun} disabled={loading} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
          {loading ? 'Scheduling...' : 'Run Greedy Scheduler'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'rgba(220,38,38,0.06)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>{error}
        </div>
      )}

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'PENDING SLOTS', value: stats.total_scheduled, color: '#0058bc', trend: null },
            { label: 'AVG. WAIT TIME', value: `${Math.round(stats.max_wait_time * 0.6)}m`, color: 'var(--color-text)' },
            { label: 'RESOURCE LOAD', value: `${Math.min(99, Math.round(stats.throughput * 8))}%`, color: 'var(--color-text)', bar: true, barVal: Math.min(1, stats.throughput * 0.08) },
            { label: 'URGENT PRIORITY', value: String(stats.starvation_count).padStart(2, '0'), color: 'var(--color-text)', alert: stats.starvation_count > 0 },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</span>
                {s.bar && (
                  <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ width: `${(s.barVal || 0) * 100}%`, height: '100%', borderRadius: '3px', background: '#0058bc', transition: 'width 0.5s' }} />
                  </div>
                )}
                {s.alert && <span style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', padding: '2px 8px', borderRadius: '4px', background: 'rgba(217,119,6,0.08)' }}>URGENCY</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>list_alt</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>Daily Treatment Sequence</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>filter_list</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>download</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="table-header">
                  {['Slot No', 'Patient Name', 'Urgency', 'Start Time', 'End Time', 'Wait Time', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((a, i) => (
                  <tr key={a.appointment_id || i} className="table-row">
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>SN-{i + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{a.patient_name}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>ID: {a.patient_id}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}><UrgencyBadge urgency={a.urgency} /></td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text)' }}>{fmt(a.start_time)}</td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text)' }}>{fmt(a.end_time)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: wc(a.wait_time) }}>
                        {a.wait_time > 0 ? '+' : ''} {a.wait_time.toFixed(0)}m
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)', cursor: 'pointer' }}>more_vert</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Showing {schedule.length} scheduled slots
          </div>
        </div>
      )}

      {/* Bottom: Algorithm Insights + Fairness */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Conflicts / Warnings */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#d97706' }}>warning</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>Scheduling Conflicts Detected</span>
            </div>
            {stats.starvation_count > 0 ? (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.1)' }}>
                  <div style={{ width: '4px', height: '100%', minHeight: '40px', borderRadius: '2px', background: '#dc2626', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>Starvation Alert</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{stats.starvation_count} patients at risk of excessive wait times</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', display: 'block', marginBottom: '4px', color: '#16a34a' }}>check_circle</span>
                No scheduling conflicts
              </div>
            )}
          </div>

          {/* Algorithm Insights */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            background: 'linear-gradient(135deg, #001F3F, #0a2d5e)',
            color: 'white', padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#adc6ff' }}>insights</span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Algorithm Insights</span>
            </div>
            <p style={{ fontSize: '13px', opacity: 0.7, lineHeight: 1.6, marginBottom: '16px' }}>
              Greedy scheduler v2.1 optimization logic: urgency priority → Time-to-Triage over Resource Idle.
            </p>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', opacity: 0.5, marginBottom: '6px' }}>OPTIMIZATION EFFICIENCY</div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.15)', marginBottom: '16px' }}>
              <div style={{ width: `${Math.min(100, Math.round(stats.fairness_index * 100))}%`, height: '100%', borderRadius: '3px', background: '#16a34a' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, fontWeight: 600 }}>Fairness Index</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.fairness_index?.toFixed(2) || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', opacity: 0.5, fontWeight: 600 }}>Throughput</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{stats.throughput} pts/hr</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load existing */}
      {!stats && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button onClick={handleLoad} className="btn-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
            Load Existing Schedule
          </button>
        </div>
      )}
    </div>
  );
}
