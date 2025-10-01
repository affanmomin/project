// ... (existing types)

export interface MetricDataPoint {
  current_value?: string;
  previous_value?: string;
  current_pct?: string;
  previous_pct?: string;
  pct_change?: string | null;
}

export interface ComplaintDataPoint {
  name: string | null;
  label: string;
  value: string;
}

export interface FeatureDataPoint {
  feature_name: string;
  competitor_name: string;
  label: string;
  value: string;
}

export interface AlternativeDataPoint {
  alternative: string | null;
  mentions: string;
}

export interface LeadDataPoint {
  platform: string;
  username: string;
  excerpt: string;
  reason: string;
  date: string;
  status: string | null;
}

export interface CardResponse {
  key: string;
  title: string;
  description: string;
  chartType: "number" | "bar" | "table" | "line";
  data: CardDataPoint[];
}

export interface MetricCardResponse extends CardResponse {
  chartType: "number";
  data: MetricDataPoint[];
}

export interface ComplaintCardResponse extends CardResponse {
  chartType: "bar";
  data: ComplaintDataPoint[];
}

export interface FeatureCardResponse extends CardResponse {
  chartType: "bar";
  data: FeatureDataPoint[];
}

export interface AlternativeCardResponse extends CardResponse {
  chartType: "bar";
  data: AlternativeDataPoint[];
}

export interface LeadCardResponse extends CardResponse {
  chartType: "table";
  data: LeadDataPoint[];
}

// Time-series trend point (e.g., complaint-trend)
export interface TrendDataPoint {
  date: string;
  value: string;
  label: string | null;
}

export interface TrendCardResponse extends Omit<CardResponse, "data"> {
  chartType: "line";
  data: TrendDataPoint[];
}

export type CardDataPoint =
  | MetricDataPoint
  | ComplaintDataPoint
  | FeatureDataPoint
  | AlternativeDataPoint
  | LeadDataPoint
  | TrendDataPoint;

export interface CardsApiResponse {
  success: boolean;
  data: CardResponse[];
}

export interface DateRangeParams {
  start_date?: string;
  end_date?: string;
}

// Generic line chart point used by SentimentChart
export interface MentionPoint {
  date: string;
  value: number;
  sentiment: number; // 0-100; when unavailable, provide 0
}

// Competitor API types
export interface CompetitorDataPoint {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  user_id: string;
  total_sources: string;
  enabled_sources: string;
  disabled_sources: string;
  last_scraped_at: string;
  total_mentions: string;
  positive_mentions: string;
  negative_mentions: string;
  neutral_mentions: string;
  total_leads: string;
  total_complaint_clusters: string;
  total_alternatives: string;
}

export interface CompetitorCardResponse {
  key: string;
  title: string;
  description: string;
  chartType: "table";
  data: CompetitorDataPoint[];
}

// Lead API types
export interface LeadDataPoint {
  id: string;
  analyzed_post_id: string | null;
  username: string;
  platform: string;
  excerpt: string;
  reason: string;
  status: string | null;
  created_at: string;
  user_id: string;
  sentiment: string | null;
  cluster: string | null;
  switch_intent: string | null;
  summary: string | null;
  alternatives: string | null;
  analyzed_at: string | null;
  competitor_name: string | null;
  competitor_slug: string | null;
}

export interface LeadCardResponse {
  key: string;
  title: string;
  description: string;
  chartType: "table";
  data: LeadDataPoint[];
}

// Additional types for mock data compatibility
export interface CompetitorData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  [key: string]: any;
}

export interface Comment {
  id: string;
  username: string;
  platform: string;
  content: string;
  sentiment: number; // 0-1 decimal representing sentiment score
  date: string;
  [key: string]: any;
}

export interface Lead {
  id: string;
  username: string;
  platform: string;
  excerpt: string;
  reason: string;
  status: string | null;
  date: string;
  [key: string]: any;
}

export interface ClusterPainPoint {
  id: string;
  cluster: string;
  pain_point: string;
  mentions: number;
  sentiment: number; // 0-1 decimal representing sentiment score
  [key: string]: any;
}
