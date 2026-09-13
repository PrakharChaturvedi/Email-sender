import express from 'express';
import cors from 'cors';
import multer from 'multer';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024, files: 10 }, // 20MB per file, 10 files max
});

// ---------- helpers ----------

function buildTransport({ email, appPassword, host, port, secure }) {
    const cleanEmail = email ? String(email).trim() : '';
    const cleanPass = appPassword ? String(appPassword).replace(/\s+/g, '') : '';
    return nodemailer.createTransport({
        host: host && host.trim() ? host.trim() : 'smtp.gmail.com',
        port: port ? Number(port) : 465,
        secure: secure === undefined || secure === null || secure === ''
            ? true
            : secure === true || secure === 'true',
        auth: { user: cleanEmail, pass: cleanPass },
    });
}

// Replaces {{name}}, {{email}}, {{anything}} with values from a data object.
function fillTemplate(str, data) {
    if (!str) return str;
    return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
        const val = data ? data[key] : undefined;
        return val === undefined || val === null ? '' : String(val);
    });
}

function parseRecipients(raw) {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) throw new Error('Recipients must be a list.');
    return list
        .map((r) => (typeof r === 'string' ? { email: r.trim() } : { ...r, email: (r.email || '').trim() }))
        .filter((r) => r.email);
}

// ---------- routes ----------

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/test-connection', async (req, res) => {
    const { email, appPassword, host, port, secure } = req.body || {};
    if (!email || !appPassword) {
        return res.status(400).json({ ok: false, error: 'Email and app password are required.' });
    }
    try {
        const transporter = buildTransport({ email, appPassword, host, port, secure });
        await transporter.verify();
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ ok: false, error: err.message });
    }
});

app.post('/api/send', upload.array('attachments'), async (req, res) => {
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no'); // disable proxy buffering (nginx etc.)
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const write = (obj) => {
        try {
            res.write(JSON.stringify(obj) + '\n');
        } catch {
            /* client disconnected */
        }
    };

    // IMPORTANT: don't use req.on('close') here — in modern Node it fires as
    // soon as the request body has been fully read (i.e. right after upload
    // finishes), not only when the client actually disconnects. That caused
    // every send job to be marked "stopped" before a single email went out.
    // res.on('close') only means an abort if the response was never finished.
    let stopped = false;
    res.on('close', () => {
        if (!res.writableEnded) {
            stopped = true;
        }
    });

    try {
        const {
            email,
            appPassword,
            host,
            port,
            secure,
            fromName,
            subject,
            bodyText,
            bodyHtml,
            isHtml,
            includeSignature,
            signature,
            delaySeconds,
            recipients,
        } = req.body;

        if (!email || !appPassword) {
            write({ type: 'error', error: 'Sender email and app password are required.' });
            return res.end();
        }

        let recipientList;
        try {
            recipientList = parseRecipients(recipients);
        } catch (e) {
            write({ type: 'error', error: `Could not read recipient list: ${e.message}` });
            return res.end();
        }
        if (recipientList.length === 0) {
            write({ type: 'error', error: 'No valid recipients were found.' });
            return res.end();
        }

        const delayMs = Math.max(0, Number(delaySeconds || 0)) * 1000;
        const useHtml = isHtml === 'true' || isHtml === true;
        const useSignature = includeSignature === 'true' || includeSignature === true;

        const attachments = (req.files || []).map((f) => ({
            filename: f.originalname,
            content: f.buffer,
            contentType: f.mimetype,
        }));

        const transporter = buildTransport({ email, appPassword, host, port, secure });
        try {
            await transporter.verify();
        } catch (err) {
            write({ type: 'error', error: `SMTP login failed: ${err.message}` });
            return res.end();
        }

        write({ type: 'start', total: recipientList.length });

        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < recipientList.length; i++) {
            if (stopped) {
                write({ type: 'stopped', sentCount, failedCount, total: recipientList.length });
                return res.end();
            }

            const data = recipientList[i];
            const toEmail = data.email;

            const finalSubject = fillTemplate(subject, data);
            const signaturePart = useSignature && signature ? fillTemplate(signature, data) : '';

            let mail = {
                from: fromName && fromName.trim() ? `"${fromName.trim()}" <${email}>` : email,
                to: toEmail,
                subject: finalSubject,
                attachments,
            };

            if (useHtml) {
                const htmlBody = fillTemplate(bodyHtml, data);
                mail.html = signaturePart ? `${htmlBody}<br/><br/>${signaturePart}` : htmlBody;
            } else {
                const textBody = fillTemplate(bodyText, data);
                mail.text = signaturePart ? `${textBody}\n\n${signaturePart}` : textBody;
            }

            try {
                await transporter.sendMail(mail);
                sentCount++;
                write({
                    type: 'progress',
                    index: i,
                    total: recipientList.length,
                    recipient: toEmail,
                    status: 'sent',
                });
            } catch (err) {
                failedCount++;
                write({
                    type: 'progress',
                    index: i,
                    total: recipientList.length,
                    recipient: toEmail,
                    status: 'failed',
                    error: err.message,
                });
            }

            const isLast = i === recipientList.length - 1;
            if (!isLast && delayMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }

        write({ type: 'done', sentCount, failedCount, total: recipientList.length });
        res.end();
    } catch (err) {
        write({ type: 'error', error: err.message || 'Unexpected server error.' });
        res.end();
    }
});

export default app;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Bulk mailer backend listening on http://localhost:${PORT}`);
    });
}