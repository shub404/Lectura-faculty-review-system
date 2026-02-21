import { useState, useEffect } from 'react';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  
  // Captcha State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaInput('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Captcha Validation
    if (parseInt(captchaInput) !== (num1 + num2)) {
      setError('Incorrect Captcha. Please try again.');
      generateCaptcha();
      return;
    }

    // Basic Credential Validation (Mocked for frontend)
    if (adminId.trim() === '' || password.trim() === '') {
      setError('Please enter both Admin ID and Password.');
      return;
    }

    // Pass the authenticated ID back to App.jsx
    onLoginSuccess(adminId);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <div style={{ backgroundColor: '#0056b3', padding: '25px 20px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>Admin Portal Access</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} style={{ padding: '30px 25px' }}>
          {error && <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #ef9a9a' }}>{error}</div>}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>Admin ID</label>
            <input 
              type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }} 
              placeholder="e.g., ADM-101" required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box' }} 
              placeholder="••••••••" required
            />
          </div>

          <div style={{ marginBottom: '25px', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>
              Security Check: {num1} + {num2} = ?
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }} 
                placeholder="Answer" required
              />
              <button type="button" onClick={generateCaptcha} style={{ padding: '0 15px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>
                ↻
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onCancel} style={{ flex: 1, padding: '14px', backgroundColor: '#f1f3f5', color: '#333', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ flex: 2, padding: '14px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Secure Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;