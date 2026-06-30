import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Return from '../models/Return.js';
import connectDB from '../config/db.js';

dotenv.config();

// Connect DB
connectDB();

const categoriesData = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Find the latest gadgets, phones, laptops, and smart devices.',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Clothing & Fashion',
    slug: 'clothing-fashion',
    description: 'Upgrade your wardrobe with stylish apparel, shoes, and accessories.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Get ready for adventure with athletic gear, fitness items, and camping equipment.',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Transform your home with furniture, cookware, and decorative items.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop'
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Explore literature, notebooks, and writing materials.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop'
  }
];

const productsData = (catMap) => [
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Experience the titanium design, groundbreaking camera, and A17 Pro chip. The ultimate smartphone.',
    price: 139900,
    discountPrice: 129900,
    category: catMap['Electronics'],
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.8,
    numReviews: 2,
    features: ['Titanium build', 'A17 Pro GPU', '5x Telephoto lens', 'USB-C interface']
  },
  {
    name: 'Sony WH-1000XM5 ANC Headphones',
    slug: 'sony-wh-1000xm5-anc-headphones',
    description: 'Industry-leading noise canceling wireless headphones with crystal-clear hands-free calling and Alexa voice control.',
    price: 29990,
    discountPrice: 26990,
    category: catMap['Electronics'],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.6,
    numReviews: 1,
    features: ['Industry leading ANC', '30 Hours Battery Life', 'Multipoint Connection', 'Touch Control']
  },
  {
    name: 'Smart Fitness Band Pro',
    slug: 'smart-fitness-band-pro',
    description: 'Track your steps, heart rate, blood oxygen levels, and workouts in real-time. Water resistant design with 14-day battery.',
    price: 3999,
    discountPrice: 2499,
    category: catMap['Electronics'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.2,
    numReviews: 1,
    features: ['AMOLED Display', 'Heart Rate Tracker', 'SpO2 Sensor', '5ATM Water Resistance']
  },
  {
    name: 'Premium Leather Bomber Jacket',
    slug: 'premium-leather-bomber-jacket',
    description: 'Made from 100% genuine sheepskin leather, this classic bomber jacket is perfect for casual settings or night outs.',
    price: 7999,
    discountPrice: 5999,
    category: catMap['Clothing & Fashion'],
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.5,
    numReviews: 0,
    features: ['100% Genuine Leather', 'Polyester interior lining', 'Durable YKK zippers', 'Elastic knit cuffs']
  },
  {
    name: 'Minimalist Canvas Sneakers',
    slug: 'minimalist-canvas-sneakers',
    description: 'Ultra-lightweight and breathable canvas sneakers. Features a cushioned insole and non-slip rubber grip.',
    price: 2999,
    discountPrice: 1999,
    category: catMap['Clothing & Fashion'],
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.0,
    numReviews: 0,
    features: ['Breathable canvas', 'Ortholite cushion sole', 'Vulcanized rubber wall', 'Machine washable']
  },
  {
    name: 'Ergonomic Camping Backpack 65L',
    slug: 'ergonomic-camping-backpack-65l',
    description: 'Designed for multi-day hikes. Features air-mesh back ventilation, hydration bladder sleeve, and rain cover.',
    price: 5999,
    discountPrice: 4999,
    category: catMap['Sports & Outdoors'],
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.7,
    numReviews: 0,
    features: ['65L Capacity', 'Waterproof rain cover included', 'Breathable mesh straps', 'Sleeping bag compartment']
  },
  {
    name: 'High-Bounce Yoga Mat 8mm',
    slug: 'high-bounce-yoga-mat-8mm',
    description: 'Eco-friendly TPE yoga mat with alignment lines. Double-sided non-slip surface provides cushioning and grip.',
    price: 1499,
    discountPrice: 999,
    category: catMap['Sports & Outdoors'],
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.4,
    numReviews: 0,
    features: ['8mm thick TPE cushion', 'Alignment guides', 'Scentless and non-toxic', 'Carrying strap included']
  },
  {
    name: 'Professional Ceramic Cookware 10-Piece Set',
    slug: 'professional-ceramic-cookware-10-piece-set',
    description: 'Non-stick ceramic coated aluminum cookware set. Includes pots, pans, and tempered glass lids. Oven safe.',
    price: 12999,
    discountPrice: 9999,
    category: catMap['Home & Kitchen'],
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.3,
    numReviews: 0,
    features: ['PTFE and PFOA free', 'Soft touch handles', 'Oven safe up to 350F', 'Tempered glass lids']
  },
  {
    name: 'Minimalist Modern Table Lamp',
    slug: 'minimalist-modern-table-lamp',
    description: 'A sleek wood-base table lamp featuring a linen fabric shade. Perfect for a bedside table or study desk.',
    price: 2499,
    discountPrice: 1499,
    category: catMap['Home & Kitchen'],
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.1,
    numReviews: 0,
    features: ['Solid wood base', 'Linen drum shade', 'E26 socket with bulb', 'On/off rocker line switch']
  },
  {
    name: 'Hardcover Notebook & Gel Pen Set',
    slug: 'hardcover-notebook-gel-pen-set',
    description: 'Premium faux-leather lined journal notebook (120gsm ink-proof paper) paired with 3 fine point black gel pens.',
    price: 799,
    discountPrice: 499,
    category: catMap['Books & Stationery'],
    stock: 100,
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop'
    ],
    rating: 4.5,
    numReviews: 0,
    features: ['120gsm lined paper', 'Expandable inner pocket', 'Elastic band closure', '0.5mm black gel pens']
  }
];

