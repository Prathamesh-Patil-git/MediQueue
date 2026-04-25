import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/* ─── Valid Credentials ─── */
const VALID_USERS = [
  {
    hospitalId: 'HOSP-001-01',
    email: 'doctor@mediqueue.org',
    password: 'admin@123',
    name: 'Dr. Sarah Chen',
    role: 'Triage Supervisor',
    initials: 'SC',
  },
  {
    hospitalId: 'HOSP-001-02',
    email: 'nurse@mediqueue.org',
    password: 'nurse@123',
    name: 'Nurse Priya Sharma',
    role: 'Head Nurse',
    initials: 'PS',
  },
  {
    hospitalId: 'HOSP-001-03',
    email: 'admin@mediqueue.org',
    password: 'superadmin@123',
    name: 'John Doe',
    role: 'System Administrator',
    initials: 'JD',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('mediqueue_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (hospitalId, email, password) => {
    const match = VALID_USERS.find(
      (u) =>
        u.hospitalId.toLowerCase() === hospitalId.trim().toLowerCase() &&
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (match) {
      const userData = {
        name: match.name,
        role: match.role,
        initials: match.initials,
        email: match.email,
        hospitalId: match.hospitalId,
      };
      setUser(userData);
      sessionStorage.setItem('mediqueue_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials. Please check Hospital ID, email, and password.' };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('mediqueue_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { VALID_USERS };
