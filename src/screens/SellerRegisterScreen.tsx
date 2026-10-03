import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  User,
  Store,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export const SellerRegisterScreen: React.FC = () => {
  const { registerSeller } = useAuth();
  const { setScreen } = useStore();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (fullName.trim().length < 2) {
      setErrorMessage('Please provide the business owner full name.');
      return;
    }
    if (businessName.trim().length < 2) {
      setErrorMessage('Please enter your store or trading name.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid business email.');
      return;
    }
    if (phone.trim().length < 8) {
      setErrorMessage('Please enter a valid store contact number.');
      return;
    }
    if (address.trim().length < 4) {
      setErrorMessage('Please enter the store physical location.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await registerSeller(fullName, businessName, email, phone, address, password);
      setScreen({ type: 'seller-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please sign in.');
      } else {
        setErrorMessage(err.message || 'Failed to register seller profile.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto space-y-4">
        {/* Navigation */}
        <button
          onClick={() => setScreen({ type: 'seller-login' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seller Sign In</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900">Register as Seller</h2>
            <p className="text-xs text-slate-500">Sell your products to thousands of BUYJUMP shoppers</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>New seller accounts undergo quality verification by administrators prior to listing active products.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Owner Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Primary owner name"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store / Business Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Royal Jaffna Traders"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="store@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0770000000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Physical Store Address</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="No, Street, City"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full pl-8 pr-7 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 pt-3"
            >
              {isLoading ? <span>Registering Store...</span> : <span>Complete Store Registration</span>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
            Already have a store?{' '}
            <button
              onClick={() => setScreen({ type: 'seller-login' })}
              className="font-bold text-emerald-700 hover:underline"
            >
              Sign In to Merchant Hub
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
