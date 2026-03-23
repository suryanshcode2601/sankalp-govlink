import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus,
  Sparkles,
  MapPin,
  FileText,
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';

export default function CitizenDashboard() {
  const { issues, upvoteIssue, userSettings } = useApp();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchParams, setSearchParams] = useSearchParams();

  // Read category filter from URL
  const categoryFilter = searchParams.get('category') || '';

  // Filter issues by category (live as user types)
  const filteredIssues = categoryFilter.trim()
    ? issues.filter(issue => {
        const q = categoryFilter.toLowerCase();
        const category = (issue.type || '').toLowerCase();
        const title = (issue.description || '').toLowerCase();
        return category.includes(q) || title.includes(q);
      })
    : issues;

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-8 space-y-8">
        {activeTab === 'Dashboard' && (
          <>
            {/* Hero Section */}
            <div className="relative bg-blue-600 rounded-3xl p-12 overflow-hidden flex justify-between items-center">
              <div className="relative z-10 max-w-xl space-y-6">
                <h2 className="text-5xl font-bold tracking-tight leading-[0.9]">Improve your city with AI</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  See a problem? Report it. Our AI handles the routing so the right department can get straight to work
                </p>
                <div className="flex gap-4">
                  <Link to="/submit" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
                    <Plus size={20} /> Report an Issue
                  </Link>
                  
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/20 flex items-center justify-center">
                <div className="w-48 h-48 border border-blue-400/30 rotate-45 flex items-center justify-center">
                  <div className="w-32 h-32 border border-blue-400/30 flex items-center justify-center">
                    <div className="w-16 h-16 border border-blue-400/30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Community Issues */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className={cn("text-2xl font-bold", !userSettings.darkMode && "text-slate-900")}>
                    {categoryFilter ? `Issues: "${categoryFilter}"` : 'Recent Community Issues'}
                  </h3>
                  {/* Active filter badge with clear button */}
                  {categoryFilter && (
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 text-[11px] font-bold px-3 py-1 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      {categoryFilter} <X size={12} />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <FilterButton label="All" active={!categoryFilter} onClick={clearFilter} />
                  {/* Dynamically show unique categories from issues */}
                  {Array.from(new Set(issues.map(i => i.type || 'General'))).map(cat => (
                    <FilterButton
                      key={cat}
                      label={cat}
                      active={categoryFilter.toLowerCase() === cat.toLowerCase()}
                      onClick={() => setSearchParams({ category: cat })}
                    />
                  ))}
                </div>
              </div>

              {/* No results message */}
              {filteredIssues.length === 0 && (
                <div className={cn("rounded-2xl p-12 text-center space-y-3", userSettings.darkMode ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-slate-200")}>
                  <p className={cn("text-lg font-bold", !userSettings.darkMode && "text-slate-900")}>No issues found</p>
                  <p className="text-slate-500 text-sm">No issues match "<span className="font-semibold">{categoryFilter}</span>"</p>
                  <button onClick={clearFilter} className="text-blue-500 text-sm font-bold hover:text-blue-400">
                    Clear filter
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {filteredIssues.map(issue => (
                  <div key={issue.id} className={cn("glass-card p-6 space-y-4", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <span className={cn(
                          "status-badge",
                          issue.status === 'PENDING' ? 'status-pending' : issue.status === 'DISPATCHED' ? 'status-dispatched' : 'status-resolved'
                        )}>
                          {issue.status}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", userSettings.darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                          {issue.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">2h ago</span>
                    </div>

                    <div>
                      <h4 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>
                        {(issue.description || "").split('.')[0]}
                      </h4>
                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                        <MapPin size={14} />
                        {issue.location_name}
                      </div>
                    </div>

                    <div className={cn("aspect-video rounded-xl border relative overflow-hidden", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                      <img 
                        src={`https://picsum.photos/seed/${issue.id}/800/450`} 
                        alt="Map" 
                        className="w-full h-full object-cover opacity-40 grayscale"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <MapPin className="text-blue-500 w-6 h-6 fill-blue-500/20" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className={cn("w-6 h-6 rounded-full border-2 overflow-hidden", userSettings.darkMode ? "border-brand-card bg-slate-800" : "border-white bg-slate-100")}>
                            <img src={`https://picsum.photos/seed/user${i}/50/50`} alt="User" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        <span className="ml-4 text-[10px] font-bold text-slate-500">+{issue.upvotes}</span>
                      </div>
                      <button 
                        onClick={() => upvoteIssue(issue.id)}
                        className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                      >
                        Upvote Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'My Reports' && (
          <div className="space-y-6">
            <h3 className={cn("text-2xl font-bold", !userSettings.darkMode && "text-slate-900")}>My Active Reports</h3>
            <div className="grid grid-cols-1 gap-4">
              {issues.slice(0, 3).map(issue => (
                <div key={issue.id} className={cn("glass-card p-6 flex items-center justify-between", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
                  <div className="flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center", userSettings.darkMode ? "bg-slate-900" : "bg-slate-50")}>
                      <FileText className="text-slate-700" />
                    </div>
                    <div>
                      <h4 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>
                        {(issue.description || "").split('.')[0]}
                      </h4>
                      <p className="text-sm text-slate-500">Reported on {new Date(issue.reported_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status</p>
                      <span className={cn(
                        "status-badge",
                        issue.status === 'PENDING' ? 'status-pending' : 'status-dispatched'
                      )}>
                        {issue.status}
                      </span>
                    </div>
                    <ChevronRight className="text-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Services' && (
          <div className="grid grid-cols-3 gap-6">
            {['Waste Management', 'Road Maintenance', 'Public Safety', 'Water & Sewage', 'Parks & Rec', 'Energy'].map(service => (
              <div key={service} className={cn("glass-card p-8 flex flex-col items-center text-center gap-4 hover:border-blue-500/50 transition-colors cursor-pointer group", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-colors", userSettings.darkMode ? "bg-slate-900 group-hover:bg-blue-600/10" : "bg-slate-50 group-hover:bg-blue-50")}>
                  <Settings className="text-slate-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <h4 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>{service}</h4>
                  <p className="text-xs text-slate-500 mt-1">Access municipal services and support</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Community' && (
          <div className="space-y-8">
            <div className={cn("border rounded-3xl p-12 text-center space-y-4", userSettings.darkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200")}>
              <h3 className={cn("text-3xl font-bold", !userSettings.darkMode && "text-slate-900")}>Community Forum</h3>
              <p className="text-slate-400 max-w-lg mx-auto">Connect with your neighbors, discuss local initiatives, and stay informed about city-wide events.</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                Join the Conversation
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="glass-card aspect-video relative overflow-hidden group cursor-pointer">
                  <img src={`https://picsum.photos/seed/comm${i}/600/400`} alt="Community" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                    <h4 className="font-bold text-lg">Local Event #{i}</h4>
                    <p className="text-xs text-slate-400">Join us this weekend for a neighborhood cleanup.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function FilterButton({ label, active = false, onClick }: { label: string, active?: boolean, onClick: () => void }) {
  const { userSettings } = useApp();
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
        active 
          ? "bg-blue-600 text-white" 
          : cn("text-slate-400 hover:text-slate-200", userSettings.darkMode ? "bg-slate-800" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900")
      )}
    >
      {label}
    </button>
  );
}
