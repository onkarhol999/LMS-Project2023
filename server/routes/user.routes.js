import upload from '../middlerwares/multer.middleware.js';
import { Router } from 'express';
import { getProfile,register, login, logout, forgotPassword, resetPassword, changedPassword, updateUser } from '../controllers/user.controller.js';
import { isLoggedIn } from '../middlerwares/auth.middleware.js';

const router = Router();


router.post('/register', upload.single("avatar"), register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isLoggedIn,getProfile);
router.post('/reset',forgotPassword);
router.post('/reset/:resetToken',resetPassword);
router.post('/changed-password',isLoggedIn, changedPassword);
router.put('/update',isLoggedIn, upload.single("avatar"), updateUser)

export default router;
