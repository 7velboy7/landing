const RESEND_ENDPOINT = 'https://api.resend.com/emails';

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

module.exports = async (req, res) => {
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

    if (!email || !message) {
        res.status(400).json({ ok: false, error: 'Email and message are required.' });
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
        res.status(500).json({ ok: false, error: 'Server email configuration is missing.' });
        return;
    }

    const identifier = name || email;
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'unknown';

    const adminText = [
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
    ].join('\n');

    const sendEmail = async (payload) => {
        const response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || 'Resend error');
        }
        return data;
    };

    try {
        await sendEmail({
            from: fromEmail,
            to: toEmail,
            subject: `New message from alexvelboy.com — ${identifier}`,
            reply_to: email,
            text: adminText
        });

        try {
            await sendEmail({
                from: fromEmail,
                to: email,
                subject: 'We received your message — Alex Velboy',
                text: 'Thanks for reaching out — your message has been delivered successfully.\nI’ll get back to you as soon as possible.\n— Alex Velboy (alexvelboy.com)'
            });
        } catch (error) {
            console.error('Resend auto-reply failed.', error);
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Resend admin email failed.', error);
        res.status(500).json({ ok: false, error: 'Failed to send message.' });
    }
};
