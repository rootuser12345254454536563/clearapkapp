export type AppLanguage = 'en' | 'ta' | 'si';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  stockQuantity: number;
  category: string;
  brand: string;
  sku: string;
  specifications: string;
  variants: string;
  weight: string;
  images: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isVisible: boolean;
  createdAt: number;
}

export interface Category {
  id: number;
  name: string;
  iconName: string;
  imageUrl: string;
  itemCount: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  destinationType: 'category' | 'product' | 'deals';
  destinationValue: string;
  actionText: string;
}

export interface CartItem {
  id: string;
  productId: number;
  quantity: number;
  selectedVariant: string;
}

export interface CartItemWithProduct {
  cartItem: CartItem;
  product: Product;
}

export interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  whatsappNumber: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  language: AppLanguage;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export type SortOption = 'DEFAULT' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'NEWEST';

export type ScreenType =
  | 'user-login'
  | 'user-register'
  | 'seller-login'
  | 'seller-register'
  | 'admin-login'
  | 'forgot-password'
  | 'home'
  | 'categories'
  | 'search'
  | 'cart'
  | 'account'
  | 'product-detail'
  | 'checkout'
  | 'order-success'
  | 'my-orders'
  | 'order-detail'
  | 'wishlist'
  | 'saved-addresses'
  | 'user-dashboard'
  | 'seller-dashboard'
  | 'admin-dashboard'
  | 'integration-guide';

export interface ScreenState {
  type: ScreenType;
  productId?: number;
  orderId?: string;
}
