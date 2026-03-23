import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  FileText, 
  Search, 
  Bell, 
  User,
  Filter,
  CheckCircle2,
  Send,
  ChevronRight,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { cn, Issue, TimelineEvent } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../AppContext';

export default function OversightDashboard() {
  const { issues, timeline, userSettings } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (issues.length > 0 && !selectedIssue) {
      setSelectedIssue(issues[0]);
    }
  }, [issues]);

  return (
    <div className={cn("flex h-screen overflow-hidden transition-colors duration-300", userSettings.darkMode ? "bg-[#0a0c12] text-slate-200" : "bg-slate-50 text-slate-900")}>
      {/* Sidebar */}
      <aside className={cn("w-64 border-r flex flex-col p-6 gap-8", userSettings.darkMode ? "border-slate-800" : "border-slate-200 bg-white")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className={cn("font-bold text-lg tracking-tight", !userSettings.darkMode && "text-slate-900")}>Leader's Oversight</h1>
        </div>

        <div className="space-y-1">
          <div className={cn("px-3 py-4 glass-card mb-6 flex items-center gap-3", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</p>
              <p className={cn("text-sm font-semibold", !userSettings.darkMode && "text-slate-900")}>Operational</p>
            </div>
          </div>

          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active />
          <NavItem icon={<MapIcon size={18} />} label="Real-time Map" />
          <NavItem icon={<AlertTriangle size={18} />} label="Urgent Alerts" />
          <NavItem icon={<FileText size={18} />} label="Governance Reports" />
          
          <div className="pt-8">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-blue-500 hover:bg-blue-500/10 transition-colors">
              <ChevronRight size={18} className="rotate-180" />
              Back to Citizen App
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={cn("h-16 border-b flex items-center justify-between px-8 shrink-0", userSettings.darkMode ? "border-slate-800" : "border-slate-200 bg-white")}>
          <div className="flex h-full items-center">
            <nav className="flex h-full gap-8">
              {['Dashboard', 'Intelligence', 'Operations', 'Archive'].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "relative h-full flex items-center text-sm font-medium transition-colors",
                    tab === 'Dashboard' ? "text-blue-500" : "text-slate-400 hover:text-slate-200",
                    !userSettings.darkMode && tab !== 'Dashboard' && "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {tab}
                  {tab === 'Dashboard' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search operational data..." 
                className={cn("border rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:border-blue-500 transition-colors", userSettings.darkMode ? "bg-slate-900/50 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900")}
              />
            </div>
            <button className={cn("p-2 rounded-lg relative", userSettings.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}>
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
            </button>
            <button className={cn("w-8 h-8 rounded-full flex items-center justify-center overflow-hidden", userSettings.darkMode ? "bg-slate-800" : "bg-slate-200")}>
              <img src={`https://picsum.photos/seed/${userSettings.email}/100/100`} alt="User" referrerPolicy="no-referrer" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Total Issues" value={issues.length.toString()} change="+12%" color="blue" />
            <StatCard title="Critical Today" value={issues.filter(i => i.impact_score === 'CRITICAL').length.toString()} change="+5%" color="red" />
            <StatCard title="AI Verified" value="94%" change="-2%" color="emerald" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Issues Table */}
            <div className={cn("col-span-8 glass-card", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
              <div className={cn("p-6 border-b flex justify-between items-center", userSettings.darkMode ? "border-slate-800" : "border-slate-100")}>
                <h2 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Prioritized Issues (AI Ranked)</h2>
                <button className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest">
                  <Filter size={14} /> Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={cn("text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b", userSettings.darkMode ? "border-slate-800" : "border-slate-100")}>
                      <th className="px-6 py-4">Issue ID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Urgency</th>
                      <th className="px-6 py-4">Impact Score</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", userSettings.darkMode ? "divide-slate-800" : "divide-slate-100")}>
                    {issues.map((issue) => (
                      <tr 
                        key={issue.id} 
                        className={cn(
                          "transition-colors cursor-pointer",
                          selectedIssue?.id === issue.id 
                            ? "bg-blue-600/5" 
                            : cn("hover:bg-slate-800/30", !userSettings.darkMode && "hover:bg-slate-50")
                        )}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <td className={cn("px-6 py-4 font-mono text-sm font-bold", !userSettings.darkMode && "text-slate-900")}>{issue.id}</td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2 py-1 rounded text-xs", userSettings.darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600")}>{issue.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex-1 h-1.5 rounded-full overflow-hidden w-24", userSettings.darkMode ? "bg-slate-800" : "bg-slate-200")}>
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  issue.urgency > 80 ? "bg-red-500" : issue.urgency > 50 ? "bg-orange-500" : "bg-emerald-500"
                                )} 
                                style={{ width: `${issue.urgency}%` }} 
                              />
                            </div>
                            <span className={cn("text-xs font-bold", !userSettings.darkMode && "text-slate-900")}>{issue.urgency}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            issue.impact_score === 'CRITICAL' ? 'text-red-500' : issue.impact_score === 'HIGH' ? 'text-orange-500' : 'text-emerald-500'
                          )}>
                            {issue.impact_score}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "status-badge",
                            issue.status === 'PENDING' ? 'status-pending' : issue.status === 'DISPATCHED' ? 'status-dispatched' : 'status-resolved'
                          )}>
                            {issue.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Issue Details Panel */}
            <div className="col-span-4 space-y-6">
              {selectedIssue && (
                <div className={cn("glass-card p-6 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
                  <div>
                    <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Issue Details: {selectedIssue.id}</h3>
                    <p className="text-xs text-slate-500">Reported {formatDistanceToNow(new Date(selectedIssue.reported_at))} ago via Citizen App</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn("aspect-square rounded-lg border flex flex-col items-center justify-center gap-2", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                      <FileText className="text-slate-700" />
                      <span className="text-[10px] uppercase font-bold text-slate-500">Evidence 01</span>
                    </div>
                    <div className={cn("aspect-square rounded-lg border relative overflow-hidden", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                       <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                         {Array.from({length: 36}).map((_, i) => (
                           <div key={i} className="border-[0.5px] border-blue-500/30" />
                         ))}
                       </div>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <MapIcon className="text-blue-500 w-4 h-4" />
                       </div>
                       <div className={cn("absolute bottom-0 left-0 right-0 p-1 text-center", userSettings.darkMode ? "bg-slate-900/80" : "bg-white/80")}>
                          <span className="text-[8px] uppercase font-bold text-slate-500">Location Map</span>
                       </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Issue Description</p>
                    <p className={cn("text-sm leading-relaxed", userSettings.darkMode ? "text-slate-300" : "text-slate-700")}>
                      {selectedIssue.description}
                    </p>
                  </div>

                  <div className={cn("border rounded-xl p-4 space-y-4", userSettings.darkMode ? "bg-blue-600/5 border-blue-500/20" : "bg-blue-50 border-blue-100")}>
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <CheckCircle2 size={16} />
                      Verify & Act
                    </div>
                    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Send size={16} /> Deploy Response Team
                    </button>
                    <button className={cn("w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors", userSettings.darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50")}>
                      <CheckCircle2 size={16} /> Mark as Resolved
                    </button>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Public Transparency Comment</p>
                      <textarea 
                        className={cn("w-full border rounded-lg p-3 text-xs focus:outline-none focus:border-blue-500 min-h-[80px]", userSettings.darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-700")}
                        placeholder="Inform the public about the steps taken..."
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0" />
                        <span className="text-[10px] text-slate-500 font-medium">Broadcast to district notification app</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Operations Timeline */}
              <div className={cn("glass-card p-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
                <h3 className={cn("font-bold text-lg mb-6", !userSettings.darkMode && "text-slate-900")}>Operations Timeline</h3>
                <div className="space-y-6">
                  {timeline.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        event.event_type === 'status_update' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                      )}>
                        {event.event_type === 'status_update' ? <CheckCircle2 size={14} /> : <Send size={14} />}
                      </div>
                      <div>
                        <p className={cn("text-sm font-bold", userSettings.darkMode ? "text-slate-200" : "text-slate-900")}>{event.message.split('.')[0]}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{event.message.split('.')[1] || ''}</p>
                        <p className="text-[10px] text-slate-600 mt-1 font-medium">{formatDistanceToNow(new Date(event.timestamp))} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  const { userSettings } = useApp();
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
      active 
        ? "bg-blue-600 text-white" 
        : cn("text-slate-400 hover:bg-slate-800/50 hover:text-slate-200", !userSettings.darkMode && "text-slate-500 hover:bg-slate-100 hover:text-slate-900")
    )}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ title, value, change, color }: { title: string, value: string, change: string, color: 'blue' | 'red' | 'emerald' }) {
  const { userSettings } = useApp();
  const colorClasses = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    emerald: "bg-emerald-600"
  };

  const textClasses = {
    blue: "text-blue-500",
    red: "text-red-500",
    emerald: "text-emerald-500"
  };

  return (
    <div className={cn("glass-card p-6 space-y-4", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="flex items-baseline gap-3">
        <h3 className={cn("text-3xl font-bold", !userSettings.darkMode && "text-slate-900")}>{value}</h3>
        <span className={cn("text-xs font-bold", textClasses[color])}>{change}</span>
      </div>
      <div className={cn("w-full h-1 rounded-full overflow-hidden", userSettings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
        <div className={cn("h-full rounded-full", colorClasses[color])} style={{ width: '60%' }} />
      </div>
    </div>
  );
}
