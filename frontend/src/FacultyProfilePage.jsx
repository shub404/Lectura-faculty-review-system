import React, { useMemo, useState, useEffect } from 'react';

const FacultyProfilePage = ({ faculty, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    let timer;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [copied]);

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

  useEffect(() => {
    const generateSummary = async () => {
      if (!faculty || !faculty.reviews || faculty.reviews.length === 0) {
        setAiSummary(null);
        return;
      }

      try {
        setLoadingSummary(true);
        setSummaryError(null);

        const response = await fetch('https://lectura-faculty-review-system.onrender.com/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviews: faculty.reviews })
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
      <span key={star} style={{ color: star <= rounded ? '#f5a623' : 'var(--color-border-subtle)', fontSize: '1.4rem' }}>★</span>
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
                  backgroundColor: copied ? 'var(--color-text-primary)' : 'var(--color-bg-elevated)',
                  color: copied ? 'var(--color-bg-card)' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)'
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
          <h2 style={styles.emptyStateText}>No student insights available yet.</h2>
          <p style={styles.emptyStateSubText}>Admins need to submit reviews to populate the student dashboard.</p>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>

          <div style={styles.metricsColumn}>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🤖 AI-Generated Student Insight</h3>
              {loadingSummary && <p style={styles.noData}>Generating intelligent summary...</p>}
              {summaryError && <p style={{ color: '#ef4444' }}>{summaryError}</p>}
              {aiSummary && <p style={{ lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>{aiSummary}</p>}
              {!loadingSummary && !aiSummary && !summaryError && (
                <p style={styles.noData}>Not enough written feedback to summarize.</p>
              )}
            </div>

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

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Consensus Tags</h3>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#22c55e' }}>Top Strengths</strong>
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
                        <p style={{ ...styles.commentText, color: 'var(--color-text-muted)' }}>⚠️ This review has been flagged for admin review.</p>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ ...styles.commentText, flex: 1 }}>"{fb.text}"</p>
                            <button
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to report this review as inappropriate?')) return;
                                try {
                                  const resp = await fetch(`https://lectura-faculty-review-system.onrender.com/api/faculty/${faculty._id}/reviews/${fb._id}/flag`, { method: 'POST' });
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
                              backgroundColor: fb.recommend.includes('Yes') ? 'rgba(34,197,94,0.12)' : fb.recommend.includes('No') ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
                              color: fb.recommend.includes('Yes') ? '#22c55e' : fb.recommend.includes('No') ? '#ef4444' : '#ca8a04'
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
  backBtn: { padding: '10px 20px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-text-secondary)', transition: 'all 0.2s', fontFamily: 'var(--font-body)' },

  profileHeader: { display: 'flex', alignItems: 'center', gap: '30px', backgroundColor: 'var(--color-bg-card)', padding: '30px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', marginBottom: '24px' },
  profileImg: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border-subtle)', flexShrink: 0 },
  profileInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  name: { margin: 0, fontSize: '2rem', color: 'var(--color-text-primary)', fontWeight: '800', fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' },
  department: { margin: 0, fontSize: '1rem', color: 'var(--color-text-muted)' },
  badgesRow: { display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' },
  ratingBadge: { padding: '5px 12px', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', borderRadius: '4px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid var(--color-border-subtle)' },
  reviewCountBadge: { padding: '5px 12px', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', border: '1px solid var(--color-border-subtle)' },
  emailBadge: { padding: '5px 12px', borderRadius: '4px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', outline: 'none', fontFamily: 'var(--font-body)' },

  academicCard: { backgroundColor: 'var(--color-bg-card)', padding: '25px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)', marginBottom: '24px' },
  academicTable: { width: '100%', borderCollapse: 'collapse', marginTop: '15px' },
  tableHeader: { width: '25%', textAlign: 'left', padding: '14px 18px', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border-subtle)', borderRight: '1px solid var(--color-border-subtle)', fontWeight: '700', fontSize: '0.9rem', verticalAlign: 'top' },
  tableData: { padding: '14px 18px', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' },
  metricsColumn: { display: 'flex', flexDirection: 'column', gap: '20px' },
  commentsColumn: { display: 'flex', flexDirection: 'column' },

  card: { backgroundColor: 'var(--color-bg-card)', padding: '24px', borderRadius: '4px', border: '1px solid var(--color-border-subtle)' },
  cardTitle: { margin: '0 0 14px 0', color: 'var(--color-text-primary)', fontSize: '1.15rem', fontWeight: '800', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' },
  cardSubTitle: { marginTop: '-8px', marginBottom: '18px', color: 'var(--color-text-muted)', fontSize: '0.85rem' },

  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)', fontWeight: '600', fontSize: '0.95rem' },
  avgScore: { fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-text-primary)' },
  avgNumber: { fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '5px' },

  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  strengthTag: { padding: '5px 11px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '700' },
  improvementTag: { padding: '5px 11px', backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '700' },
  noData: { color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic' },

  commentsList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto', paddingRight: '6px' },
  commentItem: { padding: '18px', backgroundColor: 'var(--color-bg-elevated)', borderRadius: '4px', borderLeft: '3px solid var(--color-border)' },
  commentText: { margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: '1.6' },
  commentMeta: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  recBadge: { padding: '3px 9px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' },
  attBadge: { padding: '3px 9px', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-muted)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid var(--color-border-subtle)' },
  dateText: { fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 'auto' },

  flagBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px', borderRadius: '4px', opacity: 0.5, transition: 'opacity 0.2s' },

  emptyState: { textAlign: 'center', padding: '60px', backgroundColor: 'var(--color-bg-card)', borderRadius: '4px', border: '1px dashed var(--color-border-subtle)' },
  emptyStateText: { color: 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' },
  emptyStateSubText: { color: 'var(--color-text-muted)', marginTop: '8px', fontSize: '0.9rem' }
};

export default FacultyProfilePage;
