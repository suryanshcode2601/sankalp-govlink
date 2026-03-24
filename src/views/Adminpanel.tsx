import { useEffect, useState } from "react";
 
type Issue = {
  id: number;
  description: string;
  type: string;
  status: string;
  location_name: string;
  urgency: number;
  upvotes: number;
  created_at: string;
};
 
type ConfirmModal =
  | { kind: "verify"; issue: Issue }
  | { kind: "reject"; issue: Issue }
  | { kind: "resolve"; issue: Issue }
  | null;
 
const STATUS_TABS = ["PENDING", "VERIFIED", "FORWARDED", "RESOLVED"] as const;
 
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Roads:       { bg: "#1c2a3a", text: "#60a5fa" },
  Water:       { bg: "#0f2d2d", text: "#34d399" },
  Electricity: { bg: "#2d1f0f", text: "#fbbf24" },
  default:     { bg: "#1e1b2e", text: "#a78bfa" },
};
 
const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  PENDING:   { bg: "#1c2510", text: "#86efac", label: "Pending"   },
  VERIFIED:  { bg: "#0f2233", text: "#38bdf8", label: "Verified"  },
  FORWARDED: { bg: "#1e1030", text: "#c084fc", label: "Forwarded" },
  RESOLVED:  { bg: "#0f2d1a", text: "#34d399", label: "Resolved"  },
};
 
function urgencyColor(u: number) {
  if (u > 70) return "#ef4444";
  if (u > 40) return "#f59e0b";
  return "#3b82f6";
}
 
