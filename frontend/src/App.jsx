import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Scheduler from './pages/Scheduler';
import Simulation from './pages/Simulation';
import Comparison from './pages/Comparison';
import Lookup from './pages/Lookup';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/comparison" element={<Comparison />} />
            <Route path="/lookup" element={<Lookup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
