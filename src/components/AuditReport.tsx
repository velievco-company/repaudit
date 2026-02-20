import { AuditInput, AuditResult, ProjectionMode, RiskCategory } from '@/lib/audit-engine';
import { DataSource } from '@/lib/types';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  input: AuditInput;
  result: AuditResult;
  mode: ProjectionMode;
  dataSources?: DataSource[];
  aiSummary?: string;
}

function ConfidenceBadge({ source }: { source?: DataSource }) {
  if (!source || source.source === 'user') return null;
  const color = source.confidence === 'high' ? 'text-risk-low' : source.confidence === 'medium' ? 'text-risk-medium' : 'text-risk-high';
  const Icon = source.confidence === 'high' ? CheckCircle : source.confidence === 'medium' ? HelpCircle : AlertCircle;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-xs ${color} ml-2 cursor-help`}>
            <Icon className="h-3 w-3" />
            AI ({source.confidence})
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{source.comment || 'Estimated by AI research'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function getSource(dataSources: DataSource[] | undefined, field: string): DataSource | undefined {
  return dataSources?.find(d => d.field === field);
}

function RiskBadge({ level }: { level: RiskCategory | string }) {
  const colorClass = level === 'Low' ? 'bg-risk-low/15 text-risk-low border-risk-low/30' : level === 'Medium' || level === 'Moderate' ? 'bg-risk-medium/15 text-risk-medium border-risk-medium/30' : 'bg-risk-high/15 text-risk-high border-risk-high/30';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>{level}</span>;
}

function Section({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{number}</span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h, i) => <th key={i} className="text-left py-2.5 px-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
              {row.map((cell, j) => <td key={j} className="py-2.5 px-4">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditReport({ input, result, mode, dataSources, aiSummary }: Props) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold mb-2">Reputation Audit</h1>
        <p className="text-lg font-medium text-foreground/90">{input.companyName}</p>
        <p className="text-sm text-muted-foreground mt-1">{input.location} · {input.industry} · {mode} projection</p>
        {aiSummary && (
          <div className="mt-4 mx-auto max-w-2xl bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-primary flex items-center gap-1.5 mb-1 font-medium">
              <AlertCircle className="h-3 w-3" /> AI Research Summary
            </p>
            <p className="text-xs text-muted-foreground">{aiSummary}</p>
          </div>
        )}
      </div>

      {/* Risk Score Hero */}
      <div className="flex items-center justify-center gap-8 mb-8 p-6 rounded-xl bg-muted/30 border border-border">
        <div className="text-center">
          <div className="text-4xl font-bold">{result.riskScore}<span className="text-lg text-muted-foreground">/100</span></div>
          <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="text-center">
          <RiskBadge level={result.riskCategory} />
          <p className="text-xs text-muted-foreground mt-2">Category</p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="text-center">
          <RiskBadge level={result.volatility} />
          <p className="text-xs text-muted-foreground mt-2">Volatility</p>
        </div>
        {result.intakeLoss && (
          <>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold text-risk-high">${result.intakeLoss.monthlyLeakage.toLocaleString()}<span className="text-xs text-muted-foreground">/mo</span></div>
              <p className="text-xs text-muted-foreground mt-1">Est. Leakage</p>
            </div>
          </>
        )}
      </div>

      <Section title="Executive Summary" number="01">
        <p className="text-sm leading-relaxed">{result.executiveSummary}</p>
      </Section>

      <Section title="Market Context" number="02">
        <p className="text-sm leading-relaxed">{result.marketContext}</p>
      </Section>

      <Section title="SERP Intelligence" number="03">
        <DataTable
          headers={['Factor', 'Status', 'Risk', 'Comment']}
          rows={result.serpIntelligence.map(r => [
            <span key={r.factor} className="font-medium">{r.factor}</span>,
            r.status,
            <RiskBadge key={`risk-${r.factor}`} level={r.riskLevel} />,
            <span key={`c-${r.factor}`} className="text-xs text-muted-foreground">{r.comment}</span>
          ])}
        />
      </Section>

      <Section title="Review Intelligence" number="04">
        <DataTable
          headers={['Metric', 'Value', 'Source']}
          rows={[
            ['Average Rating', String(result.reviewIntelligence.avgRating), <ConfidenceBadge key="ar" source={getSource(dataSources, 'avgRating')} />],
            ['Review Volume', String(result.reviewIntelligence.volume), <ConfidenceBadge key="rv" source={getSource(dataSources, 'totalReviews')} />],
            ['Negative %', `${result.reviewIntelligence.negativePercent}%`, <ConfidenceBadge key="np" source={getSource(dataSources, 'negativePercent')} />],
            ['Volatility', result.reviewIntelligence.volatility, ''],
            ['Trust Impact', <span key="ti" className="text-xs">{result.reviewIntelligence.trustImpact}</span>, ''],
          ]}
        />
      </Section>

      <Section title="Risk Model" number="05">
        <DataTable
          headers={['Dimension', 'Score', 'Weight']}
          rows={[
            ['Strategic', String(result.riskBreakdown.strategic), `${Math.round(result.riskBreakdown.strategic / Math.max(result.riskScore, 1) * 100)}%`],
            ['Tactical', String(result.riskBreakdown.tactical), `${Math.round(result.riskBreakdown.tactical / Math.max(result.riskScore, 1) * 100)}%`],
            ['Operational', String(result.riskBreakdown.operational), `${Math.round(result.riskBreakdown.operational / Math.max(result.riskScore, 1) * 100)}%`],
          ]}
        />
      </Section>

      <Section title="ORM Opportunity Mapping" number="06">
        <div className="space-y-4">
          {[
            { label: 'Quick Wins', period: '0–30 days', items: result.ormOpportunities.quickWins, color: 'bg-risk-low' },
            { label: 'Mid-term', period: '30–120 days', items: result.ormOpportunities.midTerm, color: 'bg-risk-medium' },
            { label: 'Long-term', period: '120+ days', items: result.ormOpportunities.longTerm, color: 'bg-primary' },
          ].map(g => (
            <div key={g.label}>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${g.color}`} />
                {g.label} <span className="text-xs text-muted-foreground">({g.period})</span>
              </h3>
              <ul className="space-y-1.5 ml-4">
                {g.items.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-foreground/30 mt-0.5">—</span>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {result.roiScenario && (
        <Section title="ROI Scenario" number="07">
          <DataTable
            headers={['Metric', 'Current', 'Optimized']}
            rows={[
              ['Monthly Revenue', `$${result.roiScenario.currentRevenue.toLocaleString()}`, `$${result.roiScenario.optimizedRevenue.toLocaleString()}`],
              ['Conversion Uplift', '—', `+${result.roiScenario.uplift}%`],
              ['Timeline', '—', result.roiScenario.timeline],
            ]}
          />
        </Section>
      )}

      {result.financialExposure && (
        <Section title="Financial Exposure Snapshot" number="10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            {[
              { label: 'Annual Revenue Leakage', value: `$${result.financialExposure.annualLeakage.toLocaleString()}`, color: 'text-risk-high' },
              { label: 'Trust Deficit', value: `${result.financialExposure.trustDeficit}%`, color: 'text-risk-medium' },
              { label: 'SERP Visibility Gap', value: `${result.financialExposure.visibilityGap}%`, color: 'text-risk-medium' },
              { label: 'Review Volume Gap', value: `${result.financialExposure.reviewVolumeGap}%`, color: 'text-risk-medium' },
            ].map(m => (
              <div key={m.label} className="bg-muted/30 rounded-lg p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">These gaps directly impact intake predictability and create compounding conversion friction over time.</p>
        </Section>
      )}

      <Section title="Reputation Exposure Summary" number="11">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Risk Score</span>
            <span className="font-bold text-lg">{result.exposureSummary.riskScore}/100</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Category</span>
            <RiskBadge level={result.exposureSummary.riskCategory} />
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Primary Exposure</span>
            <span className="font-medium text-sm">{result.exposureSummary.primaryExposure}</span>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <span className="text-xs text-muted-foreground block mb-1">Intake Stability</span>
            <span className="font-medium text-sm">{result.exposureSummary.intakeStability}</span>
          </div>
        </div>
        <ul className="space-y-2">{result.exposureSummary.bullets.map((b, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-foreground/30 mt-0.5">—</span>{b}</li>)}</ul>
      </Section>

      <Section title="Tier Recommendation" number="12">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-3">
          <p className="text-sm font-bold mb-1">Recommended: {result.tierRecommendation.tier}</p>
          <p className="text-sm text-muted-foreground">{result.tierRecommendation.reason}</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium">{result.tierRecommendation.priority}</span></div>
          <div><span className="text-muted-foreground">Horizon:</span> <span className="font-medium">{result.tierRecommendation.horizon}</span></div>
        </div>
      </Section>

      <Section title="90-Day Reputation Roadmap" number="13">
        <div className="space-y-4">
          {[
            { title: 'Phase 1 — Stabilization', period: '0–30 days', items: result.roadmap.phase1 },
            { title: 'Phase 2 — Growth & Visibility', period: '30–90 days', items: result.roadmap.phase2 },
            { title: 'Phase 3 — Authority Reinforcement', period: '90+ days', items: result.roadmap.phase3 },
          ].map(phase => (
            <div key={phase.title}>
              <h3 className="text-sm font-medium mb-2">{phase.title} <span className="text-xs text-muted-foreground">({phase.period})</span></h3>
              <ul className="space-y-1.5 ml-4">
                {phase.items.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-foreground/30 mt-0.5">—</span>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Strategic Closing Statement" number="14">
        <p className="text-sm leading-relaxed whitespace-pre-line">{result.closingStatement}</p>
      </Section>
    </div>
  );
}
