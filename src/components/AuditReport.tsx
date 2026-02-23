import { AuditResponse, AppLanguage } from '@/lib/types';
import { motion } from 'framer-motion';
import ScoreHero from './report/ScoreHero';
import SummaryCard from './report/SummaryCard';
import SentimentTimeline from './report/SentimentTimeline';
import SourceAnalysis from './report/SourceAnalysis';
import LegalSection from './report/LegalSection';
import ManagementSection from './report/ManagementSection';
import CompetitorSection from './report/CompetitorSection';
import FlagsSection from './report/FlagsSection';
import ESGSection from './report/ESGSection';
import RecommendationsSection from './report/RecommendationsSection';
import NegativeExposureSection from './report/NegativeExposureSection';
import TrustSignalsSection from './report/TrustSignalsSection';
import FunnelAnalysisSection from './report/FunnelAnalysisSection';
import SentimentHeatmapSection from './report/SentimentHeatmapSection';
import LTVRoiSection from './report/LTVRoiSection';
import CompetitiveTrustSection from './report/CompetitiveTrustSection';
import PriorityMatrixSection from './report/PriorityMatrixSection';
import TrajectorySection from './report/TrajectorySection';

interface Props {
  data: AuditResponse;
  lang: AppLanguage;
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Wrap = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={fadeUp}>{children}</motion.div>
);

export default function AuditReport({ data, lang }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* ── ORIGINAL SECTIONS ── */}
      <Wrap><ScoreHero score={data.overall_score} verdict={data.verdict} dataDate={data.data_date} confidence={data.confidence} lang={lang} /></Wrap>
      <Wrap><SummaryCard summary={data.summary} company={data.company} lang={lang} /></Wrap>
      <Wrap><SentimentTimeline data={data.sentiment_timeline} lang={lang} /></Wrap>
      <Wrap><SourceAnalysis sources={data.sources} lang={lang} /></Wrap>
      <Wrap><LegalSection legal={data.legal} lang={lang} /></Wrap>
      <Wrap><ManagementSection management={data.management} lang={lang} /></Wrap>
      <Wrap><CompetitorSection competitors={data.competitors} company={data.company} lang={lang} /></Wrap>
      <Wrap><FlagsSection redFlags={data.red_flags} greenFlags={data.green_flags} lang={lang} /></Wrap>
      <Wrap><ESGSection esg={data.esg} lang={lang} /></Wrap>
      <Wrap><RecommendationsSection recommendations={data.recommendations} lang={lang} /></Wrap>

      {/* ── NEW SECTIONS ── */}
      {data.negative_exposure?.items?.length > 0 && (
        <Wrap><NegativeExposureSection exposure={data.negative_exposure} lang={lang} /></Wrap>
      )}
      {data.trust_signals?.items?.length > 0 && (
        <Wrap><TrustSignalsSection signals={data.trust_signals} lang={lang} /></Wrap>
      )}
      {data.funnel_analysis?.steps?.length > 0 && (
        <Wrap><FunnelAnalysisSection funnel={data.funnel_analysis} lang={lang} /></Wrap>
      )}
      {data.sentiment_heatmap?.length > 0 && (
        <Wrap><SentimentHeatmapSection heatmap={data.sentiment_heatmap} lang={lang} /></Wrap>
      )}
      {data.ltv_roi_model && (
        <Wrap><LTVRoiSection model={data.ltv_roi_model} lang={lang} /></Wrap>
      )}
      {data.competitive_trust?.scores?.length > 0 && (
        <Wrap><CompetitiveTrustSection trust={data.competitive_trust} lang={lang} /></Wrap>
      )}
      {data.priority_matrix?.length > 0 && (
        <Wrap><PriorityMatrixSection matrix={data.priority_matrix} lang={lang} /></Wrap>
      )}
      {data.trajectory && (
        <Wrap><TrajectorySection trajectory={data.trajectory} lang={lang} /></Wrap>
      )}
    </motion.div>
  );
}
