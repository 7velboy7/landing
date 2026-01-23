const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEPLOY_MARKER = 'v1.0.1';

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

const buildAdminText = ({ name, email, message, projectType, budget, timestamp, userAgent }) => ([
    'New inquiry from alexvelboy.com',
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

module.exports = async (req, res) => {
    console.log('CONTACT API DEPLOY MARKER:', DEPLOY_MARKER, new Date().toISOString());

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
        userAgent
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
            console.error(`Resend ${label} error.`, { status: response.status, data });
        }
        return { ok: response.ok, status: response.status, data };
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const sendReceiptWithRetry = async () => {
        let result = await sendEmail({
            from: fromEmail,
            to: email,
            subject: 'We received your message — Alex Velboy',
            text: 'Thanks for reaching out — your message has been delivered successfully.\nI’ll get back to you as soon as possible.\n— Alex Velboy (alexvelboy.com)'
        }, 'receipt');

        if (result.ok) {
            return { ok: true };
        }

        if (result.status === 429) {
            await delay(700);
            result = await sendEmail({
                from: fromEmail,
                to: email,
                subject: 'We received your message — Alex Velboy',
                text: 'Thanks for reaching out — your message has been delivered successfully.\nI’ll get back to you as soon as possible.\n— Alex Velboy (alexvelboy.com)'
            }, 'receipt_retry');
        }

        return { ok: result.ok, error: result.data?.message || 'Auto-reply failed.' };
    };

    try {
        const adminResult = await sendEmail({
            from: fromEmail,
            to: toEmail,
            subject: `New message from alexvelboy.com — ${identifier}`,
            reply_to: email,
            text: adminText
        }, 'admin');

        if (!adminResult.ok) {
            res.status(502).json({ ok: false, error: adminResult.data?.message || 'Failed to send message.' });
            return;
        }

        const receiptResult = await sendReceiptWithRetry();

        if (!receiptResult.ok) {
            console.warn('Resend auto-reply failed.', receiptResult.error);
        }

        res.status(200).json({ ok: true, receipt_ok: receiptResult.ok });
    } catch (error) {
        console.error('Resend admin email failed.', error);
        res.status(500).json({ ok: false, error: 'Failed to send message.' });
    }
};
