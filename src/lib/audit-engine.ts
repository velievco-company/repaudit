export interface AuditInput {
  companyName: string;
  location: string;
  industry: 'Legal' | 'Dental' | 'Hotels' | 'Real Estate' | 'Fintech' | 'Other';
  avgRating: number;
  totalReviews: number;
  negativePercent: number;
  googleRanking: number;
  negativePress: boolean;
  glassdoor: 'none' | 'mild' | 'strong';
  monthlyTraffic?: number;
  conversionRate?: number;
  avgDealValue?: number;
}

export type RiskCategory = 'Low' | 'Medium' | 'High';
export type VolatilityLevel = 'Low' | 'Moderate' | 'High';
export type ProjectionMode = 'conservative' | 'aggressive';

export interface AuditResult {
  riskScore: number;
  riskCategory: RiskCategory;
  volatility: VolatilityLevel;
  intakeLoss: { monthlyLeakage: number; percent: number } | null;
  serpIntelligence: Array<{ factor: string; status: string; riskLevel: RiskCategory; comment: string }>;
  reviewIntelligence: { avgRating: number; volume: number; negativePercent: number; volatility: VolatilityLevel; trustImpact: string };
  riskBreakdown: { strategic: number; tactical: number; operational: number };
  ormOpportunities: { quickWins: string[]; midTerm: string[]; longTerm: string[] };
  roiScenario: { currentRevenue: number; optimizedRevenue: number; uplift: number; timeline: string } | null;
  financialExposure: { annualLeakage: number; trustDeficit: number; visibilityGap: number; reviewVolumeGap: number } | null;
  exposureSummary: { riskScore: number; riskCategory: RiskCategory; primaryExposure: string; intakeStability: string; bullets: string[] };
  tierRecommendation: { tier: string; reason: string; priority: string; horizon: string };
  roadmap: { phase1: string[]; phase2: string[]; phase3: string[] };
  executiveSummary: string;
  marketContext: string;
  closingStatement: string;
}

const industryContext: Record<string, string> = {
  Legal: 'High-ticket, trust-driven vertical with long sales cycles. Client decisions are heavily influenced by online credibility, peer reviews, and perceived expertise. A single negative result on page 1 can deter high-value prospects.',
  Dental: 'Locally competitive market where patient trust is built through review volume, rating consistency, and visible community presence. Reviews are the primary decision driver for new patients.',
  Hotels: 'Volume-based hospitality sector where review volatility directly impacts booking rates. Aggregator platforms amplify both positive and negative sentiment across multiple channels.',
  'Real Estate': 'Reputation-sensitive market where agent trust and brokerage credibility drive referrals and lead conversion. Online presence compounds over time through reviews and content authority.',
  Fintech: 'Compliance-driven sector where credibility and perceived security are non-negotiable. Negative press or low trust signals create disproportionate conversion barriers.',
  Other: 'Industry with standard reputation dynamics. Online reviews, search visibility, and brand sentiment collectively influence prospect decision-making and conversion rates.',
};

const industryBenchmarks: Record<string, { avgReviews: number; avgRating: number }> = {
  Legal: { avgReviews: 45, avgRating: 4.5 },
  Dental: { avgReviews: 120, avgRating: 4.6 },
  Hotels: { avgReviews: 300, avgRating: 4.3 },
  'Real Estate': { avgReviews: 60, avgRating: 4.4 },
  Fintech: { avgReviews: 80, avgRating: 4.2 },
  Other: { avgReviews: 50, avgRating: 4.3 },
};

