import { Router } from 'express';
import { analyzeImage } from '../controllers/ai-controller';

const router = Router();

router.post('/analyze-image', analyzeImage);

export default router;
