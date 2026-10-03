import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  FirestoreProduct,
  FirestoreOrder,
  updateOrderStatusInFirestore,
  deleteProductFromFirestore,
  updateProductInFirestore,
  sendTestWhatsAppMessage,
  getWhatsAppApiStatus,
  getWhatsAppLogs
} from '../services/marketplaceService';
import { UserProfileDoc, SellerProfileDoc } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ShoppingBag,
  MessageCircle,
  Search,
  Check,
  X,
  AlertTriangle,
  Send,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Trash2
} from 'lucide-react';

export const AdminPortalScreen: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const { setScreen } = useStore();

  const [activeTab, setActiveTab] = useState<'kpi' | 'users' | 'sellers' | 'orders' | 'whatsapp'>('kpi');

  const [users, setUsers] = useState<UserProfileDoc[]>([]);
  const [sellers, setSellers] = useState<SellerProfileDoc[]>([]);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);

  const [search, setSearch] = useState('');
  const [waStatus, setWaStatus] = useState<any>(null);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState('+94771234567');
  const [testMsg, setTestMsg] = useState('Hello from BUYJUMP! Order dispatch test.');
  const [testResult, setTestResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  const isAdmin = Boolean(
    currentUser && (
      role === 'admin' ||
      currentUser.email?.toLowerCase() === 'admin@buyjump.com' ||
      currentUser.email?.toLowerCase() === 'vithusan2553@gmail.com'
    )
  );

  useEffect(() => {
    if (!isAdmin) return;
    const unsubU = onSnapshot(collection(db, 'users'), (snap) => {
      const uList: UserProfileDoc[] = [];
      snap.forEach(d => uList.push(d.data() as UserProfileDoc));
      setUsers(uList);
    });
    const unsubS = onSnapshot(collection(db, 'sellers'), (snap) => {
      const sList: SellerProfileDoc[] = [];
      snap.forEach(d => sList.push(d.data() as SellerProfileDoc));
      setSellers(sList);
    });
    const unsubP = onSnapshot(collection(db, 'products'), (snap) => {
      const pList: FirestoreProduct[] = [];
      snap.forEach(d => pList.push(d.data() as FirestoreProduct));
      setProducts(pList);
    });
    const unsubO = onSnapshot(collection(db, 'orders'), (snap) => {
      const oList: FirestoreOrder[] = [];
      snap.forEach(d => oList.push(d.data() as FirestoreOrder));
      oList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(oList);
    });

    getWhatsAppApiStatus().then(setWaStatus).catch(() => {});
    getWhatsAppLogs().then(res => setWaLogs(res.logs || [])).catch(() => {});

    return () => {
      unsubU();
      unsubS();
      unsubP();
      unsubO();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          You must sign in as an authorized BUYJUMP administrator to view this portal.
        </p>
        <button
          onClick={() => setScreen({ type: 'admin-login' })}
          className="px-5 py-2.5 bg-slate-900 text-amber-400 font-bold rounded-xl text-xs"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleUpdateSellerStatus = async (uid: string, status: 'approved' | 'rejected' | 'suspended') => {
    await updateDoc(doc(db, 'sellers', uid), {
      status,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: currentUser?.uid,
      updatedAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'users', uid), {
      role: 'seller',
      status: status === 'approved' ? 'active' : 'suspended',
      updatedAt: serverTimestamp()
    });
  };

  const handleUpdateUserStatus = async (uid: string, status: 'active' | 'suspended') => {
    await updateDoc(doc(db, 'users', uid), { status, updatedAt: serverTimestamp() });
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTestResult(null);
    try {
      const res = await sendTestWhatsAppMessage(testPhone, testMsg);
      setTestResult(res);
      const updatedLogs = await getWhatsAppLogs();
      setWaLogs(updatedLogs.logs || []);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message });
    } finally {
      setIsSending(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Mobile Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-black truncate">BUYJUMP Admin Console</h2>
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            setScreen({ type: 'user-login' });
          }}
          className="p-2 rounded-xl bg-white/10 text-rose-300 hover:bg-white/20 flex-shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveTab('kpi')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            activeTab === 'kpi' ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            activeTab === 'sellers' ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Sellers ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            activeTab === 'users' ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${
            activeTab === 'whatsapp' ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          WhatsApp Cloud
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'kpi' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales</span>
              <p className="text-lg font-black text-[#0F2C59] mt-0.5">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Orders</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{orders.length}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Users</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{users.length}</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sellers</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{sellers.length}</p>
            </div>
          </div>

          {/* Pending Sellers Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-xs text-slate-900">Pending Seller Approvals</h3>
              <span className="text-[10px] font-bold text-amber-600">
                {sellers.filter(s => s.status === 'pending').length} pending
              </span>
            </div>

            {sellers.filter(s => s.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No pending seller registrations.</p>
            ) : (
              sellers.filter(s => s.status === 'pending').map((s) => (
                <div key={s.uid} className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{s.businessName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{s.fullName} • {s.phone}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleUpdateSellerStatus(s.uid, 'approved')}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateSellerStatus(s.uid, 'rejected')}
                      className="px-2 py-1 bg-rose-600 text-white rounded-lg font-bold text-[10px]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Sellers */}
      {activeTab === 'sellers' && (
        <div className="space-y-2.5">
          {sellers.map((s) => (
            <div key={s.uid} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900">{s.businessName}</h4>
                  <p className="text-[10px] text-slate-500">{s.fullName} • {s.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  s.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {s.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">{s.address} ({s.phone})</p>
              <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-50">
                {s.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateSellerStatus(s.uid, 'approved')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px]"
                  >
                    Approve Seller
                  </button>
                )}
                {s.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateSellerStatus(s.uid, 'suspended')}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg font-bold text-[10px]"
                  >
                    Suspend Store
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.uid} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs text-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{u.email} • {u.phone || 'No phone'}</p>
                <span className="inline-block px-1.5 py-0.2 rounded text-[8px] font-bold bg-slate-100 uppercase mt-0.5">
                  {u.role}
                </span>
              </div>
              {u.role !== 'admin' && (
                u.status === 'suspended' ? (
                  <button
                    onClick={() => handleUpdateUserStatus(u.uid, 'active')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[10px]"
                  >
                    Activate
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateUserStatus(u.uid, 'suspended')}
                    className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold text-[10px]"
                  >
                    Suspend
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-2.5">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-black text-slate-900">{ord.id}</span>
                  <p className="text-[10px] text-slate-400">{ord.customerName} ({ord.customerPhone})</p>
                </div>
                <select
                  value={ord.status}
                  onChange={async (e) => {
                    await updateOrderStatusInFirestore(ord.id, e.target.value as any, ord.customerPhone, ord.customerName);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[10px] font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <p className="text-slate-600 truncate">{ord.shippingAddress}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                <span className="font-black text-[#0F2C59]">Rs. {ord.totalAmount.toLocaleString()}</span>
                <a
                  href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(ord.customerName)},%20BUYJUMP%20Order%20${ord.id}%20status%20is%20${ord.status}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[10px] flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Direct WA</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: WhatsApp Cloud */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-3.5">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2 text-xs">
            <h3 className="font-black text-slate-900">Meta WhatsApp Cloud Status</h3>
            <p className={`font-bold text-xs ${waStatus?.configured ? 'text-emerald-700' : 'text-amber-700'}`}>
              {waStatus?.configured ? '● Live Meta Cloud API Active' : '○ Standby / Test Mode'}
            </p>
            <p className="text-[11px] text-slate-500">{waStatus?.instructions}</p>
          </div>

          <form onSubmit={handleSendTest} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5 text-xs">
            <h4 className="font-black text-slate-900">Send Test WhatsApp Message</h4>
            {testResult && (
              <div className={`p-2.5 rounded-xl text-[11px] font-semibold ${
                testResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {testResult.success ? 'Message dispatched successfully!' : testResult.error}
              </div>
            )}
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Phone Number (with Country Code)</label>
              <input
                type="tel"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-0.5">Message</label>
              <input
                type="text"
                required
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send WhatsApp Message'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
