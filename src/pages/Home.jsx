import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import IssueCard from '../components/IssueCard';
import { MapPin, CheckCircle, TrendingUp, Users, ArrowRight, ShieldCheck, Cpu, BrainCircuit, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { reports } = useStore();

  // Calculate live stats
  const totalReports = reports.length;
  const activeIssues = reports.filter(r => r.status !== 'Resolved').length;
  const resolvedIssues = reports.filter(r => r.status === 'Resolved').length;
  const totalMembers = "100+";

  // Get featured issues (top 2 most praised issues)
  const featuredIssues = [...reports]
    .sort((a, b) => b.praises - a.praises)
    .slice(0, 2);

  return (
    <div className="font-inter pb-20 text-brand-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-blue/5 border border-primary-blue/10 text-xs font-bold text-primary-blue mb-6 shadow-glow-primary"
          >
            <ShieldCheck className="w-4 h-4 text-primary-blue" />
            <span>AI-Powered Local Problem Solver</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-poppins text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-brand-text mb-6 leading-tight"
          >
            Report. Verify. <span className="gradient-text">Resolve.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm sm:text-base text-brand-textSecondary leading-relaxed mb-10 font-semibold"
          >
            CivicPulse empowers communities to solve local infrastructure and safety issues together. Join neighbors and public teams to make every report matter.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/report"
              className="w-full sm:w-auto gradient-btn px-8 py-3.5 rounded-btn text-sm font-bold flex items-center justify-center gap-2 shadow-premium"
            >
              Report Local Issue
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-350 text-brand-text font-bold px-8 py-3.5 rounded-btn text-sm shadow-sm flex items-center justify-center transition-all duration-200 hover:bg-slate-50"
            >
              Explore Feed
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-6 sm:p-8 bg-brand-card border border-slate-100 rounded-card shadow-soft backdrop-blur-md">
          {[
            { label: 'Total Reports', value: totalReports, icon: BarChart3, color: 'text-primary-blue bg-primary-blue/5 border-primary-blue/10' },
            { label: 'Resolved Issues', value: resolvedIssues, icon: CheckCircle, color: 'text-primary-green bg-primary-green/5 border-primary-green/10' },
            { label: 'Active Hazards', value: activeIssues, icon: MapPin, color: 'text-amber-600 bg-amber-500/5 border-amber-500/10' },
            { label: 'Active Neighbors', value: totalMembers, icon: Users, color: 'text-emerald-700 bg-emerald-500/5 border-emerald-500/10' }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color} flex-shrink-0 shadow-sm`}>
                <stat.icon className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-[9px] text-brand-textSecondary font-bold uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-xl sm:text-2xl font-extrabold text-brand-text font-poppins mt-0.5">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-text font-poppins">
            How CivicPulse Works
          </h2>
          <p className="text-xs sm:text-sm text-brand-textSecondary mt-2.5 font-semibold max-w-lg mx-auto">
            A collaborative cycle of community issue resolution in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Report', desc: 'Pin the location, upload evidence (photo/video), and describe the problem.', icon: MapPin, color: 'from-blue-600/90 to-blue-400/90 border-blue-500/30' },
            { step: '2', title: 'Verify', desc: 'The local community verifies and praises the issue to boost its visual priority.', icon: ShieldCheck, color: 'from-blue-500/90 to-emerald-400/90 border-cyan-500/30' },
            { step: '3', title: 'Track', desc: 'View live progress markers and hotspots on an interactive street map.', icon: TrendingUp, color: 'from-emerald-500/90 to-green-400/90 border-emerald-500/30' },
            { step: '4', title: 'Resolve', desc: 'Confirm completion post authorities\' fix and earn community points.', icon: CheckCircle, color: 'from-green-600/90 to-emerald-500/90 border-green-500/30' }
          ].map((item, idx) => (
            <div key={idx} className="relative bg-brand-card border border-slate-100 rounded-card p-6 shadow-sm hover:shadow-soft transition-all duration-300 glow-card">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md mb-5`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="absolute top-6 right-6 font-poppins font-black text-3xl text-slate-100">{item.step}</span>
              <h3 className="font-bold text-sm text-brand-text font-poppins mb-1.5">{item.title}</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed font-semibold">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="bg-slate-50/50 border-y border-slate-100 py-20 mb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary-blue bg-primary-blue/5 px-3 py-1 rounded-full border border-primary-blue/10">
              Technology Stack
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-text font-poppins mt-4">
              AI Analytics & Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-2.5 max-w-lg mx-auto font-semibold">
              CivicPulse employs integrated Gemini AI models to optimize municipal reporting efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-card rounded-card border border-slate-100 p-6 shadow-sm hover:shadow-soft transition-all duration-300 glow-card">
              <Cpu className="w-9 h-9 text-primary-blue mb-4" />
              <h3 className="font-bold text-sm text-brand-text font-poppins mb-2">Automated Categorization</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed font-semibold">
                Gemini AI processes issue titles and images to auto-classify categories, reducing administrative work for public coordinators.
              </p>
            </div>
            <div className="bg-brand-card rounded-card border border-slate-100 p-6 shadow-sm hover:shadow-soft transition-all duration-300 glow-card">
              <BrainCircuit className="w-9 h-9 text-amber-500 mb-4" />
              <h3 className="font-bold text-sm text-brand-text font-poppins mb-2">Severity & Impact Analysis</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed font-semibold">
                Evaluates reported descriptions and geolocations to estimate traffic blockages, public hazard risk indexes, and recommended actions.
              </p>
            </div>
            <div className="bg-brand-card rounded-card border border-slate-100 p-6 shadow-sm hover:shadow-soft transition-all duration-300 glow-card">
              <TrendingUp className="w-9 h-9 text-purple-500 mb-4" />
              <h3 className="font-bold text-sm text-brand-text font-poppins mb-2">Duplicate Checking</h3>
              <p className="text-xs text-brand-textSecondary leading-relaxed font-semibold">
                Identifies nearby reports of identical hazards and prompts users to support existing tickets, keeping local databases clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Issues Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-brand-text font-poppins">
              Featured Community Issues
            </h2>
            <p className="text-xs sm:text-sm text-brand-textSecondary mt-2 font-semibold">
              Top critical reports boosted by neighbor praises this week.
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs sm:text-sm font-bold text-primary-blue hover:text-blue-700 flex items-center gap-1 mt-3 sm:mt-0 transition-colors"
          >
            Browse all issues
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
}
