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
  source_url?: string;
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

// ── Score Breakdown ────────────────────────────────────────────────────

export interface ScoreBreakdown {
  review_sentiment: number;
  review_volume: number;
  serp_control: number;
  media_sentiment: number;
  share_of_voice: number;
  low_volatility: number;
}

// ── Risk Index ─────────────────────────────────────────────────────────

export interface RiskIndex {
  score: number;
  level: 'low' | 'moderate' | 'high';
  crisis_probability: number;
  components: {
    negative_sentiment_weight: number;
    serp_negative_presence: number;
    volatility_spike: number;
  };
}

// ── SERP Control ───────────────────────────────────────────────────────

export interface SERPResult {
  title: string;
  url: string;
  type: 'owned' | 'neutral' | 'negative' | 'competitor';
}

export interface SERPControl {
  score: number;
  owned: number;
  neutral: number;
  negative: number;
  competitor: number;
  results: SERPResult[];
}

// ── Financial Impact ───────────────────────────────────────────────────

export interface FinancialImpact {
  lost_revenue_estimate: number;
  sentiment_gap_pct: number;
  explanation: string;
  formula_inputs: {
    estimated_traffic: number;
    conversion_rate: number;
    avg_deal_size: number;
    sentiment_impact_pct: number;
  };
}

// ── Anomaly Alerts ─────────────────────────────────────────────────────

export interface AnomalyAlert {
  type: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  detected_at?: string;
}

// ── Existing v2 interfaces ─────────────────────────────────────────────

export interface NegativeExposureItem {
  source: string;
  type: string;
  severity: string;
  visibility: string;
  action: string;
  summary: string;
  url?: string;
}

export interface NegativeExposure {
  total_critical: number;
  summary: string;
  items: NegativeExposureItem[];
}

export interface TrustSignalItem {
  name: string;
  status: string;
  impact: string;
  note?: string;
}

export interface TrustSignals {
  score: number;
  summary: string;
  items: TrustSignalItem[];
}

export interface FunnelStep {
  step: string;
  risk: string;
  drop_off_pct: number;
  note?: string;
}

export interface FunnelAnalysis {
  total_estimated_loss_pct: number;
  summary: string;
  steps: FunnelStep[];
}

export interface SentimentHeatmapRow {
  theme: string;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  risk: string;
}

export interface LTVRoiModel {
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

export interface CompetitiveTrust {
  company_tier: string;
  summary: string;
  scores: CompetitiveTrustScore[];
}

export interface PriorityMatrixItem {
  action: string;
  impact: string;
  effort: string;
  priority: string;
  category?: string;
}

export interface TrajectoryForecast {
  current_rating: number;
  unmanaged_6mo: number;
  optimised_6mo: number;
  unmanaged_12mo: number;
  optimised_12mo: number;
  key_assumptions: string[];
}

// ── Main response ──────────────────────────────────────────────────────

export interface AuditResponse {
  company: string;
  overall_score: number;
  verdict: string;
  data_date: string;
  data_sources_used?: string[];
  score_breakdown?: ScoreBreakdown;
  risk_index?: RiskIndex;
  serp_control?: SERPControl;
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
  esg?: {
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

  // Financial & risk modules
  financial_impact?: FinancialImpact;
  anomaly_alerts?: AnomalyAlert[];

  // v2 optional sections
  negative_exposure?: NegativeExposure;
  trust_signals?: TrustSignals;
  funnel_analysis?: FunnelAnalysis;
  sentiment_heatmap?: SentimentHeatmapRow[];
  ltv_roi_model?: LTVRoiModel;
  competitive_trust?: CompetitiveTrust;
  priority_matrix?: PriorityMatrixItem[];
  trajectory?: TrajectoryForecast;
}

export interface AuditFormInput {
  companyName: string;
  website?: string;
  country?: string;
  industry?: string;
  timeRange: '3' | '6' | '12' | '24';
  language: 'ru' | 'en' | 'es' | 'all';
  depth: 'basic' | 'standard' | 'deep';
  targetAudience?: string;
  companyStage?: string;
  knownCompetitors?: string;
  ltv?: string;
  cac?: string;
  retentionRate?: string;
  additionalContext?: string;
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
