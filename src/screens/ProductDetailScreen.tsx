import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Plus,
  Minus
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const {
    screen,
    setScreen,
    products,
    settings,
    t,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const productId = screen.productId;
  const product = products.find((p) => p.id === productId);

  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-xs text-slate-500">Product could not be found.</p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const variantsList = product.variants
    ? product.variants.split(',').map((v) => v.trim()).filter(Boolean)
    : [];

  const currentVariant = selectedVariant || (variantsList.length > 0 ? variantsList[0] : 'Standard');
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const isFavorite = isInWishlist(product.id);
  const imageSrc = product.images.split(',')[0].trim() || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, quantity, currentVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, quantity, currentVariant);
    setScreen({ type: 'checkout' });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on BUYJUMP!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const whatsappInquiryUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${settings.storeName}! I am interested in:\n\n*${product.name}*\nPrice: ${settings.currency} ${effectivePrice.toLocaleString()}\nVariant: ${currentVariant}\n\nPlease confirm availability and delivery time!`
  )}`;

  return (
    <div className="space-y-4 pb-32">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-full border shadow-2xs transition-colors ${
              isFavorite ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-slate-200 text-slate-500'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="p-2.5 bg-slate-900 text-white text-xs font-semibold text-center rounded-xl animate-in fade-in">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-xs">
            -{discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs space-y-3.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <h1 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xl sm:text-2xl font-black text-[#0F2C59]">
              {settings.currency} {effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {settings.currency} {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Variants Selector */}
        {variantsList.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700">Select Option:</span>
            <div className="flex flex-wrap gap-1.5">
              {variantsList.map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    currentVariant === v
                      ? 'bg-[#0F2C59] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-700">Quantity</span>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs active:scale-95"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-xs w-6 text-center text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Description:</span>
          <p className="leading-relaxed">{product.description}</p>
        </div>

        {/* Delivery perks */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Truck className="w-4 h-4 text-blue-600" />
            <span>Islandwide delivery in 1-3 business days</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cash on Delivery available</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Floating Action Bar for Mobile */}
      <div className="fixed bottom-14 left-0 right-0 z-30 p-2.5 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {/* WhatsApp Direct Inquiry Button */}
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0"
            title="Inquire on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
          </a>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            className="flex-1 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            {addedToast ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <ShoppingBag className="w-4 h-4" />}
            <span>{addedToast ? 'Added to Cart' : t.addToCart}</span>
          </button>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            disabled={product.stockQuantity <= 0}
            className="flex-1 py-3 px-3 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md disabled:opacity-50"
          >
            <span>{t.buyNow}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
