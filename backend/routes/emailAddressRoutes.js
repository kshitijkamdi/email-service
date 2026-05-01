import express from 'express';
import { createEmailAddress, listEmailAddresses } from '../controllers/emailAddressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', listEmailAddresses);
router.post('/generate', createEmailAddress);

export default router;