// ── Real-time hook: recalculates every 60s so timestamps stay live
function useRealTimeAgo(dateStr: string) {
  const calc = () => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d}d ago`;
    const h = Math.floor(diff / 3600000);
    if (h > 0) return `${h}h ago`;
    const m = Math.floor(diff / 60000);
    if (m > 0) return `${m}m ago`;
    return "Just now";
  };
  const [label, setLabel] = useState(calc);
  useEffect(() => {
    setLabel(calc());
    const t = setInterval(() => setLabel(calc()), 60000);
    return () => clearInterval(t);
  }, [dateStr]);
  return label;
}
 
// ── Small component so the hook can be called per-card (hooks can't be in loops)
function TimeAgoLabel({ dateStr }: { dateStr: string }) {
  const label = useRealTimeAgo(dateStr);
  return (
    <div className="meta-item">
      <span>🕒</span>
      <span>{label}</span>
    </div>
  );
}
 
export default function AdminPanel() {
  const [issues, setIssues]                   = useState<Issue[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [statusFilter, setStatusFilter]       = useState<string>("PENDING");
  const [typeFilter, setTypeFilter]           = useState<string>("ALL");
  const [detailIssue, setDetailIssue]         = useState<Issue | null>(null);
  const [forwardIssue, setForwardIssue]       = useState<Issue | null>(null);
  const [confirmModal, setConfirmModal]       = useState<ConfirmModal>(null);
  const [forwardDept, setForwardDept]         = useState("Roads");
  const [forwardPriority, setForwardPriority] = useState("Medium");
  const [forwardMsg, setForwardMsg]           = useState("");
  const [verifiedIds, setVerifiedIds]         = useState<Set<number>>(new Set());
 
  // ── Fetch issues from backend
  const fetchIssues = () => {
    fetch("https://sankalp-govlink-production.up.railway.app/admin/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };
 
  // ── Real-time polling every 10 seconds
  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 10000);
    return () => clearInterval(interval);
  }, []);
 
  const allTypes = ["ALL", ...Array.from(new Set(issues.map((i) => i.type)))];
 
  const filtered = issues
    .filter(
      (issue) =>
        issue.status === statusFilter &&
        (typeFilter === "ALL" || issue.type === typeFilter) &&
        issue.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.urgency - a.urgency);
 
  function handleVerifyConfirm(issue: Issue) {
    fetch(`https://sankalp-govlink-production.up.railway.app/admin/issues/${issue.id}/verify`, {
      method: "PATCH",
    }).then(() => {
      setIssues((prev) =>
        prev.map((i) => (i.id === issue.id ? { ...i, status: "VERIFIED" } : i))
      );
      setVerifiedIds((prev) => new Set(prev).add(issue.id));
      setConfirmModal(null);
    });
  }
 
  function handleRejectConfirm(issue: Issue) {
    fetch(`https://sankalp-govlink-production.up.railway.app/admin/issues/${issue.id}`, {
      method: "DELETE",
    }).then(() => {
      setIssues((prev) => prev.filter((i) => i.id !== issue.id));
      setConfirmModal(null);
    });
  }
 
  function handleResolveConfirm(issue: Issue) {
    fetch(`https://sankalp-govlink-production.up.railway.app/admin/issues/${issue.id}/resolve`, {
      method: "PATCH",
    }).then(() => {
      setIssues((prev) =>
        prev.map((i) => (i.id === issue.id ? { ...i, status: "RESOLVED" } : i))
      );
      setConfirmModal(null);
    });
  }
 
  function handleForwardSubmit() {
    if (!forwardIssue) return;
    fetch(`https://sankalp-govlink-production.up.railway.app/admin/issues/${forwardIssue.id}/forward`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        department: forwardDept,
        priority: forwardPriority,
        message: forwardMsg,
      }),
    }).then(() => {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === forwardIssue.id ? { ...i, status: "FORWARDED" } : i
        )
      );
      setForwardIssue(null);
      setForwardMsg("");
    });
  }
 
  const typeStyle  = (type: string) => TYPE_COLORS[type] ?? TYPE_COLORS["default"];
  const statsCount = (status: string) => issues.filter((i) => i.status === status).length;

  return (
    <>
          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0c10; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
 
        .panel-root {
          min-height: 100vh;
          background: #0a0c10;
          color: #f1f5f9;
          font-family: 'DM Sans', sans-serif;
          padding: 0 0 80px 0;
        }
 
        /* HEADER */
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 12, 16, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #1f2937;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .header-left { display: flex; align-items: center; gap: 14px; }
        .header-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.3);
        }
        .header-title {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .header-subtitle {
          font-size: 12px;
          color: #4b5563;
          font-weight: 400;
          margin-top: 1px;
        }
        .header-right { display: flex; align-items: center; gap: 10px; }
 
        .search-wrap {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #4b5563;
          font-size: 14px;
          pointer-events: none;
        }
        .search-input {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 10px;
          padding: 9px 14px 9px 36px;
          color: #f1f5f9;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          width: 240px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .search-input::placeholder { color: #4b5563; }
 
        .type-select {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 10px;
          padding: 9px 14px;
          color: #9ca3af;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .type-select:focus { border-color: #2563eb; }
 
        /* CONTENT */
        .content { padding: 32px 40px 0; }
 
        /* STATS ROW */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          border-color: #374151;
          transform: translateY(-1px);
        }
        .stat-label { font-size: 11px; color: #4b5563; font-weight: 500; text-transform: uppercase; letter-spacing: 0.8px; }
        .stat-value { font-size: 26px; font-weight: 700; letter-spacing: -1px; }
        .stat-sub { font-size: 11px; color: #4b5563; }
 
        /* STATUS TABS */
        .tabs-row {
          display: flex;
          gap: 4px;
          margin-bottom: 22px;
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 12px;
          padding: 5px;
          width: fit-content;
        }
        .tab-btn {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, color 0.2s;
          background: transparent;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .tab-btn.active {
          background: #2563eb;
          color: #fff;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.3);
        }
        .tab-count {
          background: rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 1px 7px;
          font-size: 11px;
          font-family: 'JetBrains Mono', monospace;
        }
        .tab-btn:not(.active) .tab-count {
          background: #1f2937;
          color: #6b7280;
        }
 
        /* ISSUE CARDS */
        .issues-list { display: flex; flex-direction: column; gap: 10px; }
 
        .issue-card {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 16px;
          padding: 20px 22px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 20px;
          align-items: center;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .issue-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--urgency-color);
          border-radius: 3px 0 0 3px;
          opacity: 0.7;
        }
        .issue-card:hover {
          border-color: #2563eb;
          box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15), 0 8px 32px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
 
        .issue-left { display: flex; flex-direction: column; gap: 10px; padding-left: 8px; }
        .issue-top-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .issue-title { font-size: 14px; font-weight: 600; color: #f1f5f9; line-height: 1.4; }
 
        .badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.2px;
          white-space: nowrap;
        }
 
        .issue-meta { display: flex; align-items: center; gap: 16px; }
        .meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; }
 
        .issue-center { width: 200px; display: flex; flex-direction: column; gap: 6px; }
        .urgency-label {
          display: flex; justify-content: space-between;
          font-size: 11px; color: #6b7280; font-family: 'JetBrains Mono', monospace;
        }
        .urgency-track {
          height: 5px;
          background: #1f2937;
          border-radius: 10px;
          overflow: hidden;
        }
        .urgency-fill {
          height: 100%;
          border-radius: 10px;
          background: var(--urgency-color);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 8px var(--urgency-color);
        }
        .issue-stats { display: flex; gap: 12px; margin-top: 2px; }
        .issue-stat {
          font-size: 11px; color: #4b5563;
          display: flex; align-items: center; gap: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
 
        .issue-actions { display: flex; gap: 8px; align-items: center; }
 
        .btn {
          padding: 8px 16px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.18s ease;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .btn-verify {
          background: rgba(16, 185, 129, 0.12);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .btn-verify:hover:not(:disabled) {
          background: rgba(16, 185, 129, 0.22);
          border-color: rgba(52, 211, 153, 0.4);
        }
        .btn-verify.done {
          background: rgba(16, 185, 129, 0.08);
          color: #34d399;
          opacity: 0.6;
        }
        .btn-forward {
          background: rgba(37, 99, 235, 0.12);
          color: #60a5fa;
          border: 1px solid rgba(96, 165, 250, 0.2);
        }
        .btn-forward:hover {
          background: rgba(37, 99, 235, 0.22);
          border-color: rgba(96, 165, 250, 0.4);
        }
        .btn-reject {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(248, 113, 113, 0.2);
        }
        .btn-reject:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(248, 113, 113, 0.4);
        }
        .btn-primary {
          background: #2563eb;
          color: #fff;
          border: 1px solid transparent;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-primary:hover { background: #1d4ed8; }
        .btn-ghost {
          background: transparent;
          color: #6b7280;
          border: 1px solid #1f2937;
        }
        .btn-ghost:hover { color: #9ca3af; border-color: #374151; }
 
        /* EMPTY STATE */
        .empty {
          text-align: center;
          padding: 64px 20px;
          color: #4b5563;
        }
        .empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.5; }
        .empty-title { font-size: 15px; font-weight: 600; color: #6b7280; margin-bottom: 6px; }
        .empty-sub { font-size: 13px; }
 
        /* LOADING */
        .loading-pulse {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pulse-card {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 16px;
          height: 90px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
 
        /* MODAL OVERLAY */
        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }
 
        /* DETAIL MODAL */
        .modal {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 20px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }
        .modal-header {
          padding: 24px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .modal-title { font-size: 16px; font-weight: 700; }
        .modal-close {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: #1f2937;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .modal-close:hover { background: #374151; color: #f1f5f9; }
        .modal-body { padding: 20px 24px 24px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .detail-field { background: #0d1018; border-radius: 10px; padding: 12px 14px; }
        .detail-field.full { grid-column: 1 / -1; }
        .detail-field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #4b5563; margin-bottom: 5px; }
        .detail-field-value { font-size: 13px; color: #e2e8f0; font-weight: 500; line-height: 1.5; }
 
        /* CONFIRM MODAL */
        .confirm-modal {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 18px;
          width: 100%;
          max-width: 380px;
          padding: 28px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
          text-align: center;
        }
        .confirm-icon { font-size: 36px; margin-bottom: 14px; }
        .confirm-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .confirm-sub { font-size: 13px; color: #6b7280; margin-bottom: 24px; line-height: 1.5; }
        .confirm-actions { display: flex; gap: 10px; justify-content: center; }
 
        /* FORWARD MODAL */
        .forward-modal {
          background: #151921;
          border: 1px solid #1f2937;
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
        }
        .forward-header {
          padding: 22px 24px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .forward-body { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 14px; }
 
        .autofill-block {
          background: #0d1018;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .autofill-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .autofill-key { color: #4b5563; }
        .autofill-val { color: #d1d5db; font-weight: 500; text-align: right; max-width: 260px; }
 
        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin-bottom: 6px;
          display: block;
        }
        .field-select {
          width: 100%;
          background: #0d1018;
          border: 1px solid #1f2937;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f1f5f9;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
        }
        .field-select:focus { border-color: #2563eb; }
 
        .priority-group { display: flex; gap: 8px; }
        .priority-btn {
          flex: 1;
          padding: 9px 0;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid #1f2937;
          background: transparent;
          color: #6b7280;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .priority-btn.active-low {
          background: rgba(16,185,129,0.12);
          color: #34d399;
          border-color: rgba(52,211,153,0.3);
        }
        .priority-btn.active-medium {
          background: rgba(245,158,11,0.12);
          color: #fbbf24;
          border-color: rgba(251,191,36,0.3);
        }
        .priority-btn.active-high {
          background: rgba(239,68,68,0.12);
          color: #f87171;
          border-color: rgba(248,113,113,0.3);
        }
        .priority-btn:not(.active-low):not(.active-medium):not(.active-high):hover {
          border-color: #374151;
          color: #9ca3af;
        }
 
        .field-textarea {
          width: 100%;
          background: #0d1018;
          border: 1px solid #1f2937;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f1f5f9;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          resize: vertical;
          min-height: 80px;
          transition: border-color 0.2s;
        }
        .field-textarea:focus { border-color: #2563eb; }
        .field-textarea::placeholder { color: #374151; }
 
        .divider {
          height: 1px;
          background: #1f2937;
          margin: 4px 0;
        }
 
        @media (max-width: 768px) {
          .header { padding: 14px 20px; }
          .content { padding: 20px 20px 0; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .issue-card { grid-template-columns: 1fr; }
          .issue-center { width: 100%; }
          .search-input { width: 160px; }
        }
      `}</style>
      

      <div className="panel-root">
 
        {/* ─── HEADER ─── */}
        <header className="header">
          <div className="header-left">
            <div className="header-logo">🏛️</div>
            <div>
              <div className="header-title">GovConnect AI</div>
              <div className="header-subtitle">Admin Operations Panel</div>
            </div>
          </div>
          <div className="header-right">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues..."
              />
            </div>
            <select
              className="type-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {allTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "All Types" : t}
                </option>
              ))}
            </select>
          </div>
        </header>
 
        {/* ─── CONTENT ─── */}
        <div className="content">
 
          {/* ── STATS — all 5 in one horizontal row via inline grid override */}
          <div className="stats-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            <div className="stat-card">
              <div className="stat-label">Total Issues</div>
              <div className="stat-value" style={{ color: "#60a5fa" }}>{issues.length}</div>
              <div className="stat-sub">All time reported</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value" style={{ color: "#fbbf24" }}>{statsCount("PENDING")}</div>
              <div className="stat-sub">Awaiting review</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Verified</div>
              <div className="stat-value" style={{ color: "#38bdf8" }}>{statsCount("VERIFIED")}</div>
              <div className="stat-sub">Confirmed valid</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Forwarded</div>
              <div className="stat-value" style={{ color: "#c084fc" }}>{statsCount("FORWARDED")}</div>
              <div className="stat-sub">Sent to departments</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Resolved</div>
              <div className="stat-value" style={{ color: "#34d399" }}>{statsCount("RESOLVED")}</div>
              <div className="stat-sub">100% complete</div>
            </div>
          </div>
 
          {/* ── STATUS TABS */}
          <div className="tabs-row">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${statusFilter === tab ? "active" : ""}`}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === "PENDING"    ? "🕐"
                : tab === "VERIFIED"  ? "✅"
                : tab === "FORWARDED" ? "📤"
                :                      "🏁"}
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
                <span className="tab-count">{statsCount(tab)}</span>
              </button>
            ))}
          </div>
 
          {/* ── ISSUES LIST */}
          {loading ? (
            <div className="loading-pulse">
              {[1, 2, 3].map((n) => (<div key={n} className="pulse-card" />))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No issues found</div>
              <div className="empty-sub">Try adjusting your search or filter criteria</div>
            </div>
          ) : (
            <div className="issues-list">
              {filtered.map((issue) => {
                const uc = urgencyColor(issue.urgency);
                const ts = typeStyle(issue.type);
                const isVerified = issue.status === "VERIFIED" || verifiedIds.has(issue.id);
                const isResolved = issue.status === "RESOLVED";
 
                // ── Enforce strict flow: PENDING → VERIFIED → FORWARDED → RESOLVED
                const canForward = issue.status === "VERIFIED";
                const canResolve = issue.status === "FORWARDED";
 
                return (
                  <div
                    key={issue.id}
                    className="issue-card"
                    style={{ "--urgency-color": uc } as React.CSSProperties}
                    onClick={() => setDetailIssue(issue)}
                  >
                    {/* LEFT */}
                    <div className="issue-left">
                      <div className="issue-top-row">
                        <span className="issue-title">
                          {issue.description.length > 60
                            ? issue.description.slice(0, 60) + "…"
                            : issue.description}
                        </span>
                        <span className="badge" style={{ background: ts.bg, color: ts.text }}>
                          {issue.type}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: STATUS_BADGE[issue.status]?.bg ?? "#1f2937",
                            color:      STATUS_BADGE[issue.status]?.text ?? "#9ca3af",
                          }}
                        >
                          {STATUS_BADGE[issue.status]?.label ?? issue.status}
                        </span>
                      </div>
                      <div className="issue-meta">
                        <div className="meta-item"><span>📍</span><span>{issue.location_name}</span></div>
                        {/* ── Real-time updating timestamp */}
                        <TimeAgoLabel dateStr={issue.created_at} />
                        <div className="meta-item"><span>👍</span><span>{issue.upvotes} upvotes</span></div>
                      </div>
                    </div>
 
                    {/* CENTER — urgency bar */}
                    <div className="issue-center" onClick={(e) => e.stopPropagation()}>
                      <div className="urgency-label">
                        <span>Urgency</span>
                        <span style={{ color: uc }}>{issue.urgency}%</span>
                      </div>
                      <div className="urgency-track">
                        <div
                          className="urgency-fill"
                          style={{ width: `${issue.urgency}%`, "--urgency-color": uc } as React.CSSProperties}
                        />
                      </div>
                    </div>
 
                    {/* ACTIONS */}
                    <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
 
                      {/* Step 1 — Verify: only on PENDING */}
                      <button
                        className={`btn btn-verify ${isVerified ? "done" : ""}`}
                        disabled={isVerified || isResolved}
                        title={isVerified ? "Already verified" : "Verify this issue"}
                        onClick={() => setConfirmModal({ kind: "verify", issue })}
                      >
                        {isVerified ? "✓ Verified" : "Verify"}
                      </button>
 
                      {/* Step 2 — Forward: only enabled after VERIFIED */}
                      <button
                        className="btn btn-forward"
                        disabled={!canForward || isResolved}
                        title={!canForward ? "Verify the issue first before forwarding" : "Forward to department"}
                        onClick={() => {
                          setForwardIssue(issue);
                          setForwardDept("Roads");
                          setForwardPriority("Medium");
                          setForwardMsg("");
                        }}
                      >
                        Forward
                      </button>
 
                      {/* Step 3 — Resolved: only enabled after FORWARDED */}
                      <button
                        className={`btn btn-resolve ${isResolved ? "done" : ""}`}
                        disabled={!canResolve || isResolved}
                        title={isResolved ? "Already resolved" : !canResolve ? "Forward the issue first before resolving" : "Mark as 100% resolved"}
                        onClick={() => setConfirmModal({ kind: "resolve", issue })}
                      >
                        {isResolved ? "✓ Resolved" : "Resolved"}
                      </button>
 
                      {/* Reject: available at any stage except already resolved */}
                      <button
                        className="btn btn-reject"
                        disabled={isResolved}
                        title={isResolved ? "Cannot reject a resolved issue" : "Reject this issue"}
                        onClick={() => setConfirmModal({ kind: "reject", issue })}
                      >
                        Reject
                      </button>
 
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
        {/* ─── DETAIL MODAL ─── */}
        {detailIssue && (
          <div className="overlay" onClick={() => setDetailIssue(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
                    Issue #{detailIssue.id}
                  </div>
                  <div className="modal-title">
                    {detailIssue.description.slice(0, 50)}{detailIssue.description.length > 50 ? "…" : ""}
                  </div>
                </div>
                <button className="modal-close" onClick={() => setDetailIssue(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-field full">
                    <div className="detail-field-label">Full Description</div>
                    <div className="detail-field-value">{detailIssue.description}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Location</div>
                    <div className="detail-field-value">📍 {detailIssue.location_name}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Category</div>
                    <div className="detail-field-value">{detailIssue.type}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Urgency</div>
                    <div className="detail-field-value" style={{ color: urgencyColor(detailIssue.urgency) }}>
                      {detailIssue.urgency}%
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Status</div>
                    <div className="detail-field-value">
                      <span
                        className="badge"
                        style={{
                          background: STATUS_BADGE[detailIssue.status]?.bg ?? "#1f2937",
                          color:      STATUS_BADGE[detailIssue.status]?.text ?? "#9ca3af",
                        }}
                      >
                        {STATUS_BADGE[detailIssue.status]?.label ?? detailIssue.status}
                      </span>
                    </div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Upvotes</div>
                    <div className="detail-field-value">👍 {detailIssue.upvotes}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-field-label">Reported</div>
                    <div className="detail-field-value">
                      {new Date(detailIssue.created_at).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div className="urgency-label" style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5563", marginBottom: 6 }}>
                    <span>Urgency Level</span>
                    <span style={{ color: urgencyColor(detailIssue.urgency) }}>{detailIssue.urgency}%</span>
                  </div>
                  <div className="urgency-track" style={{ height: 8 }}>
                    <div
                      className="urgency-fill"
                      style={{ width: `${detailIssue.urgency}%`, "--urgency-color": urgencyColor(detailIssue.urgency) } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
 
        {/* ─── CONFIRM MODAL ─── */}
        {confirmModal && (
          <div className="overlay" onClick={() => setConfirmModal(null)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
 
              {confirmModal.kind === "verify" && (
                <>
                  <div className="confirm-icon">✅</div>
                  <div className="confirm-title">Verify this issue?</div>
                  <div className="confirm-sub">
                    This will mark the issue as verified and notify relevant teams.
                    <br />
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                      "{confirmModal.issue.description.slice(0, 60)}…"
                    </span>
                  </div>
                  <div className="confirm-actions">
                    <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleVerifyConfirm(confirmModal.issue)}>
                      Yes, Verify
                    </button>
                  </div>
                </>
              )}
 
              {confirmModal.kind === "reject" && (
                <>
                  <div className="confirm-icon">🗑️</div>
                  <div className="confirm-title">Reject this issue?</div>
                  <div className="confirm-sub">
                    This action is permanent and cannot be undone.
                    <br />
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                      "{confirmModal.issue.description.slice(0, 60)}…"
                    </span>
                  </div>
                  <div className="confirm-actions">
                    <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Cancel</button>
                    <button className="btn btn-reject" style={{ padding: "8px 20px" }} onClick={() => handleRejectConfirm(confirmModal.issue)}>
                      Yes, Reject
                    </button>
                  </div>
                </>
              )}
 
              {confirmModal.kind === "resolve" && (
                <>
                  <div className="confirm-icon">🏁</div>
                  <div className="confirm-title">Mark as 100% Resolved?</div>
                  <div className="confirm-sub">
                    This confirms the problem has been <strong>completely fixed</strong> on the ground.
                    This will update the Resolution Rate on the public Transparency page.
                    <br />
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                      "{confirmModal.issue.description.slice(0, 60)}…"
                    </span>
                  </div>
                  <div className="confirm-actions">
                    <button className="btn btn-ghost" onClick={() => setConfirmModal(null)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => handleResolveConfirm(confirmModal.issue)}>
                      ✅ Yes, Mark Resolved
                    </button>
                  </div>
                </>
              )}
 
            </div>
          </div>
        )}
 
        {/* ─── FORWARD MODAL ─── */}
        {forwardIssue && (
          <div className="overlay" onClick={() => setForwardIssue(null)}>
            <div className="forward-modal" onClick={(e) => e.stopPropagation()}>
              <div className="forward-header">
                <div>
                  <div style={{ fontSize: 11, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
                    Forward Issue #{forwardIssue.id}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Send to Department</div>
                </div>
                <button className="modal-close" onClick={() => setForwardIssue(null)}>✕</button>
              </div>
 
              <div className="forward-body">
                <div>
                  <label className="field-label">Issue Details (auto-filled)</label>
                  <div className="autofill-block">
                    <div className="autofill-row">
                      <span className="autofill-key">Description</span>
                      <span className="autofill-val">{forwardIssue.description.slice(0, 55)}{forwardIssue.description.length > 55 ? "…" : ""}</span>
                    </div>
                    <div className="divider" />
                    <div className="autofill-row">
                      <span className="autofill-key">Location</span>
                      <span className="autofill-val">📍 {forwardIssue.location_name}</span>
                    </div>
                    <div className="divider" />
                    <div className="autofill-row">
                      <span className="autofill-key">Category</span>
                      <span className="autofill-val">{forwardIssue.type}</span>
                    </div>
                  </div>
                </div>
 
                <div>
                  <label className="field-label">Department</label>
                  <select className="field-select" value={forwardDept} onChange={(e) => setForwardDept(e.target.value)}>
                    <option value="Roads">🛣️ Roads</option>
                    <option value="Water">💧 Water</option>
                    <option value="Electricity">⚡ Electricity</option>
                    <option value="Safety">🛡️Safety</option>
                    <option value="Infrastructure">Infrastructure</option>

                  </select>
                </div>
 
                <div>
                  <label className="field-label">Priority Level</label>
                  <div className="priority-group">
                    {(["Low", "Medium", "High"] as const).map((p) => (
                      <button
                        key={p}
                        className={`priority-btn ${forwardPriority === p ? `active-${p.toLowerCase()}` : ""}`}
                        onClick={() => setForwardPriority(p)}
                      >
                        {p === "Low" ? "🟢" : p === "Medium" ? "🟡" : "🔴"} {p}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div>
                  <label className="field-label">Message (optional)</label>
                  <textarea
                    className="field-textarea"
                    placeholder="Add notes for the department..."
                    value={forwardMsg}
                    onChange={(e) => setForwardMsg(e.target.value)}
                  />
                </div>
 
                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setForwardIssue(null)}>Cancel</button>
                  <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleForwardSubmit}>📤 Forward Issue</button>
                </div>
              </div>
            </div>
          </div>
        )}
 
      </div>
    </>
  );
}
 
