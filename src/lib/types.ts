export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SourceItem {
  title: string;
  url?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface SourceCategory {
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary: string;
  key_sources?: SourceItem[];
  avg_rating?: number;
  mention_count?: number;
  top_topics?: string[];
}

export interface SentimentPoint {
  month: string;
  positive: number;
  neutral: number;
  negative: number;
  event?: string;
}

export interface FlagItem {
  text: string;
  severity?: 'critical' | 'warning' | 'info';
}

export interface Recommendation {
  text: string;
  priority: 'urgent' | 'mid_term' | 'long_term';
}

export interface ManagementPerson {
  name: string;
  role: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

export interface CompetitorData {
  name: string;
  mentions: number;
  sentiment_score: number;
}

export interface AuditResponse {
  company: string;
  overall_score: number;
  verdict: string;
  data_date: string;
  summary: {
    main_activity: string;
    key_narratives: string[];
    key_event: string;
  };
  sentiment_timeline: SentimentPoint[];
  sources: {
    media: SourceCategory;
    reviews: SourceCategory;
    social: SourceCategory;
    video: SourceCategory;
    employer: SourceCategory;
    forums: SourceCategory;
  };
  legal: {
    lawsuits: string[];
    fines: string[];
    complaints: string[];
    risk_level: 'low' | 'medium' | 'high';
    summary: string;
  };
  management: {
    persons: ManagementPerson[];
    summary: string;
  };
  competitors: {
    data: CompetitorData[];
    summary: string;
  };
  red_flags: FlagItem[];
  green_flags: FlagItem[];
  esg: {
    ecology: string;
    labor: string;
    data_privacy: string;
    overall: 'clean' | 'concerns' | 'serious_risks';
    summary: string;
  };
  recommendations: {
    urgent: string[];
    mid_term: string[];
    long_term: string[];
  };
  confidence: ConfidenceLevel;
}

export interface AuditFormInput {
  companyName: string;
  website?: string;
  country?: string;
  industry?: string;
  timeRange: '3' | '6' | '12' | '24';
  language: 'ru' | 'en' | 'all';
  depth: 'basic' | 'standard' | 'deep';
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
