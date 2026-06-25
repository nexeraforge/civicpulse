import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import IssueCard from '../components/IssueCard';
import { Search, SlidersHorizontal, Award, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Explore() {
  const { reports, leaderboard, activeFilters, setFilters } = useStore();
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'praises'
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetIssueId = queryParams.get('issue');

  // Sync state filters to Zustand store on component mount/unmount
  useEffect(() => {
    // If a specific issue ID is provided in query params, filter for that issue
    if (targetIssueId) {
      setFilters({ search: targetIssueId });
    } else {
      setFilters({ search: '' });
    }
  }, [targetIssueId, setFilters]);

  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleCategorySelect = (category) => {
    setFilters({ category });
  };

  const handleSeveritySelect = (severity) => {
    setFilters({ severity });
  };

  const handleStatusSelect = (status) => {
    setFilters({ status });
  };

  // Filter and sort reports
  const filteredReports = reports
    .filter((report) => {
      // 1. Search Query filter (matches Title, Description, or ID)
      if (activeFilters.search) {
        const query = activeFilters.search.toLowerCase();
        if (query.startsWith('rep-')) {
          if (report.id !== query) return false;
        } else {
          const matchTitle = report.title.toLowerCase().includes(query);
          const matchDesc = report.description.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }
      }

      // 2. Category filter
      if (activeFilters.category !== 'All' && report.category !== activeFilters.category) {
        return false;
      }

      // 3. Severity filter
      if (activeFilters.severity !== 'All' && report.severity !== activeFilters.severity) {
        return false;
      }

      // 4. Status filter
      if (activeFilters.status !== 'All' && report.status !== activeFilters.status) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'praises') {
        return b.praises - a.praises;
      }
      // default: recent (createdAt descending)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const categories = ['All', 'Pothole', 'Garbage', 'Water Leakage', 'Broken Streetlight', 'Drainage', 'Illegal Dumping', 'Safety Hazard'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter text-brand-text">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-text font-poppins tracking-tight">Explore Issues</h1>
        <p className="text-sm text-brand-textSecondary mt-1.5 font-semibold">
          See what is happening in your neighborhood. Praise issues to boost priority or comment to suggest solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed Column */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Search and Quick Filters */}
          <div className="bg-brand-card rounded-card border border-slate-100 p-4 shadow-soft space-y-3.5 backdrop-blur-md">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activeFilters.search.startsWith('rep-') ? '' : activeFilters.search}
                  onChange={handleSearchChange}
                  placeholder="Search issues by title or keyword..."
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-soft/50 rounded-btn transition-all duration-200 text-brand-text font-semibold shadow-sm"
                />
              </div>
              <button
                onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
                className={`flex items-center gap-1.5 px-4 rounded-btn border text-xs font-bold transition-all duration-150 cursor-pointer ${showAdvanceFilters ? 'bg-primary-blue/5 text-primary-blue border-primary-blue/20 shadow-glow-primary' : 'bg-white text-brand-text border-slate-200 hover:border-slate-350 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Advance Filters Drawer */}
            <AnimatePresence>
              {showAdvanceFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4 pt-3.5 border-t border-slate-100"
                >
                  {/* Category filter */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Category</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          className={`text-[10px] px-3.5 py-1.5 rounded-full border font-bold transition-all duration-150 cursor-pointer ${activeFilters.category === cat ? 'bg-primary-blue border-primary-blue text-white shadow-glow-primary' : 'bg-slate-50/60 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Severity filter */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Severity</span>
                      <select
                        value={activeFilters.severity}
                        onChange={(e) => handleSeveritySelect(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft focus:bg-white text-brand-text font-semibold"
                      >
                        <option value="All">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    {/* Status filter */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Status</span>
                      <select
                        value={activeFilters.status}
                        onChange={(e) => handleStatusSelect(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-btn p-2.5 focus:outline-none focus:border-primary-soft focus:bg-white text-brand-text font-semibold"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sort Toggle */}
            <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-brand-textSecondary pt-1">
              <span>Showing {filteredReports.length} issues</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer border ${sortBy === 'recent' ? 'bg-slate-100/80 text-brand-text border-slate-200' : 'border-transparent hover:text-brand-text'}`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setSortBy('praises')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer border ${sortBy === 'praises' ? 'bg-slate-100/80 text-brand-text border-slate-200' : 'border-transparent hover:text-brand-text'}`}
                >
                  Most Praised
                </button>
              </div>
            </div>
          </div>

          {/* Active Specific Target Clear Banner */}
          {targetIssueId && (
            <div className="flex items-center justify-between bg-primary-blue/5 border border-primary-blue/15 rounded-2xl px-4 py-3 text-xs text-primary-blue shadow-sm">
              <span className="font-semibold">Filtering for shared issue ticket ID: {targetIssueId}</span>
              <button 
                onClick={() => setFilters({ search: '' })}
                className="font-bold underline hover:text-primary-blue/80 cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Issue Cards Feed */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <IssueCard key={report.id} issue={report} />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-brand-card rounded-card border border-slate-100 p-12 text-center"
                >
                  <AlertCircle className="w-12 h-12 text-slate-350 mx-auto mb-4" />
                  <h3 className="font-poppins font-bold text-lg text-brand-text">No issues found</h3>
                  <p className="text-xs text-brand-textSecondary mt-1 max-w-sm mx-auto font-semibold">
                    We couldn't find any reports matching your active filters. Try broadening your keywords or removing tags.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Leaderboard panel */}
          <div className="bg-brand-card rounded-card border border-slate-100 p-5 shadow-soft backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-amber-500 fill-amber-500/10 animate-pulse-slow" />
              <h2 className="font-poppins font-bold text-sm text-brand-text">Active Citizens Leaderboard</h2>
            </div>
            
            <div className="space-y-4">
              {leaderboard.map((user, index) => {
                const badgeColor = index === 0 ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                   index === 1 ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                   index === 2 ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-slate-50 text-slate-500 border-slate-100';
                
                return (
                  <div key={user.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 flex items-center justify-center font-extrabold rounded-full border text-[9px] ${badgeColor}`}>
                        {index + 1}
                      </span>
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <span className="font-bold block text-slate-700 leading-tight">{user.name}</span>
                        <span className="text-[9px] text-brand-textSecondary mt-0.5 block font-semibold">{user.reports} reports raised</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-600 block">{user.reputation} pts</span>
                      <span className="text-[9px] text-slate-400 font-semibold">Reputation</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Hotspots Warning Ticker */}
          <div className="bg-gradient-to-tr from-slate-900 to-blue-950 text-white rounded-card p-5 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span className="font-poppins font-bold text-xs uppercase tracking-wider text-cyan-300">Predictive AI Alert</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed mb-3 text-slate-100">
              "Illegal dumping clusters detected in Ward 3. Risk index shows 40% probability of public health complaints escalating by this weekend."
            </p>
            <p className="text-[9px] text-cyan-400 font-bold">
              Model confidence: 88.4% • Updated hourly
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
