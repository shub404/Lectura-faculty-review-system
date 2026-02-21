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
      const response = await fetch('http://localhost:5000/api/faculty');
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
      const response = await fetch(`http://localhost:5000/api/faculty/${viewingFaculty._id}/reviews`, {
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', backgroundColor: '#f4f7f6' }}>
      
      {/* 1. Admin Review Overlay */}
      {viewingFaculty && adminUser && (
        <ReviewModal 
          faculty={viewingFaculty} 
          onClose={() => setViewingFaculty(null)} 
          onSubmit={handleAdminReviewSubmit} 
        />
      )}

      {/* 2. Global Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: adminUser ? '4px solid #dc3545' : '4px solid #0056b3', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}>
        <div onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); setViewingFaculty(null); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', backgroundColor: adminUser ? '#dc3545' : '#0056b3', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', transition: 'background-color 0.3s' }}>SASTRA</div>
          <div>
            <h1 style={{ margin: '0', fontSize: '1.4rem', color: adminUser ? '#dc3545' : '#0056b3' }}>Lectura Portal</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>{adminUser ? `Admin Mode Active: ${adminUser}` : 'Student-Driven Faculty Reviews'}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.85rem' }}>System Status: <span style={{ color: status === 'Online' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{status}</span></div>
          {adminUser && (
            <button onClick={() => { setAdminUser(null); setCurrentView('home'); }} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Exit Admin</button>
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
            <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#333', fontWeight: 'normal', margin: 0 }}>Faculty Key List - <span style={{ color: adminUser ? '#dc3545' : '#0056b3', fontWeight: 'bold' }}>{selectedSchool}</span></h2>
                <button onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); }} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', border: `1px solid ${adminUser ? '#dc3545' : '#0056b3'}`, background: 'none', color: adminUser ? '#dc3545' : '#0056b3', fontWeight: 'bold' }}>← Back</button>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search professor by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flexGrow: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '250px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {depts.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setActiveDept(d)}
                      style={{ 
                        padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        backgroundColor: activeDept === d ? (adminUser ? '#dc3545' : '#0056b3') : '#eee',
                        color: activeDept === d ? 'white' : '#555',
                        fontSize: '0.85rem', fontWeight: 'bold', transition: 'background-color 0.2s'
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

      <footer style={{ textAlign: 'center', padding: '25px', backgroundColor: '#24292e', color: 'white', marginTop: 'auto' }}>
        <p style={{ fontSize: '0.85rem', margin: '0 0 10px 0', opacity: 0.8 }}>© 2026 Lectura Project (Team Aperture). For academic use only.</p>
        {!adminUser && (
          <button onClick={() => setCurrentView('admin-login')} style={{ color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}>
            Authorized Admin Login
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;