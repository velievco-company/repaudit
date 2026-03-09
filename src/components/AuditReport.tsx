import { AuditResponse, AppLanguage } from '@/lib/types';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
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
import TrustSignalSection from './report/TrustSignalSection';
import SentimentHeatmapSection from './report/SentimentHeatmapSection';
import CompetitiveTrustSection from './report/CompetitiveTrustSection';
import PriorityMatrixSection from './report/PriorityMatrixSection';
import TrajectorySection from './report/TrajectorySection';
import FunnelSection from './report/FunnelSection';
import LTVRoiSection from './report/LTVRoiSection';
import DataSourcesSection from './report/DataSourcesSection';

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

function SafeSection({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (e) {
    console.error('Section render error:', e);
    return null;
  }
}

export default function AuditReport({ data, lang }: Props) {

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}>
        <ScoreHero score={data.overall_score ?? 0} verdict={data.verdict ?? ''} dataDate={data.data_date ?? ''} confidence={data.confidence ?? 'low'} lang={lang} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <SummaryCard summary={data.summary} company={data.company ?? ''} lang={lang} />
      </motion.div>
      {(data.sentiment_timeline?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <SentimentTimeline data={data.sentiment_timeline} lang={lang} />
        </motion.div>
      )}
      <motion.div variants={fadeUp}>
        <SourceAnalysis sources={data.sources} lang={lang} />
      </motion.div>

      {data.negative_exposure && (data.negative_exposure.items?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <NegativeExposureSection data={data.negative_exposure} lang={lang} />
        </motion.div>
      )}

      {data.trust_signals && (data.trust_signals.items?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <TrustSignalSection data={data.trust_signals} lang={lang} />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <LegalSection legal={data.legal} lang={lang} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <ManagementSection management={data.management} lang={lang} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <CompetitorSection competitors={data.competitors} company={data.company ?? ''} lang={lang} />
      </motion.div>

      {data.sentiment_heatmap && (data.sentiment_heatmap?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <SentimentHeatmapSection data={data.sentiment_heatmap} lang={lang} />
        </motion.div>
      )}

      {data.competitive_trust && (data.competitive_trust.scores?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <CompetitiveTrustSection data={data.competitive_trust} lang={lang} />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <FlagsSection redFlags={data.red_flags} greenFlags={data.green_flags} lang={lang} />
      </motion.div>
      <motion.div variants={fadeUp}>
        <ESGSection esg={data.esg} lang={lang} />
      </motion.div>

      {data.priority_matrix && (data.priority_matrix?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <PriorityMatrixSection data={data.priority_matrix} lang={lang} />
        </motion.div>
      )}

      {data.trajectory && (
        <motion.div variants={fadeUp}>
          <TrajectorySection data={data.trajectory} lang={lang} />
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <RecommendationsSection recommendations={data.recommendations} lang={lang} />
      </motion.div>

      {/* Financial Impact — shown automatically when LTV data was provided */}
      {data.ltv_roi_model && (data.ltv_roi_model.ltv ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <LTVRoiSection data={data.ltv_roi_model} lang={lang} />
        </motion.div>
      )}
      {data.funnel_analysis && (data.funnel_analysis.steps?.length ?? 0) > 0 && (
        <motion.div variants={fadeUp}>
          <FunnelSection data={data.funnel_analysis} lang={lang} />
        </motion.div>
      )}
    </motion.div>
  );
}
