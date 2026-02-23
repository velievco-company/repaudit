import { AnalysisStep } from './types';

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 'media', label: 'Поиск упоминаний в СМИ', status: 'pending' },
  { id: 'reviews', label: 'Анализ отзывных платформ', status: 'pending' },
  { id: 'social', label: 'Мониторинг социальных сетей', status: 'pending' },
  { id: 'legal', label: 'Проверка юридического следа', status: 'pending' },
  { id: 'management', label: 'Анализ репутации менеджмента', status: 'pending' },
  { id: 'score', label: 'Формирование Reputation Score', status: 'pending' },
];
