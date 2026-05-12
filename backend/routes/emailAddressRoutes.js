import express from 'express';
import { createEmailAddress, listEmailAddresses } from '../controllers/emailAddressController.js';
import { protect, requireApprovedMailbox } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, requireApprovedMailbox);

router.get('/', listEmailAddresses);
router.post('/generate', createEmailAddress);

export default router;
