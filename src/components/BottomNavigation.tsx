import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Home, Grid, Search, ShoppingBag, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { screen, setScreen, t, cartTotalCount } = useStore();
  const { currentUser } = useAuth();

  // If in pure auth screens, hide bottom bar to focus user on login/registration
  if (
    screen.type === 'user-login' ||
    screen.type === 'user-register' ||
    screen.type === 'seller-login' ||
    screen.type === 'seller-register' ||
    screen.type === 'admin-login' ||
    screen.type === 'forgot-password'
  ) {
    return null;
  }

  const navItems = [
    { type: 'home' as const, label: t.home, icon: Home },
    { type: 'categories' as const, label: t.categories, icon: Grid },
    { type: 'search' as const, label: t.search, icon: Search },
    { type: 'cart' as const, label: t.cart, icon: ShoppingBag, badge: cartTotalCount },
    {
      type: 'account' as const,
      label: currentUser ? t.account : 'Login',
      icon: User
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-bottom shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = screen.type === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setScreen({ type: item.type })}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive ? 'text-[#0F2C59] font-extrabold' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#0F2C59]' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-black text-[#0F2C59]' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#00D053] rounded-full mt-0.5 animate-in fade-in"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
