import React from 'react';

const FacultyModal = ({ faculty, onClose }) => {
  // Helper function to render stars
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ color: star <= rating ? '#ffc107' : '#e4e5e9', fontSize: '1.2rem' }}>★</span>
    ));
  };

  // Helper mapping for satisfaction emojis
  const satisfactionEmojis = { 1: '😡', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' };

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* e.stopPropagation() prevents clicking inside the modal from closing it */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <img 
              src={faculty.imageUrl} 
              alt={faculty.name} 
              style={styles.profileImage} 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150/0056b3/FFFFFF?text=' + faculty.name.charAt(0); }}
            />
            <div>
              <h2 style={styles.title}>{faculty.name}</h2>
              <p style={styles.subtitle}>{faculty.department} • {faculty.designation}</p>
              <div style={styles.ratingBadge}>
                ⭐ {faculty.overallRating ? Number(faculty.overallRating).toFixed(1) : 'N/A'} / 5.0
              </div>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        {/* Scrollable Reviews Section */}
        <div style={styles.contentScroll}>
          <h3 style={styles.sectionTitle}>Student Insights</h3>
          
          {!faculty.reviews || faculty.reviews.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>📭</p>
              <p>No rich reviews available for this professor yet.</p>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>Admins can add official reviews using the secure terminal.</p>
            </div>
          ) : (
            <div style={styles.reviewList}>
              {faculty.reviews.map((review, index) => (
                <div key={review._id || index} style={styles.reviewCard}>
                  
                  {/* Top Row: Vibe Check */}
                  <div style={styles.reviewHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={styles.satisfactionEmoji} title="Overall Satisfaction">
                        {satisfactionEmojis[review.satisfaction] || '😐'}
                      </span>
                      <div>
                        <span style={styles.recommendBadge(review.recommend)}>{review.recommend} Recommend</span>
                      </div>
                    </div>
                    <span style={styles.dateText}>
                      {review.date ? new Date(review.date).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* Middle Row: Ratings & Metrics */}
                  {review.ratings && (
                    <div style={styles.metricsGrid}>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Clarity</span>
                        <div>{renderStars(review.ratings.clarity)}</div>
                      </div>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Pacing</span>
                        <div>{renderStars(review.ratings.syllabus)}</div>
                      </div>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Instruction</span>
                        <div>{renderStars(review.ratings.instruction)}</div>
                      </div>
                      <div style={styles.metricItem}>
                        <span style={styles.metricLabel}>Punctuality</span>
                        <div>{renderStars(review.ratings.punctuality)}</div>
                      </div>
                    </div>
                  )}

                  {/* Context: Tags */}
                  {(review.strengths?.length > 0 || review.improvements?.length > 0) && (
                    <div style={styles.tagsSection}>
                      {review.strengths?.map(tag => (
                        <span key={`str-${tag}`} style={styles.strengthTag}>✓ {tag}</span>
                      ))}
                      {review.improvements?.map(tag => (
                        <span key={`imp-${tag}`} style={styles.improvementTag}>△ {tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Qualitative Feedback */}
                  {review.feedback && (
                    <div style={styles.feedbackBox}>
                      <strong>💡 Head Start Tip: </strong> 
                      "{review.feedback}"
                    </div>
                  )}
                  
                  {/* Attendance & Trust Metadata */}
                  <div style={styles.metaData}>
                    Reviewer Attendance: <strong>{review.attendance || 'Unknown'}</strong>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modal: { backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden' },
  header: { padding: '20px 25px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerContent: { display: 'flex', gap: '20px', alignItems: 'center' },
  profileImage: { width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 5px 0', fontSize: '1.4rem', color: '#0056b3', fontWeight: 'bold' },
  subtitle: { margin: 0, fontSize: '0.9rem', color: '#666' },
  ratingBadge: { display: 'inline-block', marginTop: '8px', padding: '4px 10px', backgroundColor: '#e3f2fd', color: '#0056b3', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#999', lineHeight: 1 },
  contentScroll: { padding: '25px', overflowY: 'auto', flexGrow: 1, backgroundColor: '#fdfdfd' },
  sectionTitle: { marginTop: 0, marginBottom: '20px', color: '#333', fontSize: '1.2rem', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' },
  emptyState: { textAlign: 'center', padding: '40px 20px', color: '#666', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  reviewCard: { backgroundColor: '#fff', border: '1px solid #eaeaea', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' },
  satisfactionEmoji: { fontSize: '2rem', lineHeight: 1 },
  recommendBadge: (rec) => ({
    padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
    backgroundColor: rec?.includes('Yes') ? '#d4edda' : rec?.includes('No') ? '#f8d7da' : '#fff3cd',
    color: rec?.includes('Yes') ? '#155724' : rec?.includes('No') ? '#721c24' : '#856404',
  }),
  dateText: { fontSize: '0.8rem', color: '#999' },
  metricsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' },
  metricItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '6px 12px', borderRadius: '6px' },
  metricLabel: { fontSize: '0.85rem', color: '#555', fontWeight: 'bold' },
  tagsSection: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' },
  strengthTag: { padding: '4px 10px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  improvementTag: { padding: '4px 10px', backgroundColor: '#fff8e1', color: '#f57f17', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' },
  feedbackBox: { backgroundColor: '#f0f7ff', borderLeft: '4px solid #0056b3', padding: '12px 15px', fontSize: '0.95rem', color: '#333', fontStyle: 'italic', marginBottom: '15px', borderRadius: '0 4px 4px 0' },
  metaData: { fontSize: '0.75rem', color: '#888', textAlign: 'right', borderTop: '1px dotted #eee', paddingTop: '10px' }
};

export default FacultyModal;