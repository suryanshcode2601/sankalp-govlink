import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Issue, TimelineEvent } from './lib/utils';

interface AppContextType {
  issues: Issue[];
  timeline: TimelineEvent[];
  loading: boolean;
  refreshIssues: () => Promise<void>;
  upvoteIssue: (id: string) => Promise<void>;
  userSettings: {
    name: string;
    email: string;
    notifications: boolean;
    darkMode: boolean;
  };
  updateUserSettings: (settings: Partial<AppContextType['userSettings']>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('govconnect_settings');
    return saved ? JSON.parse(saved) : {
      name: 'John Doe',
      email: 'john@example.com',
      notifications: true,
      darkMode: true,
    };
  });

  const refreshIssues = async () => {
    try {
      const [issuesRes, timelineRes] = await Promise.all([
        fetch('https://sankalp-govlink-production.up.railway.app/api/issues'),
        fetch('https://sankalp-govlink-production.up.railway.app/api/timeline')
      ]);
      const [issuesData, timelineData] = await Promise.all([
        issuesRes.json(),
        timelineRes.json()
      ]);
      setIssues(issuesData);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const upvoteIssue = async (id: string) => {
    try {
      await fetch(`/api/issues/${id}/upvote`, { method: 'POST' });
      setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, upvotes: iss.upvotes + 1 } : iss));
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const updateUserSettings = (newSettings: Partial<AppContextType['userSettings']>) => {
    setUserSettings((prev: any) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('govconnect_settings', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    refreshIssues();
    const interval = setInterval(refreshIssues, 10000);
    return () => clearInterval(interval);
  }, []);

  
  return (
    <AppContext.Provider value={{ 
      issues, 
      timeline, 
      loading, 
      refreshIssues, 
      upvoteIssue,
      userSettings,
      updateUserSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
