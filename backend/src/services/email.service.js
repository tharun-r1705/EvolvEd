'use strict';

const { Resend } = require('resend');
const config = require('../config');

let resendClient = null;

function getResendClient() {
  if (!config.resend.apiKey) {
    return null; // dev/graceful degradation mode
  }
  if (!resendClient) {
    resendClient = new Resend(config.resend.apiKey);
  }
  return resendClient;
}

/**
 * Build a branded HTML email for shortlist notifications.
 */
function buildShortlistEmail({ studentName, jobTitle, companyName, recruiterName, customMessage }) {
  const previewText = `Congratulations! You've been shortlisted for ${jobTitle} at ${companyName}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${previewText}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #e8e3de; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #e8e3de; padding: 40px 16px; }
    .card { max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background-color: #0B1E33; padding: 32px 40px 24px; text-align: center; }
    .logo-text { color: #c6a43f; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-sub { color: #94a3b8; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    .badge { display: inline-block; background-color: #c6a43f; color: #0B1E33; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-top: 16px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .intro { font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px; }
    .highlight-box { background-color: #f8f6f3; border-left: 4px solid #c6a43f; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px; }
    .highlight-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin: 0 0 4px; }
    .highlight-value { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0; }
    .highlight-company { font-size: 14px; color: #475569; margin: 2px 0 0; }
    .custom-message { background-color: #f1f5f9; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; font-size: 14px; color: #334155; line-height: 1.6; font-style: italic; }
    .custom-message-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #94a3b8; margin-bottom: 8px; font-style: normal; }
    .steps { margin: 0 0 28px; }
    .steps-title { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .step { display: flex; align-items: flex-start; margin-bottom: 10px; }
    .step-num { background-color: #c6a43f; color: #0B1E33; font-size: 11px; font-weight: 800; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 10px; margin-top: 1px; }
    .step-text { font-size: 14px; color: #475569; line-height: 1.5; }
    .cta-btn { display: block; width: fit-content; background-color: #c6a43f; color: #0B1E33; font-size: 15px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 8px; margin: 0 auto 28px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 0 0 24px; }
    .recruiter-sig { font-size: 14px; color: #64748b; line-height: 1.6; }
    .recruiter-name { font-weight: 700; color: #1e293b; }
    .footer { background-color: #0B1E33; padding: 20px 40px; text-align: center; }
    .footer-text { font-size: 12px; color: #64748b; margin: 0; line-height: 1.6; }
    .footer-brand { color: #c6a43f; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <div class="logo-text">EvolvEd</div>
        <div class="logo-sub">Placement Readiness Intelligence</div>
        <div class="badge">Shortlist Notification</div>
      </div>

      <!-- Body -->
      <div class="body">
        <p class="greeting">Congratulations, ${escapeHtml(studentName)}!</p>
        <p class="intro">
          We're excited to let you know that you've been shortlisted for an opportunity that matches your profile and skills.
          This is a great recognition of your hard work and readiness on EvolvEd.
        </p>

        <!-- Job highlight -->
        <div class="highlight-box">
          <p class="highlight-label">You've been shortlisted for</p>
          <p class="highlight-value">${escapeHtml(jobTitle)}</p>
          <p class="highlight-company">at ${escapeHtml(companyName)}</p>
        </div>

        ${customMessage ? `
        <!-- Recruiter message -->
        <div class="custom-message">
          <div class="custom-message-label">Message from the recruiter</div>
          ${escapeHtml(customMessage)}
        </div>
        ` : ''}

        <!-- Next steps -->
        <div class="steps">
          <p class="steps-title">What happens next?</p>
          <div class="step">
            <span class="step-num">1</span>
            <span class="step-text">Keep your EvolvEd profile up to date — the recruiter will review it.</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span class="step-text">Watch your email for interview scheduling details from the recruiter.</span>
          </div>
          <div class="step">
            <span class="step-num">3</span>
            <span class="step-text">Continue practicing assessments to stay sharp and improve your readiness score.</span>
          </div>
        </div>

        <hr class="divider" />

        <p class="recruiter-sig">
          This notification was sent by <span class="recruiter-name">${escapeHtml(recruiterName)}</span>
          on behalf of <span class="recruiter-name">${escapeHtml(companyName)}</span>
          via the EvolvEd Recruiter Portal.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} <span class="footer-brand">EvolvEd</span> &mdash; Placement Readiness Intelligence<br />
          You received this email because your institution uses EvolvEd for placement tracking.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/** Basic HTML entity escaping to prevent XSS in email content. */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send a single shortlist notification email.
 * Returns { success: boolean, id?: string, error?: string }
 */
async function sendShortlistEmail({ to, studentName, jobTitle, companyName, recruiterName, customMessage }) {
  const client = getResendClient();

  if (!client) {
    console.warn('[email.service] RESEND_API_KEY not set — skipping real email send (dev mode). Would send to:', to);
    return { success: true, id: `dev-mock-${Date.now()}`, mock: true };
  }

  try {
    const html = buildShortlistEmail({ studentName, jobTitle, companyName, recruiterName, customMessage });
    const { data, error } = await client.emails.send({
      from: config.resend.fromEmail,
      to: [to],
      subject: `You've been shortlisted for ${jobTitle} at ${companyName}`,
      html,
    });

    if (error) {
      console.error('[email.service] Resend error for', to, error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
  } catch (err) {
    console.error('[email.service] Unexpected error sending to', to, err);
    return { success: false, error: err.message };
  }
}

/**
 * Send shortlist emails to multiple recipients in parallel.
 * @param {Array<{ email: string, name: string }>} recipients
 * @param {{ jobTitle: string, companyName: string }} jobInfo
 * @param {{ name: string }} recruiterInfo
 * @param {string|undefined} customMessage
 * @returns {{ sent: number, failed: number, results: Array }}
 */
async function sendShortlistEmailsBatch(recipients, jobInfo, recruiterInfo, customMessage) {
  const results = await Promise.allSettled(
    recipients.map((r) =>
      sendShortlistEmail({
        to: r.email,
        studentName: r.name,
        jobTitle: jobInfo.jobTitle,
        companyName: jobInfo.companyName,
        recruiterName: recruiterInfo.name,
        customMessage,
      })
    )
  );

  let sent = 0;
  let failed = 0;
  const details = results.map((result, idx) => {
    if (result.status === 'fulfilled' && result.value.success) {
      sent++;
      return { email: recipients[idx].email, success: true, id: result.value.id, mock: result.value.mock };
    } else {
      failed++;
      const reason = result.status === 'rejected' ? result.reason?.message : result.value?.error;
      return { email: recipients[idx].email, success: false, error: reason };
    }
  });

  return { sent, failed, total: recipients.length, results: details };
}

module.exports = { sendShortlistEmail, sendShortlistEmailsBatch };
