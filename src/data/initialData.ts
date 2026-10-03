import {
  Category,
  Product,
  Banner,
  StoreSettings,
  Address,
  UserProfile,
  Review
} from '../types';

export const initialCategories: Category[] = [
  { id: 1, name: 'Fresh Fruits', iconName: 'Apple', imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80', itemCount: 12 },
  { id: 2, name: 'Vegetables', iconName: 'Carrot', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', itemCount: 18 },
  { id: 3, name: 'Dairy & Eggs', iconName: 'Milk', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', itemCount: 9 },
  { id: 4, name: 'Bakery', iconName: 'Croissant', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', itemCount: 14 },
  { id: 5, name: 'Spices & Grains', iconName: 'Flame', imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', itemCount: 22 },
  { id: 6, name: 'Beverages', iconName: 'Coffee', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', itemCount: 16 }
];

export const initialProducts: Product[] = [
  {
    id: 101,
    name: 'Jaffna Karthacolomban Mangoes (1kg)',
    description: 'Freshly harvested authentic Jaffna sweet Karthacolomban mangoes. Hand-picked at peak ripeness.',
    price: 1200,
    discountPrice: 990,
    stockQuantity: 45,
    category: 'Fresh Fruits',
    brand: 'Jaffna Orchards',
    sku: 'FRU-MAN-001',
    specifications: 'Origin: Jaffna | Weight: 1kg (approx 3-4 fruits) | 100% Organic',
    variants: '1kg, 2kg, 5kg Box',
    weight: '1kg',
    images: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 102,
    name: 'Pure Ceylon Cinnamon Sticks (100g)',
    description: 'True Ceylon Cinnamon (Alba grade), organically grown in southern Sri Lanka with exquisite sweet aroma.',
    price: 850,
    discountPrice: 720,
    stockQuantity: 80,
    category: 'Spices & Grains',
    brand: 'Ceylon Spice Co',
    sku: 'SPI-CIN-002',
    specifications: 'Grade: Alba | Origin: Matara | 100g Pouch | Export Quality',
    variants: '100g, 250g, 500g',
    weight: '100g',
    images: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 38,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 103,
    name: 'Fresh Farm Cow Milk (1L Bottle)',
    description: 'Fresh pasteurized whole cow milk delivered daily from local dairy farms. No artificial preservatives.',
    price: 450,
    discountPrice: 390,
    stockQuantity: 25,
    category: 'Dairy & Eggs',
    brand: 'Highland Fresh',
    sku: 'DAI-MLK-003',
    specifications: 'Volume: 1 Liter | Fat: 3.5% | Pasteurized & Homogenized',
    variants: '1L Bottle, 2L Bottle',
    weight: '1L',
    images: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 19,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 104,
    name: 'Artisan Wood-Fired Sourdough Bread',
    description: 'Slow-fermented crusty rustic sourdough loaf baked with natural starter and unbleached flour.',
    price: 680,
    discountPrice: 0,
    stockQuantity: 15,
    category: 'Bakery',
    brand: 'Crust & Crumb',
    sku: 'BAK-SOU-004',
    specifications: 'Weight: 600g | Fermentation: 24h | Vegetarian',
    variants: 'Standard Loaf, Sliced',
    weight: '600g',
    images: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 26,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 105,
    name: 'Pure Organic Wild Blossom Honey (350g)',
    description: 'Raw unfiltered honey collected from forest beehives. Pure, nutritious and naturally antimicrobial.',
    price: 1650,
    discountPrice: 1450,
    stockQuantity: 30,
    category: 'Spices & Grains',
    brand: 'Nature Bee',
    sku: 'SPI-HON-005',
    specifications: '350g Glass Jar | 100% Pure Raw Honey | Unheated',
    variants: '350g Jar, 750g Jar',
    weight: '350g',
    images: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 31,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 106,
    name: 'Organic Nuwara Eliya Green Cabbage (1kg)',
    description: 'Crisp mountain-grown green cabbage packed with vitamins. Freshly picked from hill country farms.',
    price: 320,
    discountPrice: 280,
    stockQuantity: 50,
    category: 'Vegetables',
    brand: 'Hill Country Green',
    sku: 'VEG-CAB-006',
    specifications: 'Weight: 1kg (approx 1 head) | Grade A Produce',
    variants: '1kg, 2kg',
    weight: '1kg',
    images: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewCount: 15,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isVisible: true,
    createdAt: Date.now() - 86400000 * 4
  }
];

export const initialBanners: Banner[] = [
  {
    id: 1,
    title: 'Daily Super Saver',
    subtitle: 'Up to 30% OFF on Fresh Produce',
    badgeText: 'HOT DEAL',
    imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&auto=format&fit=crop&q=80',
    destinationType: 'deals',
    destinationValue: 'Fresh Fruits',
    actionText: 'Shop Deals'
  },
  {
    id: 2,
    title: 'Pure Ceylon Spices',
    subtitle: 'Directly from Southern Spice Gardens',
    badgeText: 'PREMIUM',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&auto=format&fit=crop&q=80',
    destinationType: 'category',
    destinationValue: 'Spices & Grains',
    actionText: 'Explore Spices'
  }
];

export const initialSettings: StoreSettings = {
  storeName: 'BUYJUMP',
  storeTagline: 'Islandwide Shopping & Fast WhatsApp Delivery',
  storePhone: '+94 77 123 4567',
  storeEmail: 'support@buyjump.com',
  storeAddress: 'Colombo & Jaffna, Sri Lanka',
  whatsappNumber: '+94771234567',
  currency: 'Rs.',
  deliveryFee: 250,
  freeDeliveryThreshold: 3500,
  language: 'en',
  notificationsEnabled: true
};

export const initialAddresses: Address[] = [
  {
    id: 'addr-1',
    fullName: 'Priyantha Silva',
    phone: '+94 77 123 4567',
    streetAddress: 'No. 42 Galle Road',
    city: 'Colombo 03',
    postalCode: '00300',
    isDefault: true
  }
];

export const initialUserProfile: UserProfile = {
  name: 'Priyantha Silva',
  email: 'priyantha@buyjump.com',
  phone: '+94 77 123 4567',
  avatarUrl: ''
};

export const initialReviews: Review[] = [
  {
    id: 1,
    productId: 101,
    customerName: 'Suresh Kumar',
    rating: 5,
    comment: 'Best mangoes I have ever tasted! Delivered fresh and on time via WhatsApp tracking.',
    date: 'Sep 25, 2026'
  },
  {
    id: 2,
    productId: 102,
    customerName: 'Anoma Perera',
    rating: 5,
    comment: 'Authentic Ceylon cinnamon sticks, very fragrant and top quality.',
    date: 'Sep 27, 2026'
  }
];
