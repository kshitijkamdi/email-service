import sanitizeHtml from 'sanitize-html';
import Email from '../models/Email.js';
import { syncReceivedEmailsForUser } from '../services/inboundEmailService.js';
import { assertOwnedAddress, listOwnedEmailAddresses } from '../services/emailAddressService.js';
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
  const requestedAddress = req.query.address || req.body?.address || req.user.email;
  const selectedAddress = await assertOwnedAddress(req.user, requestedAddress);
  const query = type === 'inbox' ? { type, to: selectedAddress } : { type, from: selectedAddress };

  if (q) {
    query.$text = { $search: q };
  }

  const [emails, total] = await Promise.all([
    Email.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Email.countDocuments(query)
  ]);

  res.status(200).json({
    emails,
    address: selectedAddress,
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
    const from = await assertOwnedAddress(req.user, req.body.from || req.user.email);
    const subject = String(req.body.subject || '').trim();
    const html = sanitizeBody(req.body.body || req.body.html);

    const delivery = await sendViaResend({
      from,
      to: recipients,
      subject,
      html,
      replyToMessageId: req.body.replyToMessageId
    });

    const email = await Email.create({
      from,
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
    const selectedAddress = req.body.address ? await assertOwnedAddress(req.user, req.body.address) : null;
    const result = await syncReceivedEmailsForUser({ user: req.user, onlyTo: selectedAddress });
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
    const addresses = await listOwnedEmailAddresses(req.user);
    const ownedEmails = addresses.map((address) => address.email);
    const email = await Email.findOne({
      _id: req.params.id,
      $or: [
        { type: 'inbox', to: { $in: ownedEmails } },
        { type: 'sent', from: { $in: ownedEmails } }
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
