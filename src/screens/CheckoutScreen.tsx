import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export const CheckoutScreen: React.FC = () => {
  const {
    t,
    cartWithProducts,
    cartSubtotal,
    cartDeliveryFee,
    cartGrandTotal,
    settings,
    addresses,
    createOrder,
    setScreen
  } = useStore();

  const { userProfile } = useAuth();
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  const [customerName, setCustomerName] = useState(userProfile?.fullName || defaultAddr?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || defaultAddr?.phone || '');
  const [streetAddress, setStreetAddress] = useState(defaultAddr?.streetAddress || '');
  const [city, setCity] = useState(defaultAddr?.city || 'Colombo');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '00300');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Bank Transfer' | 'PayHere Online'>('Cash on Delivery');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'failed' | 'success'>('idle');

  useEffect(() => {
    if (userProfile?.fullName && !customerName) {
      setCustomerName(userProfile.fullName);
    }
    if (userProfile?.phone && !customerPhone) {
      setCustomerPhone(userProfile.phone);
    }
  }, [userProfile]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setError('Please enter a valid phone number for delivery coordination.');
      return;
    }
    if (!streetAddress.trim() || !city.trim()) {
      setError('Please provide a complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const itemsSummary = cartWithProducts
      .map(
        ({ cartItem, product }) =>
          `${product.name} (${cartItem.selectedVariant || 'Standard'}) x ${cartItem.quantity}`
      )
      .join(', ');

    const fullAddress = `${streetAddress}, ${city}${postalCode ? ` - ${postalCode}` : ''}`;

    try {
      const created = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: fullAddress,
        itemsSummary,
        subtotal: cartSubtotal,
        deliveryFee: cartDeliveryFee,
        totalAmount: cartGrandTotal,
        paymentMethod,
        status: paymentMethod === 'PayHere Online' ? 'Confirmed' : 'Pending'
      });

      setIsSubmitting(false);
      setScreen({ type: 'order-success', orderId: created.orderId });
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Network error encountered while placing order. Please try again.');
    }
  };

  if (cartWithProducts.length === 0) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-xs text-slate-500">Your cart is empty.</p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Back Link */}
      <button
        onClick={() => setScreen({ type: 'cart' })}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <div className="space-y-1">
        <h2 className="text-xl font-black text-slate-900">Checkout</h2>
        <p className="text-xs text-slate-500">Provide shipping details for doorstep delivery</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Customer Details</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Priyantha Silva"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number (for Courier & WhatsApp) *</label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0771234567"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Delivery Address</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="House/Shop No, Street Name"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Town *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Colombo"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="00300"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900">Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Cash on Delivery'}
                onChange={() => setPaymentMethod('Cash on Delivery')}
                className="text-[#0F2C59]"
              />
              <Banknote className="w-4 h-4 text-emerald-600" />
              <div className="flex-1">
                <p className="font-bold text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-[10px] text-slate-400">Pay cash upon receipt at your doorstep</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'Bank Transfer'}
                onChange={() => setPaymentMethod('Bank Transfer')}
                className="text-[#0F2C59]"
              />
              <CreditCard className="w-4 h-4 text-blue-600" />
              <div className="flex-1">
                <p className="font-bold text-slate-900">Bank Transfer / Online</p>
                <p className="text-[10px] text-slate-400">Direct transfer with slip upload</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 cursor-pointer">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'PayHere Online'}
                onChange={() => setPaymentMethod('PayHere Online')}
                className="text-emerald-600"
              />
              <ShieldCheck className="w-4 h-4 text-[#00D053]" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">PayHere Secure Card / Wallet</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 font-black uppercase">
                    PayHere
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Visa, MasterCard, eZ Cash & Genie</p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{settings.currency} {cartSubtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span>{cartDeliveryFee === 0 ? 'FREE' : `${settings.currency} ${cartDeliveryFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Payable</span>
            <span className="text-[#0F2C59]">{settings.currency} {cartGrandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <span>Placing Your Order...</span>
          ) : (
            <span>Place Order ({settings.currency} {cartGrandTotal.toLocaleString()})</span>
          )}
        </button>
      </form>
    </div>
  );
};
