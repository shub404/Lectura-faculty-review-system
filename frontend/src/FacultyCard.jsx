import React from 'react';

const FacultyCard = ({ faculty, onClick }) => {
  // Ensure we have a valid rating, otherwise default to 0
  const rating = faculty.overallRating ? Number(faculty.overallRating).toFixed(1) : "0.0";
  const hasRating = rating !== "0.0";

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.imageContainer}>
        <img 
          src={faculty.imageUrl} 
          alt={faculty.name} 
          style={styles.image}
          onError={(e) => { 
            e.target.src = 'https://via.placeholder.com/150/0056b3/FFFFFF?text=' + faculty.name.charAt(0); 
          }}
        />
      </div>
      
      <div style={styles.header}>
        <h3 style={styles.name}>{faculty.name}</h3>
      </div>

      <div style={styles.body}>
        {/* Dynamic Designation & Department */}
        <p style={styles.designation}>
          {faculty.designation} <span style={styles.dot}>•</span> {faculty.department}
        </p>

        {/* Educational Qualifications Snippet (if available) */}
        {faculty.qualifications && (
          <p style={styles.qualifications} title={faculty.qualifications}>
            🎓 {faculty.qualifications.length > 35 ? faculty.qualifications.substring(0, 35) + '...' : faculty.qualifications}
          </p>
        )}

        {/* Email Display */}
        {faculty.email ? (
          <a 
            href={`mailto:${faculty.email}`} 
            style={styles.emailLink} 
            onClick={(e) => e.stopPropagation()} // Prevents opening the modal when clicking email
          >
            ✉️ {faculty.email}
          </a>
        ) : (
          <p style={styles.noEmail}>✉️ No email provided</p>
        )}

        {/* Rating Badge */}
        <div style={styles.footer}>
          <div style={{ ...styles.ratingBadge, backgroundColor: hasRating ? '#fef3c7' : '#f1f5f9', color: hasRating ? '#92400e' : '#64748b' }}>
            {hasRating ? `⭐ ${rating}` : '⭐ No Ratings'}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  imageContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    padding: '25px 0 15px 0',
    backgroundColor: '#f8fafc' 
  },
  image: { 
    width: '100px', 
    height: '100px', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '4px solid #ffffff',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  header: { 
    backgroundColor: '#0056b3', 
    padding: '12px', 
    textAlign: 'center' 
  },
  name: { 
    margin: 0, 
    color: '#ffffff', 
    fontSize: '1.05rem', 
    fontWeight: '700',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  body: { 
    padding: '20px', 
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  designation: { 
    margin: '0 0 10px 0', 
    fontSize: '0.95rem', 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  dot: {
    color: '#cbd5e1',
    margin: '0 4px'
  },
  qualifications: {
    margin: '0 0 12px 0',
    fontSize: '0.8rem',
    color: '#64748b',
    fontStyle: 'italic'
  },
  emailLink: {
    margin: '0 0 15px 0',
    fontSize: '0.85rem',
    color: '#0056b3',
    textDecoration: 'none',
    fontWeight: '600'
  },
  noEmail: { 
    margin: '0 0 15px 0', 
    fontSize: '0.85rem', 
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  footer: { 
    marginTop: 'auto', 
    display: 'flex', 
    justifyContent: 'center' 
  },
  ratingBadge: { 
    padding: '6px 16px', 
    borderRadius: '20px', 
    fontSize: '0.9rem', 
    fontWeight: 'bold',
    border: '1px solid #e2e8f0'
  }
};

export default FacultyCard;