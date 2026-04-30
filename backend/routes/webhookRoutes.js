import express from 'express';
import { handleInboundWebhook } from '../controllers/webhookController.js';

const router = express.Router();

router.post('/', handleInboundWebhook);

export default router;
