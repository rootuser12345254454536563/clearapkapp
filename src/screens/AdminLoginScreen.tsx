import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { loginAdmin } = useAuth();
  const { setScreen } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setErrorMessage('');
    setIsLoading(true);

    try {
      await loginAdmin(email, password);
      setScreen({ type: 'admin-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('Invalid administrative credentials. Access denied.');
      } else {
        setErrorMessage(err.message || 'Authentication error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm mx-auto space-y-5">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App Storefront</span>
        </button>

        <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 text-white">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-white">BUYJUMP Admin Console</h2>
            <p className="text-xs text-slate-400">Strictly restricted to authorized platform personnel</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-start gap-2 text-rose-200 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buyjump.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-800/80 text-white rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-800/80 text-white rounded-xl border border-slate-700 focus:border-amber-400 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 pt-3"
            >
              {isLoading ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] text-slate-500">
            Protected under role-based Firestore rules & token verification
          </p>
        </div>
      </div>
    </div>
  );
};