export function calculateAudit(input: AuditInput, mode: ProjectionMode): AuditResult {
  // 3.1 Branded Risk Score
  let riskScore = 0;
  if (input.avgRating < 4.2) riskScore += Math.round((4.2 - input.avgRating) * 25);
  if (input.negativePercent > 15) riskScore += 20;
  if (input.negativePress) riskScore += 25;
  if (input.glassdoor === 'strong') riskScore += 10;
  if (input.glassdoor === 'mild') riskScore += 5;
  if (input.totalReviews < 15) riskScore += 10;
  if (input.googleRanking > 5) riskScore += 10;
  riskScore = Math.min(100, Math.max(0, riskScore));

  const riskCategory: RiskCategory = riskScore <= 25 ? 'Low' : riskScore <= 55 ? 'Medium' : 'High';

  // 3.2 Volatility
  let volScore = 0;
  if (input.totalReviews < 20) volScore++;
  if (input.negativePercent > 10) volScore++;
  if (input.negativePress) volScore++;
  const volatility: VolatilityLevel = volScore === 0 ? 'Low' : volScore === 1 ? 'Moderate' : 'High';

  // 3.3 Intake Loss
  let intakeLoss: AuditResult['intakeLoss'] = null;
  let currentRevenue = 0;
  if (input.monthlyTraffic && input.conversionRate && input.avgDealValue) {
    currentRevenue = input.monthlyTraffic * (input.conversionRate / 100) * input.avgDealValue;
    const multiplier = mode === 'aggressive' ? 1.3 : 1.0;
    let lossPercent: number;
    if (riskCategory === 'Low') lossPercent = 5 * multiplier;
    else if (riskCategory === 'Medium') lossPercent = (mode === 'aggressive' ? 18 : 12) * multiplier;
    else lossPercent = (mode === 'aggressive' ? 35 : 25) * multiplier;
    lossPercent = Math.min(lossPercent, 50);
    intakeLoss = { monthlyLeakage: Math.round(currentRevenue * lossPercent / 100), percent: Math.round(lossPercent) };
  }

  // SERP Intelligence
  const serpIntelligence = [
    {
      factor: 'Google Ranking Position',
      status: `Position ${input.googleRanking}`,
      riskLevel: (input.googleRanking <= 3 ? 'Low' : input.googleRanking <= 6 ? 'Medium' : 'High') as RiskCategory,
      comment: input.googleRanking <= 3 ? 'Strong branded SERP presence' : input.googleRanking <= 6 ? 'Moderate visibility — competitors may appear above' : 'Low visibility — brand is not controlling page 1',
    },
    {
      factor: 'Negative Press Presence',
      status: input.negativePress ? 'Detected' : 'Not detected',
      riskLevel: (input.negativePress ? 'High' : 'Low') as RiskCategory,
      comment: input.negativePress ? 'Negative media results may dominate branded queries' : 'No adverse media found in branded search',
    },
    {
      factor: 'Glassdoor Sentiment',
      status: input.glassdoor === 'none' ? 'Neutral/Positive' : input.glassdoor === 'mild' ? 'Mildly Negative' : 'Strongly Negative',
      riskLevel: (input.glassdoor === 'none' ? 'Low' : input.glassdoor === 'mild' ? 'Medium' : 'High') as RiskCategory,
      comment: input.glassdoor === 'strong' ? 'Employer brand issues may affect client trust' : input.glassdoor === 'mild' ? 'Some negative signals — may surface in branded search' : 'No employer brand risk detected',
    },
    {
      factor: 'Review Volume Signal',
      status: `${input.totalReviews} reviews`,
      riskLevel: (input.totalReviews >= 50 ? 'Low' : input.totalReviews >= 15 ? 'Medium' : 'High') as RiskCategory,
      comment: input.totalReviews < 15 ? 'Insufficient social proof — vulnerable to single negative review impact' : input.totalReviews < 50 ? 'Moderate review base — needs growth for stability' : 'Healthy review volume providing social proof',
    },
  ];

  // Review Intelligence
  const trustImpact = input.avgRating >= 4.5 ? 'Strong positive trust signal' :
    input.avgRating >= 4.0 ? 'Adequate but not differentiated' :
    input.avgRating >= 3.5 ? 'Below threshold — trust erosion likely' : 'Critical — active trust damage';
  const reviewIntelligence = { avgRating: input.avgRating, volume: input.totalReviews, negativePercent: input.negativePercent, volatility, trustImpact };

  // Risk Breakdown
  const strategic = Math.round(riskScore * 0.4);
  const tactical = Math.round(riskScore * 0.35);
  const operational = riskScore - strategic - tactical;
  const riskBreakdown = { strategic, tactical, operational };

  // ORM Opportunities
  const ormOpportunities = generateORM(riskCategory, input);

  // ROI
  let roiScenario: AuditResult['roiScenario'] = null;
  if (currentRevenue > 0 && intakeLoss) {
    const upliftMult = mode === 'aggressive' ? 0.7 : 0.5;
    const recovery = Math.round(intakeLoss.monthlyLeakage * upliftMult);
    roiScenario = {
      currentRevenue: Math.round(currentRevenue),
      optimizedRevenue: Math.round(currentRevenue + recovery),
      uplift: Math.round((recovery / currentRevenue) * 100),
      timeline: riskCategory === 'High' ? '120–180 days' : riskCategory === 'Medium' ? '60–120 days' : '30–60 days',
    };
  }

  // Financial Exposure
  let financialExposure: AuditResult['financialExposure'] = null;
  if (intakeLoss) {
    const bench = industryBenchmarks[input.industry];
    financialExposure = {
      annualLeakage: intakeLoss.monthlyLeakage * 12,
      trustDeficit: Math.round(Math.max(0, (bench.avgRating - input.avgRating) / bench.avgRating * 100)),
      visibilityGap: Math.round(Math.max(0, (input.googleRanking - 1) / 9 * 100)),
      reviewVolumeGap: Math.round(Math.max(0, (bench.avgReviews - input.totalReviews) / bench.avgReviews * 100)),
    };
  }

  // Exposure Summary
  const primaryExposure = riskScore > 55 && input.negativePress ? 'Crisis Risk' :
    input.avgRating < 4.0 ? 'Reviews' :
    input.googleRanking > 5 ? 'Visibility' : 'Authority';
  const intakeStability = volatility === 'High' ? 'At Risk' : volatility === 'Moderate' ? 'Volatile' : 'Stable';

  const exposureBullets: string[] = [];
  if (riskCategory === 'High') exposureBullets.push('Brand search results present immediate conversion risk');
  if (input.avgRating < 4.2) exposureBullets.push(`Rating of ${input.avgRating} falls below the ${input.industry} trust threshold of 4.2+`);
  if (input.negativePress) exposureBullets.push('Negative press presence requires active suppression strategy');
  if (input.totalReviews < 30) exposureBullets.push('Low review volume makes rating highly susceptible to single-review shifts');
  if (exposureBullets.length === 0) exposureBullets.push('No critical exposure points identified — focus on growth and reinforcement');

  const exposureSummary = { riskScore, riskCategory, primaryExposure, intakeStability, bullets: exposureBullets };

  // Tier
  const tier = riskScore <= 35 ? 'Basic (Stabilization)' : riskScore <= 70 ? 'Professional (Growth & Visibility)' : 'Enterprise (Full Control)';
  const tierPriority = riskScore <= 35 ? 'stabilize' : riskScore <= 70 ? 'expand' : 'control';
  const tierHorizon = riskScore <= 35 ? '30 days' : riskScore <= 70 ? '90 days' : '180 days';
  const tierReason = riskScore <= 35
    ? `Risk score of ${riskScore} indicates a stable foundation with minor optimization opportunities. Focus is on maintaining current standing and incremental improvement.`
    : riskScore <= 70
    ? `Risk score of ${riskScore} reveals growth constraints tied to visibility and review gaps. Structured expansion of online presence will unlock conversion potential.`
    : `Risk score of ${riskScore} signals systemic reputation risk requiring comprehensive intervention across search, reviews, and content authority.`;

  const tierRecommendation = { tier, reason: tierReason, priority: tierPriority, horizon: tierHorizon };

  // Roadmap
  const roadmap = generateRoadmap(riskCategory, input);

  // Executive Summary
  const executiveSummary = generateExecutiveSummary(input, riskScore, riskCategory, volatility);

  // Market Context
  const marketContext = industryContext[input.industry];

  // Closing
  const closingStatement = `Reputation is not an image management exercise — it is a revenue function. Every branded search query, review interaction, and content touchpoint either builds or erodes conversion probability. This audit provides a diagnostic layer: a structured view of where ${input.companyName} currently stands relative to trust-driven conversion benchmarks in ${input.industry}. The data suggests a ${riskCategory.toLowerCase()}-risk profile with ${intakeStability.toLowerCase()} intake predictability. A 90-day stabilization strategy focused on ${tierPriority === 'stabilize' ? 'foundational improvements' : tierPriority === 'expand' ? 'visibility expansion and review growth' : 'comprehensive reputation control'} would be a logical next step.`;

  return {
    riskScore, riskCategory, volatility, intakeLoss, serpIntelligence, reviewIntelligence,
    riskBreakdown, ormOpportunities, roiScenario, financialExposure, exposureSummary,
    tierRecommendation, roadmap, executiveSummary, marketContext, closingStatement,
  };
}

