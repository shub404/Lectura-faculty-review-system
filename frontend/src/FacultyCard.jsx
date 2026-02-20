const FacultyCard = ({ faculty, onClick }) => {
  // Logic to clean the name for the initial-based avatar API
  const nameForAvatar = faculty.name.replace(/(Dr\.|Mr\.|Ms\.|Mrs\.)\s*/g, '').trim();

  // Dynamic waterfall: try SASTRA upload first, then fallback to initials
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=0056b3&color=fff&size=150&bold=true`;
  };

  return (
    <div 
      onClick={onClick} 
      style={styles.card} 
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-6px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Profile Image Section */}
      <div style={styles.imageContainer}>
        <img 
          src={faculty.imageUrl} 
          alt={faculty.name} 
          onError={handleImageError}
          style={styles.image}
        />
      </div>
      
      {/* Standardized Sastra-Blue Header */}
      <div style={styles.nameHeader}>{faculty.name}</div>
      
      {/* Content Section with Improved Spacing */}
      <div style={styles.contentArea}>
        <div style={styles.textContainer}>
          <p style={styles.designation}>{faculty.designation}</p>
          <p style={styles.email}>{faculty.email || 'No email provided'}</p>
        </div>
        
        <div style={styles.ratingWrapper}>
          <span style={styles.ratingBadge}>
            ⭐ {faculty.overallRating > 0 ? faculty.overallRating.toFixed(1) : 'No Ratings'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Extracted style object for better readability and performance
const styles = {
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e1e4e8',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '28px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    height: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  imageContainer: {
    width: '125px', 
    height: '125px', 
    borderRadius: '50%', 
    overflow: 'hidden',
    border: '4px solid #f1f3f5',
    marginBottom: '22px',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%', 
    height: '100%', 
    objectFit: 'cover'
  },
  nameHeader: {
    backgroundColor: '#0056b3', 
    color: '#ffffff', 
    width: '100%', 
    textAlign: 'center', 
    padding: '12px 10px',
    fontWeight: '700',
    fontSize: '0.95rem',
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  contentArea: { 
    padding: '22px 18px', 
    textAlign: 'center', 
    width: '100%', 
    flexGrow: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between' 
  },
  textContainer: {
    marginBottom: '15px'
  },
  designation: { 
    margin: '0 0 6px 0', 
    color: '#24292e', 
    fontSize: '0.9rem', 
    fontWeight: '600',
    lineHeight: '1.4'
  },
  email: { 
    margin: '0', 
    color: '#586069', 
    fontSize: '0.8rem', 
    wordBreak: 'break-all',
    fontStyle: 'italic'
  },
  ratingWrapper: {
    marginTop: '10px'
  },
  ratingBadge: { 
    display: 'inline-block', 
    backgroundColor: '#fff9db', 
    color: '#856404', 
    padding: '6px 16px', 
    borderRadius: '25px', 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    border: '1px solid #ffe066',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
  }
};

export default FacultyCard;