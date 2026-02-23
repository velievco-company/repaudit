import { AnalysisStep } from '@/lib/types';
import { motion } from 'framer-motion';
import { Check, Loader2, Circle } from 'lucide-react';

interface Props {
  steps: AnalysisStep[];
}

export default function AnalysisProgress({ steps }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-8">
      <h3 className="text-lg font-semibold mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Анализ в процессе...
      </h3>
      <div className="max-w-md mx-auto space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {step.status === 'done' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Check className="h-5 w-5 text-success" />
                </motion.div>
              )}
              {step.status === 'active' && (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              )}
              {step.status === 'pending' && (
                <Circle className="h-4 w-4 text-muted-foreground/30" />
              )}
              {step.status === 'error' && (
                <span className="text-destructive text-sm">✕</span>
              )}
            </div>
            <span className={`text-sm font-mono ${
              step.status === 'done' ? 'text-foreground' :
              step.status === 'active' ? 'text-primary' :
              'text-muted-foreground/50'
            }`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
