import React, { useState, useEffect } from 'react';
// Assuming FacultyCard is in the same directory
import FacultyCard from './FacultyCard'; 

const AdminDashboard = ({ adminUser, onLogout }) => {
  const [schools, setSchools] = useState([
    "School of Computing", "School of Civil Engineering", "School of Electrical & Electronics Engineering"
  ]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  
  // Review Modal State
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');

  // Fetch faculty when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      // Replace with your actual backend fetch call
      fetch(`http://localhost:5000/api/faculty?school=${encodeURIComponent(selectedSchool)}`)
        .then(res => res.json())
        .then(data => setFacultyList(data))
        .catch(err => console.error("Failed to fetch faculty:", err));
    }
  }, [selectedSchool]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Submitting...');

    try {
      // Connect this to your backend POST / PUT route for reviews
      const response = await fetch(`http://localhost:5000/api/faculty/${selectedFaculty._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          adminId: adminUser.adminId
        })
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
    } catch (error) {
      setSubmitStatus('❌ Server error.');
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          <p style={styles.headerSubtitle}>Logged in as: {adminUser.adminId}</p>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.mainContent}>
        {!selectedSchool ? (
          <div>
            <h2 style={styles.sectionTitle}>Select a School to Manage</h2>
            <div style={styles.grid}>
              {schools.map(school => (
                <button 
                  key={school} 
                  style={styles.schoolBtn}
                  onClick={() => setSelectedSchool(school)}
                >
                  {school}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={styles.flexBetween}>
              <h2 style={styles.sectionTitle}>Faculty in {selectedSchool}</h2>
              <button onClick={() => setSelectedSchool(null)} style={styles.backBtn}>← Back to Schools</button>
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

      {/* Overlay Modal for Adding Review */}
      {selectedFaculty && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0 }}>Add Review for {selectedFaculty.name}</h3>
            
            <form onSubmit={handleReviewSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Rating (1-5)</label>
                <input 
                  type="number" min="1" max="5" 
                  value={reviewRating} 
                  onChange={(e) => setReviewRating(e.target.value)} 
                  style={styles.input} required 
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Official Review Comment</label>
                <textarea 
                  rows="4" 
                  value={reviewComment} 
                  onChange={(e) => setReviewComment(e.target.value)} 
                  style={styles.textarea} required 
                  placeholder="Enter detailed feedback..."
                />
              </div>

              {submitStatus && <p style={{ fontWeight: 'bold', color: submitStatus.includes('✅') ? 'green' : 'red' }}>{submitStatus}</p>}

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setSelectedFaculty(null)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  dashboard: { minHeight: '100vh', backgroundColor: '#f4f7f6', paddingBottom: '50px' },
  header: { backgroundColor: '#0056b3', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { margin: 0, fontSize: '1.5rem' },
  headerSubtitle: { margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 },
  logoutBtn: { backgroundColor: 'transparent', border: '1px solid white', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  mainContent: { maxWidth: '1200px', margin: '40px auto', padding: '0 20px' },
  sectionTitle: { color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' },
  schoolBtn: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '30px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', color: '#0056b3', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.2s' },
  flexBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { padding: '8px 16px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};

export default AdminDashboard;