import React, { useEffect, useRef, useState } from 'react';
import { useStore } from './context/StoreContext';
import { useAuth } from './context/AuthContext';
import { MobileAppBar } from './components/MobileAppBar';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderSuccessScreen } from './screens/OrderSuccessScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { WishlistScreen } from './screens/WishlistScreen';
import { SavedAddressesScreen } from './screens/SavedAddressesScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { AccountScreen } from './screens/AccountScreen';
import { UserLoginScreen } from './screens/UserLoginScreen';
import { UserRegisterScreen } from './screens/UserRegisterScreen';
import { SellerLoginScreen } from './screens/SellerLoginScreen';
import { SellerRegisterScreen } from './screens/SellerRegisterScreen';
import { SellerDashboard } from './screens/SellerDashboard';
import { AdminLoginScreen } from './screens/AdminLoginScreen';
import { AdminPortalScreen } from './screens/AdminPortalScreen';
import { ShieldAlert, Download, CheckCircle2 } from 'lucide-react';

const ApkDownloadBar: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Hide inside the compiled Android APK WebView
  if (typeof window !== 'undefined' && (window.location.hostname === 'buyjump.local' || (window as any).BuyJumpNative)) {
    return null;
  }

  const handleDownloadApk = async () => {
    try {
      setDownloading(true);
      const response = await fetch('/download/app-debug.apk');
      if (!response.ok) {
        throw new Error('APK download failed');
      }
      const blob = await response.blob();
      const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
      const url = window.URL.createObjectURL(apkBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'app-debug.apk';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch {
      const a = document.createElement('a');
      a.href = '/download/app-debug.apk';
      a.download = 'app-debug.apk';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full bg-emerald-950 border-b border-emerald-700/60 px-3 py-2 text-white flex items-center justify-between gap-2 z-50">
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 truncate">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>APK Ready: android/app/build/outputs/apk/debug/app-debug.apk</span>
        </div>
        <div className="text-[10px] text-emerald-200/80 truncate">
          Signed Debug APK • 1.5 MB • Android SDK 35 (minSdk 24)
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownloadApk}
        disabled={downloading}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{downloading ? 'Downloading...' : downloaded ? 'Downloaded APK' : 'Download APK'}</span>
      </button>
    </div>
  );
};

export const App: React.FC = () => {
  const { screen, setScreen, t } = useStore();
  const { currentUser, role, isLoading, isGuest } = useAuth();

  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // Listen to browser path for /admin/login direct link
  useEffect(() => {
    const handleUrlCheck = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (pathname.includes('/admin/login') || hash.includes('/admin/login')) {
        setScreen({ type: 'admin-login' });
      }
    };
    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, [setScreen]);

  // Handle protected route guards
  useEffect(() => {
    if (isLoading) return;

    if (screen.type === 'admin-dashboard') {
      if (!currentUser || role !== 'admin') {
        setScreen({ type: 'admin-login' });
      }
    }

    if (screen.type === 'seller-dashboard') {
      if (!currentUser || role !== 'seller') {
        setScreen({ type: 'seller-login' });
      }
    }

    if (screen.type === 'my-orders' || screen.type === 'saved-addresses') {
      if (!currentUser && !isGuest) {
        setScreen({ type: 'user-login' });
      }
    }
  }, [screen.type, currentUser, role, isLoading, isGuest, setScreen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="w-16 h-16 rounded-2xl bg-white p-1 ring-4 ring-emerald-400/40 shadow-xl flex items-center justify-center animate-pulse mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <rect width="100" height="100" rx="24" fill="#0F2C59" />
            <path d="M28 24h24c8.8 0 16 7.2 16 16 0 5.4-2.7 10.2-6.8 13.1C66.5 56.4 70 62.8 70 70c0 8.8-7.2 16-16 16H28V24z" fill="#00D053" />
            <circle cx="74" cy="26" r="6" fill="#F59E0B" />
          </svg>
        </div>
        <h2 className="text-xl font-black tracking-tight">BUYJUMP</h2>
        <p className="text-xs text-blue-200/80 mt-1">Starting mobile app...</p>
      </div>
    );
  }

  if (screen.type === 'user-login') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <ApkDownloadBar />
        <UserLoginScreen />
      </div>
    );
  }

  if (screen.type === 'user-register') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <ApkDownloadBar />
        <UserRegisterScreen />
      </div>
    );
  }

  if (screen.type === 'seller-login') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <ApkDownloadBar />
        <SellerLoginScreen />
      </div>
    );
  }

  if (screen.type === 'seller-register') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <ApkDownloadBar />
        <SellerRegisterScreen />
      </div>
    );
  }

  if (screen.type === 'admin-login') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <ApkDownloadBar />
        <AdminLoginScreen />
      </div>
    );
  }

  if (screen.type === 'admin-dashboard') {
    if (!currentUser || role !== 'admin') {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
          <h2 className="text-lg font-bold">Unauthorized Admin Access</h2>
          <p className="text-xs text-slate-400 max-w-xs mt-1 mb-5">
            You must be authenticated with verified administrative credentials to view this area.
          </p>
          <button
            onClick={() => setScreen({ type: 'admin-login' })}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
          >
            Go to Admin Login
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <ApkDownloadBar />
        <AdminPortalScreen />
      </div>
    );
  }

  if (screen.type === 'seller-dashboard') {
    if (!currentUser || role !== 'seller') {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
          <ShieldAlert className="w-12 h-12 text-emerald-400 mb-3" />
          <h2 className="text-lg font-bold">Seller Portal Access Required</h2>
          <p className="text-xs text-slate-400 max-w-xs mt-1 mb-5">
            Please log in with your registered seller merchant account.
          </p>
          <button
            onClick={() => setScreen({ type: 'seller-login' })}
            className="px-4 py-2 bg-[#00D053] hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl"
          >
            Go to Seller Login
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl relative">
          <ApkDownloadBar />
          <SellerDashboard />
        </div>
      </div>
    );
  }

  const renderStoreScreen = () => {
    switch (screen.type) {
      case 'home':
        return <HomeScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'search':
        return <SearchScreen />;
      case 'cart':
        return <CartScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'order-success':
        return <OrderSuccessScreen />;
      case 'product-detail':
        return <ProductDetailScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      case 'saved-addresses':
        return <SavedAddressesScreen />;
      case 'my-orders':
        return <OrdersScreen />;
      case 'account':
      default:
        return <AccountScreen />;
    }
  };

  const getHeaderConfig = () => {
    switch (screen.type) {
      case 'categories':
        return { title: t.categories, showBack: true };
      case 'search':
        return { title: t.search, showBack: true };
      case 'cart':
        return { title: t.cart, showBack: true };
      case 'checkout':
        return { title: t.checkout, showBack: true };
      case 'order-success':
        return { title: 'Order Confirmed', showBack: false };
      case 'product-detail':
        return { title: 'Product Details', showBack: true };
      case 'wishlist':
        return { title: t.wishlist, showBack: true };
      case 'saved-addresses':
        return { title: t.savedAddresses, showBack: true };
      case 'my-orders':
        return { title: t.myOrders, showBack: true };
      case 'account':
        return { title: t.account, showBack: false };
      case 'home':
      default:
        return { title: undefined, showBack: false };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-start selection:bg-emerald-200">
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/40">
        <ApkDownloadBar />
        <MobileAppBar
          title={headerConfig.title}
          showBack={headerConfig.showBack}
          onBack={() => setScreen({ type: 'home' })}
        />

        <main className="flex-1 p-3.5 pb-24 overflow-x-hidden">
          {renderStoreScreen()}
        </main>

        <BottomNavigation />
      </div>
    </div>
  );
};
