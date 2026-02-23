import { Router } from 'express';
import { getAllProjects, createProject, rateProject } from '../controllers/project-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

router.get('/', getAllProjects); // Publicly viewable
router.post('/', authenticate, createProject); // Admin only (checked in controller)
router.patch('/:id/rate', authenticate, rateProject); // Logged in users

export default router;
