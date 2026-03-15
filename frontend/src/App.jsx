import { useEffect, useRef, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import SchoolsGrid from './SchoolsGrid';
import FacultyCard from './FacultyCard';
import AdminLogin from './AdminLogin';
import ReviewModal from './ReviewModal';
import FacultyProfilePage from './FacultyProfilePage';

function App() {
  const [faculties, setFaculties] = useState([]);
  const [status, setStatus] = useState('Connecting...');
  const [theme, setTheme] = useState(() => localStorage.getItem('lectura-theme') || 'light');

  const [currentView, setCurrentView] = useState('home');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [viewingFaculty, setViewingFaculty] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
  const sessionTimerRef = useRef(null);

  function getTokenExpiry(token) {
    try {
      return JSON.parse(atob(token.split('.')[1])).exp;
    } catch { return null; }
  }

  function formatCountdown(secs) {
    if (secs <= 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
  }

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lectura-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    document.documentElement.classList.add('theme-transitioning');
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
    setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
  };

  const fetchFaculties = async () => {
    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty`);
      const data = await response.json();
      setFaculties(data);
      setStatus('Online');
    } catch (err) {
      setStatus('Offline');
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Session countdown tied to JWT expiry
  useEffect(() => {
    clearInterval(sessionTimerRef.current);
    if (!adminToken) { setSessionTimeLeft(null); return; }
    const exp = getTokenExpiry(adminToken);
    if (!exp) return;
    const tick = () => {
      const remaining = Math.floor((exp * 1000 - Date.now()) / 1000);
      if (remaining <= 0) {
        setAdminUser(null); setAdminToken(null);
        setCurrentView('home'); setSessionTimeLeft(null);
        clearInterval(sessionTimerRef.current);
      } else {
        setSessionTimeLeft(remaining);
      }
    };
    tick();
    sessionTimerRef.current = setInterval(tick, 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [adminToken]);

  const filteredFaculties = faculties
    .filter(f => f.school === selectedSchool)
    .filter(f => activeDept === 'All' || f.department === activeDept)
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const depts = ['All', ...new Set(faculties.filter(f => f.school === selectedSchool).map(f => f.department))];

  const handleFacultyClick = (faculty) => {
    setViewingFaculty(faculty);
    if (!adminUser) {
      setCurrentView('profile');
    }
  };

  const handleAdminReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/${viewingFaculty._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...reviewData, adminId: adminUser })
      });

      if (response.ok) {
        alert('✅ Official Review Published Successfully!');
        fetchFaculties();
        setViewingFaculty(null);
      } else {
        const errorData = await response.json();
        console.error("Backend Error:", errorData);
        alert(`❌ Failed to publish: ${errorData.error}`);
      }
    } catch (error) {
      alert('❌ Server connection error.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', backgroundColor: 'var(--color-bg-page)' }}>

      {viewingFaculty && adminUser && (
        <ReviewModal
          faculty={viewingFaculty}
          onClose={() => setViewingFaculty(null)}
          onSubmit={handleAdminReviewSubmit}
        />
      )}

      <header style={{
        backgroundColor: 'var(--color-bg-header)',
        borderBottom: adminUser ? '3px solid #dc3545' : '1px solid rgba(255,255,255,0.08)',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div
          onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); setViewingFaculty(null); }}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
        >
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: adminUser ? '#dc3545' : 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '2px',
            color: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.55rem',
            letterSpacing: '0.04em',
            transition: 'background-color 0.2s',
            flexShrink: 0,
          }}>
            SASTRA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{
              margin: 0,
              fontSize: '1rem',
              color: 'var(--color-text-on-header)',
              fontWeight: '800',
              lineHeight: '1',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
            }}>
              Lectura Portal
            </h1>
            <p style={{
              margin: 0,
              fontSize: '0.58rem',
              color: 'var(--color-text-on-header-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '500',
            }}>
              SASTRA UNIVERSITY
            </p>
          </div>
        </div>

        {adminUser && (
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
              {isWhitelisted ? 'Access Level' : 'Session Expires In'}
            </span>
            <span style={{
              fontSize: '0.95rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              letterSpacing: '0.08em',
              color: (!isWhitelisted && sessionTimeLeft < 300) ? '#ff6b6b' : 'rgba(255,255,255,0.9)',
            }}>
              {isWhitelisted ? 'Unlimited — Whitelisted' : (sessionTimeLeft !== null ? formatCountdown(sessionTimeLeft) : '--:--:--')}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-on-header-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            letterSpacing: '0.01em',
          }}>
            <span className={`status-dot${status === 'Offline' ? ' status-dot--offline' : ''}`} />
            System Status:
            <span style={{ color: 'var(--color-text-on-header)', fontWeight: '600' }}>
              {status}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: '2px',
              color: 'var(--color-text-on-header)',
              cursor: 'pointer',
              padding: '6px 7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.15s',
              lineHeight: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>

          {adminUser && (
            <button
              onClick={() => { setAdminUser(null); setAdminToken(null); setIsWhitelisted(false); setCurrentView('home'); }}
              style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.01em' }}
            >
              Exit Admin
            </button>
          )}
        </div>
      </header>

      <main style={{ flexGrow: 1, width: '100%', boxSizing: 'border-box', padding: currentView === 'profile' ? '0' : '30px 28px', maxWidth: currentView === 'profile' ? '100%' : '1200px', margin: '0 auto' }}>

        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={(token, email, whitelisted) => { setAdminToken(token); setAdminUser(email); setIsWhitelisted(!!whitelisted); setCurrentView('home'); }}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'home' && (
          <SchoolsGrid onSelectSchool={(school) => { setSelectedSchool(school); setCurrentView('school'); }} />
        )}

        {currentView === 'profile' && viewingFaculty && (
          <FacultyProfilePage
            faculty={viewingFaculty}
            onBack={() => { setCurrentView('school'); setViewingFaculty(null); }}
          />
        )}

        {currentView === 'school' && (
          <div>
            <div style={{ marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '18px' }}>
                <h2 style={{ color: 'var(--color-text-primary)', fontWeight: '800', margin: 0, fontSize: '1.3rem', letterSpacing: '-0.03em' }}>
                  Faculty — <span style={{ fontWeight: '400', color: 'var(--color-text-muted)' }}>{selectedSchool}</span>
                </h2>
                <button
                  onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); }}
                  style={{ padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-primary)', fontWeight: '600', fontSize: '0.8rem', letterSpacing: '0.01em', transition: 'background 0.12s, color 0.12s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-text-primary)'; e.currentTarget.style.color = 'var(--color-bg-card)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                >
                  ← Back
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--color-bg-card)', padding: '18px', border: '1px solid var(--color-border-subtle)' }}>
                <input
                  type="text"
                  placeholder="Search professor by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '2px', border: '1px solid var(--color-border-subtle)', outline: 'none', fontSize: '0.88rem', backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-primary)', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border-subtle)'}
                />
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Filter:</span>
                  {depts.map(d => (
                    <button
                      key={d}
                      onClick={() => setActiveDept(d)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '2px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: activeDept === d ? 'var(--color-text-primary)' : 'transparent',
                        color: activeDept === d ? 'var(--color-bg-card)' : 'var(--color-text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: '500',
                        transition: 'all 0.12s ease',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
              {filteredFaculties.map((f) => (
                <FacultyCard key={f._id} faculty={f} onClick={() => handleFacultyClick(f)} />
              ))}
            </div>

            {filteredFaculties.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-text-muted)', fontSize: '0.9rem', letterSpacing: '0.01em' }}>
                No professors found matching your search.
              </p>
            )}
          </div>
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '32px 28px',
        backgroundColor: 'var(--color-bg-header)',
        color: 'var(--color-text-on-header-muted)',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{ fontSize: '0.78rem', margin: '0 0 10px 0', fontWeight: '400', letterSpacing: '0.01em' }}>
          © 2026 Lectura Project. For academic use only.
        </p>
        {!adminUser && (
          <button
            onClick={() => setCurrentView('admin-login')}
            style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '500', letterSpacing: '0.02em', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            Authorized Admin Login
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
