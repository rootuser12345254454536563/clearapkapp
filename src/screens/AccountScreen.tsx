import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AppLanguage } from '../types';
import {
  User,
  Package,
  Heart,
  MapPin,
  Globe,
  PhoneCall,
  MessageCircle,
  ChevronRight,
  Store,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export const AccountScreen: React.FC = () => {
  const {
    wishlistIds,
    settings,
    language,
    setLanguage,
    t,
    setScreen
  } = useStore();

  const { currentUser, userProfile, role, logout } = useAuth();

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Profile Card */}
      {currentUser ? (
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] rounded-3xl p-5 text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 ring-2 ring-emerald-400/40 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-[#00D053]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black truncate">{userProfile?.fullName || 'BUYJUMP Customer'}</h2>
              <p className="text-xs text-blue-200 truncate">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00D053] border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                {role || 'Customer'}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              setScreen({ type: 'user-login' });
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 border border-white/10 flex-shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] rounded-3xl p-6 text-white text-center space-y-3 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-white/10 ring-4 ring-white/10 flex items-center justify-center mx-auto">
            <User className="w-7 h-7 text-[#00D053]" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-black">Welcome to BUYJUMP</h2>
            <p className="text-xs text-blue-200">Sign in to track orders and save favorites</p>
          </div>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => setScreen({ type: 'user-login' })}
              className="px-5 py-2.5 bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setScreen({ type: 'user-register' })}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Seller Merchant Card */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-emerald-950">Sell on BUYJUMP</h3>
            <p className="text-[10px] text-emerald-700">Open your digital store to thousands of buyers</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (currentUser && role === 'seller') {
              setScreen({ type: 'seller-dashboard' });
            } else {
              setScreen({ type: 'seller-login' });
            }
          }}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex-shrink-0"
        >
          {role === 'seller' ? 'Seller Hub' : 'Seller Portal'}
        </button>
      </div>

      {/* Language Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5">
        <h3 className="font-bold text-xs text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0F2C59]" />
          <span>Language / மொழி / භාෂාව</span>
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              language === 'en'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('ta')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              language === 'ta'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => handleLanguageChange('si')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
              language === 'si'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            සිංහල
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden text-xs">
        <button
          onClick={() => setScreen({ type: 'my-orders' })}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0F2C59] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{t.myOrders}</p>
              <p className="text-[10px] text-slate-400">View parcel dispatch status</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setScreen({ type: 'wishlist' })}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{t.wishlist}</p>
              <p className="text-[10px] text-slate-400">{wishlistIds.length} items saved</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setScreen({ type: 'saved-addresses' })}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">{t.savedAddresses}</p>
              <p className="text-[10px] text-slate-400">Manage delivery locations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Support Hotlines */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2.5 text-xs">
        <h3 className="font-bold text-slate-900">Direct Customer Service</h3>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BUYJUMP,%20I%20need%20assistance`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[11px]">WhatsApp</p>
              <p className="text-[9px] text-emerald-700 truncate">{settings.whatsappNumber}</p>
            </div>
          </a>

          <a
            href={`tel:${settings.storePhone}`}
            className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[11px]">Call Us</p>
              <p className="text-[9px] text-blue-700 truncate">{settings.storePhone}</p>
            </div>
          </a>
        </div>
      </div>

      {/* Separate Admin Login link */}
      <div className="text-center pt-2">
        <button
          onClick={() => setScreen({ type: 'admin-login' })}
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Admin Portal Login</span>
        </button>
      </div>
    </div>
  );
};
