import { Router } from 'express';
import {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaintStatus,
    confirmResolution,
    reopenComplaint,
    getComplaintStatusPublic,
    assignOfficerByName
} from '../controllers/complaint-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

// Public route — no auth needed (bot status tracking)
router.get('/public-status/:complaintId', getComplaintStatusPublic);

router.use(authenticate); // All complaint routes below require auth

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/assign', assignOfficerByName);
router.patch('/:id/confirm', confirmResolution);
router.patch('/:id/reopen', reopenComplaint);

export default router;
