import React, { useState } from 'react';

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
      if (current.includes(tag)) {
        return { ...prev, [category]: current.filter(t => t !== tag) };
      } else if (current.length < max) {
        return { ...prev, [category]: [...current, tag] };
      }
      return prev;
    });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!pledgeAccepted) return;
    onSubmit({ satisfaction, recommend, attendance, approachability, ratings, courseReality, context, feedback });
  };

  // --- UI COMPONENTS MATCHING DRIBBBLE REFERENCE ---
  
  // 1. The Dribbble Selection Cards (e.g., for Attendance, Workload)
  const DribbbleSelector = ({ label, helper, category, options, stateObj, clickHandler }) => (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      {helper && <p style={styles.helperText}>{helper}</p>}
      <div style={styles.selectionGrid(options.length)}>
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

  // 2. Multi-Select Tags (Strengths/Improvements)
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

  // 3. Elegant Star Rater
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

  // 4. Stepper Node Logic
  const StepNode = ({ stepNum, currentStep, title }) => {
    const isCompleted = stepNum < currentStep;
    const isActive = stepNum === currentStep;

    return (
      <div style={styles.stepContainer}>
        <div style={styles.stepIndicatorWrapper}>
          {isCompleted ? (
            <div style={styles.stepCompleted}>✓</div>
          ) : isActive ? (
            <div style={styles.stepActiveRing}><div style={styles.stepActiveDot} /></div>
          ) : (
            <div style={styles.stepInactiveRing} />
          )}
          {stepNum !== 3 && <div style={styles.stepLine(isCompleted)} />}
        </div>
        <span style={isActive ? styles.stepTextActive : styles.stepText}>{title}</span>
      </div>
    );
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dribbbleModal}>
        
        {/* TOP NAVIGATION HEADER (Like Dribbble) */}
        <div style={styles.topNav}>
          <button onClick={onClose} style={styles.backLink}>
            ← <span style={{ textDecoration: 'none' }}>Back to dashboard</span>
          </button>
        </div>

        <div style={styles.splitLayout}>
          
          {/* LEFT SIDEBAR: Profile & Stepper */}
          <div style={styles.sidebar}>
            {/* Faculty Info Card */}
            <div style={styles.profileBox}>
              <img src={faculty.imageUrl} alt={faculty.name} style={styles.profileImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/150/0056b3/FFFFFF?text=' + faculty.name.charAt(0); }} />
              <h3 style={styles.facultyName}>{faculty.name}</h3>
              <p style={styles.facultyDept}>{faculty.department}</p>
            </div>

            {/* Dribbble Stepper */}
            <div style={styles.stepperWrapper}>
              <StepNode stepNum={1} currentStep={step} title="The Pulse" />
              <StepNode stepNum={2} currentStep={step} title="Course Reality" />
              <StepNode stepNum={3} currentStep={step} title="Final Context" />
            </div>
          </div>

          {/* RIGHT MAIN CONTENT: The Form */}
          <div style={styles.mainContent}>
            
            <div style={styles.formScrollArea}>
              <h1 style={styles.pageTitle}>
                {step === 1 && "Initial Vibe Check"}
                {step === 2 && "Course Reality & Guidance"}
                {step === 3 && "Final Insights & Pledge"}
              </h1>

              {/* STEP 1 */}
              {step === 1 && (
                <div style={styles.fadeContainer}>
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
                  <div style={styles.grid2Col}>
                    <DribbbleSelector 
                      label="Recommend to juniors?" category="recommend"
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
                <div style={styles.fadeContainer}>
                  <div style={styles.grid2Col}>
                    <StarRater label="Concept Clarity" category="clarity" />
                    <StarRater label="Exam Alignment" helper="Exams match class teaching?" category="examAlignment" />
                    <StarRater label="Marking Leniency" helper="Are internals easy?" category="leniency" />
                    <StarRater label="Knowledge Depth" helper="Is it research-grade?" category="knowledgeDepth" />
                  </div>

                  <div style={styles.divider} />

                  <DribbbleSelector 
                    label="Subject Workload" helper="Based on assignments & teaching pace" category="workload" 
                    options={['🟢 Light', '🟡 Moderate', '🔴 Heavy']} stateObj={courseReality} clickHandler={handleRealityClick}
                  />
                  <div style={styles.grid2Col}>
                    <DribbbleSelector 
                      label="Prior Background Needed?" category="backgroundReq" 
                      options={['No - Beginner Friendly', 'Some basics help', 'Strong foundation needed']} stateObj={courseReality} clickHandler={handleRealityClick}
                    />
                    <DribbbleSelector 
                      label="Internal Assessment Style" category="internalStyle" 
                      options={['Mostly Objective', 'Mostly Descriptive', 'Mixed']} stateObj={courseReality} clickHandler={handleRealityClick}
                    />
                  </div>
                  <div style={styles.grid2Col}>
                    <DribbbleSelector 
                      label="Goal: High CGPA?" helper="Recommend for easy marks?" category="cgpaGoal" 
                      options={['👍 Yes', '😐 Depends', '👎 No']} stateObj={courseReality} clickHandler={handleRealityClick}
                    />
                    <DribbbleSelector 
                      label="Goal: Deep Knowledge?" helper="Recommend for core understanding?" category="knowledgeGoal" 
                      options={['👍 Yes', '😐 Depends', '👎 No']} stateObj={courseReality} clickHandler={handleRealityClick}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div style={styles.fadeContainer}>
                  <DribbbleMultiSelector label="Top Strengths" helper="Select up to 3" category="strengths" max={3} options={['Explains well', 'Friendly', 'Knowledgeable', 'Motivating', 'Well prepared', 'Interactive']} />
                  <DribbbleMultiSelector label="Areas for Growth" helper="Select up to 2" category="improvements" max={2} options={['Teaching speed', 'Clarity', 'More examples needed', 'Doubt clearing', 'Strict Grading']} />
                  
                  <div style={styles.grid2Col}>
                    <DribbbleMultiSelector label="Best Suited For" helper="Select up to 2" category="bestSuitedFor" max={2} options={['Beginners', 'Toppers', 'Slow learners', 'Independent learners', 'Research-oriented']} />
                    <DribbbleMultiSelector label="Benefiting Learner Type" helper="Select up to 2" category="learnerType" max={2} options={['Self-study', 'Interactive', 'Exam-oriented', 'Concept-focused']} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>✨ One Honest Line for Juniors</label>
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
                        <strong>Team Aperture Pledge</strong>
                        <p style={styles.pledgeSubText}>I confirm this review is honest and contains no personal attacks. Reviews are moderated before publishing.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Extra spacing at the bottom of scroll */}
              <div style={{ height: '40px' }} />
            </div>

            {/* BOTTOM ACTION BAR */}
            <div style={styles.actionBar}>
              <div style={styles.actionInner}>
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} style={styles.btnOutline}>← Back</button>
                ) : <div/>}

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
  );
};

