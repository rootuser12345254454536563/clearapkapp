import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FirestoreOrder } from '../services/marketplaceService';
import { Package, MessageCircle, ArrowLeft, Clock, Truck, CheckCircle2 } from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const { setScreen, settings } = useStore();
  const { currentUser } = useAuth();
  const [firestoreOrders, setFirestoreOrders] = useState<FirestoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const ords: FirestoreOrder[] = [];
      snap.forEach(d => ords.push(d.data() as FirestoreOrder));
      ords.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setFirestoreOrders(ords);
      setIsLoading(false);
    }, (err) => {
      console.warn('Orders snapshot error:', err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  return (
    <div className="space-y-4 pb-20">
      <button
        onClick={() => setScreen({ type: 'account' })}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Account</span>
      </button>

      <div className="space-y-0.5">
        <h2 className="text-xl font-black text-slate-900">My Orders</h2>
        <p className="text-xs text-slate-500">Live order status and dispatch updates</p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your orders...</div>
      ) : firestoreOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-800">No orders yet</h3>
            <p className="text-xs text-slate-500">You haven't placed any purchases yet.</p>
          </div>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {firestoreOrders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Order ID</span>
                  <p className="font-mono font-black text-[#0F2C59] text-xs sm:text-sm">{ord.id}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-900'
                }`}>
                  {ord.status}
                </span>
              </div>

              <div className="space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">Items:</p>
                <div className="space-y-1 pl-2 border-l-2 border-slate-100">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span>{item.name} x {item.quantity}</span>
                      <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px]">Total Payable: </span>
                  <span className="font-black text-slate-900 text-sm">Rs. {ord.totalAmount.toLocaleString()}</span>
                </div>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BUYJUMP,%20checking%20status%20for%20Order%20${ord.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Status</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
