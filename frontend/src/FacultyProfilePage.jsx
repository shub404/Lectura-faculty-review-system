import React, { useMemo, useState, useEffect } from 'react';

const FacultyProfilePage = ({ faculty, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Auto-hide the "Copied" status after 3 seconds
  useEffect(() => {
    let timer;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

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
      sums.satisfaction += review.satisfaction || 0;
      sums.approachability += review.approachability || 0;

      if (review.ratings) {
        sums.clarity += review.ratings.clarity || 0;
        sums.syllabus += review.ratings.syllabus || 0;
        sums.examAlignment += review.ratings.examAlignment || 0;
        sums.leniency += review.ratings.leniency || 0;
        sums.knowledgeDepth += review.ratings.knowledgeDepth || 0;
      }

      if (review.context && review.context.strengths) {
        review.context.strengths.forEach(tag => {
          tagFrequency.strengths[tag] = (tagFrequency.strengths[tag] || 0) + 1;
        });
      }

      if (review.context && review.context.improvements) {
        review.context.improvements.forEach(tag => {
          tagFrequency.improvements[tag] = (tagFrequency.improvements[tag] || 0) + 1;
        });
      }

      if (review.feedback && review.feedback.trim() !== '') {
        allFeedback.push({
          _id: review._id,
          text: review.feedback,
          date: review.date,
          recommend: review.recommend,
          attendance: review.attendance,
          flagged: review.flagged || false
        });
      }
    });

    const averages = {};
    Object.keys(sums).forEach(key => {
      averages[key] = (sums[key] / count).toFixed(1);
    });

    const topStrengths = Object.entries(tagFrequency.strengths)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    const topImprovements = Object.entries(tagFrequency.improvements)
      .sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    allFeedback.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { count, averages, topStrengths, topImprovements, allFeedback };
  }, [faculty]);

  /* ============================================================
     🤖 GENERATE AI SUMMARY (ADDED)
  ============================================================ */
  useEffect(() => {
    const generateSummary = async () => {

      if (!faculty || !faculty.reviews || faculty.reviews.length === 0) {
        setAiSummary(null);
        return;
      }

      try {
        setLoadingSummary(true);
        setSummaryError(null);

        const response = await fetch('http://localhost:5000/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reviews: faculty.reviews
          })
        });

        if (!response.ok) throw new Error("Summarization failed");

        const data = await response.json();
        setAiSummary(data.summary);

      } catch (err) {
        console.error(err);
        setSummaryError("Failed to generate AI summary.");
      } finally {
        setLoadingSummary(false);
      }
    };

    generateSummary();
  }, [faculty]);

  const handleEmailAction = (e) => {
    e.preventDefault();
    if (!faculty.email || faculty.email === "No email provided") return;

    navigator.clipboard.writeText(faculty.email).then(() => {
      setCopied(true);
    }).catch(err => console.error("Failed to copy text: ", err));

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(faculty.email)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const renderStars = (avgValue) => {
    const rounded = Math.round(avgValue);
    return [1, 2, 3, 4, 5].map(star => (
      <span key={star} style={{ color: star <= rounded ? '#f5a623' : '#e4e5e9', fontSize: '1.4rem' }}>★</span>
    ));
  };

  const hasValidData = (text) => text && text !== "Not provided" && text.trim() !== "";
  const showAcademicProfile = hasValidData(faculty.qualifications) || hasValidData(faculty.areasOfInterest);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.navBar}>
        <button onClick={onBack} style={styles.backBtn}>← Back to Key List</button>
      </div>

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

            {faculty.email && faculty.email !== "No email provided" && (
              <button
                onClick={handleEmailAction}
                style={{
                  ...styles.emailBadge,
                  backgroundColor: copied ? '#10b981' : '#ecfdf5',
                  color: copied ? '#ffffff' : '#047857',
                  border: copied ? '1px solid #059669' : '1px solid #a7f3d0'
                }}
                title="Opens Gmail in a new tab"
              >
                {copied ? '✅ Opening Gmail...' : '✉️ Open in Gmail'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showAcademicProfile && (
        <div style={styles.academicCard}>
          <h3 style={styles.cardTitle}>Academic Profile</h3>
          <table style={styles.academicTable}>
            <tbody>
              {hasValidData(faculty.qualifications) && (
                <tr>
                  <th style={styles.tableHeader}>Educational Qualifications</th>
                  <td style={styles.tableData}>{faculty.qualifications}</td>
                </tr>
              )}
              {hasValidData(faculty.areasOfInterest) && (
                <tr>
                  <th style={styles.tableHeader}>Areas of Interest</th>
                  <td style={styles.tableData}>{faculty.areasOfInterest}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!aggregatedData ? (
        <div style={styles.emptyState}>
          <h2 style={{ color: '#64748b' }}>No student insights available yet.</h2>
          <p>Admins need to submit reviews to populate the student dashboard.</p>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>

          <div style={styles.metricsColumn}>

            {/* 🤖 AI SUMMARY CARD (NEW, NO UI MODIFICATIONS) */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🤖 AI-Generated Student Insight</h3>
              {loadingSummary && <p style={styles.noData}>Generating intelligent summary...</p>}
              {summaryError && <p style={{ color: 'red' }}>{summaryError}</p>}
              {aiSummary && <p style={{ lineHeight: '1.7', color: '#334155' }}>{aiSummary}</p>}
              {!loadingSummary && !aiSummary && !summaryError && (
                <p style={styles.noData}>Not enough written feedback to summarize.</p>
              )}
            </div>

            {/* ALL YOUR EXISTING CARDS BELOW (UNCHANGED) */}

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
                    <div key={idx} style={{ ...styles.commentItem, opacity: fb.flagged ? 0.4 : 1 }}>
                      {fb.flagged ? (
                        <p style={{ ...styles.commentText, color: '#94a3b8' }}>⚠️ This review has been flagged for admin review.</p>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ ...styles.commentText, flex: 1 }}>"{fb.text}"</p>
                            <button
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to report this review as inappropriate?')) return;
                                try {
                                  const resp = await fetch(`http://localhost:5000/api/faculty/${faculty._id}/reviews/${fb._id}/flag`, { method: 'POST' });
                                  if (resp.ok) {
                                    alert('✅ Review has been flagged for admin review.');
                                    window.location.reload();
                                  } else {
                                    alert('❌ Failed to flag review.');
                                  }
                                } catch { alert('❌ Server connection error.'); }
                              }}
                              style={styles.flagBtn}
                              title="Report this review"
                            >
                              🚩
                            </button>
                          </div>
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
                        </>
                      )}
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
  badgesRow: { display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' },
  ratingBadge: { padding: '6px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center' },
  reviewCountBadge: { padding: '6px 14px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center' },

  // EMAIL BADGE BUTTON STYLES
  emailBadge: { padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', outline: 'none' },

  academicCard: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' },
  academicTable: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  tableHeader: { width: '25%', textAlign: 'left', padding: '16px 20px', backgroundColor: '#f8fafc', color: '#334155', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontWeight: '700', fontSize: '0.95rem', verticalAlign: 'top', borderRadius: '8px 0 0 8px' },
  tableData: { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' },

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

  flagBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px', borderRadius: '4px', opacity: 0.5, transition: 'opacity 0.2s' },

  emptyState: { textAlign: 'center', padding: '60px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }
};

export default FacultyProfilePage;