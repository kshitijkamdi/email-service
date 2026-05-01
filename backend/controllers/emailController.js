import sanitizeHtml from 'sanitize-html';
import Email from '../models/Email.js';
import { syncReceivedEmailsForUser } from '../services/inboundEmailService.js';
import { sendEmail as sendViaResend } from '../services/resendService.js';

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

const parseRecipients = (to) => {
  if (Array.isArray(to)) {
    return to.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }

  return String(to || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
};

const listEmails = async ({ req, res, type }) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const q = String(req.query.q || '').trim();
  const query =
    type === 'inbox'
      ? { type, to: req.user.email }
      : { type, from: req.user.email };

  if (q) {
    query.$text = { $search: q };
  }

  const [emails, total] = await Promise.all([
    Email.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Email.countDocuments(query)
  ]);

  res.status(200).json({
    emails,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1
    }
  });
};

export const sendEmail = async (req, res, next) => {
  try {
    const recipients = parseRecipients(req.body.to);
    const subject = String(req.body.subject || '').trim();
    const html = sanitizeBody(req.body.body || req.body.html);

    const delivery = await sendViaResend({
      from: req.user.email,
      to: recipients,
      subject,
      html,
      replyToMessageId: req.body.replyToMessageId
    });

    const email = await Email.create({
      from: req.user.email,
      to: recipients.join(', '),
      subject,
      body: html,
      type: 'sent',
      messageId: delivery?.id || req.body.replyToMessageId || `${Date.now()}-${req.user._id}`
    });

    res.status(201).json({ email, delivery });
  } catch (error) {
    next(error);
  }
};

export const getInbox = (req, res, next) => {
  listEmails({ req, res, type: 'inbox' }).catch(next);
};

export const syncReceived = async (req, res, next) => {
  try {
    const result = await syncReceivedEmailsForUser({ user: req.user });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getSent = (req, res, next) => {
  listEmails({ req, res, type: 'sent' }).catch(next);
};

export const getEmailById = async (req, res, next) => {
  try {
    const email = await Email.findOne({
      _id: req.params.id,
      $or: [
        { type: 'inbox', to: req.user.email },
        { type: 'sent', from: req.user.email }
      ]
    });

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.status(200).json({ email });
  } catch (error) {
    next(error);
  }
};
