import { useState, useEffect, useRef } from 'react';
import { getQueue, processNext, triggerAging, getLogs, getScheduleStats } from '../api/api';
import QueueTable from '../components/QueueTable';
import StatsBar from '../components/StatsBar';

export default function Dashboard() {
  const [queue, setQueue] = useState([]);
  const [queueSize, setQueueSize] = useState(0);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [qRes, logRes, statRes] = await Promise.all([
        getQueue(),
        getLogs(),
        getScheduleStats(),
      ]);
      setQueue(qRes.data.queue);
      setQueueSize(qRes.data.size);
      setLogs(logRes.data.logs.slice(0, 50));
      if (statRes.data.stats) {
        setStats({
          queueSize: qRes.data.size,
          scheduled: statRes.data.stats.total_scheduled,
          fairness: statRes.data.stats.fairness_index,
          starvation: statRes.data.stats.starvation_count,
        });
      } else {
        setStats({ queueSize: qRes.data.size, scheduled: 0, fairness: null, starvation: 0 });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleProcess = async () => {
    setLoading(true);
    try {
      await processNext();
      await fetchData();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAge = async () => {
    try {
      await triggerAging();
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span style={{ color: 'var(--color-primary-light)' }}>Live</span> Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Real-time queue monitoring &middot; Auto-refreshes every 2s
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleProcess} disabled={loading || queueSize === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: 'white',
              border: 'none',
            }}>
            {loading ? 'Processing...' : '⚡ Process Next'}
          </button>
          <button onClick={handleAge} disabled={queueSize === 0}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}>
            🕐 Age Queue
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Queue Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          Priority Queue ({queueSize} patients)
        </h2>
        <QueueTable patients={queue} />
      </div>

      {/* Activity Log */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          📋 Activity Log
        </h2>
        <div className="glass-card p-4 max-h-72 overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>
              No events yet
            </p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  background: i === 0 ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                  borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
                }}>
                <span className="font-mono text-xs shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  {formatTime(log.time)}
                </span>
                <span className="font-semibold text-xs px-2 py-0.5 rounded shrink-0"
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: 'var(--color-primary-light)',
                  }}>
                  {log.event}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{log.details}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
