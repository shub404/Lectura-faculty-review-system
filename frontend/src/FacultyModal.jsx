import { QRCodeSVG } from 'qrcode.react';

const FacultyModal = ({ faculty, onClose }) => {
  if (!faculty) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
      alignItems: 'center', zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '900px', height: '90vh',
        borderRadius: '12px', overflow: 'hidden', position: 'relative',
        display: 'flex', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: '#eee',
          border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#333',
          width: '35px', height: '35px', borderRadius: '50%', zIndex: 10
        }}>✕</button>

        {/* Blue Sidebar (Matches SASTRA UI) */}
        <div style={{ backgroundColor: '#0056b3', color: 'white', width: '220px', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '25px', flexShrink: 0 }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: '5px' }}>SCHOOL</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: '5px' }}>DESIGNATION</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: '5px' }}>DEPARTMENT</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: '5px' }}>QUALIFICATIONS</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: '5px' }}>AREAS OF INTEREST</div>
          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginTop: 'auto' }}>ORCID QR</div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '30px', borderBottom: '4px solid #f0f2f5' }}>
            <h2 style={{ color: '#0056b3', marginBottom: '20px' }}>{faculty.name}</h2>
            <div style={{ display: 'grid', gap: '26px', color: '#444' }}>
              <div>{faculty.school}</div>
              <div>{faculty.designation}</div>
              <div>{faculty.department}</div>
              <div>{faculty.qualifications || 'Data not available'}</div>
              <div>{faculty.areasOfInterest || 'General Computing'}</div>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <QRCodeSVG value={`https://orcid.org/${faculty.name.replace(/\s+/g, '')}`} size={120} includeMargin={true} />
                <p style={{ fontSize: '0.75rem', color: '#777', marginTop: '8px' }}>Scan for ORCID Profile</p>
            </div>
          </div>

          {/* Review History Section */}
          <div style={{ padding: '30px', backgroundColor: '#f9f9f9', flexGrow: 1 }}>
            <h3 style={{ color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                Senior Reviews 
                <span style={{ fontSize: '0.9rem', backgroundColor: '#0056b3', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                    {faculty.reviews?.length || 0}
                </span>
            </h3>
            
            {faculty.reviews && faculty.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {faculty.reviews.map((rev, index) => (
                  <div key={index} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0056b3' }}>⭐ {rev.rating}/5</span>
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(rev.date).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}>No senior reviews posted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyModal;