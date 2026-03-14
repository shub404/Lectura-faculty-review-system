import React, { useState } from 'react';
import './App.css';

const FacultyCard = ({ faculty, onClick }) => {
  const [copied, setCopied] = useState(false);

  const rating = faculty.overallRating ? Number(faculty.overallRating).toFixed(1) : "0.0";
  const hasRating = rating !== "0.0";

  const handleEmailClick = (e) => {
    e.stopPropagation();
    if (!faculty.email || faculty.email === "No email provided") return;

    navigator.clipboard.writeText(faculty.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Clipboard failed", err));

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(faculty.email)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="faculty-card" onClick={onClick}>
      <div className="card-image-container">
        <img
          src={faculty.imageUrl}
          alt={faculty.name}
          className="card-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150/0056b3/FFFFFF?text=' + faculty.name.charAt(0);
          }}
        />
      </div>

      <div className="card-details">
        <h3 className="text-title">{faculty.name}</h3>
        <p className="text-body">{faculty.designation}</p>
        <p className="text-body" style={{ fontSize: '0.75rem', opacity: 0.8 }}>{faculty.department}</p>

        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--stitch-primary-light)',
            color: hasRating ? 'var(--stitch-primary)' : 'var(--color-text-muted)',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            ⭐ {hasRating ? rating : 'No Ratings'}
          </div>
        </div>

        {faculty.email && (
          <p
            className="text-body"
            style={{
              marginTop: '8px',
              fontSize: '0.7rem',
              cursor: 'pointer',
              color: copied ? 'var(--stitch-primary)' : 'inherit'
            }}
            onClick={handleEmailClick}
          >
            {copied ? '✅ Email Copied' : faculty.email}
          </p>
        )}
      </div>

      <button className="card-button">View Profile</button>
    </div>
  );
};

export default FacultyCard;