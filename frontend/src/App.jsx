import { useEffect, useState } from 'react';
import SchoolsGrid from './SchoolsGrid';
import FacultyCard from './FacultyCard';
import FacultyForm from './FacultyForm';
import FacultyModal from './FacultyModal';

function App() {
  const [faculties, setFaculties] = useState([]);
  const [status, setStatus] = useState('Connecting...');
  const [currentView, setCurrentView] = useState('home');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [viewingFaculty, setViewingFaculty] = useState(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDept, setActiveDept] = useState('All');

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

  // Filter Logic: School -> Department -> Search Name
  const filteredFaculties = faculties
    .filter(f => f.school === selectedSchool)
    .filter(f => activeDept === 'All' || f.department === activeDept)
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const depts = ['All', ...new Set(faculties.filter(f => f.school === selectedSchool).map(f => f.department))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {viewingFaculty && <FacultyModal faculty={viewingFaculty} onClose={() => setViewingFaculty(null)} />}

      <header style={{ backgroundColor: '#ffffff', borderBottom: '4px solid #0056b3', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', width: '100%' }}>
        <div onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '45px', height: '45px', backgroundColor: '#0056b3', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>SASTRA</div>
          <div>
            <h1 style={{ margin: '0', fontSize: '1.4rem', color: '#0056b3' }}>Lectura Portal</h1>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>Student-Driven Faculty Reviews</p>
          </div>
        </div>
        <div style={{ fontSize: '0.85rem' }}>System Status: <span style={{ color: status === 'Online' ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{status}</span></div>
      </header>
      
      <main style={{ flexGrow: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {currentView === 'home' && (
          <SchoolsGrid onSelectSchool={(school) => { setSelectedSchool(school); setCurrentView('school'); }} />
        )}

        {currentView === 'school' && (
          <div>
            <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: '#333', fontWeight: 'normal' }}>Faculty Key List - <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{selectedSchool}</span></h2>
                <button onClick={() => { setCurrentView('home'); setSearchTerm(''); setActiveDept('All'); }} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #0056b3', background: 'none', color: '#0056b3' }}>← Back to Schools</button>
              </div>

              {/* Search & Dept Filter Bar */}
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <input 
                  type="text" 
                  placeholder="🔍 Search professor by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flexGrow: 1, padding: '12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '250px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {depts.map(d => (
                    <button 
                      key={d} 
                      onClick={() => setActiveDept(d)}
                      style={{ 
                        padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        backgroundColor: activeDept === d ? '#0056b3' : '#eee',
                        color: activeDept === d ? 'white' : '#555',
                        fontSize: '0.85rem', fontWeight: 'bold'
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
                <FacultyCard key={f._id} faculty={f} onClick={() => setViewingFaculty(f)} />
              ))}
            </div>
            {filteredFaculties.length === 0 && <p style={{ textAlign: 'center', marginTop: '50px', color: '#999' }}>No professors found matching your search.</p>}
          </div>
        )}

        {currentView === 'admin' && <FacultyForm faculties={faculties} onReviewPosted={fetchFaculties} />}
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', backgroundColor: '#333', color: 'white' }}>
        <p style={{ fontSize: '0.8rem' }}>© 2026 Lectura Project (Team Aperture). For academic use only.</p>
        <button onClick={() => setCurrentView('admin')} style={{ color: '#00aaff', background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Senior Admin Login</button>
      </footer>
    </div>
  );
}

export default App;