function generateExecutiveSummary(input: AuditInput, score: number, cat: RiskCategory, vol: VolatilityLevel): string {
  const lines: string[] = [];
  lines.push(`${input.companyName} (${input.industry}, ${input.location}) presents a branded risk score of ${score}/100 (${cat}).`);
  if (cat === 'High') lines.push('Multiple reputation signals indicate active conversion leakage requiring immediate intervention.');
  else if (cat === 'Medium') lines.push('Moderate reputation gaps exist that constrain conversion potential and competitive positioning.');
  else lines.push('The overall reputation profile is stable with opportunities for reinforcement and growth.');
  if (vol === 'High') lines.push(`Review volatility is ${vol.toLowerCase()}, indicating susceptibility to sentiment shifts.`);
  return lines.join(' ');
}

function generateORM(cat: RiskCategory, input: AuditInput) {
  const quickWins: string[] = [];
  const midTerm: string[] = [];
  const longTerm: string[] = [];

  if (input.avgRating < 4.2) quickWins.push('Implement post-service review request workflow to boost positive review flow');
  if (input.negativePercent > 15) quickWins.push('Develop response templates for negative reviews — prioritize empathy and resolution');
  if (input.totalReviews < 30) quickWins.push('Launch review generation campaign targeting satisfied clients');
  quickWins.push('Audit and optimize Google Business Profile completeness');

  if (input.negativePress) midTerm.push('Create and publish authoritative content to displace negative press in SERP');
  if (input.googleRanking > 3) midTerm.push('Build branded content assets (case studies, testimonials, thought leadership)');
  midTerm.push('Establish review monitoring and alert system');
  if (input.glassdoor !== 'none') midTerm.push('Address employer brand signals on Glassdoor with engagement strategy');

  longTerm.push('Build sustained content authority through industry-specific publishing');
  longTerm.push('Develop proprietary review funnel integrated with CRM');
  if (cat === 'High') longTerm.push('Implement crisis response protocol and sentiment monitoring dashboard');
  longTerm.push('Establish competitive reputation benchmarking cadence');

  return { quickWins, midTerm, longTerm };
}

