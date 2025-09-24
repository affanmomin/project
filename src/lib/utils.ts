import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function getPageTitle(pathname: string): string {
  const path = pathname.split('/')[1] || 'dashboard';
  
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    competitors: 'Competitors',
    leads: 'Switching Leads',
    features: 'Feature Requests',
    complaints: 'Customer Complaints',
    settings: 'Settings',
  };
  
  return titles[path] || 'Not Found';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getSentimentColor(sentiment: number): string {
  if (sentiment >= 0.7) return 'text-success';
  if (sentiment >= 0.4) return 'text-warning';
  return 'text-destructive';
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}