import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Shield, 
  Settings, 
  Search, 
  Bell, 
  User,
  Plus,
  Sparkles,
  ArrowUp,
  ChevronRight,
  MapPin,
  Clock,
  FileText,
  X,
  Eye,
  Lock,
  Database,
  UserCheck,
  Mail,
  HelpCircle,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Accessibility,
  Monitor,
  Type,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showTabs?: boolean;
}

// ─── Reusable Modal Shell ─────────────────────────────────────────────────────
function ModalShell({
  isOpen,
  onClose,
  icon,
  title,
  subtitle,
  introBg,
  introText,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  introBg?: string;
  introText: string;
  children: React.ReactNode;
}) {
  const { userSettings } = useApp();
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-2xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col",
          userSettings.darkMode ? "bg-[#0a0c12] border-slate-800" : "bg-white border-slate-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn("flex items-center justify-between px-8 py-6 border-b shrink-0", userSettings.darkMode ? "border-slate-800" : "border-slate-200")}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h2 className={cn("text-xl font-bold", !userSettings.darkMode && "text-slate-900")}>{title}</h2>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
              userSettings.darkMode ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            )}
          >
            <X size={18} />
          </button>
        </div>

        {/* Intro */}
        <div className={cn("px-8 py-4 border-b shrink-0", userSettings.darkMode ? "border-slate-800 bg-slate-900/40" : "border-slate-100 bg-slate-50")}>
          <p className="text-sm text-slate-500 leading-relaxed">{introText}</p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-7">
          {children}
        </div>

        {/* Footer */}
        <div className={cn("px-8 py-5 border-t flex items-center justify-between shrink-0", userSettings.darkMode ? "border-slate-800" : "border-slate-200")}>
          <p className="text-[11px] text-slate-500">© 2026 GovConnect AI. All rights reserved.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-2 rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Section Block ───────────────────────────────────────────────────
function ModalSection({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  const { userSettings } = useApp();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          userSettings.darkMode ? "bg-blue-600/10 text-blue-400" : "bg-blue-50 text-blue-600"
        )}>
          {icon}
        </div>
        <h3 className={cn("font-bold text-sm", !userSettings.darkMode && "text-slate-900")}>{title}</h3>
      </div>
      <ul className="space-y-2 pl-11">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <div className={cn("mt-4 h-px", userSettings.darkMode ? "bg-slate-800" : "bg-slate-100")} />
    </div>
  );
}

// ─── Privacy Policy Modal ─────────────────────────────────────────────────────
function PrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Shield className="w-5 h-5 text-white" />}
      title="Privacy Policy"
      subtitle="GovConnect AI — Last updated March 2024"
      introText="GovConnect AI is committed to protecting your privacy. This policy explains what data we collect, how we use it, and the rights you have as a citizen using our civic platform."
    >
      <ModalSection icon={<Eye size={18} />} title="Information We Collect" items={[
        'Personal details (name, email) when you register on GovConnect AI.',
        'Location data when you submit city issue reports for accurate department routing.',
        'Usage data including pages visited, features used, and session duration.',
        'Issue reports, descriptions, and photos you submit through the platform.',
      ]} />
      <ModalSection icon={<Database size={18} />} title="How We Use Your Information" items={[
        'To route your city issue reports to the correct municipal department using AI.',
        'To send status updates and notifications about your submitted reports.',
        'To display community issues on the City Map for public transparency.',
        'To improve our AI routing accuracy and overall platform experience.',
      ]} />
      <ModalSection icon={<Lock size={18} />} title="Data Security" items={[
        'All data is encrypted in transit using industry-standard TLS/SSL protocols.',
        'Your personal information is stored securely and never sold to third parties.',
        'Strict access controls ensure only authorized personnel can view your data.',
        'Regular security audits are conducted to maintain platform integrity.',
      ]} />
      <ModalSection icon={<UserCheck size={18} />} title="Your Rights" items={[
        'You may request access to all personal data we hold about you at any time.',
        'Update or correct your profile information directly from the Settings page.',
        'Request full deletion of your account and all associated data.',
        'Opt out of non-essential communications at any time.',
      ]} />
      <ModalSection icon={<Mail size={18} />} title="Contact Us" items={[
        'For privacy questions, contact our Data Protection Officer.',
        'Email: privacy@govconnect.ai',
        'We respond to all privacy inquiries within 5 business days.',
      ]} />
    </ModalShell>
  );
}

