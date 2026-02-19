import { AuditInput, AuditResult, ProjectionMode, RiskCategory } from '@/lib/audit-engine';

interface Props {
  input: AuditInput;
  result: AuditResult;
  mode: ProjectionMode;
}

function RiskBadge({ level }: { level: RiskCategory | string }) {
  const colorClass = level === 'Low' ? 'text-risk-low' : level === 'Medium' || level === 'Moderate' ? 'text-risk-medium' : 'text-risk-high';
  return <span className={`font-semibold ${colorClass}`}>{level}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">{title}</h2>
      {children}
    </section>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => <th key={i} className="text-left py-2 px-3 text-muted-foreground font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              {row.map((cell, j) => <td key={j} className="py-2 px-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AuditReport({ input, result, mode }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">Reputation Audit: {input.companyName}</h1>
        <p className="text-sm text-muted-foreground">{input.location} · {input.industry} · {mode} projection</p>
      </div>

      <Section title="1. Executive Summary">
        <p className="text-sm leading-relaxed">{result.executiveSummary}</p>
      </Section>

      <Section title="2. Market Context">
        <p className="text-sm leading-relaxed">{result.marketContext}</p>
      </Section>

      <Section title="3. SERP Intelligence">
        <DataTable
          headers={['Factor', 'Status', 'Risk Level', 'Comment']}
          rows={result.serpIntelligence.map(r => [r.factor, r.status, <RiskBadge key={r.factor} level={r.riskLevel} />, r.comment])}
        />
      </Section>

      <Section title="4. Review Intelligence">
        <DataTable
          headers={['Metric', 'Value']}
          rows={[
            ['Average Rating', String(result.reviewIntelligence.avgRating)],
            ['Review Volume', String(result.reviewIntelligence.volume)],
            ['Negative %', `${result.reviewIntelligence.negativePercent}%`],
            ['Volatility', result.reviewIntelligence.volatility],
            ['Trust Impact', result.reviewIntelligence.trustImpact],
          ]}
        />
      </Section>

      <Section title="5. Risk Model">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-3xl font-bold">{result.riskScore}<span className="text-lg text-muted-foreground">/100</span></div>
          <RiskBadge level={result.riskCategory} />
        </div>
        <DataTable
          headers={['Dimension', 'Score']}
          rows={[
            ['Strategic', String(result.riskBreakdown.strategic)],
            ['Tactical', String(result.riskBreakdown.tactical)],
            ['Operational', String(result.riskBreakdown.operational)],
          ]}
        />
      </Section>

      <Section title="6. ORM Opportunity Mapping">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Wins (0–30 days)</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.ormOpportunities.quickWins.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Mid-term (30–120 days)</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.ormOpportunities.midTerm.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Long-term (120+ days)</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.ormOpportunities.longTerm.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      </Section>

      {result.roiScenario && (
        <Section title="7. ROI Scenario">
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
        <Section title="10. Financial Exposure Snapshot">
          <DataTable
            headers={['Metric', 'Value']}
            rows={[
              ['Estimated Annual Revenue Leakage', `$${result.financialExposure.annualLeakage.toLocaleString()}`],
              ['Trust Deficit vs Top Competitors', `${result.financialExposure.trustDeficit}%`],
              ['Visibility Gap in Branded SERP', `${result.financialExposure.visibilityGap}%`],
              ['Review Volume Gap', `${result.financialExposure.reviewVolumeGap}%`],
            ]}
          />
          <p className="text-sm text-muted-foreground mt-2">These gaps directly impact intake predictability and create compounding conversion friction over time.</p>
        </Section>
      )}

      <Section title="11. Reputation Exposure Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div><span className="text-xs text-muted-foreground block">Risk Score</span><span className="font-bold text-lg">{result.exposureSummary.riskScore}/100</span></div>
          <div><span className="text-xs text-muted-foreground block">Category</span><RiskBadge level={result.exposureSummary.riskCategory} /></div>
          <div><span className="text-xs text-muted-foreground block">Primary Exposure</span><span className="font-medium">{result.exposureSummary.primaryExposure}</span></div>
          <div><span className="text-xs text-muted-foreground block">Intake Stability</span><span className="font-medium">{result.exposureSummary.intakeStability}</span></div>
        </div>
        <ul className="list-disc list-inside text-sm space-y-1">{result.exposureSummary.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
      </Section>

      <Section title="12. Tier Recommendation">
        <p className="text-sm font-semibold mb-2">Recommended Plan: {result.tierRecommendation.tier}</p>
        <p className="text-sm mb-2">{result.tierRecommendation.reason}</p>
        <ul className="text-sm space-y-1">
          <li><span className="text-muted-foreground">Priority:</span> {result.tierRecommendation.priority}</li>
          <li><span className="text-muted-foreground">Horizon:</span> {result.tierRecommendation.horizon}</li>
        </ul>
      </Section>

      <Section title="13. 90-Day Reputation Roadmap">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Phase 1 (0–30 days) — Stabilization</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.roadmap.phase1.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Phase 2 (30–90 days) — Growth & Visibility</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.roadmap.phase2.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Phase 3 (90+ days) — Authority Reinforcement</h3>
            <ul className="list-disc list-inside text-sm space-y-1">{result.roadmap.phase3.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        </div>
      </Section>

      <Section title="14. Strategic Closing Statement">
        <p className="text-sm leading-relaxed">{result.closingStatement}</p>
      </Section>
    </div>
  );
}
