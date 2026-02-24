const SchoolsGrid = ({ onSelectSchool }) => {
  const schools = [
    "School of Civil Engineering",
    "School of Computing",
    "School of Electrical & Electronics Engineering",
    "School of Mechanical Engineering",
    "School of Chemical & Biotechnology",
    "School of Management",
    "School of Arts, Science and Humanities",
    "CeNTAB",
    "CARISM",
    "School of Law",
    "Corporate Relations / Training & Placement",
    "Distance Education",
    "Srinivasa Ramanujan Centre"
  ];

  return (
    <div style={{ width: '100%', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#333', marginBottom: '30px', fontWeight: 'normal', fontSize: '2rem', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        e-Staff Details
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {schools.map((school) => (
          <button
            key={school}
            onClick={() => onSelectSchool(school)}
            style={{
              backgroundColor: '#337ab7',
              color: 'white',
              border: 'none',
              padding: '18px 15px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              width: '100%',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#286090';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#337ab7';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {school}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SchoolsGrid;