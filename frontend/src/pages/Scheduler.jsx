import { useState } from 'react';
import { runSchedule, getSchedule } from '../api/api';
import UrgencyBadge from '../components/UrgencyBadge';
import FairnessGauge from '../components/FairnessGauge';

export default function Scheduler() {
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRun = async () => {
    setError(''); setLoading(true);
    try {
      const res = await runSchedule();
      setSchedule(res.data.scheduled);
      setStats(res.data.stats);
    } catch (err) { setError(err.response?.data?.detail || 'Failed'); }
    setLoading(false);
  };

  const handleLoad = async () => {
    try { const res = await getSchedule(); setSchedule(res.data.schedule); } catch {}
  };

  const fmt = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  const wc = (w) => w > 45 ? 'var(--color-critical)' : w > 20 ? 'var(--color-high)' : 'var(--color-low)';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold"><span style={{color:'var(--color-primary-light)'}}>Greedy</span> Scheduler</h1>
          <p className="text-sm mt-1" style={{color:'var(--color-text-muted)'}}>Assigns 15-min slots using greedy algorithm</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRun} disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-50" style={{background:'linear-gradient(135deg,var(--color-primary),var(--color-accent))',color:'white',border:'none'}}>{loading ? 'Scheduling...' : '🚀 Run Schedule'}</button>
          <button onClick={handleLoad} className="px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer" style={{background:'var(--color-bg-tertiary)',color:'var(--color-text)',border:'1px solid var(--color-border)'}}>📥 Load Existing</button>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg text-sm" style={{background:'var(--color-critical-bg)',color:'var(--color-critical)'}}>⚠️ {error}</div>}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-sm font-semibold mb-4" style={{color:'var(--color-text-muted)'}}>METRICS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><p className="text-2xl font-bold" style={{color:'var(--color-primary-light)'}}>{stats.total_scheduled}</p><p className="text-xs" style={{color:'var(--color-text-muted)'}}>Scheduled</p></div>
              <div><p className="text-2xl font-bold" style={{color:wc(stats.max_wait_time)}}>{stats.max_wait_time.toFixed(1)}m</p><p className="text-xs" style={{color:'var(--color-text-muted)'}}>Max Wait</p></div>
              <div><p className="text-2xl font-bold" style={{color:stats.starvation_count>0?'var(--color-critical)':'var(--color-low)'}}>{stats.starvation_count}</p><p className="text-xs" style={{color:'var(--color-text-muted)'}}>Starvation</p></div>
              <div><p className="text-2xl font-bold" style={{color:'var(--color-accent)'}}>{stats.throughput}</p><p className="text-xs" style={{color:'var(--color-text-muted)'}}>Patients/hr</p></div>
            </div>
            {stats.avg_wait_by_urgency && Object.keys(stats.avg_wait_by_urgency).length > 0 && (
              <div className="mt-5 pt-4" style={{borderTop:'1px solid var(--color-border)'}}>
                <p className="text-xs font-semibold mb-3" style={{color:'var(--color-text-muted)'}}>AVG WAIT BY URGENCY</p>
                <div className="flex flex-wrap gap-4">{Object.entries(stats.avg_wait_by_urgency).map(([u,a])=>(<div key={u} className="flex items-center gap-2"><UrgencyBadge urgency={u}/><span className="text-sm font-bold" style={{color:wc(a)}}>{a.toFixed(1)}m</span></div>))}</div>
              </div>
            )}
          </div>
          <div className="glass-card p-6 flex items-center justify-center"><FairnessGauge value={stats.fairness_index}/></div>
        </div>
      )}

      {schedule.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{color:'var(--color-text-secondary)'}}>📅 Schedule ({schedule.length})</h2>
          <div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
            <thead><tr style={{background:'rgba(99,102,241,0.08)',borderBottom:'1px solid var(--color-border)'}}>
              {['#','Time','Patient','ID','Urgency','Score','Wait'].map(h=>(<th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase" style={{color:'var(--color-text-muted)'}}>{h}</th>))}
            </tr></thead>
            <tbody>{schedule.map((a,i)=>(<tr key={a.appointment_id||i} style={{borderBottom:'1px solid var(--color-border)'}} className="transition-colors hover:bg-[var(--color-surface-hover)]">
              <td className="px-4 py-3 text-sm font-mono" style={{color:'var(--color-text-muted)'}}>{i+1}</td>
              <td className="px-4 py-3 text-sm font-mono font-bold" style={{color:'var(--color-accent)'}}>{fmt(a.start_time)}-{fmt(a.end_time)}</td>
              <td className="px-4 py-3 text-sm font-semibold">{a.patient_name}</td>
              <td className="px-4 py-3 text-xs font-mono" style={{color:'var(--color-text-muted)'}}>{a.patient_id}</td>
              <td className="px-4 py-3"><UrgencyBadge urgency={a.urgency}/></td>
              <td className="px-4 py-3 text-sm font-bold" style={{color:'var(--color-primary-light)'}}>{a.priority_score}</td>
              <td className="px-4 py-3 text-sm font-bold" style={{color:wc(a.wait_time)}}>{a.wait_time.toFixed(1)}m</td>
            </tr>))}</tbody>
          </table></div></div>
        </div>
      )}
    </div>
  );
}
