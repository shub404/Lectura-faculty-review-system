import React, { useState, useEffect } from 'react';
import FacultyCard from './FacultyCard';

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [schools] = useState([
    "School of Computing",
    "School of Civil Engineering",
    "School of Electrical & Electronics Engineering",
  ]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  useEffect(() => {
    if (selectedSchool) {
      fetch(`${import.meta.env.VITE_API_URL}/api/faculty?school=${encodeURIComponent(selectedSchool)}`)
        .then(res => res.json())
        .then(data => setFacultyList(data))
        .catch(err => console.error("Failed to fetch faculty:", err));
    }
  }, [selectedSchool]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Submitting...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/${selectedFaculty._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          adminId: adminUser.adminId,
        }),
      });

      if (response.ok) {
        setSubmitStatus('✅ Review added successfully!');
        setTimeout(() => {
          setSelectedFaculty(null);
          setSubmitStatus('');
          setReviewComment('');
          setReviewRating(5);
        }, 2000);
      } else {
        setSubmitStatus('❌ Failed to add review.');
      }
    } catch {
      setSubmitStatus('❌ Server error.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-page)', paddingBottom: '50px' }}>
      <header style={{
        backgroundColor: 'var(--color-bg-header)',
        color: 'var(--color-text-on-header)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', opacity: 0.6 }}>Logged in as: {adminUser.adminId}</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--color-text-on-header)',
            color: 'var(--color-text-on-header)',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {!selectedSchool ? (
          <div>
            <h2 style={{
              color: 'var(--color-text-primary)',
              borderBottom: '1px solid var(--color-border-subtle)',
              paddingBottom: '12px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
              fontWeight: '700',
            }}>
              Select a School to Manage
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {schools.map(school => (
                <button
                  key={school}
                  onClick={() => setSelectedSchool(school)}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    padding: '30px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    fontFamily: 'var(--font-heading)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-text-primary)';
                    e.currentTarget.style.color = 'var(--color-bg-card)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-card)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                >
                  {school}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.02em',
                fontWeight: '700',
              }}>
                Faculty in {selectedSchool}
              </h2>
              <button
                onClick={() => setSelectedSchool(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                ← Back to Schools
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {facultyList.map(faculty => (
                <FacultyCard
                  key={faculty._id}
                  faculty={faculty}
                  onClick={() => setSelectedFaculty(faculty)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedFaculty && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            padding: '30px',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ marginTop: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              Add Review for {selectedFaculty.name}
            </h3>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                  Rating (1–5)
                </label>
                <input
                  type="number" min="1" max="5"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                  Official Review Comment
                </label>
                <textarea
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Enter detailed feedback..."
                  required
                />
              </div>

              {submitStatus && (
                <p style={{ fontWeight: '600', color: submitStatus.includes('✅') ? '#22c55e' : '#dc3545', fontSize: '0.9rem' }}>
                  {submitStatus}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--color-text-primary)',
                    color: 'var(--color-bg-page)',
                    border: '1px solid var(--color-text-primary)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
