import { Router } from 'express';
import {
    createComplaint,
    getMyComplaints,
    getComplaintById,
    updateComplaintStatus,
    confirmResolution,
    reopenComplaint,
    getComplaintStatusPublic,
    assignOfficerByName,
    getNearbyComplaints,
    upvoteComplaint
} from '../controllers/complaint-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

// Public routes — no auth needed
router.get('/public-status/:complaintId', getComplaintStatusPublic);
router.get('/nearby', getNearbyComplaints); // ?lat=X&lng=Y&radius=3

router.use(authenticate); // All routes below require auth

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/assign', assignOfficerByName);
router.patch('/:id/confirm', confirmResolution);
router.patch('/:id/reopen', reopenComplaint);
router.post('/:id/upvote', upvoteComplaint);

export default router;
