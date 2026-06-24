// ============================================
//  BZR HOMES — BACKEND SERVER  (upgraded)
//  Node.js + Express
//  Deploy to: Render.com (free)
// ============================================

const express    = require('express');
const cors       = require('cors');
const nodemailer = require('nodemailer');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- MIDDLEWARE ----
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve frontend — put your frontend folder at ../frontend relative to server.js
app.use(express.static(path.join(__dirname, '../frontend')));

// ---- EMAIL TRANSPORTER ----
let transporter = null;
if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,   // Gmail App Password (16 chars)
    },
  });
}

// ---- HEALTH CHECK ----
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ---- ENQUIRY ENDPOINT ----
app.post('/enquire', async (req, res) => {
  const { name, phone, email, unit_type, visit_date, message } = req.body;

  // Validation
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: 'Name and phone are required.' });
  }
  // Basic phone sanity check
  if (phone.replace(/\D/g, '').length < 8) {
    return res.status(400).json({ success: false, error: 'Please enter a valid phone number.' });
  }

  const enquiry = {
    name, phone, email, unit_type, visit_date, message,
    received_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };

  console.log('\n📩 NEW ENQUIRY:');
  console.log(JSON.stringify(enquiry, null, 2));

  // ---- EMAIL TO OWNER ----
  if (transporter) {
    try {
      await transporter.sendMail({
        from:    `"BZR Homes Website" <${process.env.EMAIL_FROM}>`,
        to:      process.env.EMAIL_TO || 'yogesh@bzrhomes.com',
        subject: `🏠 New Site Visit — ${name} (${phone})`,
        html: buildOwnerEmail(enquiry),
      });

      if (email) {
        await transporter.sendMail({
          from:    `"BZR Homes" <${process.env.EMAIL_FROM}>`,
          to:      email,
          subject: `Thank you ${name.split(' ')[0]}! Visit confirmed — BZR Homes`,
          html: buildProspectEmail(enquiry),
        });
      }

      console.log('✅ Emails sent.');
    } catch (err) {
      console.error('⚠️  Email error (enquiry still logged):', err.message);
    }
  } else {
    console.log('ℹ️  No email config — set EMAIL_FROM & EMAIL_PASSWORD in .env to enable emails.');
  }

  res.json({ success: true, message: 'Enquiry received. We will contact you within 30 minutes.' });
});

// ---- CATCH-ALL: serve frontend ----
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// ---- START ----
app.listen(PORT, () => {
  console.log(`\n🏠 BZR Homes server → http://localhost:${PORT}`);
  console.log(`   Email notifications: ${transporter ? '✅ enabled' : '⚠️  disabled (set EMAIL_FROM + EMAIL_PASSWORD)'}`);
});

// ---- EMAIL TEMPLATES ----
function buildOwnerEmail({ name, phone, email, unit_type, visit_date, message, received_at }) {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0ece4;padding:40px;border-radius:12px;">
      <h1 style="font-size:26px;font-weight:300;color:#c4922a;margin:0 0 4px;">BZR HOMES</h1>
      <p style="color:#555;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 28px;">New Enquiry</p>
      <table style="width:100%;border-collapse:collapse;font-size:15px;">
        <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #1a1a1a;width:35%;">Name</td>
            <td style="padding:10px 0;font-weight:600;border-bottom:1px solid #1a1a1a;">${name}</td></tr>
        <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #1a1a1a;">Phone</td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;"><a href="tel:${phone}" style="color:#c4922a;">${phone}</a></td></tr>
        ${email ? `<tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #1a1a1a;">Email</td>
            <td style="padding:10px 0;border-bottom:1px solid #1a1a1a;">${email}</td></tr>` : ''}
        <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #1a1a1a;">Interested In</td>
            <td style="padding:10px 0;text-transform:uppercase;border-bottom:1px solid #1a1a1a;">${unit_type || 'Not specified'}</td></tr>
        <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #1a1a1a;">Visit Date</td>
            <td style="padding:10px 0;color:#c4922a;font-weight:600;border-bottom:1px solid #1a1a1a;">${visit_date || 'Not specified'}</td></tr>
        ${message ? `<tr><td style="padding:10px 0;color:#888;vertical-align:top;">Message</td>
            <td style="padding:10px 0;">${message}</td></tr>` : ''}
      </table>
      <div style="margin-top:28px;">
        <a href="tel:${phone}" style="display:inline-block;background:#c4922a;color:#0a0a0a;padding:11px 22px;border-radius:99px;font-weight:700;text-decoration:none;font-size:14px;margin-right:10px;">
          📞 Call ${name.split(' ')[0]}
        </a>
        <a href="https://wa.me/91${phone.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:white;padding:11px 22px;border-radius:99px;font-weight:700;text-decoration:none;font-size:14px;">
          💬 WhatsApp
        </a>
      </div>
      <p style="margin-top:28px;color:#333;font-size:11px;border-top:1px solid #1a1a1a;padding-top:14px;">Received: ${received_at} IST</p>
    </div>
  `;
}

function buildProspectEmail({ name, phone }) {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0ece4;padding:40px;border-radius:12px;">
      <h1 style="font-size:22px;font-weight:300;color:#c4922a;margin:0 0 22px;">BZR HOMES</h1>
      <h2 style="font-size:19px;font-weight:400;margin:0 0 14px;">We've received your request, ${name.split(' ')[0]}!</h2>
      <p style="color:#9a9080;line-height:1.8;">Our team will call you within 30 minutes to confirm your site visit.</p>
      <div style="margin:24px 0;padding:18px;background:#111;border-radius:12px;border-left:3px solid #c4922a;">
        <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Project Address</p>
        <p style="margin:0;line-height:1.7;">Mahavir Enclave Street, Dadri Main Road<br/>Near Pillar No. 45, Baraula<br/>Sector 49, Noida – 201301</p>
      </div>
      <p style="color:#9a9080;">Call us directly: <a href="tel:9650404888" style="color:#c4922a;">+91 96504 04888</a></p>
    </div>
  `;
}
