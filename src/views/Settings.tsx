import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import Layout from '../components/Layout';
import { cn } from '../lib/utils';
import { User, Bell, Shield, Save, LogOut, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { userSettings, updateUserSettings } = useApp();
  const [formData, setFormData] = useState(userSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Reads ?tab=notifications from URL, defaults to 'profile'
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(
    searchParams.get('tab') || 'profile'
  );

  // Refs (anchors) to identify sections for scrolling
  const profileRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);

  // Function to handle clicking sidebar buttons
  const scrollToSection = (section: string, ref: React.RefObject<HTMLDivElement>) => {
    setActiveSection(section);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateUserSettings(formData);
      setIsSaving(false);
    }, 800);
  };

  return (
    <Layout showTabs={false}>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className={cn("text-4xl font-bold tracking-tight", !userSettings.darkMode && "text-slate-900")}>Settings</h2>
            <p className="text-slate-500">Manage your profile, notification preferences, and application appearance.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2 sticky top-8 h-fit">
            <SettingsNavButton 
              icon={<User size={18} />} 
              label="Profile" 
              active={activeSection === 'profile'} 
              onClick={() => scrollToSection('profile', profileRef)}
            />
            <SettingsNavButton 
              icon={<Bell size={18} />} 
              label="Notifications" 
              active={activeSection === 'notifications'} 
              onClick={() => scrollToSection('notifications', notifyRef)}
            />
            <SettingsNavButton 
              icon={<Shield size={18} />} 
              label="Security" 
              active={activeSection === 'security'} 
              onClick={() => scrollToSection('security', securityRef)}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-2 space-y-8">
            {/* Profile Section */}
            <section ref={profileRef} className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", userSettings.darkMode ? "bg-blue-600/10 text-blue-500" : "bg-blue-50 text-blue-600")}>
                  <User size={24} />
                </div>
                <div>
                  <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Public Profile</h3>
                  <p className="text-xs text-slate-500">How you appear to other citizens and city officials.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors", userSettings.darkMode ? "bg-slate-900/50 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={cn("w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors", userSettings.darkMode ? "bg-slate-900/50 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900")}
                  />
                </div>
              </div>
            </section>

            {/* Notifications Section */}
            <section ref={notifyRef} className={cn("glass-card p-8 space-y-6", !userSettings.darkMode && "bg-white border-slate-200 shadow-sm")}>
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", userSettings.darkMode ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600")}>
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Notifications</h3>
                  <p className="text-xs text-slate-500">Control how and when you receive updates.</p>
                </div>
              </div>

              <div className="space-y-4">
                <Toggle 
                  label="Email Notifications" 
                  description="Receive updates about your reports via email." 
                  enabled={formData.notifications}
                  onChange={(val) => setFormData({ ...formData, notifications: val })}
                />
                <Toggle 
                  label="Push Notifications" 
                  description="Real-time alerts on your mobile device." 
                  enabled={formData.pushNotifications ?? true}
                  onChange={(val) => setFormData({ ...formData, pushNotifications: val })}
                />
              </div>
            </section>

            {/* Security Section */}
            <section ref={securityRef} className={cn("glass-card p-8 space-y-6 border-red-500/20", !userSettings.darkMode && "bg-white shadow-sm")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className={cn("font-bold text-lg", !userSettings.darkMode && "text-slate-900")}>Security & Access</h3>
                  <p className="text-xs text-slate-500">Manage your password and account security.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl transition-colors text-sm">
                  Delete Account
                </button>
                <button className={cn("flex-1 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2", userSettings.darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Sidebar Button Component
function SettingsNavButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  const { userSettings } = useApp();
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group",
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
          : cn("text-slate-400 hover:text-slate-200", userSettings.darkMode ? "hover:bg-slate-800/50" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900")
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      <ChevronRight size={14} className={cn("transition-transform", active ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0")} />
    </button>
  );
}

// Toggle Switch Component
function Toggle({ label, description, enabled, onChange }: { label: string, description: string, enabled: boolean, onChange: (val: boolean) => void }) {
  const { userSettings } = useApp();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className={cn("text-sm font-bold", !userSettings.darkMode && "text-slate-900")}>{label}</h4>
        <p className="text-[10px] text-slate-500">{description}</p>
      </div>
      <button 
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors duration-300",
          enabled ? "bg-blue-600" : (userSettings.darkMode ? "bg-slate-800" : "bg-slate-200")
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
          enabled ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