// --- CSS-in-JS: Dribbble Aesthetic ---
const THEME = {
  blue: '#2563eb',          // Vibrant action blue
  blueLight: '#eff6ff',     // Selected background
  textMain: '#0f172a',      // Slate 900
  textMuted: '#64748b',     // Slate 500
  border: '#e2e8f0',        // Slate 200
  bg: '#ffffff'
};

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  dribbbleModal: { display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1150px', height: '88vh', maxHeight: '850px', backgroundColor: THEME.bg, borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' },
  
  // Top Nav
  topNav: { padding: '24px 40px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center' },
  backLink: { background: 'none', border: 'none', color: THEME.textMuted, fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

  // Layout
  splitLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  
  // Sidebar (Left)
  sidebar: { width: '320px', padding: '40px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.border}`, backgroundColor: '#fafafa' },
  profileBox: { marginBottom: '50px', textAlign: 'left' },
  profileImg: { width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: `1px solid ${THEME.border}` },
  facultyName: { margin: '0 0 4px 0', fontSize: '1.25rem', color: THEME.textMain, fontWeight: '700' },
  facultyDept: { margin: 0, fontSize: '0.9rem', color: THEME.textMuted },
  
  // Stepper
  stepperWrapper: { display: 'flex', flexDirection: 'column' },
  stepContainer: { display: 'flex', alignItems: 'flex-start', gap: '16px' },
  stepIndicatorWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' },
  stepCompleted: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: THEME.blue, color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' },
  stepActiveRing: { width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME.blue}`, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  stepActiveDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: THEME.blue },
  stepInactiveRing: { width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME.border}` },
  stepLine: (isCompleted) => ({ width: '2px', height: '32px', backgroundColor: isCompleted ? THEME.blue : THEME.border, margin: '4px 0' }),
  stepTextActive: { fontSize: '0.95rem', fontWeight: '600', color: THEME.textMain, marginTop: '2px' },
  stepText: { fontSize: '0.95rem', fontWeight: '500', color: THEME.textMuted, marginTop: '2px' },

  // Main Content (Right)
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
  formScrollArea: { flex: 1, padding: '40px 60px', overflowY: 'auto' },
  pageTitle: { margin: '0 0 40px 0', fontSize: '1.75rem', color: THEME.textMain, fontWeight: '700' },
  fadeContainer: { animation: 'fadeIn 0.3s ease' },
  divider: { height: '1px', backgroundColor: THEME.border, margin: '30px 0' },
  
  // Form Elements
  formGroup: { marginBottom: '32px' },
  label: { display: 'block', fontSize: '0.95rem', fontWeight: '600', color: THEME.textMain, marginBottom: '6px' },
  helperText: { margin: '0 0 12px 0', fontSize: '0.85rem', color: THEME.textMuted },
  grid2Col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  
  // Selection Cards (The Dribbble aesthetic)
  selectionGrid: (count) => ({ display: 'flex', gap: '12px', flexWrap: count > 3 ? 'wrap' : 'nowrap' }),
  selectBox: { flex: 1, padding: '16px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.textMain, fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center', minWidth: '120px' },
  selectBoxActive: { flex: 1, padding: '16px', backgroundColor: THEME.blueLight, border: `1px solid ${THEME.blue}`, borderRadius: '8px', color: THEME.blue, fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', textAlign: 'center', minWidth: '120px' },
  
  // Tags
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tagInactive: { padding: '10px 16px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '20px', color: THEME.textMuted, fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' },
  tagActive: { padding: '10px 16px', backgroundColor: THEME.textMain, border: `1px solid ${THEME.textMain}`, borderRadius: '20px', color: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' },
  
  // Stars
  starsContainer: { display: 'flex', gap: '8px' },
  star: { fontSize: '2rem', cursor: 'pointer', lineHeight: 1 },
  
  // Text Area
  textArea: { width: '100%', height: '100px', padding: '16px', border: `1px solid ${THEME.border}`, borderRadius: '8px', fontSize: '0.95rem', color: THEME.textMain, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  charCount: { textAlign: 'right', marginTop: '8px', fontSize: '0.8rem', color: THEME.textMuted },
  
  // Pledge
  pledgeBox: { backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: `1px solid ${THEME.border}`, marginTop: '20px' },
  pledgeLabel: { display: 'flex', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', color: THEME.textMain, fontSize: '0.95rem' },
  checkbox: { marginTop: '4px', width: '18px', height: '18px', accentColor: THEME.blue },
  pledgeSubText: { margin: '4px 0 0 0', fontSize: '0.85rem', color: THEME.textMuted },

  // Action Bar (Bottom sticky)
  actionBar: { borderTop: `1px solid ${THEME.border}`, padding: '24px 60px', backgroundColor: '#fff' },
  actionInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  btnOutline: { padding: '12px 24px', backgroundColor: '#fff', border: `1px solid ${THEME.border}`, borderRadius: '8px', color: THEME.textMain, fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnPrimary: { padding: '12px 32px', backgroundColor: THEME.blue, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnSubmit: { padding: '12px 32px', backgroundColor: '#10b981', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' }
};

export default ReviewModal;