const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Return.deleteMany({});

    console.log('Database cleared!');

    // Create users
    const adminUser = await User.create({
      name: 'ShopEZ Admin',
      email: 'admin@shopez.com',
      password: 'adminpassword123',
      role: 'ADMIN',
      phone: '9876543210'
    });

    const standardUser = await User.create({
      name: 'Jane Doe',
      email: 'jane@shopez.com',
      password: 'userpassword123',
      role: 'USER',
      phone: '9988776655',
      addresses: [
        {
          street: '123 Main St, Appt 4B',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
          isDefault: true
        }
      ]
    });

    console.log('Users created!');

    // Initialize carts and wishlists
    await Cart.create({ user: adminUser._id, items: [] });
    await Wishlist.create({ user: adminUser._id, products: [] });

    const customerCart = await Cart.create({ user: standardUser._id, items: [] });
    await Wishlist.create({ user: standardUser._id, products: [] });

    // Seed categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log('Categories created!');

    // Create category map for products lookup
    const catMap = {};
    createdCategories.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    // Seed products
    const sampleProducts = productsData(catMap);
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log('Products created!');

    // Let's add standardUser to customerCart item for testing
    customerCart.items.push({
      product: createdProducts[1]._id, // Sony headphones
      quantity: 1,
      saveForLater: false
    });
    customerCart.items.push({
      product: createdProducts[2]._id, // Fitness band
      quantity: 2,
      saveForLater: true // Saved for later
    });
    await customerCart.save();

    // Create some sample reviews
    const review1 = await Review.create({
      user: standardUser._id,
      userName: standardUser.name,
      product: createdProducts[0]._id, // iPhone
      rating: 5,
      comment: 'Absolutely love the new titanium design and camera. Best phone ever!'
    });

    const review2 = await Review.create({
      user: adminUser._id,
      userName: adminUser.name,
      product: createdProducts[0]._id, // iPhone
      rating: 4,
      comment: 'Great phone, but the price is too high. Otherwise, solid upgrade.'
    });

    const review3 = await Review.create({
      user: standardUser._id,
      userName: standardUser.name,
      product: createdProducts[1]._id, // Sony
      rating: 5,
      comment: 'The noise cancellation is magical. Very comfortable for long flights.'
    });

    // Run review aggregates
    await Review.calculateAverageRating(createdProducts[0]._id);
    await Review.calculateAverageRating(createdProducts[1]._id);
    console.log('Reviews and aggregates updated!');

    // Create a sample order
    const order = await Order.create({
      user: standardUser._id,
      orderItems: [
        {
          product: createdProducts[0]._id, // iPhone
          name: createdProducts[0].name,
          quantity: 1,
          price: createdProducts[0].price,
          image: createdProducts[0].images[0]
        }
      ],
      shippingAddress: standardUser.addresses[0],
      paymentMethod: 'COD',
      itemsPrice: 139900,
      taxPrice: 25182,
      shippingPrice: 0,
      totalPrice: 165082,
      isPaid: false,
      isDelivered: false,
      orderStatus: 'Pending'
    });
    console.log('Sample order created!');

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

importData();
