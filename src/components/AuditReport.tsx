import { AuditResponse, AppLanguage } from '@/lib/types';
import { motion } from 'framer-motion';
import ScoreHero from './report/ScoreHero';
import ScoreBreakdownSection from './report/ScoreBreakdownSection';
import RiskIndexSection from './report/RiskIndexSection';
import SERPControlSection from './report/SERPControlSection';
import SummaryCard from './report/SummaryCard';
import SentimentTimeline from './report/SentimentTimeline';
import SourceAnalysis from './report/SourceAnalysis';
import LegalSection from './report/LegalSection';
import ManagementSection from './report/ManagementSection';
import CompetitorSection from './report/CompetitorSection';
import FlagsSection from './report/FlagsSection';
import RecommendationsSection from './report/RecommendationsSection';
import FinancialImpactSection from './report/FinancialImpactSection';
import AnomalyAlertSection from './report/AnomalyAlertSection';
import DataSourcesSection from './report/DataSourcesSection';

// Lazy-load optional v2 sections
import { lazy, Suspense } from 'react';
const NegativeExposureSection = lazy(() => import('./report/NegativeExposureSection'));
const TrustSignalSection = lazy(() => import('./report/TrustSignalSection'));
const FunnelSection = lazy(() => import('./report/FunnelSection'));
const SentimentHeatmapSection = lazy(() => import('./report/SentimentHeatmapSection'));
const LTVRoiSection = lazy(() => import('./report/LTVRoiSection'));
const CompetitiveTrustSection = lazy(() => import('./report/CompetitiveTrustSection'));
const PriorityMatrixSection = lazy(() => import('./report/PriorityMatrixSection'));
const TrajectorySection = lazy(() => import('./report/TrajectorySection'));

interface Props {
  data: AuditResponse;
  lang: AppLanguage;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function OptionalSection({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

export default function AuditReport({ data, lang }: Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Block 1: Core Metrics */}
      <motion.div variants={fadeUp}><ScoreHero score={data.overall_score} verdict={data.verdict} dataDate={data.data_date} confidence={data.confidence} lang={lang} /></motion.div>
      
      {data.score_breakdown && (
        <motion.div variants={fadeUp}><ScoreBreakdownSection breakdown={data.score_breakdown} overallScore={data.overall_score} lang={lang} /></motion.div>
      )}

      {data.risk_index && (
        <motion.div variants={fadeUp}><RiskIndexSection riskIndex={data.risk_index} lang={lang} /></motion.div>
      )}

      {data.serp_control && (
        <motion.div variants={fadeUp}><SERPControlSection serpControl={data.serp_control} lang={lang} /></motion.div>
      )}

      {/* Block 2: Anomaly Alerts (prominent position) */}
      {data.anomaly_alerts && data.anomaly_alerts.length > 0 && (
        <motion.div variants={fadeUp}><AnomalyAlertSection alerts={data.anomaly_alerts} lang={lang} /></motion.div>
      )}

      {/* Block 3: Summary & Timeline */}
      <motion.div variants={fadeUp}><SummaryCard summary={data.summary} company={data.company} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><SentimentTimeline data={data.sentiment_timeline} lang={lang} /></motion.div>

      {/* Block 4: Source Analysis */}
      <motion.div variants={fadeUp}><SourceAnalysis sources={data.sources} lang={lang} /></motion.div>

      {/* Block 5: Financial Impact */}
      {data.financial_impact && (
        <motion.div variants={fadeUp}><FinancialImpactSection financialImpact={data.financial_impact} lang={lang} /></motion.div>
      )}

      {/* Block 6: Risk & Compliance */}
      <motion.div variants={fadeUp}><LegalSection legal={data.legal} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><ManagementSection management={data.management} lang={lang} /></motion.div>

      {/* Block 7: Market Context */}
      <motion.div variants={fadeUp}><CompetitorSection competitors={data.competitors} company={data.company} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><FlagsSection redFlags={data.red_flags} greenFlags={data.green_flags} lang={lang} /></motion.div>

      {/* Block 8: Recommendations */}
      <motion.div variants={fadeUp}><RecommendationsSection recommendations={data.recommendations} lang={lang} /></motion.div>

      {/* Block 9: Optional v2 deep-dive sections */}
      {data.negative_exposure?.items?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><NegativeExposureSection data={data.negative_exposure} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.trust_signals?.items?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><TrustSignalSection data={data.trust_signals} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.funnel_analysis?.steps?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><FunnelSection data={data.funnel_analysis} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.sentiment_heatmap?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><SentimentHeatmapSection data={data.sentiment_heatmap} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.ltv_roi_model ? (
        <motion.div variants={fadeUp}><OptionalSection><LTVRoiSection data={data.ltv_roi_model} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.competitive_trust?.scores?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><CompetitiveTrustSection data={data.competitive_trust} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.priority_matrix?.length ? (
        <motion.div variants={fadeUp}><OptionalSection><PriorityMatrixSection data={data.priority_matrix} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {data.trajectory ? (
        <motion.div variants={fadeUp}><OptionalSection><TrajectorySection data={data.trajectory} lang={lang} /></OptionalSection></motion.div>
      ) : null}

      {/* Block 10: Data Sources */}
      {data.data_sources_used && data.data_sources_used.length > 0 && (
        <motion.div variants={fadeUp}><DataSourcesSection sources={data.data_sources_used} lang={lang} /></motion.div>
      )}
    </motion.div>
  );
}
