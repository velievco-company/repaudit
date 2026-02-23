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

export default function AuditReport({ data, lang }: Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeUp}><ScoreHero score={data.overall_score} verdict={data.verdict} dataDate={data.data_date} confidence={data.confidence} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><SummaryCard summary={data.summary} company={data.company} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><SentimentTimeline data={data.sentiment_timeline} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><SourceAnalysis sources={data.sources} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><LegalSection legal={data.legal} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><ManagementSection management={data.management} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><CompetitorSection competitors={data.competitors} company={data.company} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><FlagsSection redFlags={data.red_flags} greenFlags={data.green_flags} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><ESGSection esg={data.esg} lang={lang} /></motion.div>
      <motion.div variants={fadeUp}><RecommendationsSection recommendations={data.recommendations} lang={lang} /></motion.div>
    </motion.div>
  );
}
