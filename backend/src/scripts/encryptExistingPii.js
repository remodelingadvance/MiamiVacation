import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import { Booking, User } from '../models/index.js';
import { assertFieldEncryptionReady } from '../utils/fieldEncryption.js';

dotenv.config();

const resaveCollection = async (Model, label) => {
  let count = 0;
  const cursor = Model.find({}).cursor();

  for await (const doc of cursor) {
    await doc.save({ validateBeforeSave: false });
    count += 1;

    if (count % 100 === 0) {
      console.log(`[encrypt:pii] ${label}: ${count} records processed`);
    }
  }

  console.log(`[encrypt:pii] ${label}: ${count} records processed`);
};

const run = async () => {
  assertFieldEncryptionReady();
  await connectDB();

  await resaveCollection(User, 'users');
  await resaveCollection(Booking, 'bookings');

  await mongoose.connection.close();
  console.log('[encrypt:pii] Complete');
};

run().catch(async (error) => {
  console.error('[encrypt:pii] Failed:', error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
