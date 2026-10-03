import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  FirestoreProduct,
  FirestoreOrder,
  createProductInFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  uploadImageToStorage
} from '../services/marketplaceService';
import {
  Store,
  Package,
  ShoppingBag,
  Plus,
  DollarSign,
  Edit2,
  Trash2,
  AlertTriangle,
  Upload,
  LogOut,
  X,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentUser, sellerProfile, logout, isSellerApproved } = useAuth();
  const { categories, setScreen } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Fresh Fruits');
  const [formPrice, setFormPrice] = useState('1000');
  const [formDiscountPrice, setFormDiscountPrice] = useState('850');
  const [formStock, setFormStock] = useState('25');
  const [formDescription, setFormDescription] = useState('');
  const [formVariants, setFormVariants] = useState('Standard');
  const [formImageUrl, setFormImageUrl] = useState('https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to seller's products
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const prods: FirestoreProduct[] = [];
      snapshot.forEach(docSnap => {
        prods.push(docSnap.data() as FirestoreProduct);
      });
      setProducts(prods);
      setIsLoading(false);
    }, (err) => {
      console.warn('Seller products query warning:', err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Listen to seller's orders
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const ords: FirestoreOrder[] = [];
      snapshot.forEach(docSnap => {
        ords.push(docSnap.data() as FirestoreOrder);
      });
      setOrders(ords);
    }, (err) => {
      console.warn('Seller orders query warning:', err);
    });

    return () => unsub();
  }, [currentUser]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Fresh Fruits');
    setFormPrice('1000');
    setFormDiscountPrice('850');
    setFormStock('20');
    setFormDescription('High quality product freshly prepared.');
    setFormVariants('Standard');
    setFormImageUrl('https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: FirestoreProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(String(p.price));
    setFormDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
    setFormStock(String(p.stock));
    setFormDescription(p.description);
    setFormVariants(p.variants || 'Standard');
    setFormImageUrl(p.imageUrl);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    let finalImageUrl = formImageUrl;
    if (imageFile) {
      finalImageUrl = await uploadImageToStorage(imageFile, 'products');
    }

    const payload = {
      sellerId: currentUser.uid,
      sellerName: sellerProfile?.businessName || sellerProfile?.fullName || 'BUYJUMP Seller',
      name: formName.trim(),
      category: formCategory,
      price: parseFloat(formPrice) || 0,
      discountPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : undefined,
      stock: parseInt(formStock, 10) || 0,
      description: formDescription.trim(),
      variants: formVariants.trim(),
      imageUrl: finalImageUrl,
      status: 'active' as const
    };

    if (editingProduct) {
      await updateProductInFirestore(editingProduct.id, payload);
    } else {
      await createProductInFirestore(payload);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = async (pId: string, name: string) => {
    if (confirm(`Delete "${name}" from store catalog?`)) {
      await deleteProductFromFirestore(pId);
    }
  };

  const isPending = sellerProfile?.status === 'pending';

  return (
    <div className="space-y-4 pb-20">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white/10 ring-2 ring-emerald-400 flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-[#00D053]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black truncate">{sellerProfile?.businessName || 'Seller Storefront'}</h2>
            <p className="text-xs text-emerald-200 truncate">{sellerProfile?.phone} • {sellerProfile?.address}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              sellerProfile?.status === 'approved' ? 'bg-[#00D053] text-slate-950' : 'bg-amber-400 text-slate-950'
            }`}>
              {sellerProfile?.status || 'Pending'}
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            setScreen({ type: 'user-login' });
          }}
          className="p-2 rounded-xl bg-white/10 text-rose-200 hover:bg-white/20 flex-shrink-0"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Pending Approval Notice */}
      {!isSellerApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Store Application Under Review</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Your store registration has been received. BUYJUMP administrators are currently verifying your business credentials. Once approved, you will be able to publish products and fulfill customer orders.
          </p>
        </div>
      )}

      {/* Quick Metrics */}
      {isSellerApproved && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Live Listings</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{products.length}</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{orders.length}</p>
          </div>
        </div>
      )}

      {/* Tabs & Add Button */}
      {isSellerApproved && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Catalog ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      )}

      {/* Products Tab */}
      {isSellerApproved && activeTab === 'products' && (
        <div className="space-y-2.5">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-2">
              <Package className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-extrabold text-sm text-slate-800">No products listed</h3>
              <p className="text-xs text-slate-500">Tap "Add Item" above to publish your first product.</p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex items-center gap-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                  <p className="text-[10px] text-slate-400">{p.category} • {p.stock} in stock</p>
                  <p className="font-black text-xs text-emerald-700 mt-0.5">Rs. {(p.discountPrice || p.price).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-sm text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Karthacolomban Mango (1kg)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Variant Name</label>
                  <input
                    type="text"
                    value={formVariants}
                    onChange={(e) => setFormVariants(e.target.value)}
                    placeholder="Standard, 1kg"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    }
                  }}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
                {!imageFile && (
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Or image URL"
                    className="w-full mt-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px]"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
