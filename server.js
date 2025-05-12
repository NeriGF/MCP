// ✅ Simple Express Server for Stripe Checkout + Success Page
// - Collects payment
// - Shows Stripe customer ID as "MCP API Key"
// - Deployable to Render, Vercel, or any Node host

import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });
app.use(express.static('public'));

// 1️⃣ Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: process.env.PRICE_ID, quantity: 1 }],
    success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.DOMAIN}/cancel`
  });
  res.redirect(303, session.url);
});

// 2️⃣ Show API Key (customer.id) on success
app.get('/success', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.send('Missing session ID');

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const customerId = session.customer;

  res.send(`<h2>✅ Subscription Success</h2>
            <p>Your MCP API Key (Stripe customer ID):</p>
            <pre>${customerId}</pre>
            <p>Use this to call your deal-finding tool in Claude or Postman.</p>`);
});

app.get('/cancel', (req, res) => {
  res.send('<h2>❌ Payment canceled</h2>');
});
// ✅ Landing page for users
app.get('/', (req, res) => {
  res.send('<a href="/checkout">Click here to subscribe</a>');
});

app.get('/checkout', (req, res) => {
  res.send(`
    <form action="/create-checkout-session" method="POST">
      <button type="submit">Subscribe for Deals Access</button>
    </form>
  `);
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

