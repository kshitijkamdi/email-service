import { storeReceivedEmail } from '../services/inboundEmailService.js';
import { verifyWebhook } from '../services/resendService.js';

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
    const result = await storeReceivedEmail({ data });

    res.status(200).json({ received: true, ...result });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};
