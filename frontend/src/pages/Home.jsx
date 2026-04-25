import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const features = [
  { icon: 'monitor_heart', title: 'Smart Triage', desc: 'Automatically prioritize patients based on urgency, age, and wait time — ensuring the most critical cases are seen first.' },
  { icon: 'calendar_month', title: 'Intelligent Scheduling', desc: 'Allocate appointment slots dynamically so your team spends less time planning and more time treating.' },
  { icon: 'speed', title: 'Live Monitoring', desc: 'See your entire emergency department at a glance with real-time queue updates every 2 seconds.' },
  { icon: 'shield', title: 'Fairness Engine', desc: 'Built-in safeguards prevent any patient from waiting too long, regardless of their initial urgency level.' },
  { icon: 'analytics', title: 'Performance Insights', desc: 'Compare scheduling strategies side-by-side and make data-driven decisions to reduce bottlenecks.' },
  { icon: 'sim_card_download', title: 'Stress Testing', desc: 'Simulate patient surges before they happen — prepare your staff for peak hours and mass-casualty events.' },
];

const tiers = [
  { label: 'Immediate', color: '#dc2626', desc: 'Life-threatening conditions requiring instant attention' },
  { label: 'Urgent', color: '#d97706', desc: 'Serious conditions needing care within minutes' },
  { label: 'Standard', color: '#2563eb', desc: 'Stable patients who can wait with monitoring' },
  { label: 'Routine', color: '#16a34a', desc: 'Minor issues suitable for scheduled treatment' },
];

const steps = [
  { num: '01', title: 'Patient Arrives', desc: 'Front desk registers the patient with symptoms, age, and urgency level.', icon: 'person_add' },
  { num: '02', title: 'Priority Assigned', desc: 'Our engine calculates a composite score instantly — no manual guessing.', icon: 'calculate' },
  { num: '03', title: 'Queue Updated', desc: 'The live dashboard reorders every patient in real-time so staff always see who\'s next.', icon: 'reorder' },
  { num: '04', title: 'Treatment Begins', desc: 'One click processes the next patient, logs the event, and updates all metrics.', icon: 'check_circle' },
];

