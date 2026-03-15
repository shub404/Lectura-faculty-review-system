import React, { useState } from 'react';

const RESPONSIVE_CSS = `
  @keyframes rmFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rm-fade { animation: rmFadeIn 0.3s ease; }

  /* ── Modal shell ── */
  .rm-modal {
    display: flex; flex-direction: column;
    width: 100%; max-width: 1150px;
    height: 88vh; max-height: 850px;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
    overflow: hidden;
  }

  /* ── Top nav ── */
  .rm-topnav {
    padding: 24px 40px;
    border-bottom: 1px solid #e2e8f0;
    display: flex; align-items: center;
    flex-shrink: 0;
  }

  /* ── Split layout ── */
  .rm-split { display: flex; flex: 1; overflow: hidden; }

  /* ── Left sidebar ── */
  .rm-sidebar {
    width: 280px; flex-shrink: 0;
    padding: 32px 28px;
    display: flex; flex-direction: column;
    border-right: 1px solid #e2e8f0;
    background: #fafafa;
    overflow-y: auto;
  }
  .rm-profile-box { margin-bottom: 40px; }

  /* ── Stepper ── */
  .rm-stepper { display: flex; flex-direction: column; }

  /* ── Main content ── */
  .rm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .rm-scroll { flex: 1; padding: 40px 52px; overflow-y: auto; }
  .rm-actionbar { border-top: 1px solid #e2e8f0; padding: 20px 52px; background: #fff; flex-shrink: 0; }

  /* ── 2-col grid (inside form) ── */
  .rm-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

  /* ── Selection option grids ── */
  .rm-sel-grid { display: grid; gap: 10px; }

  /* ════════════════════════════════
     Tablet  (640 – 900px)
  ════════════════════════════════ */
  @media (max-width: 900px) and (min-width: 641px) {
    .rm-sidebar  { width: 220px; padding: 24px 20px; }
    .rm-scroll   { padding: 28px 28px; }
    .rm-actionbar{ padding: 16px 28px; }
    .rm-topnav   { padding: 18px 28px; }
  }

  /* ════════════════════════════════
     Mobile  (≤ 640px)
  ════════════════════════════════ */
  @media (max-width: 640px) {
    .rm-modal {
      height: 100dvh; max-height: 100dvh;
      border-radius: 0;
    }
    .rm-topnav { padding: 14px 16px; }

    /* Sidebar: profile on left, stepper on right */
    .rm-split   { flex-direction: column; }
    .rm-sidebar {
      width: auto; flex-shrink: 0;
      flex-direction: row; align-items: center;
      padding: 12px 16px; gap: 12px;
      border-right: none; border-bottom: 1px solid #e2e8f0;
      overflow: visible;
    }

    /* Profile block: image + text side by side, takes remaining space */
    .rm-profile-box {
      margin-bottom: 0;
      display: flex; align-items: center; gap: 10px;
      flex: 1; min-width: 0;
    }
    .rm-profile-name {
      font-size: 0.85rem !important;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rm-profile-img-mobile { width: 40px !important; height: 40px !important; }

    /* Stepper: vertical column of circles on the right */
    .rm-stepper {
      flex-direction: column;
      align-items: center;
      gap: 0;
      flex-shrink: 0;
    }
    .rm-step-container {
      flex-direction: column !important;
      align-items: center !important;
      gap: 0 !important;
    }
    .rm-step-indicator-wrap {
      flex-direction: column !important;
      width: 20px !important;
    }
    .rm-step-line {
      width: 2px !important;
      height: 14px !important;
      margin: 2px 0 !important;
    }
    .rm-step-label { display: none; }

    .rm-scroll    { padding: 20px 16px; }
    .rm-actionbar { padding: 14px 16px; }
    .rm-grid2     { grid-template-columns: 1fr; gap: 16px; }

    /* On mobile, collapse many-option grids to 2 columns */
    .rm-sel-many  { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

const ReviewModal = ({ faculty, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);

  // --- STEP 1 STATE ---
  const [satisfaction, setSatisfaction] = useState(0);
  const [recommend, setRecommend] = useState('');
  const [attendance, setAttendance] = useState('');
  const [approachability, setApproachability] = useState(0);

  // --- STEP 2 STATE ---
  const [ratings, setRatings] = useState({ clarity: 0, syllabus: 0, examAlignment: 0, leniency: 0, knowledgeDepth: 0 });
  const [courseReality, setCourseReality] = useState({
    workload: '', assignmentFreq: '', internalStyle: '',
    backgroundReq: '', avgStudentKeepUp: '', doubtHandling: '',
    cgpaGoal: '', knowledgeGoal: ''
  });

  // --- STEP 3 STATE ---
  const [context, setContext] = useState({ strengths: [], improvements: [], bestSuitedFor: [], learnerType: [] });
  const [feedback, setFeedback] = useState('');
  const [pledgeAccepted, setPledgeAccepted] = useState(false);

  // --- HANDLERS ---
  const handleStarClick = (category, value) => setRatings(prev => ({ ...prev, [category]: value }));
  const handleRealityClick = (category, value) => setCourseReality(prev => ({ ...prev, [category]: value }));

  const handleMultiSelect = (category, tag, max) => {
    setContext(prev => {
      const current = prev[category];
      if (current.includes(tag)) return { ...prev, [category]: current.filter(t => t !== tag) };
      if (current.length < max) return { ...prev, [category]: [...current, tag] };
      return prev;
    });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!pledgeAccepted) return;
    onSubmit({ satisfaction, recommend, attendance, approachability, ratings, courseReality, context, feedback });
  };

  // --- UI COMPONENTS ---

  const DribbbleSelector = ({ label, helper, category, options, stateObj, clickHandler }) => {
    const count = options.length;
    return (
      <div style={styles.formGroup}>
        <label style={styles.label}>{label}</label>
        {helper && <p style={styles.helperText}>{helper}</p>}
        <div
          className={`rm-sel-grid${count >= 4 ? ' rm-sel-many' : ''}`}
          style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}
        >
          {options.map(opt => {
            const isSelected = stateObj === opt || stateObj[category] === opt;
            return (
              <button
                key={opt} type="button"
                onClick={() => clickHandler(category, opt)}
                style={isSelected ? styles.selectBoxActive : styles.selectBox}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const DribbbleMultiSelector = ({ label, helper, category, options, max }) => (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      {helper && <p style={styles.helperText}>{helper}</p>}
      <div style={styles.tagGrid}>
        {options.map(opt => {
          const isSelected = context[category].includes(opt);
          return (
            <button
              key={opt} type="button"
              onClick={() => handleMultiSelect(category, opt, max)}
              style={isSelected ? styles.tagActive : styles.tagInactive}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );

  const StarRater = ({ label, helper, category }) => (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      {helper && <p style={styles.helperText}>{helper}</p>}
      <div style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star} onClick={() => handleStarClick(category, star)}
            style={{ ...styles.star, color: star <= ratings[category] ? '#f5a623' : '#e2e8f0' }}
          >★</span>
        ))}
      </div>
    </div>
  );

  const StepNode = ({ stepNum, currentStep, title }) => {
    const isCompleted = stepNum < currentStep;
    const isActive = stepNum === currentStep;
    return (
      <div className="rm-step-container" style={styles.stepContainer}>
        <div className="rm-step-indicator-wrap" style={styles.stepIndicatorWrapper}>
          {isCompleted ? (
            <div style={styles.stepCompleted}>✓</div>
          ) : isActive ? (
            <div style={styles.stepActiveRing}><div style={styles.stepActiveDot} /></div>
          ) : (
            <div style={styles.stepInactiveRing} />
          )}
          {stepNum !== 3 && <div className="rm-step-line" style={styles.stepLine(isCompleted)} />}
        </div>
        <span className="rm-step-label" style={isActive ? styles.stepTextActive : styles.stepText}>{title}</span>
      </div>
    );
  };

  const STEP_TITLES = ['The Pulse', 'Course Reality', 'Final Context'];

  return (
    <>
      <style>{RESPONSIVE_CSS}</style>
      <div style={styles.overlay}>
        <div className="rm-modal">

          {/* TOP NAV */}
          <div className="rm-topnav">
            <button onClick={onClose} style={styles.backLink}>
              ← <span>Back to dashboard</span>
            </button>
          </div>

          <div className="rm-split">

            {/* LEFT SIDEBAR */}
            <div className="rm-sidebar">
              {/* Faculty info */}
              <div className="rm-profile-box">
                <img
                  src={faculty.imageUrl} alt={faculty.name}
                  className="rm-profile-img-mobile"
                  style={styles.profileImg}
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(faculty.name) + '&background=0056b3&color=fff'; }}
                />
                <div style={{ minWidth: 0 }}>
                  <h3 className="rm-profile-name" style={styles.facultyName}>{faculty.name}</h3>
                  <p style={styles.facultyDept}>{faculty.department}</p>
                </div>
              </div>

              {/* Stepper — desktop: vertical, mobile: horizontal dots */}
              <div className="rm-stepper">
                {/* Desktop vertical stepper (hidden on mobile via CSS would need display toggling; we render both and use CSS) */}
                <div className="rm-stepper-desktop" style={{ display: 'contents' }}>
                  <StepNode stepNum={1} currentStep={step} title="The Pulse" />
                  <StepNode stepNum={2} currentStep={step} title="Course Reality" />
                  <StepNode stepNum={3} currentStep={step} title="Final Context" />
                </div>
              </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="rm-main">
              <div className="rm-scroll">

                <h1 style={styles.pageTitle}>
                  {STEP_TITLES[step - 1]}
                </h1>

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="rm-fade">
                    <DribbbleSelector
                      label="Overall Satisfaction" helper="How satisfied are you with this faculty's teaching?" category="satisfaction"
                      options={[1, 2, 3, 4, 5]} stateObj={satisfaction} clickHandler={(_, val) => setSatisfaction(val)}
                    />
                    <DribbbleSelector
                      label="Approachability" helper="How comfortable are students approaching this faculty for doubts?" category="approachability"
                      options={['1 (Hesitant)', '2 (Neutral)', '3 (Comfortable)', '4 (Very Comfortable)']}
                      stateObj={['', '1 (Hesitant)', '2 (Neutral)', '3 (Comfortable)', '4 (Very Comfortable)'][approachability]}
                      clickHandler={(_, val) => setApproachability(parseInt(val.charAt(0)))}
                    />
                    <div className="rm-grid2">
                      <DribbbleSelector
                        label="Would you recommend this professor?" category="recommend"
                        options={['👍 Yes', '😐 Depends', '👎 No']} stateObj={recommend} clickHandler={(_, val) => setRecommend(val)}
                      />
                      <DribbbleSelector
                        label="Your Class Attendance" category="attendance"
                        options={['> 90%', '75% - 90%', '< 75%']} stateObj={attendance} clickHandler={(_, val) => setAttendance(val)}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="rm-fade">
                    <div className="rm-grid2">
                      <StarRater label="Concept Clarity" category="clarity" />
                      <StarRater label="Exam Alignment" helper="Exams match what was taught in class?" category="examAlignment" />
                      <StarRater label="Marking Leniency" helper="Are internal marks given generously?" category="leniency" />
                      <StarRater label="Knowledge Depth" helper="Does this professor go beyond the syllabus?" category="knowledgeDepth" />
                    </div>

                    <div style={styles.divider} />

                    <DribbbleSelector
                      label="Subject Workload" helper="Based on assignments & teaching pace" category="workload"
                      options={['🟢 Light', '🟡 Moderate', '🔴 Heavy']} stateObj={courseReality} clickHandler={handleRealityClick}
                    />
                    <div className="rm-grid2">
                      <DribbbleSelector
                        label="Prior Background Needed?" category="backgroundReq"
                        options={['No — Beginner Friendly', 'Some basics help', 'Strong foundation needed']} stateObj={courseReality} clickHandler={handleRealityClick}
                      />
                      <DribbbleSelector
                        label="Internal Assessment Style" category="internalStyle"
                        options={['Mostly Objective', 'Mostly Descriptive', 'Mixed']} stateObj={courseReality} clickHandler={handleRealityClick}
                      />
                    </div>
                    <div className="rm-grid2">
                      <DribbbleSelector
                        label="Good for High CGPA?" helper="Would you recommend for scoring marks?" category="cgpaGoal"
                        options={['👍 Yes', '😐 Depends', '👎 No']} stateObj={courseReality} clickHandler={handleRealityClick}
                      />
                      <DribbbleSelector
                        label="Good for Deep Learning?" helper="Would you recommend for core understanding?" category="knowledgeGoal"
                        options={['👍 Yes', '😐 Depends', '👎 No']} stateObj={courseReality} clickHandler={handleRealityClick}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="rm-fade">
                    <DribbbleMultiSelector label="Top Strengths" helper="Select up to 3" category="strengths" max={3}
                      options={['Explains well', 'Friendly', 'Knowledgeable', 'Motivating', 'Well prepared', 'Interactive']} />
                    <DribbbleMultiSelector label="Areas for Growth" helper="Select up to 2" category="improvements" max={2}
                      options={['Teaching speed', 'Clarity', 'More examples needed', 'Doubt clearing', 'Strict Grading']} />

                    <div className="rm-grid2">
                      <DribbbleMultiSelector label="Best Suited For" helper="Select up to 2" category="bestSuitedFor" max={2}
                        options={['Beginners', 'Toppers', 'Slow learners', 'Independent learners', 'Research-oriented']} />
                      <DribbbleMultiSelector label="Learner Type That Benefits" helper="Select up to 2" category="learnerType" max={2}
                        options={['Self-study', 'Interactive', 'Exam-oriented', 'Concept-focused']} />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>✨ Honest Review for Juniors</label>
                      <textarea
                        maxLength="120" value={feedback} onChange={(e) => setFeedback(e.target.value)}
                        placeholder="e.g., 'Great for concepts but expect regular assignments...'"
                        style={styles.textArea}
                      />
                      <div style={styles.charCount}>{feedback.length} / 120</div>
                    </div>

                    <div style={styles.pledgeBox}>
                      <label style={styles.pledgeLabel}>
                        <input type="checkbox" checked={pledgeAccepted} onChange={(e) => setPledgeAccepted(e.target.checked)} style={styles.checkbox} />
                        <div>
                          <strong>🛡️Sastraite Pledge</strong>
                          <p style={styles.pledgeSubText}>I confirm this review is honest and contains no personal attacks. Reviews are moderated before publishing.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                <div style={{ height: '24px' }} />
              </div>

              {/* BOTTOM ACTION BAR */}
              <div className="rm-actionbar">
                <div style={styles.actionInner}>
                  {step > 1
                    ? <button type="button" onClick={() => setStep(step - 1)} style={styles.btnOutline}>← Back</button>
                    : <div />
                  }
                  {step < 3 ? (
                    <button
                      type="button" onClick={() => setStep(step + 1)}
                      disabled={step === 1 && (!satisfaction || !recommend || !attendance || !approachability)}
                      style={{ ...styles.btnPrimary, ...(step === 1 && (!satisfaction || !recommend || !attendance || !approachability) ? styles.btnDisabled : {}) }}
                    >Continue →</button>
                  ) : (
                    <button
                      type="button" onClick={handleFinalSubmit}
                      disabled={!pledgeAccepted}
                      style={{ ...styles.btnSubmit, ...(!pledgeAccepted ? styles.btnDisabled : {}) }}
                    >Publish Review</button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const THEME = {
  blue: '#2563eb',
  blueLight: '#eff6ff',
  textMain: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  bg: '#ffffff'
};

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },

  backLink: { background: 'none', border: 'none', color: THEME.textMuted, fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

  profileImg: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${THEME.border}`, flexShrink: 0 },
  facultyName: { margin: '0 0 4px 0', fontSize: '1.05rem', color: THEME.textMain, fontWeight: '700', lineHeight: 1.3 },
  facultyDept: { margin: 0, fontSize: '0.85rem', color: THEME.textMuted },

  // Stepper
  stepContainer: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  stepIndicatorWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 },
  stepCompleted: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: THEME.blue, color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' },
  stepActiveRing: { width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME.blue}`, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  stepActiveDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: THEME.blue },
  stepInactiveRing: { width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME.border}` },
  stepLine: (done) => ({ width: '2px', height: '30px', backgroundColor: done ? THEME.blue : THEME.border, margin: '4px 0' }),
  stepTextActive: { fontSize: '0.9rem', fontWeight: '600', color: THEME.textMain, marginTop: '2px' },
  stepText: { fontSize: '0.9rem', fontWeight: '500', color: THEME.textMuted, marginTop: '2px' },

  pageTitle: { margin: '0 0 32px 0', fontSize: '1.6rem', color: THEME.textMain, fontWeight: '700' },
  divider: { height: '1px', backgroundColor: THEME.border, margin: '28px 0' },

  formGroup: { marginBottom: '28px' },
  label: { display: 'block', fontSize: '0.95rem', fontWeight: '600', color: THEME.textMain, marginBottom: '6px' },
  helperText: { margin: '0 0 12px 0', fontSize: '0.83rem', color: THEME.textMuted },

  selectBox: { flex: 1, padding: '14px 10px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.textMain, fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', textAlign: 'center', minWidth: '80px' },
  selectBoxActive: { flex: 1, padding: '14px 10px', backgroundColor: THEME.blueLight, border: `1px solid ${THEME.blue}`, borderRadius: '8px', color: THEME.blue, fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', textAlign: 'center', minWidth: '80px' },

  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tagInactive: { padding: '9px 15px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', color: THEME.textMuted, fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' },
  tagActive: { padding: '9px 15px', backgroundColor: THEME.textMain, border: `1px solid ${THEME.textMain}`, borderRadius: '20px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' },

  starsContainer: { display: 'flex', gap: '8px' },
  star: { fontSize: '2rem', cursor: 'pointer', lineHeight: 1 },

  textArea: { width: '100%', height: '96px', padding: '14px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '0.95rem', color: THEME.textMain, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  charCount: { textAlign: 'right', marginTop: '6px', fontSize: '0.8rem', color: THEME.textMuted },

  pledgeBox: { backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: `1px solid ${THEME.border}`, marginTop: '16px' },
  pledgeLabel: { display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', color: THEME.textMain, fontSize: '0.95rem' },
  checkbox: { marginTop: '3px', width: '18px', height: '18px', accentColor: THEME.blue, flexShrink: 0 },
  pledgeSubText: { margin: '4px 0 0 0', fontSize: '0.83rem', color: THEME.textMuted },

  actionInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnOutline: { padding: '11px 22px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.textMain, fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnPrimary: { padding: '11px 28px', backgroundColor: THEME.blue, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnSubmit: { padding: '11px 28px', backgroundColor: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' }
};

export default ReviewModal;