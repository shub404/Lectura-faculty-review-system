const express = require('express');
const crypto = require('crypto');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const OTPRequest = require('../models/OTPRequest');
const AdminSession = require('../models/AdminSession');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const SESSION_DURATION_MS = 30 * 60 * 1000;

const WHITELIST = (process.env.ADMIN_WHITELIST || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

function signToken(email, expiresIn) {
  return jwt.sign({ adminEmail: email }, process.env.JWT_SECRET, { expiresIn });
}

async function createSession(email) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await AdminSession.findOneAndUpdate(
    { email },
    { email, expiresAt, createdAt: new Date() },
    { upsert: true, new: true }
  );
}

// ─── POST /api/auth/request-otp ─────────────────────────────────────────────
router.post('/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const normalized = email.trim().toLowerCase();

    // 1. Whitelisted — always instant, no session tracking needed, long-lived token
    if (WHITELIST.includes(normalized)) {
      const token = signToken(normalized, '24h');
      return res.json({ token, adminEmail: normalized, whitelisted: true });
    }

    // 2. Active OTP session — skip OTP, token expires with existing session
    const activeSession = await AdminSession.findOne({
      email: normalized,
      expiresAt: { $gt: new Date() },
    });

    if (activeSession) {
      const secondsLeft = Math.max(1, Math.floor((activeSession.expiresAt - Date.now()) / 1000));
      const token = signToken(normalized, secondsLeft);
      return res.json({ token, adminEmail: normalized, sessionActive: true });
    }

    // 3. Unknown user — send OTP to admin for approval
    await OTPRequest.deleteMany({ email: normalized });

    const otp = String(crypto.randomInt(100000, 999999));
    await OTPRequest.create({
      email: normalized,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await resend.emails.send({
      from: 'Lectura Portal <onboarding@resend.dev>',
      to: process.env.OWNER_EMAIL,
      subject: `Admin Access Request — ${email}`,
      html: `
        <div style="font-family: 'Courier New', monospace; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9f9f9; border: 1px solid #e0e0e0;">
          <h2 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #000; letter-spacing: -0.02em;">Admin Access Request</h2>
          <p style="margin: 0 0 24px 0; font-size: 0.8rem; color: #666;">Lectura Portal — SASTRA University</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="padding: 8px 0; font-size: 0.85rem; color: #666; border-bottom: 1px solid #eee;">Requesting Email</td>
              <td style="padding: 8px 0; font-size: 0.85rem; color: #000; font-weight: 600; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 0.85rem; color: #666;">Time</td>
              <td style="padding: 8px 0; font-size: 0.85rem; color: #000;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
            </tr>
          </table>
          <div style="background: #000; color: #fff; padding: 24px; text-align: center; border-radius: 2px; margin-bottom: 16px;">
            <p style="margin: 0 0 8px 0; font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.6;">One-Time Password</p>
            <p style="margin: 0; font-size: 2.4rem; letter-spacing: 0.5em; font-weight: 700;">${otp}</p>
          </div>
          <p style="margin: 0; font-size: 0.75rem; color: #999; text-align: center;">Expires in 10 minutes. Share only if you recognize this request.</p>
        </div>
      `,
    });

    res.json({ message: 'OTP sent to administrator.' });
  } catch (err) {
    console.error('❌ OTP Request Error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Check server email configuration.' });
  }
});

// ─── POST /api/auth/verify-otp ──────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required.' });

    const normalized = email.trim().toLowerCase();

    const record = await OTPRequest.findOne({
      email: normalized,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(401).json({ error: 'OTP has expired or was not found. Please request a new one.' });
    }

    if (otp.trim() !== record.otp) {
      return res.status(401).json({ error: 'Incorrect OTP. Please try again.' });
    }

    record.used = true;
    await record.save();

    // Create 30-min session — re-login within this window skips OTP
    await createSession(normalized);
    const token = signToken(normalized, '30m');

    res.json({ token, adminEmail: normalized });
  } catch (err) {
    console.error('❌ OTP Verify Error:', err.message);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

module.exports = router;
