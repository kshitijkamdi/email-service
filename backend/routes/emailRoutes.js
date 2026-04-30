import express from 'express';
import { body, param, query } from 'express-validator';
import { getEmailById, getInbox, getSent, sendEmail } from '../controllers/emailController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.post(
  '/send',
  [
    body('to').custom((value) => {
      const recipients = Array.isArray(value) ? value : String(value || '').split(',');
      if (!recipients.length || recipients.some((recipient) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(recipient).trim()))) {
        throw new Error('At least one valid recipient is required');
      }
      return true;
    }),
    body('subject').trim().isLength({ min: 1, max: 300 }).withMessage('Subject is required'),
    body('body').optional().isString(),
    body('html').optional().isString(),
    body().custom((value) => {
      if (!value.body && !value.html) {
        throw new Error('Email body is required');
      }
      return true;
    })
  ],
  validate,
  sendEmail
);

router.get(
  '/inbox',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().trim().escape()
  ],
  validate,
  getInbox
);

router.get(
  '/sent',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().trim().escape()
  ],
  validate,
  getSent
);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid email id')], validate, getEmailById);

export default router;
