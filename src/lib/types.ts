export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface AIMetric<T = number> {
  value: T;
  confidence: ConfidenceLevel;
  comment: string;
}

export interface AIResearchResult {
  metrics: {
    avgRating: AIMetric<number>;
    totalReviews: AIMetric<number>;
    negativePercent: AIMetric<number>;
    googleRanking: AIMetric<number>;
    negativePress: AIMetric<boolean>;
    glassdoor: AIMetric<string>;
    monthlyTraffic: AIMetric<number>;
    conversionRate: AIMetric<number>;
    avgDealValue: AIMetric<number>;
  };
  summary: string;
}

export interface DataSource {
  field: string;
  source: 'user' | 'ai';
  confidence?: ConfidenceLevel;
  comment?: string;
}
