export interface CompetitorData {
  id: string;
  name: string;
  totalMentions: number;
  negativeSentiment: number;
  trendingComplaints: string[];
  mentionsOverTime: MentionPoint[];
  alternativesMentioned: AlternativeMention[];
}

export interface MentionPoint {
  date: string;
  value: number;
  sentiment: number;
}

export interface AlternativeMention {
  name: string;
  count: number;
}

export interface Comment {
  id: string;
  competitorId: string;
  platform: 'Reddit' | 'Twitter' | 'G2';
  username: string;
  content: string;
  date: string;
  sentiment: number;
  url: string;
}

export interface Lead {
  id: string;
  competitorId: string;
  platform: string;
  username: string;
  content: string;
  issue: string;
  date: string;
  status: 'new' | 'contacted' | 'responded';
  url: string;
}

export interface ClusterPainPoint {
  id: string;
  competitorId: string;
  label: string;
  count: number;
  examples: string[];
}

export interface CompetitorOverview {
  sentimentScore: number;
  totalMentions: number;
  totalNegativeMentions: number;
  trendingComplaints: string[];
  mentionsOverTime: MentionPoint[];
}

export interface SummaryMetric {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}