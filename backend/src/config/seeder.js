import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Property, Coupon } from '../models/index.js';
import connectDB from './database.js';

dotenv.config();

// Sample data
const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@miamirentals.com',
    password: 'Admin@123456',
    role: 'super-admin',
    isVerified: true,
    phone: '+13051234567',
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'User@123456',
    role: 'user',
    isVerified: true,
    phone: '+13059876543',
  },
];

const properties = [
  {
    name: 'Luxury Oceanfront Penthouse',
    description: {
      short: 'Stunning 3-bedroom penthouse with panoramic ocean views in South Beach',
      full: 'Experience the ultimate Miami luxury lifestyle in this breathtaking oceanfront penthouse. Floor-to-ceiling windows offer panoramic views of the Atlantic Ocean and Miami skyline. This meticulously designed 3-bedroom, 3.5-bathroom residence features premium finishes, a gourmet kitchen, and a private terrace.',
    },
    type: 'penthouse',
    status: 'active',
    featured: true,
    priority: 1,
    location: {
      address: '1000 Ocean Drive',
      city: 'Miami Beach',
      state: 'Florida',
      zipCode: '33139',
      coordinates: [-80.1300, 25.7800],
      neighborhood: 'South Beach',
      nearbyAttractions: [
        { name: 'South Beach', distance: '0.1 miles', type: 'beach' },
        { name: 'Lincoln Road Mall', distance: '0.5 miles', type: 'shopping' },
        { name: 'Miami Beach Convention Center', distance: '0.8 miles', type: 'other' },
      ],
    },
    details: {
      bedrooms: 3,
      bathrooms: 3.5,
      maxGuests: 8,
      size: 2500,
      floor: 20,
      yearBuilt: 2020,
      parking: 2,
    },
    amenities: [
      { category: 'basic', name: 'WiFi', icon: 'wifi' },
      { category: 'basic', name: 'Air Conditioning', icon: 'ac' },
      { category: 'kitchen', name: 'Full Kitchen', icon: 'kitchen' },
      { category: 'outdoor', name: 'Private Balcony', icon: 'balcony' },
      { category: 'outdoor', name: 'Ocean View', icon: 'view' },
      { category: 'entertainment', name: 'Smart TV', icon: 'tv' },
      { category: 'safety', name: 'Security System', icon: 'security' },
      { category: 'other', name: 'Gym Access', icon: 'gym' },
    ],
    houseRules: {
      checkIn: '16:00',
      checkOut: '11:00',
      smoking: false,
      pets: false,
      parties: false,
      additionalRules: ['No loud music after 10 PM', 'Respect quiet hours'],
    },
    pricing: {
      basePrice: 850,
      cleaningFee: 250,
      serviceFee: 100,
      taxRate: 13.5,
      minimumStay: 2,
      weeklyDiscount: 10,
      monthlyDiscount: 25,
    },
    ratings: {
      average: 4.9,
      count: 45,
    },
  },
  {
    name: 'Modern Brickell Condo with Bay Views',
    description: {
      short: 'Sleek 2-bedroom condo in the heart of Brickell with stunning bay views',
      full: 'Located in the vibrant Brickell neighborhood, this modern condo offers the perfect blend of luxury and convenience. Enjoy stunning views of Biscayne Bay from your private balcony. The building features world-class amenities including a rooftop pool, fitness center, and 24/7 concierge.',
    },
    type: 'condo',
    status: 'active',
    featured: true,
    priority: 2,
    location: {
      address: '500 Brickell Avenue',
      city: 'Miami',
      state: 'Florida',
      zipCode: '33131',
      coordinates: [-80.1900, 25.7600],
      neighborhood: 'Brickell',
      nearbyAttractions: [
        { name: 'Brickell City Centre', distance: '0.2 miles', type: 'shopping' },
        { name: 'Bayfront Park', distance: '0.5 miles', type: 'park' },
        { name: 'American Airlines Arena', distance: '1.0 miles', type: 'entertainment' },
      ],
    },
    details: {
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 6,
      size: 1500,
      floor: 30,
      yearBuilt: 2019,
      parking: 1,
    },
    amenities: [
      { category: 'basic', name: 'WiFi', icon: 'wifi' },
      { category: 'basic', name: 'Air Conditioning', icon: 'ac' },
      { category: 'kitchen', name: 'Kitchen', icon: 'kitchen' },
      { category: 'outdoor', name: 'Pool Access', icon: 'pool' },
      { category: 'entertainment', name: 'Smart TV', icon: 'tv' },
      { category: 'other', name: 'Concierge', icon: 'concierge' },
    ],
    houseRules: {
      checkIn: '15:00',
      checkOut: '11:00',
      smoking: false,
      pets: true,
      parties: false,
    },
    pricing: {
      basePrice: 450,
      cleaningFee: 150,
      serviceFee: 75,
      taxRate: 13.5,
      minimumStay: 2,
      weeklyDiscount: 8,
      monthlyDiscount: 20,
    },
    ratings: {
      average: 4.7,
      count: 32,
    },
  },
  {
    name: 'Art Deco Villa in Miami Beach',
    description: {
      short: 'Charming restored Art Deco villa with private pool in Miami Beach',
      full: 'Step back in time with this beautifully restored 1930s Art Deco villa. This 4-bedroom gem features original architectural details combined with modern luxury. Enjoy your private pool, tropical garden, and proximity to the best of Miami Beach.',
    },
    type: 'villa',
    status: 'active',
    featured: true,
    priority: 3,
    location: {
      address: '2301 Collins Avenue',
      city: 'Miami Beach',
      state: 'Florida',
      zipCode: '33139',
      coordinates: [-80.1280, 25.7900],
      neighborhood: 'Mid-Beach',
      nearbyAttractions: [
        { name: 'Miami Beach Boardwalk', distance: '0.1 miles', type: 'beach' },
        { name: 'Faena District', distance: '0.3 miles', type: 'entertainment' },
        { name: 'Basement Miami', distance: '0.4 miles', type: 'entertainment' },
      ],
    },
    details: {
      bedrooms: 4,
      bathrooms: 3,
      maxGuests: 10,
      size: 3200,
      yearBuilt: 1935,
      parking: 2,
    },
    amenities: [
      { category: 'basic', name: 'WiFi', icon: 'wifi' },
      { category: 'outdoor', name: 'Private Pool', icon: 'pool' },
      { category: 'outdoor', name: 'Garden', icon: 'garden' },
      { category: 'kitchen', name: 'Gourmet Kitchen', icon: 'kitchen' },
      { category: 'entertainment', name: 'Home Theater', icon: 'theater' },
      { category: 'other', name: 'BBQ Grill', icon: 'bbq' },
    ],
    houseRules: {
      checkIn: '15:00',
      checkOut: '10:00',
      smoking: false,
      pets: true,
      parties: true,
      additionalRules: ['Events allowed with prior approval', 'Pool hours: 8 AM - 10 PM'],
    },
    pricing: {
      basePrice: 1200,
      cleaningFee: 350,
      serviceFee: 150,
      taxRate: 13.5,
      minimumStay: 3,
      weeklyDiscount: 12,
      monthlyDiscount: 30,
    },
    ratings: {
      average: 4.8,
      count: 28,
    },
  },
];

