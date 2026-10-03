import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    t,
    cartWithProducts,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartGrandTotal,
    settings,
    setScreen
  } = useStore();

  const itemsList = cartWithProducts
    .map(
      ({ cartItem, product }, idx) =>
        `${idx + 1}. ${product.name} (${cartItem.selectedVariant || 'Standard'}) x ${cartItem.quantity} = ${settings.currency} ${(
          (product.discountPrice > 0 ? product.discountPrice : product.price) * cartItem.quantity
        ).toLocaleString()}`
    )
    .join('\n');

  const fastWhatsAppUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🛍️ *NEW ORDER INQUIRY - ${settings.storeName}*\n\n` +
    `Items:\n${itemsList}\n\n` +
    `*Subtotal:* ${settings.currency} ${cartSubtotal.toLocaleString()}\n` +
    `*Delivery Fee:* ${settings.currency} ${cartDeliveryFee.toLocaleString()}\n` +
    `*Total Amount:* ${settings.currency} ${cartGrandTotal.toLocaleString()}\n\n` +
    `Please provide delivery address details to confirm delivery!`
  )}`;

  if (cartWithProducts.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-800">{t.emptyCart}</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You haven't added any items to your shopping cart yet.
          </p>
        </div>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-6 py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header with Clear button */}
      <div className="flex items-center justify-between px-1">
        <h2 className="font-black text-sm text-slate-900">
          Shopping Cart ({cartWithProducts.length} items)
        </h2>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 font-bold hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Cart items list */}
      <div className="space-y-2.5">
        {cartWithProducts.map(({ cartItem, product }) => {
          const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
          const imageSrc = product.images.split(',')[0].trim() || 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80';

          return (
            <div
              key={cartItem.id}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center gap-3"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs text-slate-900 truncate">
                  {product.name}
                </h3>
                {cartItem.selectedVariant && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    Variant: {cartItem.selectedVariant}
                  </p>
                )}
                <p className="font-black text-xs text-[#0F2C59] mt-0.5">
                  {settings.currency} {effectivePrice.toLocaleString()}
                </p>
              </div>

              {/* Quantity Stepper & Delete */}
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <button
                  onClick={() => removeFromCart(cartItem.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                  <button
                    onClick={() => updateCartItemQuantity(cartItem.id, cartItem.quantity - 1)}
                    className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center text-slate-900">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateCartItemQuantity(cartItem.id, cartItem.quantity + 1)}
                    className="w-5 h-5 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs active:scale-90"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Breakdown Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>{t.subtotal}</span>
          <span className="font-bold text-slate-900">{settings.currency} {cartSubtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>{t.deliveryFee}</span>
          <span className="font-bold text-slate-900">
            {cartDeliveryFee === 0 ? (
              <span className="text-emerald-600 uppercase font-black text-[10px]">Free</span>
            ) : (
              `${settings.currency} ${cartDeliveryFee.toLocaleString()}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
          <span>{t.total}</span>
          <span className="text-[#0F2C59]">{settings.currency} {cartGrandTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-2">
        <button
          onClick={() => setScreen({ type: 'checkout' })}
          className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4 text-[#00D053]" />
        </button>

        <a
          href={fastWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Quick Order via WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
