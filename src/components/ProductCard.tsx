import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Plus, Check, Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setScreen, addToCart, toggleWishlist, isInWishlist, settings } = useStore();
  const [added, setAdded] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = hasDiscount ? product.discountPrice : product.price;
  const imageSrc = product.images.split(',')[0].trim() || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';

  const handleCardClick = () => {
    setScreen({ type: 'product-detail', productId: product.id });
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer active:scale-[0.98]"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-2">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
              -{discountPercent}%
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-md transition-colors ${
              isFavorite ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-slate-400 hover:text-slate-600'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Out of stock overlay */}
          {product.stockQuantity <= 0 && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-[10px] font-black text-white px-2 py-1 rounded-md bg-rose-600 uppercase">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="truncate max-w-[80px]">{product.category}</span>
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-[#0F2C59] transition-colors">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Price & Add Action */}
      <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between gap-1">
        <div className="min-w-0">
          <p className="font-black text-xs sm:text-sm text-[#0F2C59] truncate">
            {settings.currency} {currentPrice.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="text-[10px] text-slate-400 line-through -mt-0.5">
              {settings.currency} {product.price.toLocaleString()}
            </p>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stockQuantity <= 0}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold transition-all active:scale-90 flex-shrink-0 ${
            added
              ? 'bg-[#00D053] text-slate-950 shadow-xs'
              : 'bg-[#0F2C59] hover:bg-blue-900 text-white shadow-xs'
          } disabled:opacity-40 disabled:pointer-events-none`}
          aria-label="Add to Cart"
        >
          {added ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
