import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { cn } from '../lib/utils';
import { Shield, TrendingUp, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function Transparency() {
  const { issues, userSettings } = useApp();

  const totalIssues     = issues.length;
  const pendingIssues   = issues.filter(i => i.status === "PENDING").length;
  const verifiedIssues  = issues.filter(i => i.status === "VERIFIED").length;
  const forwardedIssues = issues.filter(i => i.status === "FORWARDED").length;
  const resolvedIssues  = issues.filter(i => i.status === "RESOLVED").length;
  const resolutionRate  = totalIssues ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // Category bar chart
  const typeMap: Record<string, number> = {};
  issues.forEach((issue) => {
    const type = issue.type || "General";
    typeMap[type] = (typeMap[type] || 0) + 1;
  });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Status pie chart
  const statusData = [
    { name: "Pending",   value: pendingIssues,   color: "#f59e0b" },
    { name: "Verified",  value: verifiedIssues,  color: "#3b82f6" },
    { name: "Forwarded", value: forwardedIssues, color: "#a855f7" },
    { name: "Resolved",  value: resolvedIssues,  color: "#10b981" },
  ].filter(s => s.value > 0);

  // Urgency distribution
  const urgencyBuckets: Record<string, number> = {
    "Critical (80-100)": 0,
    "High (60-79)":      0,
    "Medium (40-59)":    0,
    "Low (10-39)":       0,
  };
  issues.forEach((issue) => {
    const u = issue.urgency ?? 50;
    if (u >= 80)      urgencyBuckets["Critical (80-100)"]++;
    else if (u >= 60) urgencyBuckets["High (60-79)"]++;
    else if (u >= 40) urgencyBuckets["Medium (40-59)"]++;
    else              urgencyBuckets["Low (10-39)"]++;
  });
  const urgencyData   = Object.entries(urgencyBuckets).map(([name, value]) => ({ name, value }));
  const urgencyColors = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  // Monthly trend
  const monthMap: Record<string, { issues: number; resolved: number }> = {};
  issues.forEach((issue) => {
    const date  = new Date(issue.reported_at);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!monthMap[month]) monthMap[month] = { issues: 0, resolved: 0 };
    monthMap[month].issues++;
    if (issue.status === "RESOLVED") monthMap[month].resolved++;
  });
  const timelineData = Object.entries(monthMap).map(([name, data]) => ({
    name,
    issues:   data.issues,
    resolved: data.resolved,
  }));

  // ── Tooltip style — dark slate box, no blue border
  const tooltipStyle = {
    backgroundColor: '#1e293b',
    border:          '1px solid #475569',
    borderRadius:    '10px',
    fontSize:        '12px',
    fontWeight:      600,
    padding:         '10px 14px',
    boxShadow:       '0 8px 32px rgba(0,0,0,0.4)',
  };
  const tooltipLabel = { color: '#94a3b8', marginBottom: 4, fontSize: 11 };
  const tooltipItem  = { color: '#f1f5f9' };

  return (
    <Layout showTabs={false}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className={cn("text-4xl font-bold tracking-tight", !userSettings.darkMode && "text-slate-900")}>
              City Transparency
            </h2>
            <p className="text-slate-500 max-w-xl">
              Real-time data on municipal service performance and issue resolution. We believe in open data and accountability.
            </p>
          </div>
          <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border", userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <Shield className="text-blue-500 w-4 h-4" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Verified Data</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4">
          <StatCard icon={<FileText className="text-blue-500" />}        label="Total Reports"   value={totalIssues.toString()}    trend="+12%" />
          <StatCard icon={<CheckCircle2 className="text-emerald-500" />} label="Resolved"        value={resolvedIssues.toString()} trend="+5%"  />
          <StatCard icon={<Clock className="text-amber-500" />}          label="Pending"         value={pendingIssues.toString()}  trend="-2%"  />
          <StatCard icon={<TrendingUp className="text-purple-500" />}    label="In Progress"     value={forwardedIssues.toString()} trend="→"   />
          <StatCard icon={<TrendingUp className="text-purple-500" />}    label="Resolution Rate" value={`${resolutionRate}%`}      trend="+3%"  />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-8">

          {/* 1 — Reports by Category */}
          <div className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Reports by Category</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distribution</span>
            </div>
            {typeData.length === 0 ? (
              <EmptyChart message="No issues submitted yet." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={userSettings.darkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 2 — Resolution Status (Pie) */}
          <div className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Resolution Status</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Status</span>
            </div>
            {statusData.length === 0 ? (
              <EmptyChart message="No status data yet." />
            ) : (
              <div className="h-64 flex items-center gap-6">
                {/* Pie chart — takes left half */}
                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%" cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabel}
                        itemStyle={tooltipItem}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend — takes right side */}
                <div className="flex flex-col gap-3 shrink-0 pr-2">
                  {statusData.map(status => {
                    const pct = totalIssues ? Math.round((status.value / totalIssues) * 100) : 0;
                    return (
                      <div key={status.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
                        <div className="flex flex-col">
                          <span className={cn("text-xs font-bold", !userSettings.darkMode ? "text-slate-900" : "text-slate-200")}>
                            {status.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {status.value} reports · {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3 — Urgency Distribution */}
          <div className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Urgency Distribution</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Scored</span>
            </div>
            {issues.length === 0 ? (
              <EmptyChart message="No urgency data yet." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={urgencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={userSettings.darkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {urgencyData.map((_, index) => (
                        <Cell key={index} fill={urgencyColors[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 4 — Monthly Trend */}
          <div className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Monthly Trend</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resolved</span>
                </div>
              </div>
            </div>
            {timelineData.length === 0 ? (
              <EmptyChart message="Submit issues to see the monthly trend." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <defs>
                      <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={userSettings.darkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabel} itemStyle={tooltipItem} />
                    <Area type="monotone" dataKey="issues"   stroke="#3b82f6" fillOpacity={1} fill="url(#colorIssues)"   strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
      {message}
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode; label: string; value: string; trend: string }) {
  const { userSettings } = useApp();
  const isPositive = trend.startsWith('+');
  const isNeutral  = trend === '→';
  return (
    <div className={cn("glass-card p-6 space-y-4", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
      <div className="flex justify-between items-center">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", userSettings.darkMode ? "bg-slate-900" : "bg-slate-50")}>
          {icon}
        </div>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded",
          isNeutral  ? "bg-slate-500/10 text-slate-400"     :
          isPositive ? "bg-emerald-500/10 text-emerald-500"  :
                       "bg-amber-500/10 text-amber-500"
        )}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
        <h4 className={cn("text-3xl font-bold mt-1", !userSettings.darkMode && "text-slate-900")}>{value}</h4>
      </div>
    </div>
  );
}