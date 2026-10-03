import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  Order,
  CartItem,
  CartItemWithProduct,
  Address,
  StoreSettings,
  UserProfile,
  Review,
  AppLanguage,
  ScreenState
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialSettings,
  initialAddresses,
  initialUserProfile,
  initialReviews
} from '../data/initialData';
import { translations } from '../localization/translations';
import { db, auth } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { createOrderInFirestore } from '../services/marketplaceService';

interface StoreContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (typeof translations)['en'];
  products: Product[];
  categories: Category[];
  banners: Banner[];
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  cart: CartItem[];
  cartWithProducts: CartItemWithProduct[];
  cartTotalCount: number;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartGrandTotal: number;
  addToCart: (productId: number, quantity?: number, variant?: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  user: UserProfile;
  updateUser: (user: Partial<UserProfile>) => void;
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('buyjump_lang') as AppLanguage) || 'en';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('buyjump_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories] = useState<Category[]>(initialCategories);
  const [banners] = useState<Banner[]>(initialBanners);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('buyjump_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('buyjump_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('buyjump_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('buyjump_addresses');
    return saved ? JSON.parse(saved) : initialAddresses;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('buyjump_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('buyjump_user');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('buyjump_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // Screen state starts at user-login if unauthenticated, or home if authenticated/guest
  const [screen, setScreenState] = useState<ScreenState>(() => {
    const hasAuth = auth.currentUser !== null;
    const isGuest = sessionStorage.getItem('buyjump_guest_mode') === 'true';
    if (hasAuth || isGuest) {
      return { type: 'home' };
    }
    return { type: 'user-login' };
  });

  const setScreen = (newScreen: ScreenState) => {
    setScreenState(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('buyjump_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('buyjump_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('buyjump_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('buyjump_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('buyjump_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('buyjump_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('buyjump_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('buyjump_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Synchronize Firestore products in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status === 'active' || !data.status) {
            firestoreList.push({
              id: typeof data.id === 'number' ? data.id : Math.abs(hashCode(docSnap.id)),
              name: data.name || 'Product',
              description: data.description || '',
              price: Number(data.price) || 0,
              discountPrice: Number(data.discountPrice) || 0,
              stockQuantity: Number(data.stock ?? data.stockQuantity) || 0,
              category: data.category || 'General',
              brand: data.sellerName || data.brand || 'BUYJUMP',
              sku: data.id || `SKU-${docSnap.id.slice(0, 6)}`,
              specifications: data.specifications || 'Authentic marketplace item',
              variants: data.variants || 'Standard',
              weight: data.weight || 'Standard',
              images: data.imageUrl || data.images || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
              rating: Number(data.rating) || 5.0,
              reviewCount: Number(data.reviewCount) || 12,
              isFeatured: Boolean(data.isFeatured),
              isBestSeller: Boolean(data.isBestSeller),
              isNewArrival: true,
              isVisible: true,
              createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
            });
          }
        });
        if (firestoreList.length > 0) {
          const existingIds = new Set(firestoreList.map(p => p.id));
          const combined = [...firestoreList, ...initialProducts.filter(p => !existingIds.has(p.id))];
          setProducts(combined);
        }
      }
    }, (err) => {
      console.warn('Firestore products stream notice:', err);
    });

    return () => unsub();
  }, []);

  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || Date.now();
  }

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const t = translations[language] || translations.en;

  // Cart operations
  const addToCart = (productId: number, quantity: number = 1, variant: string = '') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const defaultVariant = variant || (product.variants ? product.variants.split(',')[0].trim() : 'Standard');

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.selectedVariant === defaultVariant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [
        ...prev,
        {
          id: `${productId}-${defaultVariant}-${Date.now()}`,
          productId,
          quantity,
          selectedVariant: defaultVariant
        }
      ];
    });
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: number) => {
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderId = `BJ-${dateStr}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      orderId,
      createdAt: Date.now()
    };
    setOrders(prev => [newOrder, ...prev]);

    const currentUserId = auth.currentUser?.uid || `guest_${Date.now()}`;
    createOrderInFirestore({
      userId: currentUserId,
      customerName: orderData.customerName,
      customerEmail: auth.currentUser?.email || `${orderData.customerName.toLowerCase().replace(/\s+/g, '')}@buyjump.com`,
      customerPhone: orderData.customerPhone,
      items: cartWithProducts.map(c => ({
        productId: String(c.product.id),
        name: c.product.name,
        price: c.product.discountPrice > 0 ? c.product.discountPrice : c.product.price,
        quantity: c.cartItem.quantity,
        selectedVariant: c.cartItem.selectedVariant,
        imageUrl: c.product.images.split(',')[0].trim()
      })),
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      status: 'pending'
    }).catch(err => console.warn('Firestore order sync:', err));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => (ord.orderId === orderId ? { ...ord, status } : ord))
    );
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`
    };
    setAddresses(prev => {
      if (newAddress.isDefault) {
        return [newAddress, ...prev.map(a => ({ ...a, isDefault: false }))];
      }
      return [...prev, newAddress];
    });
  };

  const updateAddress = (updated: Address) => {
    setAddresses(prev =>
      prev.map(a => {
        if (a.id === updated.id) return updated;
        if (updated.isDefault) return { ...a, isDefault: false };
        return a;
      })
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  const updateUser = (userData: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReviews(prev => [newReview, ...prev]);
  };

  // Cart calculations
  const cartWithProducts: CartItemWithProduct[] = cart
    .map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) return null;
      return { cartItem, product };
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cartWithProducts.reduce((sum, { cartItem, product }) => {
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    return sum + price * cartItem.quantity;
  }, 0);

  const cartDeliveryFee =
    cartSubtotal === 0 || cartSubtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFee;

  const cartGrandTotal = cartSubtotal + cartDeliveryFee;

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        t,
        products,
        categories,
        banners,
        settings,
        updateSettings,
        cart,
        cartWithProducts,
        cartTotalCount,
        cartSubtotal,
        cartDeliveryFee,
        cartGrandTotal,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        orders,
        createOrder,
        updateOrderStatus,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        user,
        updateUser,
        reviews,
        addReview,
        screen,
        setScreen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
