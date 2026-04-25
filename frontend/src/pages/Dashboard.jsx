import { useState, useEffect, useRef } from 'react';
import { getQueue, processNext, triggerAging, getLogs, getScheduleStats } from '../api/api';
import QueueTable from '../components/QueueTable';

export default function Dashboard() {
  const [queue, setQueue] = useState([]);
  const [queueSize, setQueueSize] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [qRes, logRes, statRes] = await Promise.all([getQueue(), getLogs(), getScheduleStats()]);
      const queueData = qRes.data.queue;
      setQueue(queueData);
      setQueueSize(qRes.data.size);
      setLogs(logRes.data.logs.slice(0, 50));
      
      const s = statRes.data.stats;
      
      // Calculate live estimates if no schedule stats exist yet
      let liveAvgWait = 0;
      let liveStarvation = 0;
      let liveFairness = 1.0;
      
      if (queueData.length > 0) {
        let totalWait = 0;
        let waitTimes = [];
        queueData.forEach(p => {
          // Estimate wait time (wait_time_bonus grows +5 every 10 min)
          let wait = p.wait_time_bonus ? (p.wait_time_bonus / 5) * 10 : Math.round(p.priority_score / 4);
          totalWait += wait;
          waitTimes.push(wait);
          if (wait > 40) liveStarvation++;
        });
        liveAvgWait = totalWait / queueData.length;
        
        let sumX = 0, sumX2 = 0;
        waitTimes.forEach(x => { let val = x + 1; sumX += val; sumX2 += val * val; });
        liveFairness = (sumX * sumX) / (queueData.length * sumX2);
      }

      setStats({
        queueSize: qRes.data.size,
        avgWait: s ? Object.values(s.avg_wait_by_urgency).reduce((a,b)=>a+b, 0) / Math.max(1, Object.keys(s.avg_wait_by_urgency).length) : liveAvgWait,
        fairness: s ? s.fairness_index : (queueData.length > 0 ? liveFairness : null),
        starvation: s ? s.starvation_count : liveStarvation,
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleProcess = async () => { 
    if (queue.length === 0) return;
    
    // Voice Announcement Logic
    const currentPatient = queue[0];
    const upcomingPatient = queue.length > 1 ? queue[1] : null;
    const roomNo = Math.floor(Math.random() * 5) + 1; // Random room 1-5
    
    let announcement = `Patient ${currentPatient.name}, please go to room number ${roomNo}.`;
    if (upcomingPatient) {
      announcement += ` Patient ${upcomingPatient.name}, please be ready.`;
    }
    
    const utterance = new SpeechSynthesisUtterance(announcement);
    const speak = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.82;
      utterance.pitch = 1.1;
      
      const voices = window.speechSynthesis.getVoices();
      // Prioritize en-IN or hi-IN voices
      const indianVoice = voices.find(v => v.lang === 'en-IN' || v.lang === 'hi-IN' || v.name.includes('India') || v.name.includes('Rishi') || v.name.includes('Heera'));
      
      if (indianVoice) utterance.voice = indianVoice;
      window.speechSynthesis.speak(utterance);
    };

    speak(announcement);

    setLoading(true); 
    try { 
      await processNext(); 
      await fetchData(); 
    } catch {} 
    setLoading(false); 
  };
  const handleAge = async () => { try { await triggerAging(); await fetchData(); } catch {} };
  const formatTime = (ts) => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

  const eventMeta = {
    REGISTERED: { icon: 'person_add', color: '#0058bc', label: 'New Entry' },
    SCHEDULED: { icon: 'check_circle', color: '#16a34a', label: 'Patient Processed' },
    AGING: { icon: 'trending_up', color: '#d97706', label: 'Priority Escalation' },
    PROCESSED: { icon: 'task_alt', color: '#16a34a', label: 'Patient Processed' },
    SIM_START: { icon: 'play_circle', color: '#0d9488', label: 'Simulation Started' },
    SIM_STOP: { icon: 'stop_circle', color: '#dc2626', label: 'Simulation Stopped' },
    ARRIVAL: { icon: 'login', color: '#0058bc', label: 'New Entry' },
  };

  const nextPatient = queue.length > 0 ? queue[0] : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL IN QUEUE', value: stats.queueSize ?? 0, color: '#0058bc', trend: null },
          { label: 'AVG WAIT TIME', value: stats.avgWait != null ? `${Math.round(stats.avgWait)}m` : '—', color: 'var(--color-text)', trend: null },
          { label: 'FAIRNESS INDEX', value: stats.fairness != null ? stats.fairness.toFixed(2) : '—', color: 'var(--color-text)', bar: true, barVal: stats.fairness },
          { label: 'STARVATION COUNT', value: stats.starvation != null ? String(stats.starvation).padStart(2, '0') : '00', color: 'var(--color-text)', alert: stats.starvation > 0 },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</span>
              {s.bar && s.barVal != null && (
                <div style={{ width: '60px', height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                  <div style={{ width: `${s.barVal * 100}%`, height: '100%', borderRadius: '3px', background: '#0058bc', transition: 'width 0.5s ease' }} />
                </div>
              )}
              {s.alert && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', padding: '2px 8px', borderRadius: '4px', background: 'rgba(220,38,38,0.08)' }}>CRITICAL</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content — Two Column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left — Queue Table */}
        <div>
          <QueueTable patients={queue} />
        </div>

        {/* Right — Process Card + Activity Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Process Next Patient Card */}
          <button
            onClick={handleProcess}
            disabled={loading || queueSize === 0}
            style={{
              width: '100%', padding: '28px 20px', borderRadius: '12px',
              background: queueSize > 0 ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'var(--color-bg)',
              color: queueSize > 0 ? 'white' : 'var(--color-text-muted)',
              border: queueSize > 0 ? 'none' : '1px solid var(--color-border)',
              cursor: queueSize > 0 ? 'pointer' : 'not-allowed',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxShadow: queueSize > 0 ? '0 4px 20px rgba(220,38,38,0.3)' : 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '32px', display: 'block', marginBottom: '8px',
              opacity: queueSize > 0 ? 1 : 0.4,
            }}>add_box</span>
            <div style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {loading ? 'Processing...' : 'Process Next Patient'}
            </div>
            {nextPatient && (
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px' }}>
                Next: {nextPatient.name} ({nextPatient.patient_id})
              </div>
            )}
          </button>

          {/* Age Queue Button */}
          <button onClick={handleAge} disabled={queueSize === 0} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
            Trigger Aging
          </button>

          {/* Activity Log */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>history</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>Live Activity Log</span>
              {logs.length > 0 && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0058bc', marginLeft: 'auto' }} />
              )}
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                  No events yet
                </div>
              ) : (
                logs.slice(0, 15).map((log, i) => {
                  const ev = eventMeta[log.event] || { icon: 'info', color: '#74777f', label: log.event };
                  return (
                    <div key={i} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
                      display: 'flex', gap: '10px',
                    }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: `${ev.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '2px',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: ev.color }}>{ev.icon}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '2px' }}>{ev.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{log.details}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {formatTime(log.time)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {logs.length > 0 && (
              <div style={{
                padding: '10px 16px', borderTop: '1px solid var(--color-border)',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0058bc', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  View Full Audit Log
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
