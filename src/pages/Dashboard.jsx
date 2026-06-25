import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ShieldAlert, AlertCircle, CheckCircle2, FileText, Sparkles, MapPin } from 'lucide-react';

export default function Dashboard() {
  const { reports } = useStore();

  // Aggregate metrics
  const total = reports.length;
  const active = reports.filter(r => r.status !== 'Resolved').length;
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const critical = reports.filter(r => r.severity === 'Critical').length;

  // Chart data 1: Category Distribution
  const categoryCounts = reports.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  // Chart data 2: Severity Distribution
  const severityCounts = reports.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});

  const severityData = [
    { name: 'Critical', value: severityCounts['Critical'] || 0, color: '#EF4444' },
    { name: 'High', value: severityCounts['High'] || 0, color: '#F59E0B' },
    { name: 'Medium', value: severityCounts['Medium'] || 0, color: '#3B82F6' },
    { name: 'Low', value: severityCounts['Low'] || 0, color: '#10B981' }
  ].filter(s => s.value > 0);

  // Chart data 3: Real Weekly reports trend (last 6 days)
  const getTrendData = () => {
    const data = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      
      // Count reports on this day
      const count = reports.filter(r => {
        if (!r.createdAt) return false;
        const repDate = new Date(r.createdAt);
        return repDate.toDateString() === d.toDateString();
      }).length;
      
      data.push({
        week: dayName,
        reports: count
      });
    }
    return data;
  };
  const trendData = getTrendData();

  // AI Hotspots derived from active/critical reports
  const activeReports = reports.filter(r => r.status !== 'Resolved');
  const aiHotspots = activeReports.slice(0, 3).map(r => ({
    zone: r.location,
    issue: `${r.category} reported by ${r.username || 'Citizen'}`,
    risk: r.severity === 'Critical' ? 'Critical (High risk to safety/traffic)' : `${r.severity} Priority (Local hazard)`,
    trend: `${r.praises || 0} praises`
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-inter text-brand-text">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-text font-poppins tracking-tight">Impact Dashboard</h1>
        <p className="text-sm text-brand-textSecondary mt-1.5 font-semibold">
          Realtime telemetry of municipal reports, category distribution, and AI-predicted hotspots.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Reports', value: total, icon: FileText, color: 'text-primary-blue border-primary-blue/15 bg-primary-blue/5 shadow-glow-primary' },
          { label: 'Active Issues', value: active, icon: AlertCircle, color: 'text-amber-755 border-amber-500/15 bg-amber-500/5' },
          { label: 'Resolved Issues', value: resolved, icon: CheckCircle2, color: 'text-primary-green border-primary-green/15 bg-primary-green/5' },
          { label: 'Critical Hazards', value: critical, icon: ShieldAlert, color: 'text-red-600 border-red-500/15 bg-red-500/5 shadow-glow-danger' }
        ].map((item, index) => (
          <div key={index} className={`border rounded-card p-5 flex flex-col justify-between ${item.color} shadow-sm backdrop-blur-sm glow-card`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary">{item.label}</span>
              <item.icon className="w-5 h-5 flex-shrink-0" />
            </div>
            <h3 className="text-2xl font-extrabold font-poppins mt-3.5 leading-none">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* Recharts Diagrams Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Category distribution */}
        <div className="col-span-1 lg:col-span-2 bg-brand-card rounded-card border border-slate-100 p-5 shadow-soft backdrop-blur-md glow-card">
          <h3 className="font-poppins font-bold text-sm text-brand-text mb-4">Issues by Category</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#0F172A' }}
                  itemStyle={{ color: '#0F172A' }}
                />
                <Bar dataKey="value" fill="#0066FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity distribution */}
        <div className="bg-brand-card rounded-card border border-slate-100 p-5 shadow-soft flex flex-col backdrop-blur-md glow-card">
          <h3 className="font-poppins font-bold text-sm text-brand-text mb-4">Severity Distribution</h3>
          <div className="w-full h-56 relative flex-1 flex items-center justify-center">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#0F172A' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-brand-textSecondary font-bold">No data available</span>
            )}
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold text-slate-500">
            {severityData.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trends & AI Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reports trend area chart */}
        <div className="col-span-1 lg:col-span-2 bg-brand-card rounded-card border border-slate-100 p-5 shadow-soft backdrop-blur-md glow-card">
          <h3 className="font-poppins font-bold text-sm text-brand-text mb-4">Weekly Submission Trends</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#0F172A' }} />
                <Area type="monotone" dataKey="reports" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReports)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Predictive Analytics & Insights */}
        <div className="bg-brand-card rounded-card border border-slate-100 p-5 shadow-soft flex flex-col justify-between backdrop-blur-md glow-card">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse-slow" />
              <h3 className="font-poppins font-bold text-sm text-brand-text">AI Hotspot Analysis</h3>
            </div>
            
            <div className="space-y-4">
              {aiHotspots.length > 0 ? (
                aiHotspots.map((item, index) => (
                  <div key={index} className="text-xs leading-normal">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4.5 h-4.5 text-primary-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 block">{item.zone}</span>
                        <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">{item.issue}</span>
                        <p className="text-[10px] text-red-600 font-bold mt-1">
                          ⚠️ Risk: {item.risk}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 font-medium">
                  <p className="text-xs font-bold text-slate-600">No active hazard hotspots detected</p>
                  <p className="text-[10px] mt-0.5 text-slate-450">All local reports in Bangalore are currently resolved!</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-primary-blue/5 rounded-2xl border border-primary-blue/15 text-xs text-primary-blue leading-relaxed font-semibold">
            <span className="font-bold text-primary-blue flex items-center gap-1.5 mb-1.5 text-[10px] font-poppins uppercase tracking-wider">
              🔮 Predictive Model Tip
            </span>
            "Ward 12 has historically experienced a 35% increase in potholes during the monsoon season. Deploying preventative sealant reduces overall repair costs by 18%."
          </div>
        </div>

      </div>
    </div>
  );
}
