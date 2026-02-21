import React, { useMemo } from 'react';

const FacultyProfilePage = ({ faculty, onBack }) => {
  // Memoize the calculations so they only run when the faculty data changes
  const aggregatedData = useMemo(() => {
    if (!faculty || !faculty.reviews || faculty.reviews.length === 0) return null;

    const count = faculty.reviews.length;
    let sums = {
      satisfaction: 0, approachability: 0, clarity: 0, syllabus: 0, 
      examAlignment: 0, leniency: 0, knowledgeDepth: 0
    };
    
    let tagFrequency = { strengths: {}, improvements: {} };
    let allFeedback = [];

    faculty.reviews.forEach(review => {
      // Aggregate numeric scores
      sums.satisfaction += review.satisfaction || 0;
      sums.approachability += review.approachability || 0;
      
      if (review.ratings) {
        sums.clarity += review.ratings.clarity || 0;
        sums.syllabus += review.ratings.syllabus || 0;
        sums.examAlignment += review.ratings.examAlignment || 0;
        sums.leniency += review.ratings.leniency || 0;
        sums.knowledgeDepth += review.ratings.knowledgeDepth || 0;
      }

      // Aggregate tags for Strengths
      if (review.context && review.context.strengths) {
        review.context.strengths.forEach(tag => {
          tagFrequency.strengths[tag] = (tagFrequency.strengths[tag] || 0) + 1;
        });
      }

      // Aggregate tags for Improvements
      if (review.context && review.context.improvements) {
        review.context.improvements.forEach(tag => {
          tagFrequency.improvements[tag] = (tagFrequency.improvements[tag] || 0) + 1;
        });
      }

      // Collect honest lines
      if (review.feedback && review.feedback.trim() !== '') {
        allFeedback.push({
          text: review.feedback,
          date: review.date,
          recommend: review.recommend,
          attendance: review.attendance
        });
      }
    });

    // Calculate Averages
    const averages = {};
    Object.keys(sums).forEach(key => {
      averages[key] = (sums[key] / count).toFixed(1);
    });

    // Sort to get top 3 tags
    const topStrengths = Object.entries(tagFrequency.strengths)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
      
    const topImprovements = Object.entries(tagFrequency.improvements)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    // Sort feedback by newest first
    allFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { count, averages, topStrengths, topImprovements, allFeedback };
  }, [faculty]);

  // Helper to render average stars
  const renderStars = (avgValue) => {
    const rounded = Math.round(avgValue);
    return [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ color: star <= rounded ? '#f5a623' : '#e4e5e9', fontSize: '1.4rem' }}>★</span>
    ));
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navigation Header */}
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>← Back to Key List</button>
      </div>

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <img 
          src={faculty.imageUrl} 
          alt={faculty.name} 
          style={styles.profileImg} 
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150/0056b3/FFFFFF?text=' + faculty.name.charAt(0); }}
        />
        <div style={styles.profileInfo}>
          <h1 style={styles.name}>{faculty.name}</h1>
          <p style={styles.department}>{faculty.department} | {faculty.designation}</p>
          <div style={styles.badgesRow}>
            <span style={styles.ratingBadge}>⭐ {faculty.overallRating ? Number(faculty.overallRating).toFixed(1) : 'N/A'} Overall Rating</span>
            {aggregatedData && <span style={styles.reviewCountBadge}>📊 {aggregatedData.count} Verified Reviews</span>}
          </div>
        </div>
      </div>

      {!aggregatedData ? (
        <div style={styles.emptyState}>
          <h2 style={{ color: '#64748b' }}>No data available yet.</h2>
          <p>Admins need to submit reviews to populate this dashboard.</p>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>
          
          {/* Left Column: Averages & Metrics */}
          <div style={styles.metricsColumn}>
            
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Vibe & Comfort Averages</h3>
              <div style={styles.metricRow}>
                <span>Overall Satisfaction</span>
                <span style={styles.avgScore}>{aggregatedData.averages.satisfaction} / 5.0</span>
              </div>
              <div style={styles.metricRow}>
                <span>Student Approachability</span>
                <span style={styles.avgScore}>{aggregatedData.averages.approachability} / 4.0</span>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Academic Averages</h3>
              <div style={styles.metricRow}>
                <span>Concept Clarity</span>
                <div>{renderStars(aggregatedData.averages.clarity)} <span style={styles.avgNumber}>({aggregatedData.averages.clarity})</span></div>
              </div>
              <div style={styles.metricRow}>
                <span>Teaching Pace</span>
                <div>{renderStars(aggregatedData.averages.syllabus)} <span style={styles.avgNumber}>({aggregatedData.averages.syllabus})</span></div>
              </div>
              <div style={styles.metricRow}>
                <span>Exam Alignment</span>
                <div>{renderStars(aggregatedData.averages.examAlignment)} <span style={styles.avgNumber}>({aggregatedData.averages.examAlignment})</span></div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Junior Decision Averages</h3>
              <div style={styles.metricRow}>
                <span>Marking Leniency (Internals)</span>
                <div>{renderStars(aggregatedData.averages.leniency)} <span style={styles.avgNumber}>({aggregatedData.averages.leniency})</span></div>
              </div>
              <div style={styles.metricRow}>
                <span>Knowledge Depth (Research)</span>
                <div>{renderStars(aggregatedData.averages.knowledgeDepth)} <span style={styles.avgNumber}>({aggregatedData.averages.knowledgeDepth})</span></div>
              </div>
            </div>

            {/* Top Tags */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Consensus Tags</h3>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#10b981' }}>Top Strengths</strong>
                <div style={styles.tagWrap}>
                  {aggregatedData.topStrengths.length > 0 ? aggregatedData.topStrengths.map(tag => (
                    <span key={tag} style={styles.strengthTag}>✓ {tag}</span>
                  )) : <span style={styles.noData}>Not enough data</span>}
                </div>
              </div>
              <div>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b' }}>Common Growth Areas</strong>
                <div style={styles.tagWrap}>
                  {aggregatedData.topImprovements.length > 0 ? aggregatedData.topImprovements.map(tag => (
                    <span key={tag} style={styles.improvementTag}>△ {tag}</span>
                  )) : <span style={styles.noData}>Not enough data</span>}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: The Honest Lines (Comments) */}
          <div style={styles.commentsColumn}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>✨ The "Honest Lines" from Juniors</h3>
              <p style={styles.cardSubTitle}>Unfiltered, one-line feedback from verified students.</p>
              
              <div style={styles.commentsList}>
                {aggregatedData.allFeedback.length === 0 ? (
                  <p style={styles.noData}>No written feedback provided yet.</p>
                ) : (
                  aggregatedData.allFeedback.map((fb, idx) => (
                    <div key={idx} style={styles.commentItem}>
                      <p style={styles.commentText}>"{fb.text}"</p>
                      <div style={styles.commentMeta}>
                        <span style={{ 
                          ...styles.recBadge, 
                          backgroundColor: fb.recommend.includes('Yes') ? '#dcfce7' : fb.recommend.includes('No') ? '#fee2e2' : '#fef3c7',
                          color: fb.recommend.includes('Yes') ? '#166534' : fb.recommend.includes('No') ? '#991b1b' : '#92400e'
                        }}>
                          {fb.recommend} Recommend
                        </span>
                        <span style={styles.attBadge}>Attendance: {fb.attendance}</span>
                        <span style={styles.dateText}>{new Date(fb.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { maxWidth: '1200px', margin: '0 auto', padding: '20px', width: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.4s ease' },
  navBar: { marginBottom: '20px' },
  backBtn: { padding: '10px 20px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569', transition: 'all 0.2s' },
  
  profileHeader: { display: 'flex', alignItems: 'center', gap: '30px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #e2e8f0' },
  profileImg: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #f1f5f9' },
  profileInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  name: { margin: 0, fontSize: '2.2rem', color: '#0f172a', fontWeight: '900' },
  department: { margin: 0, fontSize: '1.1rem', color: '#64748b' },
  badgesRow: { display: 'flex', gap: '15px', marginTop: '10px' },
  ratingBadge: { padding: '6px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' },
  reviewCountBadge: { padding: '6px 14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' },
  
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' },
  metricsColumn: { display: 'flex', flexDirection: 'column', gap: '25px' },
  commentsColumn: { display: 'flex', flexDirection: 'column' },
  
  card: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  cardTitle: { margin: '0 0 15px 0', color: '#0f172a', fontSize: '1.3rem', fontWeight: '800', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' },
  cardSubTitle: { marginTop: '-10px', marginBottom: '20px', color: '#64748b', fontSize: '0.9rem' },
  
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #e2e8f0', color: '#334155', fontWeight: '600', fontSize: '1rem' },
  avgScore: { fontSize: '1.2rem', fontWeight: '800', color: '#0056b3' },
  avgNumber: { fontSize: '0.9rem', color: '#94a3b8', marginLeft: '5px' },
  
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  strengthTag: { padding: '6px 12px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' },
  improvementTag: { padding: '6px 12px', backgroundColor: '#fff7ed', color: '#c2410c', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700' },
  noData: { color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' },
  
  commentsList: { display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' },
  commentItem: { padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #0056b3' },
  commentText: { margin: '0 0 15px 0', fontSize: '1.05rem', color: '#1e293b', fontStyle: 'italic', lineHeight: '1.5' },
  commentMeta: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  recBadge: { padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  attBadge: { padding: '4px 10px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  dateText: { fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' },
  
  emptyState: { textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }
};

export default FacultyProfilePage;