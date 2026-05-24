import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: false,
});

console.log("stripe initialized with secret key:", process.env.STRIPE_SECRET_KEY);

export default stripe;