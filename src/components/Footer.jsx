import React from 'react';
import { MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-card border-t border-slate-100 mt-auto py-12 font-inter text-brand-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & About summary */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-blue to-primary-green flex items-center justify-center shadow-md">
                <MapPin className="text-white w-4.5 h-4.5" />
              </div>
              <span className="font-poppins font-extrabold text-base text-brand-text tracking-tight">
                CivicPulse
              </span>
            </Link>
            <p className="text-xs text-brand-textSecondary max-w-xs leading-relaxed font-medium">
              Every Citizen Matters. Every Problem Counts. CivicPulse empowers communities to resolve local infrastructure and public issues together.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider text-brand-textSecondary mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-textSecondary font-semibold">
              <li>
                <Link to="/" className="hover:text-primary-blue transition-colors duration-150">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-primary-blue transition-colors duration-150">Explore Issues</Link>
              </li>
              <li>
                <Link to="/maps" className="hover:text-primary-blue transition-colors duration-150">Interactive Map</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary-blue transition-colors duration-150">Impact Analytics</Link>
              </li>
            </ul>
          </div>

          {/* About/Policy Links */}
          <div>
            <h4 className="font-poppins font-bold text-xs uppercase tracking-wider text-brand-textSecondary mb-4">
              Legal & Info
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-textSecondary font-semibold">
              <li>
                <a href="#about" className="hover:text-primary-blue transition-colors duration-150">About Us</a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-primary-blue transition-colors duration-150">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-primary-blue transition-colors duration-150">Terms of Service</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-primary-blue transition-colors duration-150">Contact Authorities</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-textSecondary">
          <div className="flex items-center gap-1.5 font-semibold">
            <span>© {new Date().getFullYear()} CivicPulse. Made with</span>
            <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse-slow" />
            <span>for better neighborhoods.</span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-full hover:bg-slate-100 text-brand-textSecondary hover:text-brand-text transition-colors duration-150"
              aria-label="GitHub Link"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="p-1.5 rounded-full hover:bg-slate-100 text-brand-textSecondary hover:text-brand-text transition-colors duration-150"
              aria-label="LinkedIn Link"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
