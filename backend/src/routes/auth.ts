import { Router } from 'express';
import { registerParent, loginParent, loginChild, getChildLoginOptions } from '../controllers/authController';

const router = Router();

router.post('/register', registerParent);
router.post('/login', loginParent);
router.get('/child-options', getChildLoginOptions);
router.post('/child-login', loginChild);

export default router;
