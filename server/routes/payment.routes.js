import { Router } from 'express';
import {
  allPayments,
  buySubscription,
  cancelSubscription,
  getRazorpayApiKey,
  verifySubscription
} from '../controllers/payment.controller.js';

import {
  authorizedRoles,
  isLoggedIn
} from '../middlewares/auth.middleware.js';

const router = Router();

// Get Razorpay API key (logged-in users)
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);

// Subscribe to a plan
router.route('/subscribe').post(isLoggedIn, buySubscription);

// Verify subscription payment
router.route('/verify').post(isLoggedIn, verifySubscription);

// Cancel subscription
router.route('/unsubscribe').post(isLoggedIn, cancelSubscription);

// Get all payments (ADMIN only)
router.route('/').get(isLoggedIn, authorizedRoles('ADMIN'), allPayments);

export default router;