// ─── Support Center Modal ─────────────────────────────────────────────────────
function SupportCenterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<HelpCircle className="w-5 h-5 text-white" />}
      title="Support Center"
      subtitle="GovConnect AI — We're here to help"
      introText="Welcome to the GovConnect AI Support Center. Find answers to common questions, learn how to use the platform, and get in touch with our support team if you need further assistance."
    >
      <ModalSection icon={<Plus size={18} />} title="How to Report a City Issue" items={[
        'Click the "Report an Issue" button on the Dashboard or City Map page.',
        'Describe the issue clearly — include what it is, where it is, and how urgent it feels.',
        'Drop a pin on the map to mark the exact location of the problem.',
        'Optionally attach a photo to help the relevant department understand the issue.',
        'Submit your report — our AI will automatically route it to the right department.',
      ]} />
      <ModalSection icon={<FileText size={18} />} title="Tracking Your Report" items={[
        'Go to "My Reports" in the Dashboard to see all your submitted issues.',
        'Each report shows a status: Pending, Dispatched, or Resolved.',
        'You will receive email and push notifications when your report status changes.',
        'Click any report to see detailed information and department updates.',
      ]} />
      <ModalSection icon={<MapPin size={18} />} title="Using the City Map" items={[
        'The City Map shows all reported issues across your city in real time.',
        'Click any pin on the map to view issue details and current status.',
        'Use filters to view issues by category such as Roads, Water, or Safety.',
        'You can submit a new report directly from the map by clicking any location.',
      ]} />
      <ModalSection icon={<AlertCircle size={18} />} title="Frequently Asked Questions" items={[
        'How long does resolution take? Most issues are reviewed within 48 hours.',
        'Can I report anonymously? No, an account is required to track and verify reports.',
        'What if my issue is urgent? Mark it as high urgency when submitting.',
        'Can I edit a report after submitting? Currently reports cannot be edited once submitted.',
        'What categories are supported? Roads, Water, Electricity, Safety, and General.',
      ]} />
      <ModalSection icon={<MessageSquare size={18} />} title="Contact Support" items={[
        'Email us at support@govconnect.ai for any platform-related issues.',
        'Our support team is available Monday to Friday, 9am to 6pm.',
        'For urgent civic emergencies, please contact your local emergency services directly.',
        'Response time for support tickets is within 1 to 2 business days.',
      ]} />
    </ModalShell>
  );
}

// ─── Accessibility Modal ──────────────────────────────────────────────────────
function AccessibilityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      icon={<Accessibility className="w-5 h-5 text-white" />}
      title="Accessibility"
      subtitle="GovConnect AI — Inclusive for everyone"
      introText="GovConnect AI is committed to making our platform accessible to all citizens, regardless of ability or disability. We follow WCAG 2.1 Level AA standards and continuously work to improve our accessibility features."
    >
      <ModalSection icon={<Monitor size={18} />} title="Screen Reader Support" items={[
        'GovConnect AI is compatible with major screen readers including NVDA, JAWS, and VoiceOver.',
        'All images and icons include descriptive alt text for screen reader users.',
        'Interactive elements such as buttons and forms are clearly labeled.',
        'Page structure uses semantic HTML to ensure logical reading order.',
      ]} />
      <ModalSection icon={<Type size={18} />} title="Text & Visual Adjustments" items={[
        'Use your browser\'s built-in zoom (Ctrl + / Cmd +) to increase text size up to 200% without loss of content.',
        'Dark mode is available in Settings to reduce eye strain in low-light environments.',
        'Color contrast across the platform meets WCAG 2.1 AA contrast ratio requirements.',
        'Important information is never conveyed by color alone — icons and labels are always included.',
      ]} />
      <ModalSection icon={<BookOpen size={18} />} title="Keyboard Navigation" items={[
        'All features of GovConnect AI can be accessed using a keyboard alone.',
        'Use the Tab key to move between interactive elements on the page.',
        'Press Enter or Space to activate buttons and links.',
        'Press Escape to close modals and dropdown menus.',
        'Focus indicators are clearly visible on all interactive elements.',
      ]} />
      <ModalSection icon={<Globe size={18} />} title="Language & Compatibility" items={[
        'GovConnect AI currently supports English with additional languages planned.',
        'The platform is compatible with modern browsers including Chrome, Firefox, Safari, and Edge.',
        'Mobile accessibility is supported on both iOS (VoiceOver) and Android (TalkBack).',
        'We recommend keeping your browser updated for the best accessible experience.',
      ]} />
      <ModalSection icon={<Mail size={18} />} title="Request Accommodations" items={[
        'If you experience any accessibility barriers, please contact us at accessibility@govconnect.ai.',
        'We will work with you to provide the information or service in an alternative format.',
        'Feedback and suggestions to improve accessibility are always welcome.',
        'Response time for accessibility requests is within 2 business days.',
      ]} />
    </ModalShell>
  );
}

