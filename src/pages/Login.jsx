import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { loginWithGoogle, loginAsDemo } = useStore();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Google authentication error:", error);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter text-brand-text relative overflow-hidden">
      
      {/* Decorative Glow elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-brand-card rounded-card shadow-premium border border-slate-100 p-8 sm:p-10 relative z-10 text-center backdrop-blur-md glow-card"
      >
        {/* App Logo */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-premium mb-6">
          <MapPin className="text-white w-7 h-7" />
        </div>
        
        <h2 className="font-poppins font-extrabold text-2xl tracking-tight leading-tight">
          Welcome to CivicPulse
        </h2>
        <p className="text-xs text-brand-textSecondary mt-2 max-w-xs mx-auto leading-relaxed font-semibold">
          Sign in to report infrastructure issues, verify resolutions, and earn community points.
        </p>

        {/* Buttons section */}
        <div className="mt-8 space-y-4">
          
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-slate-200 hover:bg-slate-50 text-brand-text font-bold text-xs py-3.5 px-4 rounded-btn shadow-sm flex items-center justify-center gap-3 transition-colors duration-150 cursor-pointer bg-white"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.79z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3V6.49H1.21C.44 8.04 0 9.97 0 12s.44 3.96 1.21 5.51l4.11-3.27z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.51l4.11 3.27c.94-2.85 3.57-4.96 6.68-4.96z" />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-4 rounded-btn shadow-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse-slow" />
            <span>Enter as Guest (Demo Mode)</span>
          </button>



        </div>

        {/* Info panel */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left max-w-xs mx-auto">
          <ShieldCheck className="w-6 h-6 text-primary-soft flex-shrink-0" />
          <p className="leading-normal font-semibold">
            Secure authentication managed by Supabase. Your profile will be auto-registered upon successful login.
          </p>
        </div>

      </motion.div>
      
    </div>
  );
}