/* Intersection Observer animation hook */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el); } }, { threshold: 0.15 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useReveal();
  return <div ref={ref} className="reveal-section" style={{ ...style, transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Home() {
  return (
    <div style={{ background: '#f1f3f5', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ═══ Navbar ═══ */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)', padding: '0 5%',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        height: '76px', position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', justifySelf: 'start' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0058bc, #0070eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,88,188,0.3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'white' }}>local_hospital</span>
          </div>
          <span style={{ color: '#001F3F', fontWeight: 900, fontSize: '20px', letterSpacing: '0.08em' }} className="hide-mobile">MEDIQUEUE</span>
        </div>

        {/* Center: Links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '40px', justifySelf: 'center' }}>
          {[
            { id: 'home', label: 'Home' },
            { id: 'features', label: 'Features' },
            { id: 'how-it-works', label: 'How It Works' },
            { id: 'triage', label: 'Triage' }
          ].map(link => (
            <a key={link.id} href={`#${link.id}`} style={{
              color: 'rgba(0, 31, 63, 0.65)', fontSize: '15px', fontWeight: 700, textDecoration: 'none',
              transition: 'color 0.2s, transform 0.2s', display: 'inline-block'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0058bc'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0, 31, 63, 0.65)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Login */}
        <div style={{ justifySelf: 'end' }}>
          <Link to="/login" style={{
            padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
            color: 'white', background: 'linear-gradient(135deg, #0058bc, #0070eb)', textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,112,235,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,112,235,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,112,235,0.3)'; }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>login</span> <span className="hide-mobile">Staff Login</span>
          </Link>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section id="home" style={{ background: 'var(--sidebar-bg)', padding: '80px 40px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'absolute', right: '-120px', top: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,88,188,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-80px', bottom: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,112,235,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="responsive-grid" style={{ gap: '48px', alignItems: 'center' }}>
            <div>
              <div className="animate-slide-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', marginBottom: '20px', background: 'rgba(0,88,188,0.15)', border: '1px solid rgba(0,88,188,0.2)' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#adc6ff', letterSpacing: '0.04em' }}>NOW AVAILABLE FOR HOSPITALS</span>
              </div>
              <h1 className="animate-slide-up animate-delay-100" style={{ color: 'white', fontSize: '52px', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: '20px' }}>
                Smarter Emergency<br /><span style={{ color: '#adc6ff' }}>Patient Care</span>
              </h1>
              <p className="animate-slide-up animate-delay-200" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px', lineHeight: 1.7, marginBottom: '36px', maxWidth: '480px' }}>
                The all-in-one platform that helps hospitals reduce wait times, prevent patient neglect, and optimize every minute in the emergency department.
              </p>
              <div className="animate-slide-up animate-delay-300" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <Link to="/login" style={{ padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: 'white', color: '#001F3F', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'; }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span> Get Started
                </Link>
                <a href="#how-it-works" style={{ padding: '14px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>play_circle</span> See How It Works
                </a>
              </div>
              {/* Credential hint */}
              <div className="animate-slide-up animate-delay-400" style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)', animation: 'shimmer 3s infinite linear' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#adc6ff' }}>key</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>DEMO LOGIN</span>
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: 1.8, color: 'rgba(255,255,255,0.4)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', display: 'inline-block', width: '80px' }}>Hospital:</span><span style={{ color: 'rgba(255,255,255,0.65)' }}>HOSP-001-01</span><br/>
                  <span style={{ color: 'rgba(255,255,255,0.25)', display: 'inline-block', width: '80px' }}>Email:</span><span style={{ color: 'rgba(255,255,255,0.65)' }}>doctor@mediqueue.org</span><br/>
                  <span style={{ color: 'rgba(255,255,255,0.25)', display: 'inline-block', width: '80px' }}>Password:</span><span style={{ color: 'rgba(255,255,255,0.65)' }}>admin@123</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="animate-slide-right animate-delay-200" style={{ animation: 'float 6s ease-in-out infinite, slide-in-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -10, background: 'rgba(0,112,235,0.2)', filter: 'blur(30px)', borderRadius: '50%', animation: 'glow-pulse 4s infinite' }} />
                <img src="/hero-dashboard.png" alt="MediQueue Dashboard Preview" style={{ position: 'relative', width: '100%', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <svg viewBox="0 0 1440 80" style={{ display: 'block', marginTop: '60px' }} preserveAspectRatio="none">
          <path fill="#f1f3f5" d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      {/* ═══ Trusted Stats ═══ */}
      <Reveal>
        <section style={{ padding: '40px 5% 60px' }}>
          <div className="stats-grid" style={{ maxWidth: '1000px', margin: '0 auto', gap: '32px', textAlign: 'center' }}>
            {[
              { val: '85%', label: 'Faster Triage' },
              { val: '99.8%', label: 'System Uptime' },
              { val: '3x', label: 'Staff Efficiency' },
              { val: '0', label: 'Patients Neglected' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#0058bc', letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ═══ Features ═══ */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 40px 80px' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0058bc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>What We Offer</span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text)', marginTop: '8px', letterSpacing: '-0.02em' }}>Everything Your ED Needs</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}>One platform to manage patient flow from arrival to treatment.</p>
          </div>
        </Reveal>
        <div className="features-grid" style={{ gap: '20px' }}>
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card" style={{ padding: '28px', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'default', height: '100%' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #0058bc, #0070eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" style={{ background: 'var(--sidebar-bg)', padding: '80px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Reveal>
            <div className="responsive-grid" style={{ gap: '60px', alignItems: 'center' }}>
              <div className="animate-slide-left">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#adc6ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Simple & Powerful</span>
                <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'white', marginTop: '8px', letterSpacing: '-0.02em', marginBottom: '32px' }}>How It Works</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {steps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', transition: 'transform 0.2s', cursor: 'default' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(10px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,88,188,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#adc6ff' }}>{s.icon}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0070eb', letterSpacing: '0.04em' }}>STEP {s.num}</span>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>{s.title}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="animate-slide-right animate-delay-200" style={{ animation: 'float-reverse 7s ease-in-out infinite, slide-in-right 1s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <img src="/team-scheduling.png" alt="Medical team collaborating" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Triage Levels ═══ */}
      <section id="triage" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 5%' }}>
        <Reveal>
          <div className="responsive-grid" style={{ gap: '60px', alignItems: 'center' }}>
            <div>
              <img src="/patient-flow.png" alt="Patient flow visualization" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', animation: 'float 8s ease-in-out infinite', animationDelay: '0.5s' }} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0058bc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Color-Coded Priority</span>
              <h2 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--color-text)', marginTop: '8px', letterSpacing: '-0.02em', marginBottom: '12px' }}>4-Level Triage System</h2>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
                Every patient gets an instant priority score based on how urgent their condition is, their age, and how long they've been waiting. No one falls through the cracks.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tiers.map((t, i) => (
                  <div key={i} className="card" style={{ padding: '16px 20px', borderLeft: `4px solid ${t.color}`, display: 'flex', alignItems: 'center', gap: '14px', transition: 'transform 0.2s', cursor: 'default' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(8px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: `0 0 8px ${t.color}40` }} />
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>{t.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background: 'var(--sidebar-bg)', padding: '80px 40px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#adc6ff', marginBottom: '16px', display: 'block' }}>rocket_launch</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', marginBottom: '12px' }}>Ready to transform your ED?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', marginBottom: '32px', lineHeight: 1.6 }}>Log in now and see how MediQueue can help your team deliver faster, fairer patient care.</p>
            <Link to="/login" style={{ padding: '16px 36px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, background: 'white', color: '#001F3F', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>login</span> Staff Login
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{ padding: '32px 40px', background: '#f8f9fa', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '0.06em', color: 'var(--color-primary)' }}>MEDIQUEUE</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>© 2025 All rights reserved</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['Privacy', 'Terms', 'Support'].map(l => (
              <a key={l} href="#" style={{ fontSize: '12px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
