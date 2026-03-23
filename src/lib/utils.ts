import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Issue {
  id: string;
  type: string;
  urgency: number;
  impact_score: string;
  status: string;
  description: string;
  location_name: string;
  lat: number;
  lng: number;
  reported_at: string;
  evidence_url?: string;
  upvotes: number;
}

export interface TimelineEvent {
  id: number;
  issue_id: string;
  event_type: string;
  message: string;
  timestamp: string;
}
