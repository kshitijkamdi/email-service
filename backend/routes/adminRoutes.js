import express from 'express';
import { param } from 'express-validator';
import { approveUser, deleteUser, listUsers } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/users', listUsers);

router.patch('/users/:id/approve', [param('id').isMongoId().withMessage('Valid mailbox id is required')], validate, approveUser);

router.delete('/users/:id', [param('id').isMongoId().withMessage('Valid mailbox id is required')], validate, deleteUser);

export default router;
