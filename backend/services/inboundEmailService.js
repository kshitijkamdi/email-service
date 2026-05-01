import sanitizeHtml from 'sanitize-html';
import Email from '../models/Email.js';
import { findOwnerByAddress, listOwnedEmailAddresses } from './emailAddressService.js';
import { listReceivedEmails, retrieveReceivedEmail } from './resendService.js';

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export const extractEmailAddresses = (value) => {
  const values = Array.isArray(value) ? value : [value];
  const addresses = values.flatMap((item) => String(item || '').match(EMAIL_PATTERN) || []);
  return [...new Set(addresses.map((address) => address.toLowerCase()))];
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
  `<p>This message was received by Resend.</p><p>Full content was not available when the message was processed.</p><p>Resend email ID: ${data.email_id || data.id || 'unknown'}</p>`;

export const storeReceivedEmail = async ({ data, onlyTo }) => {
  const emailId = data.email_id || data.id;
  const domain = (process.env.EMAIL_DOMAIN || 'mydomain.com').toLowerCase();
  const onlyToAddress = onlyTo ? String(onlyTo).trim().toLowerCase() : '';
  const recipients = extractEmailAddresses(data.to)
    .filter((address) => address.endsWith(`@${domain}`))
    .filter((address) => !onlyToAddress || address === onlyToAddress);

  if (recipients.length === 0) {
    return { stored: 0, ids: [] };
  }

  const receivedEmail = await retrieveReceivedEmail(emailId);
  const body = sanitizeBody(receivedEmail?.html || receivedEmail?.text || fallbackBody(data));
  const subject = String(receivedEmail?.subject || data.subject || '(no subject)').trim();
  const from = String(receivedEmail?.from || data.from || '').trim();
  const messageId = String(receivedEmail?.message_id || data.message_id || emailId).trim();
  const created = [];

  for (const recipient of recipients) {
    const { owner } = await findOwnerByAddress(recipient);
    if (!owner) {
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

  return { stored: created.length, ids: created };
};

export const syncReceivedEmailsForUser = async ({ user, onlyTo, limit = 100 }) => {
  const ownedAddresses = onlyTo
    ? [String(onlyTo).toLowerCase()]
    : (await listOwnedEmailAddresses(user)).map((address) => address.email);
  const list = await listReceivedEmails({ limit });
  const messages = Array.isArray(list?.data) ? list.data : [];
  let stored = 0;
  const ids = [];

  for (const message of messages) {
    for (const mailbox of ownedAddresses) {
      const result = await storeReceivedEmail({ data: message, onlyTo: mailbox });
      stored += result.stored;
      ids.push(...result.ids);
    }
  }

  return {
    received: messages.length,
    stored,
    ids
  };
};
