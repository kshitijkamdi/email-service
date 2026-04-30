import { Resend } from 'resend';

let cachedClient;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required');
  }

  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }

  return cachedClient;
};

export const sendEmail = async ({ from, to, subject, html, replyToMessageId }) => {
  const resend = getResendClient();
  const headers = replyToMessageId
    ? {
        'In-Reply-To': replyToMessageId,
        References: replyToMessageId
      }
    : undefined;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    headers
  });

  if (error) {
    const serviceError = new Error(error.message || 'Failed to send email');
    serviceError.statusCode = 502;
    serviceError.details = error;
    throw serviceError;
  }

  return data;
};

export const retrieveReceivedEmail = async (emailId) => {
  if (!emailId) {
    return null;
  }

  const resend = getResendClient();
  const { data, error } = await resend.emails.receiving.get(emailId);

  if (error) {
    console.warn('Could not fetch received email content from Resend:', error);
    return null;
  }

  return data;
};

export const verifyWebhook = ({ payload, headers }) => {
  if (!process.env.RESEND_WEBHOOK_SECRET) {
    return JSON.parse(payload);
  }

  const resend = getResendClient();

  return resend.webhooks.verify({
    payload,
    headers: {
      id: headers['svix-id'],
      timestamp: headers['svix-timestamp'],
      signature: headers['svix-signature']
    },
    webhookSecret: process.env.RESEND_WEBHOOK_SECRET
  });
};
