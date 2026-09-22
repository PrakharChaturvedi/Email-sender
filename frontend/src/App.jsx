import React, { useEffect, useMemo, useRef, useState } from 'react';
import { template1 } from './templates/template1.js';

const API_BASE = import.meta.env.VITE_API_URL || '';

const BUILTIN_TEMPLATES = [
  template1,
];

// --- helpers -----------------------------------------------------------

function parseRecipientsText(raw) {
  if (!raw) return [];
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const [emailPart, ...rest] = line.split(',');
      const email = (emailPart || '').trim();
      const name = rest.join(',').trim();
      return { email, name: name || undefined };
    })
    .filter((r) => /\S+@\S+\.\S+/.test(r.email));
}

function fillTemplateClient(str, data) {
  if (!str) return str;
  return str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const val = data ? data[key] : undefined;
    return val === undefined || val === null ? '' : String(val);
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatEta(totalRemaining, delaySeconds) {
  const seconds = totalRemaining * delaySeconds;
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

const STEP = ({ n, title, hint }) => (
  <div className="step-head">
    <span className="step-num">{n}</span>
    <div>
      <h2>{title}</h2>
      {hint && <p className="step-hint">{hint}</p>}
    </div>
  </div>
);

// --- app -----------------------------------------------------------

export default function App() {
  // navigation
  const [activeNavTab, setActiveNavTab] = useState('compose'); // 'compose' | 'analytics'
  const [campaigns, setCampaigns] = useState(() => {
    try {
      const saved = localStorage.getItem('dispatch_campaigns');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dispatch_campaigns', JSON.stringify(campaigns));
    } catch {
      /* storage full or disabled */
    }
  }, [campaigns]);

  const [syncingCampaignId, setSyncingCampaignId] = useState(null);

  async function handleSyncReplies(campaignId) {
    const camp = campaigns.find((c) => c.id === campaignId);
    if (!camp || !email || !appPassword) return;

    setSyncingCampaignId(campaignId);
    try {
      const targetEmails = camp.recipients.map((r) => r.email);
      const res = await fetch(`${API_BASE}/api/check-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, appPassword, host, recipients: targetEmails }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.repliedEmails)) {
        const repliedSet = new Set(data.repliedEmails.map((e) => String(e).toLowerCase()));
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id !== campaignId) return c;
            return {
              ...c,
              repliedEmails: Array.from(new Set([...(c.repliedEmails || []), ...data.repliedEmails])),
              recipients: c.recipients.map((r) =>
                repliedSet.has(r.email.toLowerCase()) ? { ...r, status: 'replied' } : r
              ),
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to sync replies:', err);
    } finally {
      setSyncingCampaignId(null);
    }
  }

  function handleToggleRecipientReply(campaignId, targetEmail) {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        const recipient = c.recipients.find((r) => r.email.toLowerCase() === targetEmail.toLowerCase());
        if (!recipient) return c;
        const newStatus = recipient.status === 'replied' ? 'no_reply' : 'replied';

        return {
          ...c,
          recipients: c.recipients.map((r) =>
            r.email.toLowerCase() === targetEmail.toLowerCase() ? { ...r, status: newStatus } : r
          ),
        };
      })
    );
  }

  function handleLaunchFollowup(camp) {
    const unreplied = camp.recipients.filter((r) => r.status !== 'replied');
    if (unreplied.length === 0) return;

    const rawText = unreplied
      .map((r) => (r.name ? `${r.email}, ${r.name}` : r.email))
      .join('\n');

    setRecipientsRaw(rawText);

    const origSub = camp.subject || 'Follow-Up';
    const followupSub = /^re:/i.test(origSub) ? origSub : `Re: ${origSub}`;
    setSubject(followupSub);

    setActiveNavTab('compose');
  }

  function handleDeleteCampaign(campaignId) {
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
  }

  // sender
  const [provider, setProvider] = useState('gmail'); // 'gmail' | 'zoho' | 'zoho_in' | 'office365' | 'custom'
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fromName, setFromName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState('465');
  const [secure, setSecure] = useState(true);

  function handleProviderChange(preset) {
    setProvider(preset.id);
    if (preset.id !== 'custom') {
      setHost(preset.host);
      setPort(preset.port);
      setSecure(preset.secure);
    }
  }

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // {ok, error}

  // recipients
  const [recipientsRaw, setRecipientsRaw] = useState('');
  const fileInputRef = useRef(null);
  const recipients = useMemo(() => parseRecipientsText(recipientsRaw), [recipientsRaw]);

  // message
  const [mailType, setMailType] = useState('text'); // 'text' | 'html'
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [bodyText, setBodyText] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(false);

  function handleLoadTemplate(tmpl) {
    setMailType('html');
    setBodyHtml(tmpl.html);
    if (!subject.trim()) {
      setSubject(tmpl.subject);
    }
  }
  const [signatureMode, setSignatureMode] = useState('card'); // 'card' | 'custom'
  const [signature, setSignature] = useState(''); // used when signatureMode === 'custom'

  // structured "card" signature fields — mirrors a typical business signature block
  const [sigClosing, setSigClosing] = useState('Best regards,');
  const [sigName, setSigName] = useState('');
  const [sigTitle, setSigTitle] = useState('');
  const [sigPhone, setSigPhone] = useState('');
  const [sigEmail, setSigEmail] = useState('');
  const [sigWebsite, setSigWebsite] = useState('');
  const [sigTagline, setSigTagline] = useState('');

  // logos shown in the signature — each is either a hosted image URL or a
  // file uploaded from the device (converted to a base64 data URI so no
  // backend changes are needed to embed it in the HTML signature).
  const [sigLogos, setSigLogos] = useState([]); // { id, mode: 'url'|'upload', url, dataUri, fileName }

  const [showPreview, setShowPreview] = useState(false);

  // attachments
  const [attachments, setAttachments] = useState([]);
  const attachInputRef = useRef(null);

  // delay
  const [delayChoice, setDelayChoice] = useState('60'); // '60' | '30' | 'custom'
  const [customDelay, setCustomDelay] = useState('45');
  const delaySeconds = delayChoice === 'custom' ? Math.max(0, Number(customDelay) || 0) : Number(delayChoice);

  // The signature's rich HTML form — built whenever the "card" builder has
  // data, independent of whether the compose body itself is plain text or
  // HTML. This is what lets a logo show up even if the user is writing in
  // the plain-text tab.
  const signatureHtml = useMemo(() => {
    const contactLine = [sigPhone && `Contact: ${sigPhone}`].filter(Boolean).join(' | ');
    const websiteLine = [sigWebsite, sigTagline].filter(Boolean).join(' | ');

    const lines = [];
    if (sigClosing) lines.push(`<p style="margin:0 0 4px;">${escapeHtml(sigClosing)}</p>`);
    if (sigName) lines.push(`<p style="margin:0 0 16px;">${escapeHtml(sigName)}</p>`);
    lines.push('<hr style="border:none;border-top:1px solid #ddd;margin:0 0 12px;" />');
    const block = [];
    if (sigName) block.push(`<div style="font-weight:600;color:#222;">${escapeHtml(sigName)}</div>`);
    if (sigTitle) block.push(`<div style="color:#777;">${escapeHtml(sigTitle)}</div>`);
    if (sigPhone) block.push(`<div style="color:#555;">Contact: <a href="tel:${escapeHtml(sigPhone)}" style="color:#2454C7;">${escapeHtml(sigPhone)}</a></div>`);
    if (sigEmail) block.push(`<div style="color:#555;">Email: <a href="mailto:${escapeHtml(sigEmail)}" style="color:#2454C7;">${escapeHtml(sigEmail)}</a></div>`);
    lines.push(`<div style="font-size:13px;line-height:1.6;">${block.join('\n')}</div>`);

    const logoSrcs = sigLogos
      .map((logo) => (logo.mode === 'upload' ? logo.dataUri : logo.url))
      .filter(Boolean);
    if (logoSrcs.length > 0) {
      // Each logo sits in a fixed-size box (36px tall, up to 130px wide) so
      // mismatched source image sizes don't distort the signature row —
      // the image is scaled to fit inside, never stretched or cropped.
      const divider =
        '<span style="display:inline-block;width:1px;height:32px;background:#ccc;margin:0 14px;vertical-align:middle;"></span>';
      const logoRow = logoSrcs
        .map(
          (src) =>
            `<span style="display:inline-flex;align-items:center;justify-content:center;height:36px;max-width:130px;vertical-align:middle;overflow:hidden;"><img src="${escapeHtml(
              src
            )}" alt="" style="max-height:36px;max-width:130px;width:auto;height:auto;object-fit:contain;display:block;border:0;" /></span>`
        )
        .join(divider);
      lines.push(`<div style="margin:16px 0;">${logoRow}</div>`);
    }

    if (websiteLine) {
      lines.push('<hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />');
      const siteLink = sigWebsite
        ? `<a href="https://${escapeHtml(sigWebsite.replace(/^https?:\/\//, ''))}" style="color:#2454C7;">${escapeHtml(sigWebsite)}</a>`
        : '';
      lines.push(
        `<div style="font-size:13px;color:#777;">Explore: ${siteLink}${sigTagline ? ` | ${escapeHtml(sigTagline)}` : ''}</div>`
      );
    }
    return lines.join('\n');
  }, [sigClosing, sigName, sigTitle, sigPhone, sigEmail, sigWebsite, sigTagline, sigLogos]);

  const signatureTextPlain = useMemo(() => {
    const contactLine = [sigPhone && `Contact: ${sigPhone}`].filter(Boolean).join(' | ');
    const websiteLine = [sigWebsite, sigTagline].filter(Boolean).join(' | ');
    const lines = [];
    if (sigClosing) lines.push(sigClosing);
    if (sigName) lines.push(sigName);
    lines.push('');
    if (sigName) lines.push(sigName);
    if (sigTitle) lines.push(sigTitle);
    if (contactLine) lines.push(contactLine);
    if (sigEmail) lines.push(`Email: ${sigEmail}`);
    if (websiteLine) {
      lines.push('');
      lines.push(`Explore: ${websiteLine}`);
    }
    return lines.join('\n');
  }, [sigClosing, sigName, sigTitle, sigPhone, sigEmail, sigWebsite, sigTagline]);

  // true if the card signature has at least one usable logo — logos require
  // an HTML email, so when this is true we send/preview as HTML even if the
  // compose tab is set to "Plain text".
  const sigHasLogo = useMemo(
    () => sigLogos.some((logo) => (logo.mode === 'upload' ? logo.dataUri : logo.url)),
    [sigLogos]
  );
  const logoForcesHtml = includeSignature && signatureMode === 'card' && sigHasLogo;
  const effectiveIsHtml = mailType === 'html' || logoForcesHtml;

  // builds the final signature string that gets sent — either the free-text
  // "custom" signature, or an assembled block from the structured fields.
  const signatureForSend = useMemo(() => {
    if (!includeSignature) return '';
    if (signatureMode === 'custom') return signature;
    return effectiveIsHtml ? signatureHtml : signatureTextPlain;
  }, [includeSignature, signatureMode, signature, effectiveIsHtml, signatureHtml, signatureTextPlain]);

  // the body actually sent/previewed as HTML — the user's own HTML if they
  // wrote it, or their plain-text body auto-converted to simple HTML if
  // logos forced this email into HTML mode.
  const effectiveBodyHtml = useMemo(() => {
    if (mailType === 'html') return bodyHtml;
    if (logoForcesHtml) return escapeHtml(bodyText).replace(/\n/g, '<br/>');
    return bodyHtml;
  }, [mailType, bodyHtml, bodyText, logoForcesHtml]);

  // send state
  const [isSending, setIsSending] = useState(false);
  const [log, setLog] = useState([]); // {recipient, status, error}
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [sendError, setSendError] = useState('');
  const abortRef = useRef(null);

  const canTest = email.trim() && appPassword.trim() && !testing;
  const canSend =
    email.trim() &&
    appPassword.trim() &&
    subject.trim() &&
    recipients.length > 0 &&
    (mailType === 'text' ? bodyText.trim() : bodyHtml.trim()) &&
    !isSending;

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, appPassword, host, port, secure }),
      });
      const data = await res.json();
      setTestResult(data.ok ? { ok: true } : { ok: false, error: data.error });
    } catch (err) {
      setTestResult({ ok: false, error: err.message });
    } finally {
      setTesting(false);
    }
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const firstLine = text.split(/\r?\n/, 1)[0] || '';
      const looksLikeHeader = /^\s*(email|e-mail)/i.test(firstLine) && !/\S+@\S+\.\S+/.test(firstLine);
      const body = looksLikeHeader ? text.split(/\r?\n/).slice(1).join('\n') : text;
      setRecipientsRaw((prev) => (prev.trim() ? `${prev.trim()}\n${body.trim()}` : body.trim()));
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleAttachmentChange(e) {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeAttachment(idx) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }

  function addLogo() {
    setSigLogos((prev) => [
      ...prev,
      { id: `logo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, mode: 'url', url: '', dataUri: '', fileName: '' },
    ]);
  }

  function removeLogo(id) {
    setSigLogos((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLogo(id, patch) {
    setSigLogos((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function handleLogoFileUpload(id, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateLogo(id, { dataUri: String(reader.result || ''), fileName: file.name });
    };
    reader.readAsDataURL(file); // -> base64 data: URI, embeddable directly in the HTML signature
  }

  function resetSendState() {
    setLog([]);
    setSentCount(0);
    setFailedCount(0);
    setTotalCount(0);
    setCurrentIndex(-1);
    setSendError('');
  }

  async function handleSend() {
    resetSendState();
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    setTotalCount(recipients.length);

    const delayMs = Math.max(0, Number(delaySeconds || 0)) * 1000;
    let localSent = 0;
    let localFailed = 0;

    for (let i = 0; i < recipients.length; i++) {
      if (signal.aborted) {
        break;
      }

      setCurrentIndex(i);
      const target = recipients[i];

      const form = new FormData();
      form.append('email', email.trim());
      form.append('appPassword', appPassword);
      form.append('host', host);
      form.append('port', port);
      form.append('secure', String(secure));
      form.append('fromName', fromName.trim());
      form.append('cc', cc.trim());
      form.append('bcc', bcc.trim());
      form.append('subject', subject);
      form.append('bodyText', bodyText);
      form.append('bodyHtml', effectiveBodyHtml);
      form.append('isHtml', String(effectiveIsHtml));
      form.append('includeSignature', String(includeSignature));
      form.append('signature', signatureForSend);
      form.append('recipient', JSON.stringify(target));
      attachments.forEach((file) => form.append('attachments', file));

      try {
        const res = await fetch(`${API_BASE}/api/send-single`, {
          method: 'POST',
          body: form,
          signal,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || `Server returned ${res.status}`);
        }

        localSent++;
        setSentCount(localSent);
        setLog((prev) => [...prev, { recipient: target.email, status: 'sent' }]);
      } catch (err) {
        if (err.name === 'AbortError') {
          break;
        }
        localFailed++;
        setFailedCount(localFailed);
        setLog((prev) => [...prev, { recipient: target.email, status: 'failed', error: err.message }]);
      }

      const isLast = i === recipients.length - 1;
      if (!isLast && delayMs > 0 && !signal.aborted) {
        try {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, delayMs);
            signal.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(new DOMException('Aborted', 'AbortError'));
            }, { once: true });
          });
        } catch (e) {
          if (e.name === 'AbortError') break;
        }
      }
    }

    if (localSent > 0 || localFailed > 0) {
      const newCamp = {
        id: `camp-${Date.now()}`,
        name: subject.trim() || 'Untitled Campaign',
        subject: subject.trim(),
        date: new Date().toISOString(),
        total: recipients.length,
        sentCount: localSent,
        failedCount: localFailed,
        repliedEmails: [],
        recipients: recipients.map((r) => ({
          email: r.email,
          name: r.name,
          status: 'no_reply',
        })),
      };
      setCampaigns((prev) => [newCamp, ...prev]);
    }

    setIsSending(false);
    abortRef.current = null;
  }

  function handleEvent(evt) {
    if (evt.type === 'start') {
      setTotalCount(evt.total);
    } else if (evt.type === 'progress') {
      setCurrentIndex(evt.index);
      setLog((prev) => [...prev, { recipient: evt.recipient, status: evt.status, error: evt.error }]);
      if (evt.status === 'sent') setSentCount((c) => c + 1);
      else setFailedCount((c) => c + 1);
    } else if (evt.type === 'done' || evt.type === 'stopped') {
      setSentCount(evt.sentCount);
      setFailedCount(evt.failedCount);
      setTotalCount(evt.total);
    } else if (evt.type === 'error') {
      setSendError(evt.error);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  const doneCount = sentCount + failedCount;
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const remaining = totalCount ? totalCount - doneCount - (isSending ? 1 : 0) : 0;

  return (
    <div className="app">
      <div className="airmail-stripe" aria-hidden="true" />
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div style={{ flex: 1 }}>
            <h1>Dispatch</h1>
            <p>A steady hand for sending mail, one message at a time.</p>
          </div>
          <div className="tabs nav-tabs">
            <button
              type="button"
              className={`tab ${activeNavTab === 'compose' ? 'active' : ''}`}
              onClick={() => setActiveNavTab('compose')}
            >
              ✉️ Compose & Send
            </button>
            <button
              type="button"
              className={`tab ${activeNavTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveNavTab('analytics')}
            >
              📊 Campaigns & Analytics ({campaigns.length})
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {activeNavTab === 'analytics' ? (
          <CampaignsDashboard
            campaigns={campaigns}
            email={email}
            appPassword={appPassword}
            syncingCampaignId={syncingCampaignId}
            onSyncReplies={handleSyncReplies}
            onToggleRecipientReply={handleToggleRecipientReply}
            onLaunchFollowup={handleLaunchFollowup}
            onDeleteCampaign={handleDeleteCampaign}
            onSwitchToCompose={() => setActiveNavTab('compose')}
          />
        ) : (
          <>
            {/* Step 1 — Sender */}
            <section className="card">
              <STEP n="1" title="Connect your account" hint="Select your email provider and enter your credentials." />

          <div className="tabs" style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'gmail', label: 'Gmail', host: 'smtp.gmail.com', port: '465', secure: true },
              { id: 'zoho', label: 'Zoho Mail (.com)', host: 'smtppro.zoho.com', port: '465', secure: true },
              { id: 'zoho_in', label: 'Zoho Mail (.in)', host: 'smtppro.zoho.in', port: '465', secure: true },
              { id: 'office365', label: 'Microsoft 365', host: 'smtp.office365.com', port: '587', secure: false },
              { id: 'custom', label: 'Custom SMTP' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tab ${provider === p.id ? 'active' : ''}`}
                onClick={() => handleProviderChange(p)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid-2">
            <label className="field">
              <span>Your email address</span>
              <input
                type="email"
                placeholder={provider.startsWith('zoho') ? 'aws-connect@virtuecloud-aws.com' : 'you@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>

            <label className="field">
              <span>App password / Password</span>
              <div className="password-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="App-specific password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="link-btn" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="field">
              <span>Display name (optional)</span>
              <input
                type="text"
                placeholder="How your name appears to recipients"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </label>

            <div className="field">
              <span>Connection</span>
              <div className="test-row">
                <button type="button" className="btn secondary" disabled={!canTest} onClick={handleTestConnection}>
                  {testing ? 'Checking…' : 'Test connection'}
                </button>
                {testResult?.ok && <span className="pill success">Connected</span>}
                {testResult && !testResult.ok && <span className="pill danger">Failed</span>}
              </div>
            </div>
          </div>

          {testResult && !testResult.ok && <p className="error-text">{testResult.error}</p>}

          <button type="button" className="link-btn" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? 'Hide advanced SMTP settings' : 'Advanced SMTP settings'}
          </button>

          {showAdvanced && (
            <div className="grid-3 advanced">
              <label className="field">
                <span>SMTP host</span>
                <input type="text" value={host} onChange={(e) => setHost(e.target.value)} />
              </label>
              <label className="field">
                <span>Port</span>
                <input type="number" value={port} onChange={(e) => setPort(e.target.value)} />
              </label>
              <label className="field checkbox-field">
                <span>Use TLS (secure)</span>
                <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} />
              </label>
            </div>
          )}

          <p className="helper-text">
            {provider.startsWith('zoho') ? (
              <>
                For <strong>Zoho Mail</strong>: Use your full Zoho address (e.g. <code>aws-connect@virtuecloud-aws.com</code>) and your Zoho Application-Specific Password. Generate one at{' '}
                <a href="https://accounts.zoho.com" target="_blank" rel="noreferrer">accounts.zoho.com</a> (or <a href="https://accounts.zoho.in" target="_blank" rel="noreferrer">accounts.zoho.in</a>) → <em>Security → Application-Specific Passwords</em>.
              </>
            ) : provider === 'gmail' ? (
              <>
                Don&rsquo;t have an app password? Turn on 2-Step Verification in your Google Account, then create one at{' '}
                <em>myaccount.google.com → Security → App passwords</em>.
              </>
            ) : provider === 'office365' ? (
              <>
                For <strong>Microsoft 365 / Outlook</strong>: Uses <code>smtp.office365.com</code> on port 587. Ensure Authenticated SMTP is enabled in your M365 admin center.
              </>
            ) : (
              <>Custom SMTP settings configured (Host: {host}, Port: {port}).</>
            )}
          </p>
        </section>

        {/* Step 2 — Recipients */}
        <section className="card">
          <STEP n="2" title="Add recipients" hint="One per line. Add a name after a comma to personalize with {{name}}." />

          <textarea
            className="textarea recipients-area"
            rows={6}
            placeholder={'jane@example.com, Jane\njohn@example.com'}
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
          />

          <div className="recipients-footer">
            <button type="button" className="btn secondary" onClick={() => fileInputRef.current?.click()}>
              Upload .csv or .txt
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              hidden
              onChange={handleCsvUpload}
            />
            <span className="count-pill">
              {recipients.length} valid recipient{recipients.length === 1 ? '' : 's'}
            </span>
          </div>
        </section>

        {/* Step 3 — Message */}
        <section className="card">
          <STEP n="3" title="Write the message" hint="Choose plain text for a personal feel, or HTML for formatted layouts." />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div className="tabs" role="tablist" style={{ marginBottom: 0 }}>
              <button
                type="button"
                className={`tab ${mailType === 'text' ? 'active' : ''}`}
                onClick={() => setMailType('text')}
              >
                Plain text
              </button>
              <button
                type="button"
                className={`tab ${mailType === 'html' ? 'active' : ''}`}
                onClick={() => setMailType('html')}
              >
                HTML
              </button>
            </div>

            <div className="template-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft)' }}>Templates:</span>
              {BUILTIN_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  className="btn secondary"
                  style={{ padding: '5px 12px', fontSize: '12.5px', borderRadius: '999px', height: '32px' }}
                  onClick={() => handleLoadTemplate(tmpl)}
                  title={`Load ${tmpl.name}`}
                >
                  {tmpl.icon} {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <div className="field-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ color: 'var(--ink-soft)', fontWeight: 600, fontSize: '13px' }}>Subject</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`pill-toggle ${showCc || cc ? 'active' : ''}`}
                  onClick={() => setShowCc((v) => !v)}
                  title="Toggle Carbon Copy (CC)"
                >
                  Cc
                </button>
                <button
                  type="button"
                  className={`pill-toggle ${showBcc || bcc ? 'active' : ''}`}
                  onClick={() => setShowBcc((v) => !v)}
                  title="Toggle Blind Carbon Copy (BCC)"
                >
                  Bcc
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="A subject your recipients will recognize"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {(showCc || cc) && (
            <div className="field animate-fade" style={{ marginTop: '14px' }}>
              <span>CC (Carbon Copy)</span>
              <input
                type="text"
                placeholder="manager@example.com, {{cc_email}}"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
          )}

          {(showBcc || bcc) && (
            <div className="field animate-fade" style={{ marginTop: '14px' }}>
              <span>BCC (Blind Carbon Copy)</span>
              <input
                type="text"
                placeholder="audit@example.com"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
              />
            </div>
          )}

          {mailType === 'text' ? (
            <label className="field">
              <span>Body</span>
              <textarea
                className="textarea"
                rows={10}
                placeholder={'Hi {{name}},\n\nWrite your message here…'}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="field">
                <span>HTML source</span>
                <textarea
                  className="textarea mono"
                  rows={10}
                  placeholder={'<p>Hi {{name}},</p>\n<p>Write your message here…</p>'}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                />
              </label>
              <button type="button" className="link-btn" onClick={() => setShowHtmlPreview((v) => !v)}>
                {showHtmlPreview ? 'Hide preview' : 'Show preview'}
              </button>
              {showHtmlPreview && (
                <div className="html-preview" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
              )}
            </>
          )}

          <div className="signature-block">
            <label className="checkbox-field inline">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
              />
              <span>Add a signature footer</span>
            </label>

            {includeSignature && (
              <>
                <div className="tabs small">
                  <button
                    type="button"
                    className={`tab ${signatureMode === 'card' ? 'active' : ''}`}
                    onClick={() => setSignatureMode('card')}
                  >
                    Business card
                  </button>
                  <button
                    type="button"
                    className={`tab ${signatureMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setSignatureMode('custom')}
                  >
                    Custom text
                  </button>
                </div>

                {signatureMode === 'card' ? (
                  <div className="sig-grid">
                    <label className="field">
                      <span>Closing line</span>
                      <input type="text" value={sigClosing} onChange={(e) => setSigClosing(e.target.value)} />
                    </label>
                    <label className="field">
                      <span>Full name</span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={sigName}
                        onChange={(e) => setSigName(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Title</span>
                      <input
                        type="text"
                        placeholder="Senior Business Analyst"
                        value={sigTitle}
                        onChange={(e) => setSigTitle(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Phone</span>
                      <input
                        type="text"
                        placeholder="+1 (555) 019-2834"
                        value={sigPhone}
                        onChange={(e) => setSigPhone(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Signature email</span>
                      <input
                        type="text"
                        placeholder="john.doe@example.com"
                        value={sigEmail}
                        onChange={(e) => setSigEmail(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      <span>Website</span>
                      <input
                        type="text"
                        placeholder="example.com"
                        value={sigWebsite}
                        onChange={(e) => setSigWebsite(e.target.value)}
                      />
                    </label>
                    <label className="field sig-tagline">
                      <span>Tagline</span>
                      <input
                        type="text"
                        placeholder="AWS Advanced Partner"
                        value={sigTagline}
                        onChange={(e) => setSigTagline(e.target.value)}
                      />
                    </label>
                  </div>
                ) : null}

                {signatureMode === 'card' && (
                  <div className="logo-section">
                    <div className="logo-section-head">
                      <span>Logos</span>
                      <button type="button" className="link-btn" onClick={addLogo}>
                        + Add logo
                      </button>
                    </div>

                    {sigLogos.length === 0 && (
                      <p className="helper-text">
                        No logos yet. Add your company logo and any partner badges — they'll sit in a row, separated
                        by a divider, just like in the sample.
                      </p>
                    )}

                    {sigLogos.map((logo, idx) => {
                      const preview = logo.mode === 'upload' ? logo.dataUri : logo.url;
                      return (
                        <div key={logo.id} className="logo-row">
                          <div className="logo-row-top">
                            <span className="logo-row-label">Logo {idx + 1}</span>
                            <div className="tabs tiny">
                              <button
                                type="button"
                                className={`tab ${logo.mode === 'url' ? 'active' : ''}`}
                                onClick={() => updateLogo(logo.id, { mode: 'url' })}
                              >
                                Image URL
                              </button>
                              <button
                                type="button"
                                className={`tab ${logo.mode === 'upload' ? 'active' : ''}`}
                                onClick={() => updateLogo(logo.id, { mode: 'upload' })}
                              >
                                Upload
                              </button>
                            </div>
                            <button type="button" className="link-btn danger" onClick={() => removeLogo(logo.id)}>
                              Remove
                            </button>
                          </div>

                          {logo.mode === 'url' ? (
                            <input
                              type="text"
                              placeholder="https://example.com/logo.png"
                              value={logo.url}
                              onChange={(e) => updateLogo(logo.id, { url: e.target.value })}
                            />
                          ) : (
                            <div className="logo-upload-row">
                              <label className="btn secondary file-btn">
                                Choose file
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(e) => handleLogoFileUpload(logo.id, e.target.files?.[0])}
                                />
                              </label>
                              <span className="file-size">{logo.fileName || 'No file chosen'}</span>
                            </div>
                          )}

                          {preview && (
                            <div className="logo-preview-box">
                              <img src={preview} alt="" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <p className="helper-text">
                      Uploaded logos are embedded directly in the email as image data, so no external hosting is
                      needed — but this makes the email heavier and a few older clients (like desktop Outlook) may
                      not render them. A hosted image URL is the most reliable option if you have one.
                    </p>
                  </div>
                )}

                {signatureMode === 'custom' && (
                  <textarea
                    className="textarea"
                    rows={4}
                    placeholder={'Best,\nYour Name\nYour Company'}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                )}

                <div className="sig-preview">
                  {effectiveIsHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: signatureForSend }} />
                  ) : (
                    <pre>{signatureForSend}</pre>
                  )}
                </div>

                {logoForcesHtml && mailType === 'text' && (
                  <p className="notice-text">
                    This signature includes a logo, so this email will be sent as HTML — your plain-text body
                    will be converted automatically. Switch to the HTML tab above if you'd like full control over
                    formatting.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* Step 4 — Attachments */}
        <section className="card">
          <STEP n="4" title="Attachments" hint="Optional. Same files are sent with every email." />

          <button type="button" className="btn secondary" onClick={() => attachInputRef.current?.click()}>
            Add files
          </button>
          <input ref={attachInputRef} type="file" multiple hidden onChange={handleAttachmentChange} />

          {attachments.length > 0 && (
            <ul className="attachment-list">
              {attachments.map((file, idx) => (
                <li key={`${file.name}-${idx}`}>
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" className="link-btn danger" onClick={() => removeAttachment(idx)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Step 5 — Send */}
        <section className="card">
          <STEP n="5" title="Set the pace and send" hint="Sending slowly, with a gap between messages, keeps you well within Gmail's limits and out of spam folders." />

          <div className="delay-options">
            {[
              { id: '60', label: '1 email / minute' },
              { id: '30', label: '1 email / 30 sec' },
              { id: 'custom', label: 'Custom' },
            ].map((opt) => (
              <label key={opt.id} className={`delay-option ${delayChoice === opt.id ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="delay"
                  checked={delayChoice === opt.id}
                  onChange={() => setDelayChoice(opt.id)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
            {delayChoice === 'custom' && (
              <div className="custom-delay">
                <input
                  type="number"
                  min="0"
                  value={customDelay}
                  onChange={(e) => setCustomDelay(e.target.value)}
                />
                <span>seconds between emails</span>
              </div>
            )}
          </div>

          {totalCount > 0 && delaySeconds > 0 && !isSending && doneCount === 0 && (
            <p className="helper-text">
              Estimated time for {recipients.length} recipients: ~{formatEta(recipients.length - 1, delaySeconds)}
            </p>
          )}

          <div className="send-row">
            <button
              type="button"
              className="btn secondary"
              disabled={!subject.trim() && !bodyText.trim() && !bodyHtml.trim()}
              onClick={() => setShowPreview(true)}
            >
              Preview email
            </button>
            {!isSending ? (
              <button type="button" className="btn primary" disabled={!canSend} onClick={handleSend}>
                Send to {recipients.length || 0} recipient{recipients.length === 1 ? '' : 's'}
              </button>
            ) : (
              <button type="button" className="btn danger" onClick={handleStop}>
                Stop sending
              </button>
            )}
          </div>

          {sendError && <p className="error-text">{sendError}</p>}

          {(isSending || totalCount > 0) && (
            <div className="progress-block">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="progress-stats">
                <span>{doneCount} / {totalCount} sent</span>
                <span className="stat-success">{sentCount} delivered</span>
                {failedCount > 0 && <span className="stat-fail">{failedCount} failed</span>}
                {isSending && delaySeconds > 0 && remaining > 0 && (
                  <span className="stat-eta">~{formatEta(remaining, delaySeconds)} remaining</span>
                )}
              </div>

              {log.length > 0 && (
                <ul className="send-log">
                  {log.slice().reverse().map((entry, idx) => (
                    <li key={idx} className={entry.status}>
                      <span className="log-dot" />
                      <span className="log-recipient">{entry.recipient}</span>
                      <span className="log-status">
                        {entry.status === 'sent' ? 'sent' : entry.error || 'failed'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
        </>
        )}
      </main>

      <footer className="app-footer">
        <p>Your address and app password are used only for this session and are never stored.</p>
      </footer>

      {showPreview && (
        <PreviewModal
          isHtml={effectiveIsHtml}
          fromName={fromName}
          email={email}
          cc={cc}
          bcc={bcc}
          subject={subject}
          bodyText={bodyText}
          bodyHtml={effectiveBodyHtml}
          signature={signatureForSend}
          includeSignature={includeSignature}
          recipient={recipients[0]}
          attachments={attachments}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

function CampaignsDashboard({
  campaigns,
  email,
  appPassword,
  syncingCampaignId,
  onSyncReplies,
  onToggleRecipientReply,
  onLaunchFollowup,
  onDeleteCampaign,
  onSwitchToCompose,
}) {
  const [expandedCampId, setExpandedCampId] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'replied' | 'no_reply'

  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalRecipients = campaigns.reduce((acc, c) => acc + (c.total || 0), 0);

  let totalReplied = 0;
  let totalNoReply = 0;
  campaigns.forEach((c) => {
    (c.recipients || []).forEach((r) => {
      if (r.status === 'replied') totalReplied++;
      else if (r.status === 'no_reply') totalNoReply++;
    });
  });

  const overallReplyPct = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
  const overallDeliverPct = totalRecipients > 0 ? Math.round((totalSent / totalRecipients) * 100) : 0;

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header card">
        <div>
          <h2>Campaign Analytics & History</h2>
          <p className="step-hint">Track email performance, detect replies automatically, and launch follow-ups.</p>
        </div>
        <button type="button" className="btn primary" onClick={onSwitchToCompose}>
          + New Campaign
        </button>
      </div>

      {totalCampaigns === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">📊</span>
          <h3>No campaigns run yet</h3>
          <p>Send your first email campaign to see delivery stats, reply percentage graphs, and follow-up tracking here.</p>
          <button type="button" className="btn primary" onClick={onSwitchToCompose}>
            Compose & Send Campaign
          </button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stat-cards-grid">
            <div className="stat-card">
              <span className="stat-icon">🚀</span>
              <div className="stat-info">
                <span className="stat-val">{totalCampaigns}</span>
                <span className="stat-lbl">Total Campaigns</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">✉️</span>
              <div className="stat-info">
                <span className="stat-val">{totalSent}</span>
                <span className="stat-lbl">Emails Delivered</span>
              </div>
            </div>

            <div className="stat-card accent">
              <span className="stat-icon">💬</span>
              <div className="stat-info">
                <span className="stat-val">{overallReplyPct}%</span>
                <span className="stat-lbl">Overall Reply Rate</span>
              </div>
            </div>

            <div className="stat-card warning">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <span className="stat-val">{totalNoReply}</span>
                <span className="stat-lbl">Follow-Ups Needed</span>
              </div>
            </div>
          </div>

          {/* Visual Analytics Graphs */}
          <div className="grid-2 analytics-charts">
            {/* Chart 1: Reply Breakdown */}
            <div className="card chart-card">
              <h3>Reply Rate Breakdown</h3>
              <div className="donut-chart-container">
                <div className="progress-bar-lg">
                  <div
                    className="bar-fill success"
                    style={{ width: `${overallReplyPct}%` }}
                    title={`Replied: ${overallReplyPct}%`}
                  />
                  <div
                    className="bar-fill warning"
                    style={{ width: `${100 - overallReplyPct}%` }}
                    title={`Unreplied: ${100 - overallReplyPct}%`}
                  />
                </div>
                <div className="legend-row">
                  <span className="legend-item"><span className="dot success" /> Replied ({totalReplied})</span>
                  <span className="legend-item"><span className="dot warning" /> No Reply ({totalNoReply})</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Campaign Deliverability */}
            <div className="card chart-card">
              <h3>Deliverability & Success</h3>
              <div className="donut-chart-container">
                <div className="progress-bar-lg">
                  <div
                    className="bar-fill primary"
                    style={{ width: `${overallDeliverPct}%` }}
                  />
                </div>
                <div className="legend-row">
                  <span className="legend-item"><span className="dot primary" /> Delivered ({totalSent})</span>
                  <span className="legend-item"><span className="dot danger" /> Failed ({totalRecipients - totalSent})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign History List */}
          <div className="card campaign-list-card">
            <div className="card-header-row" style={{ marginBottom: '16px' }}>
              <h3>Campaign History ({totalCampaigns})</h3>
            </div>

            <div className="campaign-items">
              {campaigns.map((camp) => {
                const isExpanded = expandedCampId === camp.id;
                const campReplied = (camp.recipients || []).filter((r) => r.status === 'replied').length;
                const campNoReply = (camp.recipients || []).filter((r) => r.status === 'no_reply').length;
                const replyRate = camp.sentCount > 0 ? Math.round((campReplied / camp.sentCount) * 100) : 0;
                const isSyncing = syncingCampaignId === camp.id;

                const displayedRecipients = (camp.recipients || []).filter((r) => {
                  if (filterMode === 'replied') return r.status === 'replied';
                  if (filterMode === 'no_reply') return r.status === 'no_reply';
                  return true;
                });

                return (
                  <div key={camp.id} className="campaign-item-card">
                    <div className="campaign-item-head" onClick={() => setExpandedCampId(isExpanded ? null : camp.id)}>
                      <div className="camp-info">
                        <span className="camp-date">{new Date(camp.date).toLocaleDateString()}</span>
                        <h4>{camp.name}</h4>
                        <span className="camp-sub">{camp.subject}</span>
                      </div>

                      <div className="camp-metrics">
                        <span className="metric-pill">
                          <span>Delivered:</span> {camp.sentCount} / {camp.total}
                        </span>
                        <span className={`metric-pill ${replyRate > 0 ? 'success' : ''}`}>
                          <span>Reply Rate:</span> {replyRate}% ({campReplied})
                        </span>
                        <button type="button" className="link-btn">
                          {isExpanded ? 'Hide details ▲' : 'View details ▼'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="campaign-expanded-body">
                        <div className="action-bar">
                          <div className="filter-tabs">
                            <button
                              type="button"
                              className={`tab ${filterMode === 'all' ? 'active' : ''}`}
                              onClick={() => setFilterMode('all')}
                            >
                              All ({camp.recipients.length})
                            </button>
                            <button
                              type="button"
                              className={`tab ${filterMode === 'replied' ? 'active' : ''}`}
                              onClick={() => setFilterMode('replied')}
                            >
                              Replied ({campReplied})
                            </button>
                            <button
                              type="button"
                              className={`tab ${filterMode === 'no_reply' ? 'active' : ''}`}
                              onClick={() => setFilterMode('no_reply')}
                            >
                              No Reply ({campNoReply})
                            </button>
                          </div>

                          <div className="right-actions">
                            <button
                              type="button"
                              className="btn secondary sm"
                              disabled={isSyncing || !email || !appPassword}
                              onClick={() => onSyncReplies(camp.id)}
                              title={!email || !appPassword ? 'Enter email & password in Step 1 to auto-check IMAP' : 'Check IMAP Inbox for replies'}
                            >
                              {isSyncing ? 'Syncing IMAP...' : '🔄 Auto-Detect Replies'}
                            </button>

                            <button
                              type="button"
                              className="btn primary sm"
                              disabled={campNoReply === 0}
                              onClick={() => onLaunchFollowup(camp)}
                            >
                              ⚡ Launch Follow-Up to Unreplied ({campNoReply})
                            </button>

                            <button
                              type="button"
                              className="btn danger sm link-btn"
                              onClick={() => onDeleteCampaign(camp.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="recipient-status-table-container">
                          <table className="recipient-status-table">
                            <thead>
                              <tr>
                                <th>Recipient Email</th>
                                <th>Name</th>
                                <th>Reply Status</th>
                                <th>Manual Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedRecipients.map((r, i) => (
                                <tr key={i}>
                                  <td className="mono">{r.email}</td>
                                  <td>{r.name || '—'}</td>
                                  <td>
                                    {r.status === 'replied' ? (
                                      <span className="pill success">🟢 Reply Received</span>
                                    ) : (
                                      <span className="pill warning">⏳ Pending Follow-Up</span>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="link-btn"
                                      onClick={() => onToggleRecipientReply(camp.id, r.email)}
                                    >
                                      {r.status === 'replied' ? 'Mark as No Reply' : 'Mark as Replied'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewModal({
  isHtml,
  fromName,
  email,
  cc,
  bcc,
  subject,
  bodyText,
  bodyHtml,
  signature,
  includeSignature,
  recipient,
  attachments,
  onClose,
}) {
  const sampleData = recipient || { email: 'jane@example.com', name: 'Jane' };
  const renderedSubject = fillTemplateClient(subject, sampleData) || '(no subject)';
  const renderedCc = fillTemplateClient(cc, sampleData);
  const renderedBcc = fillTemplateClient(bcc, sampleData);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Preview</h3>
          <button type="button" className="link-btn" onClick={onClose}>Close</button>
        </div>

        <div className="preview-meta">
          <div><span>From</span> {fromName ? `${fromName} <${email || 'you@example.com'}>` : email || 'you@example.com'}</div>
          <div><span>To</span> {sampleData.email}{recipient ? '' : ' (sample recipient)'}</div>
          {renderedCc && <div><span>CC</span> {renderedCc}</div>}
          {renderedBcc && <div><span>BCC</span> {renderedBcc}</div>}
          <div><span>Subject</span> {renderedSubject}</div>
          {attachments.length > 0 && (
            <div>
              <span>Attachments</span> {attachments.map((f) => f.name).join(', ')}
            </div>
          )}
        </div>

        <div className="preview-body">
          {isHtml ? (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  fillTemplateClient(bodyHtml, sampleData) +
                  (includeSignature && signature ? `<br/><br/>${signature}` : ''),
              }}
            />
          ) : (
            <pre>
              {fillTemplateClient(bodyText, sampleData) +
                (includeSignature && signature ? `\n\n${signature}` : '')}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}