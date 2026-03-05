import './assets/school-animated-buttons.css';

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
    <div style={{
      width: '100%',
      backgroundColor: 'var(--stitch-white)',
      padding: '40px',
      borderRadius: 'var(--stitch-radius-xl)',
      boxShadow: 'var(--stitch-shadow)',
      border: '1px solid var(--stitch-border)'
    }}>
      <h2 style={{
        color: 'var(--stitch-navy)',
        marginBottom: '32px',
        fontWeight: 'bold',
        fontSize: '2rem',
        borderBottom: '2px solid var(--stitch-border)',
        paddingBottom: '16px'
      }}>
        Staff Details
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {schools.map((school) => (
          <button
            key={school}
            className="school-animated-btn"
            onClick={() => onSelectSchool(school)}
          >
            {school}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SchoolsGrid;