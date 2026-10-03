import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export const WishlistScreen: React.FC = () => {
  const { wishlistIds, products, setScreen } = useStore();

  const favoriteProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-slate-500">
          {favoriteProducts.length} saved items
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span>My Wishlist</span>
        </h2>
        <p className="text-xs text-slate-500">Items you have bookmarked for later</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500">Explore products and tap the heart icon to save them.</p>
          </div>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {favoriteProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
