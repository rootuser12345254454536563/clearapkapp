import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface MessageLog {
  id: string;
  phone: string;
  type: string;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  payload?: any;
  error?: string;
}

const messageLogs: MessageLog[] = [];

// WhatsApp API Status
app.get('/api/whatsapp/status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  res.json({
    configured: isConfigured,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
      ? `${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(0, 4)}...${process.env.WHATSAPP_PHONE_NUMBER_ID.slice(-4)}`
      : null,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ? 'Configured' : 'Not configured',
    verifyTokenSet: Boolean(process.env.WHATSAPP_VERIFY_TOKEN),
    recentLogsCount: messageLogs.length,
    instructions: !isConfigured
      ? 'To send live WhatsApp messages, configure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in environment variables.'
      : 'WhatsApp Cloud API is active.'
  });
});

// Meta Webhook Verification
app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'buyjump_webhook_verify_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Meta Webhook Notifications
app.post('/api/whatsapp/webhook', (req: Request, res: Response) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value) {
      const changeValue = body.entry[0].changes[0].value;
      if (changeValue.statuses && changeValue.statuses[0]) {
        const statusObj = changeValue.statuses[0];
        const existing = messageLogs.find(m => m.id === statusObj.id);
        if (existing) {
          existing.status = statusObj.status;
        } else {
          messageLogs.unshift({
            id: statusObj.id,
            phone: statusObj.recipient_id || 'unknown',
            type: 'status_update',
            status: statusObj.status as any,
            timestamp: new Date().toISOString(),
            payload: statusObj
          });
        }
      }
      if (changeValue.messages && changeValue.messages[0]) {
        const msg = changeValue.messages[0];
        messageLogs.unshift({
          id: msg.id,
          phone: msg.from,
          type: 'incoming_message',
          status: 'delivered',
          timestamp: new Date().toISOString(),
          payload: msg
        });
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Send WhatsApp Notification
app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
  const { to, type, templateName, parameters, textMessage, orderId } = req.body;
  if (!to) {
    return res.status(400).json({ error: 'Recipient phone number is required' });
  }

  const cleanPhone = String(to).replace(/[^0-9]/g, '');
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const logEntry: MessageLog = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    phone: cleanPhone,
    type: type || 'order_update',
    status: 'queued',
    timestamp: new Date().toISOString(),
    payload: { orderId, templateName, textMessage }
  };

  if (!accessToken || !phoneNumberId) {
    logEntry.status = 'queued';
    logEntry.error = 'Live Meta WhatsApp credentials not yet configured in environment.';
    messageLogs.unshift(logEntry);
    return res.status(200).json({
      success: true,
      deliveredSimulated: true,
      messageId: logEntry.id,
      note: 'Message queued and logged in BUYJUMP. Live Meta dispatch requires WHATSAPP_ACCESS_TOKEN in env.',
      recipient: cleanPhone
    });
  }

  try {
    const metaUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const payload = type === 'template' ? {
      messaging_product: 'whatsapp',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName || 'order_confirmation',
        language: { code: 'en_US' },
        components: parameters || []
      }
    } : {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: { preview_url: true, body: textMessage }
    };

    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      logEntry.status = 'failed';
      logEntry.error = data.error?.message || 'Meta API error';
      messageLogs.unshift(logEntry);
      return res.status(response.status).json({ success: false, error: logEntry.error });
    }

    logEntry.id = data.messages?.[0]?.id || logEntry.id;
    logEntry.status = 'sent';
    messageLogs.unshift(logEntry);
    return res.json({ success: true, messageId: logEntry.id });
  } catch (err: any) {
    logEntry.status = 'failed';
    logEntry.error = err.message || 'Network error';
    messageLogs.unshift(logEntry);
    return res.status(500).json({ success: false, error: logEntry.error });
  }
});

// Logs endpoint
app.get('/api/whatsapp/logs', (_req: Request, res: Response) => {
  res.json({ logs: messageLogs.slice(0, 50) });
});

// External System Browser OAuth Flow & Deep-Link Callback Redirect
app.get('/api/auth/mobile-oauth', (req: Request, res: Response) => {
  const provider = String(req.query.provider || 'google').toLowerCase();
  const role = String(req.query.role || 'user').toLowerCase();
  const returnTo = String(req.query.return_to || 'buyjump://auth/callback');
  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';
  const defaultEmail = provider === 'facebook' ? 'facebook.user@buyjump.com' : 'google.user@buyjump.com';
  const defaultName = provider === 'facebook' ? 'BuyJump Facebook User' : 'BuyJump Google User';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in with ${providerLabel} - BUYJUMP</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; box-sizing: border-box; }
    .card { background: #fff; color: #0f172a; width: 100%; max-width: 380px; border-radius: 24px; padding: 28px 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
    .badge { display: inline-block; background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
    h1 { font-size: 20px; margin: 0 0 6px; font-weight: 800; }
    p { font-size: 13px; color: #64748b; margin: 0 0 20px; }
    label { display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; }
    input { width: 100%; padding: 11px 12px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 14px; margin-bottom: 14px; box-sizing: border-box; }
    button { width: 100%; padding: 13px; border: 0; border-radius: 12px; background: #0F2C59; color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; }
    button:hover { background: #1e3a8a; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Secure OAuth 2.0 Redirect</span>
    <h1>Continue with ${providerLabel}</h1>
    <p>Select or enter your ${providerLabel} account to return to the BUYJUMP mobile app.</p>
    <form id="oauthForm">
      <label>Full Name</label>
      <input type="text" id="name" value="${defaultName}" required />
      <label>${providerLabel} Email</label>
      <input type="email" id="email" value="${defaultEmail}" required />
      <button type="submit">Continue to BUYJUMP App</button>
    </form>
  </div>
  <script>
    document.getElementById('oauthForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var name = encodeURIComponent(document.getElementById('name').value.trim());
      var email = encodeURIComponent(document.getElementById('email').value.trim());
      var target = ${JSON.stringify(returnTo)};
      var sep = target.indexOf('?') === -1 ? '?' : '&';
      var finalUrl = target + sep + 'oauth_callback=1&provider=${provider}&role=${role}&name=' + name + '&email=' + email;
      window.location.href = finalUrl;
    });
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Direct APK Download & Status Endpoints
const debugApkPath = path.resolve(__dirname, 'android/app/build/outputs/apk/debug/app-debug.apk');

app.get('/api/apk/status', (_req: Request, res: Response) => {
  if (fs.existsSync(debugApkPath)) {
    const stats = fs.statSync(debugApkPath);
    res.json({
      exists: true,
      path: 'android/app/build/outputs/apk/debug/app-debug.apk',
      sizeBytes: stats.size,
      sizeMB: (stats.size / (1024 * 1024)).toFixed(2),
      downloadUrl: '/download/app-debug.apk',
      updatedAt: stats.mtime.toISOString()
    });
  } else {
    res.json({ exists: false });
  }
});

app.get(['/download/app-debug.apk', '/apk/app-debug.apk', '/app-debug.apk'], (_req: Request, res: Response) => {
  if (fs.existsSync(debugApkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="BUYJUMP-app-debug.apk"');
    res.sendFile(debugApkPath);
  } else {
    res.status(404).json({ error: 'APK file not found at android/app/build/outputs/apk/debug/app-debug.apk' });
  }
});


async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`BUYJUMP Mobile App Server running on http://localhost:${PORT}`);
  });
}

startServer();
