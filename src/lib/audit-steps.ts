import { AnalysisStep } from './types';

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 'media',       label: 'step_media',       status: 'pending' },
  { id: 'reviews',     label: 'step_reviews',     status: 'pending' },
  { id: 'social',      label: 'step_social',      status: 'pending' },
  { id: 'legal',       label: 'step_legal',       status: 'pending' },
  { id: 'management',  label: 'step_management',  status: 'pending' },
  { id: 'negative',    label: 'step_negative',    status: 'pending' },
  { id: 'trust',       label: 'step_trust',       status: 'pending' },
  { id: 'funnel',      label: 'step_funnel',      status: 'pending' },
  { id: 'ltv',         label: 'step_ltv',         status: 'pending' },
  { id: 'competitors', label: 'step_competitors', status: 'pending' },
  { id: 'score',       label: 'step_score',       status: 'pending' },
]; 