function generateRoadmap(cat: RiskCategory, input: AuditInput) {
  const phase1: string[] = [];
  const phase2: string[] = [];
  const phase3: string[] = [];

  phase1.push('Complete Google Business Profile optimization');
  if (input.avgRating < 4.2) phase1.push('Activate review generation workflow');
  if (input.negativePress) phase1.push('Begin content suppression strategy for negative SERP results');
  phase1.push('Set up review monitoring alerts');

  phase2.push('Scale review acquisition to target volume benchmarks');
  phase2.push('Publish 4–6 branded content pieces for SERP control');
  if (input.glassdoor !== 'none') phase2.push('Engage with Glassdoor profile improvement');
  phase2.push('Measure conversion impact of reputation improvements');

  phase3.push('Establish ongoing content authority cadence');
  phase3.push('Implement competitive reputation tracking');
  phase3.push('Refine and automate review funnel');
  if (cat === 'High') phase3.push('Build crisis preparedness framework');

  return { phase1, phase2, phase3 };
}

export function generateMarkdown(input: AuditInput, result: AuditResult, mode: ProjectionMode): string {
  let md = '';
  md += `# Reputation Audit: ${input.companyName}\n\n`;
  md += `**Location:** ${input.location} | **Industry:** ${input.industry} | **Mode:** ${mode}\n\n`;
  md += `---\n\n`;

  md += `## 1. Executive Summary\n\n${result.executiveSummary}\n\n`;
  md += `## 2. Market Context\n\n${result.marketContext}\n\n`;

  md += `## 3. SERP Intelligence\n\n`;
  md += `| Factor | Status | Risk Level | Comment |\n|---|---|---|---|\n`;
  result.serpIntelligence.forEach(r => md += `| ${r.factor} | ${r.status} | ${r.riskLevel} | ${r.comment} |\n`);
  md += '\n';

  md += `## 4. Review Intelligence\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Average Rating | ${result.reviewIntelligence.avgRating} |\n`;
  md += `| Review Volume | ${result.reviewIntelligence.volume} |\n`;
  md += `| Negative % | ${result.reviewIntelligence.negativePercent}% |\n`;
  md += `| Volatility | ${result.reviewIntelligence.volatility} |\n`;
  md += `| Trust Impact | ${result.reviewIntelligence.trustImpact} |\n\n`;

  md += `## 5. Risk Model\n\n`;
  md += `**Risk Score:** ${result.riskScore}/100 (${result.riskCategory})\n\n`;
  md += `| Dimension | Score |\n|---|---|\n`;
  md += `| Strategic | ${result.riskBreakdown.strategic} |\n`;
  md += `| Tactical | ${result.riskBreakdown.tactical} |\n`;
  md += `| Operational | ${result.riskBreakdown.operational} |\n\n`;

  md += `## 6. ORM Opportunity Mapping\n\n`;
  md += `### Quick Wins (0–30 days)\n${result.ormOpportunities.quickWins.map(s => `- ${s}`).join('\n')}\n\n`;
  md += `### Mid-term (30–120 days)\n${result.ormOpportunities.midTerm.map(s => `- ${s}`).join('\n')}\n\n`;
  md += `### Long-term (120+ days)\n${result.ormOpportunities.longTerm.map(s => `- ${s}`).join('\n')}\n\n`;

  if (result.roiScenario) {
    md += `## 7. ROI Scenario\n\n`;
    md += `| Metric | Current | Optimized |\n|---|---|---|\n`;
    md += `| Monthly Revenue | $${result.roiScenario.currentRevenue.toLocaleString()} | $${result.roiScenario.optimizedRevenue.toLocaleString()} |\n`;
    md += `| Conversion Uplift | — | +${result.roiScenario.uplift}% |\n`;
    md += `| Timeline | — | ${result.roiScenario.timeline} |\n\n`;
  }

  if (result.financialExposure) {
    md += `## 10. Financial Exposure Snapshot\n\n`;
    md += `- **Estimated Annual Revenue Leakage:** $${result.financialExposure.annualLeakage.toLocaleString()}\n`;
    md += `- **Trust Deficit vs Top Competitors:** ${result.financialExposure.trustDeficit}%\n`;
    md += `- **Visibility Gap in Branded SERP:** ${result.financialExposure.visibilityGap}%\n`;
    md += `- **Review Volume Gap:** ${result.financialExposure.reviewVolumeGap}%\n\n`;
    md += `These gaps directly impact intake predictability and create compounding conversion friction over time.\n\n`;
  }

  md += `## 11. Reputation Exposure Summary\n\n`;
  md += `- **Risk Score:** ${result.exposureSummary.riskScore}/100\n`;
  md += `- **Risk Category:** ${result.exposureSummary.riskCategory}\n`;
  md += `- **Primary Exposure:** ${result.exposureSummary.primaryExposure}\n`;
  md += `- **Intake Stability:** ${result.exposureSummary.intakeStability}\n\n`;
  result.exposureSummary.bullets.forEach(b => md += `- ${b}\n`);
  md += '\n';

  md += `## 12. Tier Recommendation\n\n`;
  md += `**Recommended Plan:** ${result.tierRecommendation.tier}\n\n`;
  md += `${result.tierRecommendation.reason}\n\n`;
  md += `- **Priority:** ${result.tierRecommendation.priority}\n`;
  md += `- **Horizon:** ${result.tierRecommendation.horizon}\n\n`;

  md += `## 13. 90-Day Reputation Roadmap\n\n`;
  md += `### Phase 1 (0–30 days) — Stabilization\n${result.roadmap.phase1.map(s => `- ${s}`).join('\n')}\n\n`;
  md += `### Phase 2 (30–90 days) — Growth & Visibility\n${result.roadmap.phase2.map(s => `- ${s}`).join('\n')}\n\n`;
  md += `### Phase 3 (90+ days) — Authority Reinforcement\n${result.roadmap.phase3.map(s => `- ${s}`).join('\n')}\n\n`;

  md += `## 14. Strategic Closing Statement\n\n${result.closingStatement}\n`;

  return md;
}

export function generatePlainText(input: AuditInput, result: AuditResult, mode: ProjectionMode): string {
  return generateMarkdown(input, result, mode)
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\|/g, ' | ')
    .replace(/---/g, '———');
}
