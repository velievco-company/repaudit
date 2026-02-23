export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type AppLanguage = 'en' | 'ru' | 'es';

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

// ── NEW TYPES ────────────────────────────────────────────────────────────────

export interface NegativeMentionItem {
  source: string;
  type: string;
  severity: 'critical' | 'warning' | 'low';
  visibility: 'High' | 'Medium' | 'Low';
  action: 'Respond' | 'Monitor' | 'Escalate' | 'Ignore';
  summary: string;
  url?: string;
}

export interface TrustSignal {
  name: string;
  status: 'present' | 'missing' | 'partial';
  impact: 'high' | 'medium' | 'low';
  note?: string;
}

export interface FunnelStep {
  step: string;
  risk: string;
  drop_off_pct: number;
  note?: string;
}

export interface SentimentHeatmapRow {
  theme: string;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  risk: 'low' | 'medium' | 'high';
}

export interface LTVModel {
  ltv: number;
  cac: number;
  retention_rate: number;
  churn_from_reviews_pct: number;
  estimated_annual_loss_min: number;
  estimated_annual_loss_max: number;
  loss_explanation: string;
}

export interface CompetitiveTrustScore {
  competitor: string;
  review_volume_ratio: number;
  authority_score: number;
  media_mentions_score: number;
  clinical_authority_score: number;
  overall_tier: string;
}

export interface PriorityMatrixItem {
  action: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category?: string;
}

export interface ReputationTrajectory {
  current_rating: number;
  unmanaged_6mo: number;
  unmanaged_12mo: number;
  optimised_6mo: number;
  optimised_12mo: number;
  key_assumptions: string[];
}

// ── CORE RESPONSE (original + extended) ──────────────────────────────────────

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
  // ── NEW FIELDS ──────────────────────────────────────────────────────────────
  negative_exposure: {
    items: NegativeMentionItem[];
    summary: string;
    total_critical: number;
  };
  trust_signals: {
    items: TrustSignal[];
    score: number;
    summary: string;
  };
  funnel_analysis: {
    steps: FunnelStep[];
    total_estimated_loss_pct: number;
    summary: string;
  };
  sentiment_heatmap: SentimentHeatmapRow[];
  ltv_roi_model: LTVModel;
  competitive_trust: {
    scores: CompetitiveTrustScore[];
    company_tier: string;
    summary: string;
  };
  priority_matrix: PriorityMatrixItem[];
  trajectory: ReputationTrajectory;
}

export interface AuditFormInput {
  companyName: string;
  website?: string;
  country?: string;
  industry?: string;
  timeRange: '3' | '6' | '12' | '24';
  language: 'ru' | 'en' | 'all';
  depth: 'basic' | 'standard' | 'deep';
  // ── NEW FIELDS ──────────────────────────────────────────────────────────────
  targetAudience?: string;
  companyStage?: 'pre-seed' | 'seed' | 'series-a' | 'growth' | 'public';
  knownCompetitors?: string;
  ltv?: number;
  cac?: number;
  retentionRate?: number;
  additionalContext?: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
