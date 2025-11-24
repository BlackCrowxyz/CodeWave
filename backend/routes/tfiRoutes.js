import express from 'express';
import { getRealtimeBusUpdates, findBusRoute } from '../controllers/tfiController.js';

const router = express.Router();

router.get('/tfi/live', getRealtimeBusUpdates);
router.get('/tfi/route', findBusRoute);

export default router;
