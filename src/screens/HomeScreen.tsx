import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  ChevronRight,
  Flame,
  Search,
  Store,
  Grid
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    t,
    products,
    categories,
    banners,
    settings,
    setScreen,
    setSelectedCategory
  } = useStore();

  const { currentUser, role } = useAuth();
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Auto banner rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const flashDeals = products.filter(p => p.discountPrice > 0 && p.discountPrice < p.price);
  const featured = products.filter(p => p.isFeatured || p.isBestSeller);
  const newArrivals = products.filter(p => p.isNewArrival);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setScreen({ type: 'categories' });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Mobile Search Input Header */}
      <div className="pt-1">
        <button
          onClick={() => setScreen({ type: 'search' })}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-400 text-xs flex items-center justify-between shadow-xs active:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span className="truncate">{t.searchPlaceholder}</span>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px]">
            Fast
          </span>
        </button>
      </div>

      {/* Hero Carousel Banner */}
      {banners.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[16/8] sm:aspect-[16/7] bg-slate-900 group">
          <img
            src={banners[activeBannerIndex].imageUrl}
            alt={banners[activeBannerIndex].title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4 text-white">
            <span className="inline-block self-start px-2 py-0.5 rounded-full bg-[#00D053] text-slate-950 font-black text-[9px] uppercase tracking-wider mb-1">
              {banners[activeBannerIndex].badgeText}
            </span>
            <h2 className="font-extrabold text-base sm:text-lg leading-tight line-clamp-1">
              {banners[activeBannerIndex].title}
            </h2>
            <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
              {banners[activeBannerIndex].subtitle}
            </p>
          </div>

          {/* Carousel dots */}
          <div className="absolute bottom-2 right-3 flex items-center gap-1">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBannerIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeBannerIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories Horizontal Scroll Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-[#0F2C59]" />
            <span>{t.categories}</span>
          </h2>
          <button
            onClick={() => setScreen({ type: 'categories' })}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
          >
            See All →
          </button>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex flex-col items-center flex-shrink-0 group active:scale-95 transition-all text-center w-16"
            >
              <div className="w-14 h-14 rounded-2xl p-1 bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition-colors">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1 line-clamp-1 leading-tight group-hover:text-emerald-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Flash Deals / Hot Offers */}
      {flashDeals.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-rose-50 text-rose-600">
                <Flame className="w-3.5 h-3.5 fill-rose-500" />
              </span>
              <h2 className="font-black text-sm text-slate-900 tracking-tight">Super Deals</h2>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Save Big
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {flashDeals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Featured / Fresh Marketplace Picks */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <h2 className="font-black text-sm text-slate-900 tracking-tight">Popular Products</h2>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {products.length} in catalog
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* WhatsApp Quick Order Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#00D053]" />
            </div>
            <div>
              <h3 className="font-black text-xs">Direct WhatsApp Ordering</h3>
              <p className="text-[10px] text-emerald-200">Send item list or screenshot</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BUYJUMP,%20I%20would%20like%20to%20order%20products!`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs"
          >
            Chat Now
          </a>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="grid grid-cols-3 gap-2 text-center text-slate-700">
        <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <Truck className="w-4 h-4 text-blue-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-900 leading-tight">Fast Islandwide</p>
          <p className="text-[9px] text-slate-400">Doorstep delivery</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-900 leading-tight">Cash on Delivery</p>
          <p className="text-[9px] text-slate-400">Pay on receipt</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-2xs space-y-1">
          <RotateCcw className="w-4 h-4 text-amber-600 mx-auto" />
          <p className="text-[10px] font-bold text-slate-900 leading-tight">Easy Returns</p>
          <p className="text-[9px] text-slate-400">Verified quality</p>
        </div>
      </div>
    </div>
  );
};
