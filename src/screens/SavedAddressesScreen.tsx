import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Plus, Trash2, ArrowLeft, Check, Edit2 } from 'lucide-react';

export const SavedAddressesScreen: React.FC = () => {
  const { addresses, addAddress, deleteAddress, setDefaultAddress, setScreen } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !streetAddress || !city) return;

    addAddress({
      fullName: fullName.trim(),
      phone: phone.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      isDefault: addresses.length === 0
    });

    setFullName('');
    setPhone('');
    setStreetAddress('');
    setCity('');
    setPostalCode('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 pb-20">
      <button
        onClick={() => setScreen({ type: 'account' })}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Account</span>
      </button>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-slate-900">Saved Addresses</h2>
          <p className="text-xs text-slate-500">Manage delivery locations for quick checkout</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900">New Delivery Address</h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priyantha Silva"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0771234567"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="House/Shop No, Street"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F2C59] text-white font-bold"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address cards */}
      <div className="space-y-2.5">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                    Default
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteAddress(addr.id)}
                className="p-1 text-slate-300 hover:text-rose-600 rounded-lg"
                title="Delete address"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-slate-600">{addr.streetAddress}, {addr.city} {addr.postalCode}</p>
            <p className="text-slate-500 font-mono text-[11px]">{addr.phone}</p>

            {!addr.isDefault && (
              <button
                onClick={() => setDefaultAddress(addr.id)}
                className="text-xs font-bold text-blue-600 hover:underline pt-1 block"
              >
                Set as Default Address
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
