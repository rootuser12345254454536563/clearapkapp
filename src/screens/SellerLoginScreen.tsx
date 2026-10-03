import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export const SellerLoginScreen: React.FC = () => {
  const { loginSeller } = useAuth();
  const { setScreen } = useStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSellerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setErrorMessage('');
    setIsLoading(true);

    try {
      await loginSeller(identifier, password);
      setScreen({ type: 'seller-dashboard' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Seller sign in failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto space-y-5">
        {/* Navigation */}
        <button
          onClick={() => setScreen({ type: 'user-login' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Sign In</span>
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Seller Merchant Portal</h2>
            <p className="text-xs text-slate-500">Sign in to manage your inventory and store orders</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSellerLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Store Email or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="store@example.com or 0770000000"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter store password"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-emerald-600 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Verifying Seller Account...</span>
              ) : (
                <>
                  <span>Sign In as Seller</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center space-y-2.5">
            <button
              type="button"
              onClick={async () => {
                setIsLoading(true);
                setErrorMessage('');
                try {
                  await loginSeller('merchant@buyjump.com', 'SellerPass123!');
                  setScreen({ type: 'seller-dashboard' });
                } catch (e: any) {
                  setErrorMessage(e.message || 'Demo seller login failed.');
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Mobile Test Sign-In (Seller Store)</span>
            </button>

            <p className="text-xs text-slate-600">
              New merchant on BUYJUMP?{' '}
              <button
                onClick={() => setScreen({ type: 'seller-register' })}
                className="font-bold text-emerald-700 hover:underline"
              >
                Register Your Store
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