const coupons = [
  {
    code: 'WELCOME20',
    description: '20% off your first booking',
    type: 'percentage',
    value: 20,
    minimumBookingAmount: 500,
    maximumDiscount: 500,
    minimumNights: 2,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    status: 'active',
    applicableUserTypes: ['new'],
  },
  {
    code: 'MIAMI100',
    description: '$100 off any booking over $1000',
    type: 'fixed',
    value: 100,
    minimumBookingAmount: 1000,
    minimumNights: 3,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    status: 'active',
    applicableUserTypes: ['all'],
  },
  {
    code: 'SUMMER25',
    description: '25% off summer stays',
    type: 'percentage',
    value: 25,
    minimumBookingAmount: 750,
    maximumDiscount: 750,
    minimumNights: 5,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    status: 'active',
    applicableUserTypes: ['all'],
  },
];

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Property.deleteMany();
    await Coupon.deleteMany();

    console.log('Data cleared...');

    // Insert users
    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0]._id;
    console.log('Users imported...');

    // Add createdBy to properties
    const propertiesWithUser = properties.map(property => ({
      ...property,
      createdBy: adminUser,
    }));

    // Insert properties
    await Property.create(propertiesWithUser);
    console.log('Properties imported...');

    // Insert coupons
    const couponsWithUser = coupons.map(coupon => ({
      ...coupon,
      createdBy: adminUser,
    }));
    await Coupon.create(couponsWithUser);
    console.log('Coupons imported...');

    console.log('Data imported successfully! ✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Property.deleteMany();
    await Coupon.deleteMany();

    console.log('Data destroyed successfully! ✅');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run seeder
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import or -d to delete data');
  process.exit();
}