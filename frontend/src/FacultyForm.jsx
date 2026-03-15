import { useState } from 'react';

const FacultyForm = ({ faculties, onReviewPosted }) => {
  const [selectedId, setSelectedId] = useState('');
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Select a faculty member first!");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faculty/${selectedId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (response.ok) {
        alert('Review published!');
        setReview({ rating: 5, comment: '' });
        onReviewPosted();
      }
    } catch (err) {
      console.error("Review failed:", err);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '20px auto' }}>
      <h2 style={{ color: '#0056b3', marginBottom: '20px', textAlign: 'center' }}>Post Senior Review</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <select 
          value={selectedId} 
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">-- Choose Faculty --</option>
          {faculties.map(f => (
            <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
          ))}
        </select>

        <label style={{ fontWeight: 'bold' }}>Rating:</label>
        <select 
            value={review.rating} 
            onChange={(e) => setReview({...review, rating: Number(e.target.value)})}
            style={{ padding: '10px' }}
        >
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
        </select>

        <textarea 
          placeholder="Write the detailed review..." 
          value={review.comment} 
          onChange={(e) => setReview({...review, comment: e.target.value})}
          style={{ padding: '12px', minHeight: '120px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />

        <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default FacultyForm;