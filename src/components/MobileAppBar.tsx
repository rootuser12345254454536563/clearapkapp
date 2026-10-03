import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Globe, Search, Heart, User } from 'lucide-react';
import { AppLanguage } from '../types';

interface MobileAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const MobileAppBar: React.FC<MobileAppBarProps> = ({
  title,
  showBack = false,
  onBack
}) => {
  const {
    screen,
    setScreen,
    cartTotalCount,
    wishlistIds,
    language,
    setLanguage
  } = useStore();

  const { currentUser, role } = useAuth();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setScreen({ type: 'home' });
    }
  };

  const handleLanguageCycle = () => {
    const nextLang: Record<AppLanguage, AppLanguage> = {
      en: 'ta',
      ta: 'si',
      si: 'en'
    };
    setLanguage(nextLang[language]);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0F2C59] text-white shadow-md safe-top">
      <div className="px-3.5 h-14 flex items-center justify-between gap-2">
        {/* Left: Back button or App Logo */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-1 text-white hover:bg-white/10 rounded-full active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setScreen({ type: 'home' })}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-white p-0.5 ring-2 ring-emerald-400 shadow-xs flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                  <rect width="100" height="100" rx="24" fill="#0F2C59" />
                  <path d="M28 24h24c8.8 0 16 7.2 16 16 0 5.4-2.7 10.2-6.8 13.1C66.5 56.4 70 62.8 70 70c0 8.8-7.2 16-16 16H28V24z" fill="#00D053" />
                  <circle cx="74" cy="26" r="6" fill="#F59E0B" />
                </svg>
              </div>
              <div className="leading-none">
                <div className="flex items-center gap-1">
                  <span className="font-black text-base tracking-tight text-white">BUYJUMP</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded bg-[#00D053] text-slate-950">
                    App
                  </span>
                </div>
              </div>
            </button>
          )}

          {title && (
            <h1 className="font-bold text-sm sm:text-base text-white truncate max-w-[170px] sm:max-w-xs">
              {title}
            </h1>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1">
          {/* Quick Language Toggle */}
          <button
            onClick={handleLanguageCycle}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-emerald-300 flex items-center gap-1 active:scale-95 transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Search Button */}
          {screen.type !== 'search' && (
            <button
              onClick={() => setScreen({ type: 'search' })}
              className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full active:scale-95 transition-all"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => setScreen({ type: 'wishlist' })}
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full relative active:scale-95 transition-all"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-[#0F2C59]">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Cart Icon with Counter */}
          <button
            onClick={() => setScreen({ type: 'cart' })}
            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full relative active:scale-95 transition-all"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartTotalCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-[#0F2C59]">
                {cartTotalCount}
              </span>
            )}
          </button>

          {/* User profile / login icon */}
          <button
            onClick={() => {
              if (currentUser) {
                if (role === 'admin') setScreen({ type: 'admin-dashboard' });
                else if (role === 'seller') setScreen({ type: 'seller-dashboard' });
                else setScreen({ type: 'account' });
              } else {
                setScreen({ type: 'user-login' });
              }
            }}
            className="p-1.5 ml-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all flex items-center justify-center"
            aria-label="User Account"
          >
            <User className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
