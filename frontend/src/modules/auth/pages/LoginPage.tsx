import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Lock, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';

export const LoginPage: React.FC = () => {
  const { language, setLanguage, t } = useUIStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin_rahul');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-sky-50 via-slate-50 to-teal-50">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-8 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-sky-500 to-indigo-500"></div>

        {/* Top Controls: Back to Site & Language Switcher */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition flex items-center gap-1 cursor-pointer"
          >
            <span>←</span>
            <span>{language === 'mr' ? 'डॅशबोर्डवर जा' : 'Go to App Dashboard'}</span>
          </button>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                language === 'en'
                  ? 'bg-white shadow-xs font-semibold text-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('mr')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                language === 'mr'
                  ? 'bg-white shadow-xs font-semibold text-slate-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center my-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white text-3xl font-extrabold shadow-lg shadow-emerald-500/20 mb-3">
            <Plus className="w-9 h-9 stroke-[3]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">MedEasy</h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('tagline')} • <span className="font-semibold text-slate-700">Khed Shivapur</span>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {t('username')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {t('password')}
              </label>
              <a href="#forgot" className="text-xs text-sky-600 hover:underline">
                {t('forgotPassword')}
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Logging in...' : t('loginToCounter')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Feature Tags Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-around text-slate-500 text-xs text-center font-medium">
          <span>⚡ Simple Billing</span>
          <span>•</span>
          <span>📦 Smart Stock</span>
          <span>•</span>
          <span>📈 Better Business</span>
        </div>
      </div>
    </div>
  );
};