// ─── Footer text content map ──────────────────────────────────────────────────
const FOOTER_TEXTS: Record<string, string> = {
  default:     '© 2026 GovConnect AI. Your data is handled with strict governance standards.',
  privacy:     '© 2026 GovConnect AI. We never sell your data. Encrypted in transit. You can request deletion anytime at privacy@govconnect.ai.',
  accessibility: '© 2026 GovConnect AI. Built to WCAG 2.1 AA standards. Screen reader compatible. Keyboard navigable. Contact accessibility@govconnect.ai for help.',
  support:     '© 2026 GovConnect AI. Support available Mon–Fri 9am–6pm. Email: support@govconnect.ai. Response within 1–2 business days.',
};

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function Layout({ children, activeTab, onTabChange, showTabs = true }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { issues, userSettings } = useApp();

  const [searchQuery, setSearchQuery]         = useState('');
  const [showDropdown, setShowDropdown]       = useState(false);
  const [showPrivacyModal, setShowPrivacyModal]           = useState(false);
  const [showSupportModal, setShowSupportModal]           = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);

  // ── Which footer text is active: 'default' | 'privacy' | 'accessibility' | 'support'
  const [footerText, setFooterText] = useState<keyof typeof FOOTER_TEXTS>('default');

  const searchRef = useRef<HTMLDivElement>(null);

  // ── Admin login state (reads from localStorage)
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allCategories = Array.from(new Set(issues.map(i => i.type || 'General')));

  const filteredCategories = searchQuery.trim().length === 0
    ? allCategories
    : allCategories.filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredIssues = searchQuery.trim().length === 0 ? [] : issues.filter(issue => {
    const q = searchQuery.toLowerCase();
    const title    = (issue.description || '').toLowerCase();
    const category = (issue.type || '').toLowerCase();
    return title.includes(q) && !category.includes(q);
  });

  const handleCategoryClick = (category: string) => {
    setShowDropdown(false);
    setSearchQuery(category);
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  const handleIssueClick = (issueId: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/?issueId=${issueId}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowDropdown(false);
    navigate('/');
  };

  // ── Toggle footer text — clicking same link again resets to default
  const handleFooterLink = (key: keyof typeof FOOTER_TEXTS) => {
    setFooterText(prev => prev === key ? 'default' : key);
  };

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard',    path: '/'            },
    { icon: <MapIcon size={18} />,         label: 'City Map',     path: '/city-map'     },
    { icon: <Shield size={18} />,          label: 'Transparency', path: '/transparency' },
    { icon: <Settings size={18} />,        label: 'Settings',     path: '/settings'     },
  ];

  return (
    <div className={cn("flex h-screen text-slate-200 overflow-hidden transition-colors duration-300", userSettings.darkMode ? "bg-[#0a0c12]" : "bg-slate-50 text-slate-900")}>

      {/* Modals — kept exactly as before, still work normally */}
      <PrivacyPolicyModal    isOpen={showPrivacyModal}       onClose={() => setShowPrivacyModal(false)}       />
      <SupportCenterModal    isOpen={showSupportModal}       onClose={() => setShowSupportModal(false)}       />
      <AccessibilityModal    isOpen={showAccessibilityModal} onClose={() => setShowAccessibilityModal(false)} />

      {/* Sidebar */}
      <aside className={cn("w-64 border-r flex flex-col p-6 gap-8", userSettings.darkMode ? "border-slate-800" : "border-slate-200 bg-white")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className={cn("font-bold text-lg tracking-tight", !userSettings.darkMode && "text-slate-900")}>GovConnect AI</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-4 mb-2">Navigation</p>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : cn("text-slate-400 hover:bg-slate-800/50 hover:text-slate-200", !userSettings.darkMode && "text-slate-500 hover:bg-slate-100 hover:text-slate-900")
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-4 mb-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Active Reports</p>
              <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded font-bold">{issues.length} Total</span>
            </div>
            {issues.slice(0, 3).map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/city-map?issueId=${issue.id}`)}
                className={cn("px-4 py-2 space-y-2 cursor-pointer group rounded-lg transition-colors", userSettings.darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-100")}
              >
                <div className="flex justify-between items-center">
                  <span className={cn("text-[11px] font-medium truncate max-w-[120px]", userSettings.darkMode ? "text-slate-300" : "text-slate-700")}>
                    {(issue.description || "").split('.')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{issue.urgency || 0}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${issue.urgency || 0}%` }} />
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate('/city-map')}
              className="w-full text-center text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-4 hover:text-blue-400"
            >
              View All My Reports
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* ─── HEADER ─── */}
        <header className={cn("h-16 border-b flex items-center justify-between px-8 shrink-0", userSettings.darkMode ? "border-slate-800" : "border-slate-200 bg-white")}>
          <div className="flex h-full items-center">
            {showTabs && onTabChange && (
              <nav className="flex h-full gap-8">
                {['Dashboard', 'My Reports', 'Services', 'Community'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={cn(
                      "relative h-full flex items-center text-sm font-medium transition-colors",
                      activeTab === tab ? "text-blue-500" : "text-slate-400 hover:text-slate-200",
                      !userSettings.darkMode && activeTab !== tab && "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                    )}
                  </button>
                ))}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">

            {/* Search with Dropdown */}
            <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 z-10" />
              <input
                type="text"
                placeholder="Search category or issue..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                  if (e.target.value.trim()) {
                    navigate(`/?category=${encodeURIComponent(e.target.value.trim())}`, { replace: true });
                  } else {
                    navigate('/', { replace: true });
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className={cn(
                  "border rounded-lg pl-10 pr-8 py-2 text-sm w-72 focus:outline-none focus:border-blue-500 transition-colors",
                  userSettings.darkMode ? "bg-slate-900/50 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900"
                )}
              />
              {searchQuery && (
                <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  <X size={14} />
                </button>
              )}

              {/* Dropdown */}
              {showDropdown && searchQuery.trim().length > 0 && (
                <div className={cn(
                  "absolute top-full mt-2 left-0 w-full rounded-xl border shadow-xl z-50 overflow-hidden",
                  userSettings.darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                )}>
                  {filteredCategories.length === 0 && filteredIssues.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      No results for "<span className="font-bold">{searchQuery}</span>"
                    </div>
                  ) : (
                    <>
                      {filteredCategories.length > 0 && (
                        <div>
                          <div className={cn("px-4 py-2 text-[10px] uppercase tracking-widest font-bold", userSettings.darkMode ? "bg-slate-800/60 text-blue-400" : "bg-slate-50 text-blue-600")}>
                            Categories
                          </div>
                          {filteredCategories.map(category => {
                            const count = issues.filter(i => (i.type || 'General') === category).length;
                            return (
                              <button
                                key={category}
                                onClick={() => handleCategoryClick(category)}
                                className={cn("w-full text-left px-4 py-3 flex items-center gap-3 transition-colors", userSettings.darkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-800")}
                              >
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-blue-500 font-bold text-xs", userSettings.darkMode ? "bg-blue-600/10" : "bg-blue-50")}>
                                  {category.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{category}</p>
                                  <p className="text-[10px] text-slate-500">{count} issue{count !== 1 ? 's' : ''}</p>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-slate-500" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {filteredIssues.length > 0 && (
                        <div>
                          <div className={cn("px-4 py-2 text-[10px] uppercase tracking-widest font-bold", userSettings.darkMode ? "bg-slate-800/60 text-blue-400" : "bg-slate-50 text-blue-600")}>
                            Issues
                          </div>
                          {filteredIssues.map(issue => (
                            <button
                              key={issue.id}
                              onClick={() => handleIssueClick(issue.id)}
                              className={cn("w-full text-left px-4 py-3 flex items-center gap-3 transition-colors", userSettings.darkMode ? "hover:bg-slate-800 text-slate-200" : "hover:bg-slate-50 text-slate-800")}
                            >
                              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", userSettings.darkMode ? "bg-slate-800" : "bg-slate-100")}>
                                <FileText size={14} className="text-blue-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{(issue.description || '').split('.')[0]}</p>
                                <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <MapPin size={10} /> {issue.location_name || 'Unknown location'}
                                </p>
                              </div>
                              <span className={cn(
                                "ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0",
                                issue.status === 'PENDING'  ? "bg-amber-500/10 text-amber-500"  :
                                issue.status === 'RESOLVED' ? "bg-green-500/10 text-green-500"  :
                                                              "bg-blue-500/10 text-blue-500"
                              )}>
                                {issue.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bell Icon → Notifications */}
            <button
              onClick={() => navigate('/settings?tab=notifications')}
              className={cn("p-2 rounded-lg relative", userSettings.darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100")}
            >
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
            </button>

            {/* Profile Icon → Settings */}
            <button
              onClick={() => navigate('/settings')}
              className={cn("w-8 h-8 rounded-full flex items-center justify-center overflow-hidden", userSettings.darkMode ? "bg-slate-800" : "bg-slate-200")}
            >
              <img src={`https://picsum.photos/seed/${userSettings.email}/100/100`} alt="User" referrerPolicy="no-referrer" />
            </button>

            {/* ── Admin Login / Logout button */}
            {isAdminLoggedIn ? (
              <button
                onClick={handleAdminLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition"
              >
                <Lock size={12} />
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-500/20 transition"
              >
                <Shield size={12} />
                Admin
              </button>
            )}

          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* ─── FOOTER ─── */}
        <footer className={cn(
          "h-12 border-t flex items-center justify-between px-8 text-[10px] text-slate-500 font-medium shrink-0",
          userSettings.darkMode ? "border-slate-800" : "border-slate-200 bg-white"
        )}>
          {/* Left — changes text when a link is clicked */}
          <div className="flex items-center gap-2 transition-all duration-300">
            <Shield size={12} />
            <span>{FOOTER_TEXTS[footerText]}</span>
            {/* Show a reset X when non-default text is showing */}
            {footerText !== 'default' && (
              <button
                onClick={() => setFooterText('default')}
                className="ml-1 text-slate-600 hover:text-slate-400 transition"
                title="Reset"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Right — links that swap the footer text */}
          <div className="flex gap-6">
            <button
              onClick={() => handleFooterLink('privacy')}
              className={cn(
                "transition-colors",
                footerText === 'privacy' ? "text-blue-400 font-bold" : "hover:text-slate-300"
              )}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleFooterLink('accessibility')}
              className={cn(
                "transition-colors",
                footerText === 'accessibility' ? "text-blue-400 font-bold" : "hover:text-slate-300"
              )}
            >
              Accessibility
            </button>
            <button
              onClick={() => handleFooterLink('support')}
              className={cn(
                "transition-colors",
                footerText === 'support' ? "text-blue-400 font-bold" : "hover:text-slate-300"
              )}
            >
              Support Center
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}