import { useEffect, useState } from 'react';
import SchoolsGrid from './SchoolsGrid';
import FacultyCard from './FacultyCard';
import AdminLogin from './AdminLogin';
import ReviewModal from './ReviewModal';
import FacultyProfilePage from './FacultyProfilePage'; // <-- Import the new page

function App() {
  const [faculties, setFaculties] = useState([]);
  const [status, setStatus] = useState('Connecting...');

  // App Navigation States
  const [currentView, setCurrentView] = useState('home'); // 'home', 'school', 'profile', 'admin-login'
  const [selectedSchool, setSelectedSchool] = useState('');
  const [viewingFaculty, setViewingFaculty] = useState(null);

  // Search, Filter, and Auth States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const [adminUser, setAdminUser] = useState(null);

  const fetchFaculties = async () => {
    try {
      console.log("API URL:", import.meta.env.VITE_API_URL);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty`);;
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

  const filteredFaculties = faculties
    .filter(f => f.school === selectedSchool)
    .filter(f => activeDept === 'All' || f.department === activeDept)
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const depts = ['All', ...new Set(faculties.filter(f => f.school === selectedSchool).map(f => f.department))];

  // Modified Click Handler
  const handleFacultyClick = (faculty) => {
    setViewingFaculty(faculty);
    if (!adminUser) {
      // If student clicks, take them to the new detailed profile page
      setCurrentView('profile');
    }
    // If admin clicks, it just sets viewingFaculty, which triggers ReviewModal overlay below
  };

  const handleAdminReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/${viewingFaculty._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', backgroundColor: 'var(--stitch-background)' }}>

      {/* 1. Admin Review Overlay */}
      {viewingFaculty && adminUser && (
        <ReviewModal
          faculty={viewingFaculty}
          onClose={() => setViewingFaculty(null)}
          onSubmit={handleAdminReviewSubmit}
        />
      )}

      {/* 2. Global Header */}
      <header style={{
        backgroundColor: 'var(--stitch-navy)',
        borderBottom: adminUser ? '4px solid #dc3545' : 'none',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--stitch-shadow)',
        width: '100%',
        boxSizing: 'border-box',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); setViewingFaculty(null); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: adminUser ? '#dc3545' : 'var(--stitch-primary)',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            transition: 'background-color 0.3s'
          }}>SASTRA</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: '0', fontSize: '1.25rem', color: 'white', fontWeight: 'bold', lineHeight: '1' }}>Lectura Portal</h1>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', trackingWide: '0.05em' }}>SASTRA UNIVERSITY</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
            System Status: <span style={{ color: status === 'Online' ? 'var(--stitch-primary)' : '#dc3545', fontWeight: 'bold' }}>{status}</span>
          </div>
          {adminUser && (
            <button onClick={() => { setAdminUser(null); setCurrentView('home'); }} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Exit Admin</button>
          )}
        </div>
      </header>

      {/* 3. Main Content Routing Area */}
      <main style={{ flexGrow: 1, width: '100%', boxSizing: 'border-box', padding: currentView === 'profile' ? '0' : '30px 20px', maxWidth: currentView === 'profile' ? '100%' : '1200px', margin: '0 auto' }}>

        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={(id) => { setAdminUser(id); setCurrentView('home'); }}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'home' && (
          <SchoolsGrid onSelectSchool={(school) => { setSelectedSchool(school); setCurrentView('school'); }} />
        )}

        {/* The New Student Profile Page Router */}
        {currentView === 'profile' && viewingFaculty && (
          <FacultyProfilePage
            faculty={viewingFaculty}
            onBack={() => { setCurrentView('school'); setViewingFaculty(null); }}
          />
        )}

        {currentView === 'school' && (
          <div>
            <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--stitch-navy)', fontWeight: 'bold', margin: 0, fontSize: '1.5rem' }}>Faculty Key List - <span style={{ color: 'var(--stitch-primary)' }}>{selectedSchool}</span></h2>
                <button onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); }} style={{ padding: '10px 20px', borderRadius: 'var(--stitch-radius-lg)', cursor: 'pointer', border: '1px solid var(--stitch-border)', background: 'var(--stitch-white)', color: 'var(--stitch-navy)', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: 'var(--stitch-shadow)' }}>← Back</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--stitch-white)', padding: '24px', borderRadius: 'var(--stitch-radius-xl)', boxShadow: 'var(--stitch-shadow)', border: '1px solid var(--stitch-border)' }}>
                <input
                  type="text"
                  placeholder="🔍 Search professor by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: 'var(--stitch-radius-lg)', border: '1px solid var(--stitch-border)', outline: 'none', fontSize: '1rem', backgroundColor: '#f8fafc' }}
                />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--stitch-text-muted)', textTransform: 'uppercase', trackingWide: '0.05em' }}>Filter:</span>
                  {depts.map(d => (
                    <button
                      key={d}
                      onClick={() => setActiveDept(d)}
                      style={{
                        padding: '8px 16px', borderRadius: 'var(--stitch-radius-lg)', border: 'none', cursor: 'pointer',
                        backgroundColor: activeDept === d ? 'var(--stitch-primary)' : 'var(--stitch-primary-light)',
                        color: activeDept === d ? 'white' : 'var(--stitch-primary)',
                        fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s ease'
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
            {filteredFaculties.length === 0 && <p style={{ textAlign: 'center', marginTop: '50px', color: '#999', fontSize: '1.1rem' }}>No professors found matching your search.</p>}
          </div>
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '40px 24px',
        backgroundColor: 'var(--stitch-navy)',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ fontSize: '0.85rem', margin: '0 0 12px 0', fontWeight: '500' }}>© 2026 Lectura Project (Team Aperture). For academic use only.</p>
        {!adminUser && (
          <button onClick={() => setCurrentView('admin-login')} style={{ color: 'var(--stitch-primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
            Authorized Admin Login
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;