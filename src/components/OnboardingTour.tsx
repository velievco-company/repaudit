import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Search, BarChart3, Share2 } from 'lucide-react';
import { AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

const STORAGE_KEY = 'repaudit_onboarding_done';

const stepConfig = [
  { icon: Shield, titleKey: 'tour_welcome_title' as const, descKey: 'tour_welcome_desc' as const },
  { icon: Search, titleKey: 'tour_form_title' as const, descKey: 'tour_form_desc' as const },
  { icon: BarChart3, titleKey: 'tour_metrics_title' as const, descKey: 'tour_metrics_desc' as const },
  { icon: Share2, titleKey: 'tour_export_title' as const, descKey: 'tour_export_desc' as const },
];

interface Props {
  onClose: () => void;
  lang: AppLanguage;
}

export default function OnboardingTour({ onClose, lang }: Props) {
  const [step, setStep] = useState(0);
  const current = stepConfig[step];
  const Icon = current.icon;

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
  };

  const handleNext = () => {
    if (step < stepConfig.length - 1) setStep(step + 1);
    else finish();
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <Dialog open onOpenChange={finish}>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {t(lang, current.titleKey)}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {t(lang, current.descKey)}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {stepConfig.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" onClick={handlePrev} className="flex-1">
                {t(lang, 'tour_prev')}
              </Button>
            )}
            {step === 0 && (
              <Button variant="ghost" size="sm" onClick={finish} className="flex-1 text-muted-foreground">
                {t(lang, 'tour_skip')}
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step < stepConfig.length - 1 ? t(lang, 'tour_next') : t(lang, 'tour_start')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
