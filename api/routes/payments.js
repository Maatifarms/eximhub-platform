const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { Cashfree, CFEnvironment } = require('cashfree-pg'); 

// Config
const PLAN_CONFIG = {
  program_1: { tier: 'Program 1', points: 500, amount: 25000 },
  program_2: { tier: 'Program 2', points: 1200, amount: 45000 },
};

// Cashfree Setup
Cashfree.XClientId = process.env.CASHFREE_APP_ID || '';
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || '';
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

// 1. Create Cashfree Order
router.post('/create-order', auth, async (req, res) => {
  const { planId, bookId } = req.body;
  const user = req.user;
  
  let amount = 0;
  let label = '';

  if (planId) {
    const plan = PLAN_CONFIG[planId];
    if (!plan) return res.status(400).json({ success: false, message: 'Invalid plan' });
    amount = plan.amount;
    label = plan.tier;
  } else if (bookId) {
    const [books] = await db.execute('SELECT price, title FROM books WHERE id = ?', [bookId]);
    if (books.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });
    amount = books[0].price || 499;
    label = `Book: ${books[0].title}`;
  } else {
    return res.status(400).json({ success: false, message: 'planId or bookId required' });
  }

  const orderId = `ORDER_${user.id}_${Date.now()}`;

  try {
    const response = await Cashfree.PGCreateOrder("2023-08-01", {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: String(user.id),
        customer_email: user.email,
        customer_phone: user.phone || "9169658628",
        customer_name: user.name || "Customer",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_BASE_URL || 'https://eximhub.pro'}/dashboard?order_id={order_id}&status=verify`,
      }
    });

    await db.execute(
      'INSERT INTO payment_orders (user_id, order_id, plan_id, book_id, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, orderId, planId || null, bookId || null, amount, 'PENDING']
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('PAYMENT_INIT_ERROR:', error.response?.data || error);
    res.status(500).json({ success: false, message: 'Failed to init payment' });
  }
});

// 2. Verify Payment
router.post('/verify-order', auth, async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;
  try {
    const [orders] = await db.execute('SELECT * FROM payment_orders WHERE order_id = ? AND user_id = ? LIMIT 1', [orderId, userId]);
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = orders[0];
    if (order.status === 'SUCCESS') return res.json({ success: true, message: 'Already verified' });

    const cfResponse = await Cashfree.PGGetOrder("2023-08-01", orderId);
    const cfDetails = cfResponse.data;
    
    if (cfDetails.order_status === 'PAID') {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute('UPDATE payment_orders SET status = ?, transaction_id = ? WHERE id = ?', ['SUCCESS', cfDetails.order_token || 'CF_PAID', order.id]);
        
        if (order.plan_id) {
          const plan = PLAN_CONFIG[order.plan_id];
          await conn.execute('UPDATE users SET subscription_tier = ?, points_balance = points_balance + ? WHERE id = ?', [plan.tier, plan.points, userId]);
          await conn.commit();
          res.json({ success: true, message: `Upgraded to ${plan.tier}` });
        } else if (order.book_id) {
          await conn.execute('INSERT IGNORE INTO purchases (user_id, book_id, payment_id) VALUES (?, ?, ?)', [userId, order.book_id, orderId]);
          await conn.commit();
          res.json({ success: true, message: `Book unlocked successfully` });
        } else {
          await conn.commit();
          res.json({ success: true, message: 'Payment successful' });
        }
      } catch (dbErr) {
        await conn.rollback();
        throw dbErr;
      } finally {
        conn.release();
      }
    } else {
      res.json({ success: false, status: cfDetails.order_status });
    }
  } catch (error) {
    console.error('PAYMENT_VERIFY_ERROR:', error.response?.data || error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

module.exports = router;
