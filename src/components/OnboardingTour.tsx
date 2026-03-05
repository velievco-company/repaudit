import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Search, BarChart3, Share2 } from 'lucide-react';

const steps = [
  {
    icon: Shield,
    title: 'Welcome to RepAudit',
    desc: 'AI-powered reputation audits that scan news, reviews, social media, legal databases and more to build a comprehensive reputation profile.',
  },
  {
    icon: Search,
    title: 'Start an Audit',
    desc: 'Enter any company name in the form above and hit "Run Audit". The analysis takes about 60 seconds.',
  },
  {
    icon: BarChart3,
    title: '15+ Reputation Metrics',
    desc: 'Your report includes sentiment analysis, trust signals, competitive benchmarks, ESG risks, legal footprint, and actionable recommendations.',
  },
  {
    icon: Share2,
    title: 'Export & Share',
    desc: 'Download reports as PDF or Markdown, or share a link with your team. All your audits are saved in History.',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('onboarding_completed', 'true');
      onComplete();
    }
  };

  return (
    <Dialog open onOpenChange={() => { localStorage.setItem('onboarding_completed', 'true'); onComplete(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {current.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {current.desc}
          </p>
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`}
              />
            ))}
          </div>
          <Button onClick={handleNext} className="w-full">
            {step < steps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
