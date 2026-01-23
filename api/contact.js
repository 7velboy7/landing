const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEPLOY_MARKER = 'v1.0.2';

const isValidEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

const parseBody = (body) => {
    if (!body) return {};
    if (typeof body === 'string') {
        try {
            return JSON.parse(body);
        } catch (error) {
            return {};
        }
    }
    return body;
};

const escapeHtml = (value) => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const buildAdminText = ({ name, email, message, projectType, budget, timestamp, userAgent, requestId }) => ([
    'New inquiry from alexvelboy.com',
    `Request ID: ${requestId}`,
    '',
    `Name: ${name || 'Not provided'}`,
    `Email: ${email}`,
    `Project Type: ${projectType || 'Not provided'}`,
    `Budget: ${budget || 'Not provided'}`,
    '',
    'Message:',
    message,
    '',
    `Timestamp: ${timestamp}`,
    `User Agent: ${userAgent}`
].join('\n'));

const buildReceiptHtml = ({ name, message, year }) => {
    const safeName = escapeHtml(name || 'there');
    const safeMessage = escapeHtml(message || '');

    return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>We received your message</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      Thanks — your message has been received.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:92vw;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:24px 28px;background:#111111;">
                <div style="font:700 18px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#ffffff;">
                  Alex Velboy
                </div>
                <div style="font:400 13px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:rgba(255,255,255,0.75);margin-top:4px;">
                  Message received
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <div style="font:700 22px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#111111;">
                  Thanks, ${safeName} 👋
                </div>

                <div style="font:400 15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#333333;margin-top:12px;">
                  Your message has been delivered successfully. I’ll get back to you as soon as possible.
                </div>

                <div style="margin-top:18px;padding:14px 16px;background:#f3f3f3;border-radius:12px;">
                  <div style="font:600 12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#666;">
                    Your message
                  </div>
                  <div style="font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#111;margin-top:6px;white-space:pre-wrap;">
                    ${safeMessage}
                  </div>
                </div>

                <div style="margin-top:22px;">
                  <a href="https://alexvelboy.com" style="display:inline-block;background:#ffdb3a;color:#111;text-decoration:none;font:700 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;padding:12px 16px;border-radius:12px;">
                    Visit alexvelboy.com
                  </a>
                </div>

                <div style="font:400 12px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#777;margin-top:18px;">
                  — Alex Velboy<br/>
                  <a href="mailto:itsme@alexvelboy.com" style="color:#777;text-decoration:underline;">itsme@alexvelboy.com</a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px;background:#fafafa;font:400 11px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#888;">
                This is an automated confirmation. If you didn’t send this message, you can ignore this email.
              </td>
            </tr>
          </table>

          <div style="font:400 11px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;color:#999;margin-top:12px;">
            © ${year} Alex Velboy
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

module.exports = async (req, res) => {
    const requestId = Math.random().toString(36).slice(2, 8);
    console.log('CONTACT API DEPLOY MARKER:', DEPLOY_MARKER, new Date().toISOString(), `req:${requestId}`);

    if (req.method === 'GET') {
        res.status(200).json({ ok: true, marker: DEPLOY_MARKER });
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed.' });
        return;
    }

    const body = parseBody(req.body);
    const name = (body.name || '').toString().trim();
    const email = (body.email || '').toString().trim();
    const message = (body.message || '').toString().trim();
    const website = (body.website || '').toString().trim();
    const projectType = (body.projectType || '').toString().trim();
    const budget = (body.budget || '').toString().trim();

    if (website) {
        res.status(200).json({ ok: true });
        return;
    }

    if (!name || !email || !message) {
        res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({ ok: false, error: 'Invalid email address.' });
        return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
        console.error('Missing RESEND_API_KEY/CONTACT_TO_EMAIL/CONTACT_FROM_EMAIL.');
        res.status(500).json({ ok: false, error: 'Server email configuration is missing.' });
        return;
    }

    const identifier = name || email;
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'unknown';
    const adminText = buildAdminText({
        name,
        email,
        message,
        projectType,
        budget,
        timestamp,
        userAgent,
        requestId
    });

    const sendEmail = async (payload, label) => {
        const response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error(`Resend ${label} error.`, { status: response.status, data, requestId });
        }
        return { ok: response.ok, status: response.status, data };
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const receiptHtml = buildReceiptHtml({
        name,
        message,
        year: new Date().getFullYear()
    });
    const receiptPayload = {
        from: fromEmail,
        to: email,
        subject: 'We received your message — Alex Velboy',
        text: 'Thanks for reaching out — your message has been delivered successfully.\nI’ll get back to you as soon as possible.\n— Alex Velboy (alexvelboy.com)',
        html: receiptHtml
    };

    try {
        const adminResult = await sendEmail({
            from: fromEmail,
            to: toEmail,
            subject: `[req:${requestId}] New message from alexvelboy.com — ${identifier}`,
            reply_to: email,
            text: adminText
        }, 'admin');

        if (!adminResult.ok) {
            res.status(502).json({ ok: false, error: adminResult.data?.message || 'Failed to send message.' });
            return;
        }

        await delay(700);
        let receiptResult = await sendEmail(receiptPayload, 'receipt');

        if (!receiptResult.ok && receiptResult.status === 429) {
            await delay(1000);
            receiptResult = await sendEmail(receiptPayload, 'receipt_retry');
        }

        if (!receiptResult.ok) {
            console.warn('Resend auto-reply failed.', {
                error: receiptResult.data?.message || 'Auto-reply failed.',
                status: receiptResult.status,
                requestId
            });
        }

        res.status(200).json({ ok: true, receipt_ok: Boolean(receiptResult.ok) });
    } catch (error) {
        console.error('Resend admin email failed.', { error, requestId });
        res.status(500).json({ ok: false, error: 'Failed to send message.' });
    }
};
