import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight, Truck } from 'lucide-react';

export const OrderSuccessScreen: React.FC = () => {
  const { screen, setScreen, orders, settings, t } = useStore();
  const [copied, setCopied] = useState(false);

  const orderId = screen.orderId;
  const order = orders.find((o) => o.orderId === orderId) || orders[0];

  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = order ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🎉 *NEW ORDER CONFIRMATION - ${settings.storeName}*\n\n` +
    `*Order ID:* ${order.orderId}\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.customerPhone}\n` +
    `*Delivery Address:* ${order.deliveryAddress}\n\n` +
    `*Items Ordered:*\n${order.itemsSummary}\n\n` +
    `*Total Payable:* ${settings.currency} ${order.totalAmount.toLocaleString()}\n` +
    `*Payment Method:* ${order.paymentMethod}\n\n` +
    `Please confirm dispatch status. Thank you!`
  )}` : '#';

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="text-lg font-black text-slate-900">Order Completed</h2>
        <p className="text-xs text-slate-500">Thank you for your purchase!</p>
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
    <div className="space-y-5 py-4 pb-20">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#00D053] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-black text-slate-900">{t.orderSuccess}</h2>
        <p className="text-xs text-slate-500">
          Your order has been recorded in our dispatch system.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Order Reference</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono font-extrabold text-[#0F2C59] text-sm sm:text-base">
                {order.orderId}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 bg-slate-50"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] uppercase">
            {order.status}
          </span>
        </div>

        <div className="space-y-1.5 text-slate-700">
          <p><strong>Customer:</strong> {order.customerName}</p>
          <p><strong>Contact:</strong> {order.customerPhone}</p>
          <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
          <p><strong>Items:</strong> {order.itemsSummary}</p>
          <p className="pt-1 text-sm font-black text-[#0F2C59]">
            Total Payable: {settings.currency} {order.totalAmount.toLocaleString()} ({order.paymentMethod})
          </p>
        </div>
      </div>

      {/* WhatsApp Dispatch Button */}
      <div className="space-y-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Confirm on WhatsApp ({settings.whatsappNumber})</span>
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setScreen({ type: 'my-orders' })}
            className="py-2.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs"
          >
            Track My Orders
          </button>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="py-2.5 px-3 bg-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-2xs"
          >
            Keep Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
