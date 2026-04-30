import sanitizeHtml from 'sanitize-html';
import Email from '../models/Email.js';
import User from '../models/User.js';
import { retrieveReceivedEmail, verifyWebhook } from '../services/resendService.js';

const normalizeRecipients = (to) => {
  const values = Array.isArray(to) ? to : [to];
  return values
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);
};

const sanitizeBody = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data']
  });

const fallbackBody = (data) =>
  `<p>This message was received by Resend.</p><p>Full content was not available when the webhook was processed.</p><p>Resend email ID: ${data.email_id || 'unknown'}</p>`;

export const handleInboundWebhook = async (req, res, next) => {
  try {
    const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    const event = verifyWebhook({
      payload,
      headers: req.headers
    });

    if (event.type !== 'email.received') {
      return res.status(200).json({ received: true, ignored: true });
    }

    const data = event.data || {};
    const domain = (process.env.EMAIL_DOMAIN || 'mydomain.com').toLowerCase();
    const recipients = normalizeRecipients(data.to).filter((address) => address.endsWith(`@${domain}`));

    if (recipients.length === 0) {
      return res.status(200).json({ received: true, stored: 0 });
    }

    const receivedEmail = await retrieveReceivedEmail(data.email_id);
    const body = sanitizeBody(receivedEmail?.html || receivedEmail?.text || fallbackBody(data));
    const subject = String(receivedEmail?.subject || data.subject || '(no subject)').trim();
    const from = String(receivedEmail?.from || data.from || '').trim();
    const messageId = String(receivedEmail?.message_id || data.message_id || data.email_id).trim();
    const created = [];

    for (const recipient of recipients) {
      const user = await User.findOne({ email: recipient });
      if (!user) {
        continue;
      }

      const alreadyStored = await Email.findOne({
        messageId,
        type: 'inbox',
        to: recipient
      });

      if (alreadyStored) {
        continue;
      }

      const email = await Email.create({
        from,
        to: recipient,
        subject,
        body,
        type: 'inbox',
        messageId
      });

      created.push(email._id);
    }

    res.status(200).json({ received: true, stored: created.length, ids: created });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};
