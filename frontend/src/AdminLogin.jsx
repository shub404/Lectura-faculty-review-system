import { useState } from 'react';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slowWarning, setSlowWarning] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-body)',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    fontSize: '0.88rem',
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setSlowWarning(false);
    const slowTimer = setTimeout(() => setSlowWarning(true), 8000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Request failed.');
        return;
      }

      setStep('otp');
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Server may be starting up — please try again.');
      } else {
        setError('Could not reach the server. Please try again.');
      }
    } finally {
      clearTimeout(slowTimer);
      clearTimeout(timeoutId);
      setSlowWarning(false);
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        return;
      }

      onLoginSuccess(data.token, data.adminEmail);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '10px',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          backgroundColor: 'var(--color-bg-header)',
          padding: '25px 20px',
          textAlign: 'center',
          color: 'var(--color-text-on-header)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Admin Portal Access
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.6 }}>Authorized Personnel Only</p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} style={{ padding: '30px 25px' }}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                textAlign: 'center',
                border: '1px solid rgba(220, 53, 69, 0.3)',
              }}>
                {error}
              </div>
            )}

            {slowWarning && (
              <div style={{
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                color: '#856404',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.82rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 193, 7, 0.3)',
              }}>
                Server is waking up, please wait a moment...
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Your Authorized Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="you@example.com"
                required
                autoFocus
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                The administrator will receive an OTP to approve your request.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onCancel}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Request Access'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ padding: '30px 25px' }}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                color: '#dc3545',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '0.85rem',
                textAlign: 'center',
                border: '1px solid rgba(220, 53, 69, 0.3)',
              }}>
                {error}
              </div>
            )}

            <div style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '24px',
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              lineHeight: '1.5',
            }}>
              OTP sent to the administrator for <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>.
              Contact the administrator and enter the code they provide.
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4em', fontWeight: '700' }}
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="admin-btn admin-btn-secondary"
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
