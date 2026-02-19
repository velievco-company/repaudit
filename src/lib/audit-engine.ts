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
  Legal: 'High-ticket, trust-driven vertical with long sales cycles averaging 2–8 weeks. Client decisions are heavily influenced by online credibility, peer reviews, and perceived expertise. A single negative result on page 1 can deter prospects with case values exceeding $10,000. In legal, 84% of potential clients research firms online before making contact, and 72% eliminate firms based on negative search results alone. The competitive density in local legal search makes branded SERP control a direct revenue lever.',
  Dental: 'Locally competitive healthcare market where patient trust is built through review volume, rating consistency, and visible community presence. Reviews are the primary decision driver for new patients — 93% of patients read reviews before choosing a dentist, and practices below 4.3 stars see a 30–40% reduction in new patient inquiries. The average patient lifetime value ($3,000–$8,000) makes each lost prospect a significant revenue event. Insurance network visibility compounds the reputation effect.',
  Hotels: 'Volume-based hospitality sector where review volatility directly impacts booking rates and ADR (Average Daily Rate). A 1-star improvement on major platforms correlates with 5–9% revenue uplift. Aggregator platforms (TripAdvisor, Booking.com, Google Hotels) amplify both positive and negative sentiment across multiple channels simultaneously. Seasonal demand patterns make reputation damage during peak periods disproportionately costly. Review recency weighs heavily in algorithmic ranking.',
  'Real Estate': 'Reputation-sensitive market where agent trust and brokerage credibility drive referrals and lead conversion. 78% of home buyers and sellers work with the first agent they contact, making branded search position critical. Online presence compounds over time through reviews, transaction history, and content authority. Negative sentiment around an agent or brokerage can redirect high-value transactions ($200K–$1M+) to competitors within the same market radius.',
  Fintech: 'Compliance-driven sector where credibility and perceived security are non-negotiable. Negative press or low trust signals create disproportionate conversion barriers — users are 3x more likely to abandon fintech onboarding after encountering negative search results compared to other industries. Regulatory scrutiny amplifies reputation risk, as negative media coverage can trigger compliance reviews. App store ratings and review sentiment directly correlate with download velocity and activation rates.',
  Other: 'Industry with standard reputation dynamics where online reviews, search visibility, and brand sentiment collectively influence prospect decision-making. In most B2B and B2C verticals, 67% of the buyer journey occurs before first contact, making the digital footprint a de facto sales asset. Review volume and recency serve as trust proxies, while branded SERP composition determines first-impression quality for new prospects.',
};

const industryBenchmarks: Record<string, { avgReviews: number; avgRating: number; avgDealValue: number; conversionRate: number }> = {
  Legal: { avgReviews: 45, avgRating: 4.5, avgDealValue: 5000, conversionRate: 4.5 },
  Dental: { avgReviews: 120, avgRating: 4.6, avgDealValue: 800, conversionRate: 8.0 },
  Hotels: { avgReviews: 300, avgRating: 4.3, avgDealValue: 250, conversionRate: 3.5 },
  'Real Estate': { avgReviews: 60, avgRating: 4.4, avgDealValue: 12000, conversionRate: 2.5 },
  Fintech: { avgReviews: 80, avgRating: 4.2, avgDealValue: 150, conversionRate: 6.0 },
  Other: { avgReviews: 50, avgRating: 4.3, avgDealValue: 1000, conversionRate: 4.0 },
};

const industryTerms: Record<string, { client: string; action: string; channel: string }> = {
  Legal: { client: 'client', action: 'intake', channel: 'branded search & legal directories' },
  Dental: { client: 'patient', action: 'booking', channel: 'Google Maps & review platforms' },
  Hotels: { client: 'guest', action: 'booking', channel: 'OTAs & Google Hotels' },
  'Real Estate': { client: 'lead', action: 'inquiry', channel: 'branded search & listing portals' },
  Fintech: { client: 'user', action: 'onboarding', channel: 'app stores & branded search' },
  Other: { client: 'prospect', action: 'conversion', channel: 'branded search & review platforms' },
};

export function calculateAudit(input: AuditInput, mode: ProjectionMode): AuditResult {
  const bench = industryBenchmarks[input.industry];
  const terms = industryTerms[input.industry];

  // 3.1 Branded Risk Score
  let riskScore = 0;
  if (input.avgRating < 4.2) riskScore += Math.round((4.2 - input.avgRating) * 25);
  if (input.negativePercent > 15) riskScore += 20;
  else if (input.negativePercent > 10) riskScore += 10;
  if (input.negativePress) riskScore += 25;
  if (input.glassdoor === 'strong') riskScore += 10;
  if (input.glassdoor === 'mild') riskScore += 5;
  if (input.totalReviews < 15) riskScore += 10;
  else if (input.totalReviews < 30) riskScore += 5;
  if (input.googleRanking > 5) riskScore += 10;
  else if (input.googleRanking > 3) riskScore += 5;
  riskScore = Math.min(100, Math.max(0, riskScore));

  const riskCategory: RiskCategory = riskScore <= 25 ? 'Low' : riskScore <= 55 ? 'Medium' : 'High';

  // 3.2 Volatility
  let volScore = 0;
  if (input.totalReviews < 20) volScore += 2;
  else if (input.totalReviews < 40) volScore++;
  if (input.negativePercent > 15) volScore += 2;
  else if (input.negativePercent > 10) volScore++;
  if (input.negativePress) volScore += 2;
  if (input.glassdoor === 'strong') volScore++;
  const volatility: VolatilityLevel = volScore <= 1 ? 'Low' : volScore <= 3 ? 'Moderate' : 'High';

  // 3.3 Intake Loss
  let intakeLoss: AuditResult['intakeLoss'] = null;
  let currentRevenue = 0;
  if (input.monthlyTraffic && input.conversionRate && input.avgDealValue) {
    currentRevenue = input.monthlyTraffic * (input.conversionRate / 100) * input.avgDealValue;
    const multiplier = mode === 'aggressive' ? 1.3 : 1.0;
    let lossPercent: number;
    if (riskCategory === 'Low') lossPercent = (mode === 'aggressive' ? 8 : 5) * multiplier;
    else if (riskCategory === 'Medium') lossPercent = (mode === 'aggressive' ? 22 : 14) * multiplier;
    else lossPercent = (mode === 'aggressive' ? 35 : 25) * multiplier;
    lossPercent = Math.min(lossPercent, 50);
    intakeLoss = { monthlyLeakage: Math.round(currentRevenue * lossPercent / 100), percent: Math.round(lossPercent) };
  }

  // SERP Intelligence — expanded
  const serpIntelligence = buildSerpIntelligence(input, bench, terms);

  // Review Intelligence
  const trustImpact = input.avgRating >= 4.5
    ? `Strong positive trust signal — above ${input.industry} benchmark of ${bench.avgRating}. Rating supports ${terms.action} confidence.`
    : input.avgRating >= 4.0
    ? `Adequate but not differentiated — sits at or below the ${input.industry} average of ${bench.avgRating}. Marginal ${terms.client}s may hesitate.`
    : input.avgRating >= 3.5
    ? `Below trust threshold — ${input.industry} ${terms.client}s expect 4.0+ ratings. Current rating actively discourages ${terms.action}.`
    : `Critical trust damage — rating signals systemic service issues. Estimated 30–40% ${terms.action} deterrence at this level.`;

  const reviewIntelligence = { avgRating: input.avgRating, volume: input.totalReviews, negativePercent: input.negativePercent, volatility, trustImpact };

  // Risk Breakdown — more granular
  const strategic = Math.min(40, Math.round(
    (input.negativePress ? 15 : 0) +
    (input.avgRating < 4.0 ? 12 : input.avgRating < 4.2 ? 6 : 0) +
    (input.glassdoor === 'strong' ? 8 : input.glassdoor === 'mild' ? 4 : 0) +
    (input.googleRanking > 7 ? 5 : 0)
  ));
  const tactical = Math.min(35, Math.round(
    (input.negativePercent > 15 ? 12 : input.negativePercent > 10 ? 6 : 0) +
    (input.totalReviews < 15 ? 10 : input.totalReviews < 30 ? 5 : 0) +
    (input.googleRanking > 5 ? 8 : input.googleRanking > 3 ? 4 : 0) +
    (volatility === 'High' ? 5 : 0)
  ));
  const operational = Math.max(0, Math.min(25, riskScore - strategic - tactical));
  const riskBreakdown = { strategic, tactical, operational };

  // ORM Opportunities
  const ormOpportunities = generateORM(riskCategory, input, bench, terms);

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

  // Financial Exposure — works even without financial data using benchmarks
  const reviewVolumeGap = Math.round(Math.max(0, (bench.avgReviews - input.totalReviews) / bench.avgReviews * 100));
  const trustDeficit = Math.round(Math.max(0, (bench.avgRating - input.avgRating) / bench.avgRating * 100));
  const visibilityGap = Math.round(Math.max(0, (input.googleRanking - 1) / 9 * 100));
  
  let financialExposure: AuditResult['financialExposure'] = null;
  if (intakeLoss) {
    financialExposure = {
      annualLeakage: intakeLoss.monthlyLeakage * 12,
      trustDeficit,
      visibilityGap,
      reviewVolumeGap,
    };
  } else {
    // Estimate using industry benchmarks
    const estimatedMonthlyRevenue = (input.monthlyTraffic || 2000) * (bench.conversionRate / 100) * bench.avgDealValue;
    const estLossPercent = riskCategory === 'Low' ? 5 : riskCategory === 'Medium' ? 14 : 25;
    financialExposure = {
      annualLeakage: Math.round(estimatedMonthlyRevenue * estLossPercent / 100 * 12),
      trustDeficit,
      visibilityGap,
      reviewVolumeGap,
    };
  }

  // Exposure Summary — richer bullets
  const primaryExposure = riskScore > 55 && input.negativePress ? 'Crisis Risk' :
    input.avgRating < 4.0 ? 'Reviews' :
    input.googleRanking > 5 ? 'Visibility' :
    input.totalReviews < bench.avgReviews * 0.5 ? 'Authority' : 'Reviews';
  const intakeStability = volatility === 'High' ? 'At Risk' : volatility === 'Moderate' ? 'Volatile' : 'Stable';

  const exposureBullets = buildExposureBullets(input, riskCategory, bench, terms, trustDeficit, reviewVolumeGap, visibilityGap);
  const exposureSummary = { riskScore, riskCategory, primaryExposure, intakeStability, bullets: exposureBullets };

  // Tier Recommendation — more detailed reasoning
  const tierRecommendation = buildTierRecommendation(riskScore, input, terms, primaryExposure);

  // Roadmap — industry-specific
  const roadmap = generateRoadmap(riskCategory, input, bench, terms);

  // Executive Summary
  const executiveSummary = generateExecutiveSummary(input, riskScore, riskCategory, volatility, bench, terms, intakeLoss);

  // Market Context
  const marketContext = industryContext[input.industry];

  // Closing Statement
  const closingStatement = `Reputation is not an image management exercise — it is a revenue function. Every branded search query, review interaction, and ${terms.channel} touchpoint either builds or erodes ${terms.action} probability. For ${input.industry.toLowerCase()} businesses, this effect is compounded by the high-trust nature of ${terms.client} decision-making.\n\nThis audit provides a diagnostic layer: a structured view of where ${input.companyName} currently stands relative to trust-driven ${terms.action} benchmarks in ${input.industry}. The data indicates a ${riskCategory.toLowerCase()}-risk profile with ${intakeStability.toLowerCase()} ${terms.action} predictability.${trustDeficit > 0 ? ` A ${trustDeficit}% trust deficit relative to top competitors suggests structural conversion friction that compounds over time.` : ''}\n\nA 90-day stabilization strategy focused on ${tierRecommendation.priority === 'stabilize' ? 'foundational reputation repair and review recovery' : tierRecommendation.priority === 'expand' ? 'visibility expansion, review velocity growth, and SERP control' : 'comprehensive reputation control across all digital touchpoints'} would be the logical next step. The objective is not cosmetic improvement — it is measurable ${terms.action} predictability.`;

  return {
    riskScore, riskCategory, volatility, intakeLoss, serpIntelligence, reviewIntelligence,
    riskBreakdown, ormOpportunities, roiScenario, financialExposure, exposureSummary,
    tierRecommendation, roadmap, executiveSummary, marketContext, closingStatement,
  };
}

function buildSerpIntelligence(input: AuditInput, bench: typeof industryBenchmarks['Legal'], terms: typeof industryTerms['Legal']) {
  const results: AuditResult['serpIntelligence'] = [];

  results.push({
    factor: 'Google Ranking Position',
    status: `Position ${input.googleRanking}`,
    riskLevel: input.googleRanking <= 3 ? 'Low' : input.googleRanking <= 6 ? 'Medium' : 'High',
    comment: input.googleRanking <= 3
      ? `Strong branded SERP presence — ${input.companyName} controls top positions in branded queries. ${terms.client} first impression is owned.`
      : input.googleRanking <= 6
      ? `Moderate visibility — competitors or aggregators may appear above ${input.companyName} in branded search. Estimated 15–25% of ${terms.client}s see competitor content first.`
      : `Low visibility — brand is not controlling page 1. At position ${input.googleRanking}, an estimated 40–60% of branded traffic encounters third-party or competitor content before reaching ${input.companyName}.`,
  });

  results.push({
    factor: 'Negative Press Presence',
    status: input.negativePress ? 'Detected' : 'Not detected',
    riskLevel: input.negativePress ? 'High' : 'Low',
    comment: input.negativePress
      ? `Negative media results detected in branded search landscape. In ${input.industry.toLowerCase()}, negative press on page 1 can reduce ${terms.action} rates by 25–45%. Active suppression strategy required.`
      : `No adverse media found in branded search. This is a positive signal but does not eliminate future risk — proactive content strategy recommended to maintain SERP control.`,
  });

  results.push({
    factor: 'Glassdoor / Employer Sentiment',
    status: input.glassdoor === 'none' ? 'Neutral/Positive' : input.glassdoor === 'mild' ? 'Mildly Negative' : 'Strongly Negative',
    riskLevel: input.glassdoor === 'none' ? 'Low' : input.glassdoor === 'mild' ? 'Medium' : 'High',
    comment: input.glassdoor === 'strong'
      ? `Strong employer brand negativity surfaces in branded search and affects ${terms.client} trust. 48% of consumers factor employer reputation into purchase/service decisions. This is a cross-channel trust leak.`
      : input.glassdoor === 'mild'
      ? `Mild negative employer signals detected — may surface on page 1–2 of branded search. While not critical, this creates a secondary trust friction point for ${terms.client}s conducting deep research.`
      : `No employer brand risk detected. Glassdoor profile either positive or not prominent enough to impact branded search composition.`,
  });

  results.push({
    factor: 'Review Volume vs Industry Benchmark',
    status: `${input.totalReviews} reviews (benchmark: ${bench.avgReviews})`,
    riskLevel: input.totalReviews >= bench.avgReviews ? 'Low' : input.totalReviews >= bench.avgReviews * 0.5 ? 'Medium' : 'High',
    comment: input.totalReviews >= bench.avgReviews
      ? `Review volume meets or exceeds the ${input.industry} industry benchmark of ${bench.avgReviews} reviews. Strong social proof signal for ${terms.client} decision-making.`
      : input.totalReviews >= bench.avgReviews * 0.5
      ? `Review volume is ${Math.round((input.totalReviews / bench.avgReviews) * 100)}% of the ${input.industry} benchmark (${bench.avgReviews}). This gap reduces social proof effectiveness and makes the rating more volatile.`
      : `Review volume is critically below the ${input.industry} benchmark. At ${input.totalReviews} reviews vs. ${bench.avgReviews} expected, ${input.companyName} lacks sufficient social proof. Each negative review has ${Math.round(bench.avgReviews / Math.max(input.totalReviews, 1))}x more impact than it would at benchmark volume.`,
  });

  results.push({
    factor: 'Rating Competitiveness',
    status: `${input.avgRating} (benchmark: ${bench.avgRating})`,
    riskLevel: input.avgRating >= bench.avgRating ? 'Low' : input.avgRating >= bench.avgRating - 0.3 ? 'Medium' : 'High',
    comment: input.avgRating >= bench.avgRating
      ? `Rating meets or exceeds the ${input.industry} competitive benchmark. This is a trust asset that supports ${terms.action} confidence.`
      : input.avgRating >= bench.avgRating - 0.3
      ? `Rating is ${(bench.avgRating - input.avgRating).toFixed(1)} stars below the ${input.industry} average. In a high-trust vertical, this gap translates to measurable ${terms.action} friction.`
      : `Rating is significantly below the competitive threshold. A ${(bench.avgRating - input.avgRating).toFixed(1)}-star gap in ${input.industry} typically correlates with 20–35% lower ${terms.action} conversion vs. top-rated competitors.`,
  });

  results.push({
    factor: 'Negative Review Density',
    status: `${input.negativePercent}% (1–2 star)`,
    riskLevel: input.negativePercent <= 5 ? 'Low' : input.negativePercent <= 15 ? 'Medium' : 'High',
    comment: input.negativePercent <= 5
      ? `Negative review density is within healthy range. Minimal impact on ${terms.client} perception when browsing reviews.`
      : input.negativePercent <= 15
      ? `${input.negativePercent}% negative review density is elevated. ${terms.client}s scanning reviews will encounter negative experiences within the first 5–10 reviews, creating hesitation.`
      : `${input.negativePercent}% negative density is critical — ${terms.client}s are statistically likely to encounter multiple negative reviews during decision research. This creates a compounding deterrence effect.`,
  });

  results.push({
    factor: 'SERP Content Control',
    status: input.googleRanking <= 3 && !input.negativePress ? 'Owned' : input.googleRanking <= 5 ? 'Partial' : 'Uncontrolled',
    riskLevel: input.googleRanking <= 3 && !input.negativePress ? 'Low' : input.googleRanking <= 5 ? 'Medium' : 'High',
    comment: input.googleRanking <= 3 && !input.negativePress
      ? `${input.companyName} controls the narrative in branded search. Owned properties and positive third-party results dominate page 1.`
      : input.googleRanking <= 5
      ? `Partial SERP control — ${input.companyName} shares page 1 with third-party content. This creates narrative risk if competitor or negative content gains ranking authority.`
      : `Branded SERP is largely uncontrolled. ${input.companyName} does not own enough page 1 real estate to shape ${terms.client} first impressions. Competitors and aggregators define the brand narrative.`,
  });

  return results;
}

function buildExposureBullets(input: AuditInput, cat: RiskCategory, bench: typeof industryBenchmarks['Legal'], terms: typeof industryTerms['Legal'], trustDeficit: number, reviewVolumeGap: number, visibilityGap: number): string[] {
  const bullets: string[] = [];

  if (cat === 'High') {
    bullets.push(`Brand search results present immediate ${terms.action} risk — multiple high-severity factors detected across SERP, reviews, and trust signals.`);
  }

  if (input.avgRating < 4.2) {
    bullets.push(`Rating of ${input.avgRating} falls ${(4.2 - input.avgRating).toFixed(1)} stars below the industry trust threshold. In ${input.industry.toLowerCase()}, ${terms.client}s below 4.2 stars see a measurable drop in ${terms.action} intent.`);
  }

  if (trustDeficit > 0) {
    bullets.push(`Trust deficit of ${trustDeficit}% relative to top ${input.industry.toLowerCase()} competitors creates a structural disadvantage in side-by-side comparison scenarios.`);
  }

  if (reviewVolumeGap > 30) {
    bullets.push(`Review volume gap of ${reviewVolumeGap}% vs. industry benchmark (${bench.avgReviews} reviews) weakens social proof and increases rating volatility — each negative review carries disproportionate weight.`);
  }

  if (visibilityGap > 30) {
    bullets.push(`Visibility gap of ${visibilityGap}% in branded SERP means ${input.companyName} does not control enough of the first-impression narrative. Third-party content shapes ${terms.client} perception.`);
  }

  if (input.negativePress) {
    bullets.push(`Active negative press presence requires immediate suppression strategy — in ${input.industry.toLowerCase()}, negative media on page 1 can reduce ${terms.action} rates by 25–45%.`);
  }

  if (input.negativePercent > 15) {
    bullets.push(`Negative review density of ${input.negativePercent}% exceeds the 10% threshold — ${terms.client}s scanning recent reviews will encounter negative experiences within the first few entries.`);
  }

  if (bullets.length === 0) {
    bullets.push(`No critical exposure points identified. Current profile supports stable ${terms.action} flow with opportunities for growth and competitive reinforcement.`);
    bullets.push(`Focus should shift from risk mitigation to authority building and review velocity acceleration.`);
  }

  return bullets;
}

function buildTierRecommendation(riskScore: number, input: AuditInput, terms: typeof industryTerms['Legal'], primaryExposure: string) {
  let tier: string, reason: string, priority: string, horizon: string;

  if (riskScore <= 35) {
    tier = 'Basic (Stabilization)';
    priority = 'stabilize';
    horizon = '30 days';
    reason = `Risk score of ${riskScore}/100 indicates a stable foundation with no critical exposure points. ${input.companyName}'s current reputation profile supports baseline ${terms.action} flow. The Basic tier focuses on: (1) reinforcing existing strengths through structured review generation, (2) optimizing branded SERP presence with owned content, and (3) establishing monitoring systems to detect early warning signals. At this risk level, the primary objective is converting a stable reputation into a competitive advantage rather than reactive repair.`;
  } else if (riskScore <= 70) {
    tier = 'Professional (Growth & Visibility)';
    priority = 'expand';
    horizon = '90 days';
    reason = `Risk score of ${riskScore}/100 reveals growth constraints tied to ${primaryExposure.toLowerCase()} gaps. ${input.companyName} has ${terms.action} leakage that is not immediately visible but compounds over time. The Professional tier addresses: (1) closing the ${primaryExposure.toLowerCase()} gap through targeted content and review strategies, (2) building SERP authority to control branded narrative, (3) scaling review velocity to match or exceed the ${input.industry} benchmark, and (4) implementing conversion tracking to measure reputation-driven ${terms.action} improvements. The 90-day horizon allows for measurable impact across all three pillars.`;
  } else {
    tier = 'Enterprise (Full Control)';
    priority = 'control';
    horizon = '180 days';
    reason = `Risk score of ${riskScore}/100 signals systemic reputation risk requiring comprehensive intervention. ${input.companyName} faces active ${terms.action} erosion across multiple channels — ${primaryExposure.toLowerCase()} exposure is the primary vector, but secondary risk factors compound the damage. The Enterprise tier deploys: (1) immediate crisis stabilization for the most damaging SERP and review signals, (2) aggressive content strategy to displace negative results, (3) review recovery program with structured response protocols, (4) ongoing monitoring with real-time alert systems, and (5) competitive benchmarking to track market position recovery. The 180-day horizon reflects the depth of intervention required.`;
  }

  return { tier, reason, priority, horizon };
}

function generateExecutiveSummary(input: AuditInput, score: number, cat: RiskCategory, vol: VolatilityLevel, bench: typeof industryBenchmarks['Legal'], terms: typeof industryTerms['Legal'], intakeLoss: AuditResult['intakeLoss']): string {
  const lines: string[] = [];
  lines.push(`${input.companyName} (${input.industry}, ${input.location}) presents a branded risk score of ${score}/100, classified as ${cat} risk.`);

  if (cat === 'High') {
    lines.push(`Multiple reputation signals indicate active ${terms.action} leakage requiring immediate intervention. The combination of ${input.avgRating < 4.0 ? 'below-threshold rating, ' : ''}${input.negativePress ? 'negative press presence, ' : ''}${input.totalReviews < bench.avgReviews * 0.5 ? 'critically low review volume, ' : ''}and ${input.googleRanking > 5 ? 'weak SERP positioning ' : 'existing risk factors '}creates a compounding effect on ${terms.client} trust.`);
  } else if (cat === 'Medium') {
    lines.push(`Moderate reputation gaps constrain ${terms.action} potential and competitive positioning in the ${input.industry.toLowerCase()} market. While no single factor is critical, the cumulative effect of ${input.avgRating < bench.avgRating ? 'below-benchmark rating' : 'current gaps'}${input.totalReviews < bench.avgReviews ? ', insufficient review volume' : ''} and ${input.googleRanking > 3 ? 'suboptimal SERP positioning' : 'identified factors'} creates measurable conversion friction.`);
  } else {
    lines.push(`The overall reputation profile is stable with no critical exposure points. ${input.companyName} maintains an adequate competitive position in the ${input.industry.toLowerCase()} market, with opportunities for growth through review velocity acceleration and content authority building.`);
  }

  if (vol === 'High') {
    lines.push(`Review volatility is high — with ${input.totalReviews} reviews and ${input.negativePercent}% negative density, the current rating is susceptible to rapid shifts from even a small number of new negative reviews.`);
  } else if (vol === 'Moderate') {
    lines.push(`Review volatility is moderate — the current ${terms.action} signal is stable but not resilient to sudden sentiment changes.`);
  }

  if (intakeLoss) {
    lines.push(`Based on provided financial data, estimated monthly revenue leakage attributable to reputation factors is $${intakeLoss.monthlyLeakage.toLocaleString()} (${intakeLoss.percent}% of current ${terms.action} revenue).`);
  }

  return lines.join(' ');
}

function generateORM(cat: RiskCategory, input: AuditInput, bench: typeof industryBenchmarks['Legal'], terms: typeof industryTerms['Legal']) {
  const quickWins: string[] = [];
  const midTerm: string[] = [];
  const longTerm: string[] = [];

  // Quick Wins — specific, actionable
  if (input.avgRating < 4.2) {
    quickWins.push(`Implement post-${terms.action} review request workflow — target ${Math.ceil(input.totalReviews * 0.3)} new positive reviews in 30 days to move rating toward ${bench.avgRating}`);
  }
  if (input.negativePercent > 15) {
    quickWins.push(`Develop empathy-first response templates for all ${Math.round(input.totalReviews * input.negativePercent / 100)} existing negative reviews — response rate should target 100% within 48 hours`);
  } else if (input.negativePercent > 5) {
    quickWins.push(`Respond to all unanswered negative reviews with resolution-focused messaging — aim for 100% response rate within 48 hours`);
  }
  if (input.totalReviews < bench.avgReviews) {
    quickWins.push(`Launch structured review generation campaign targeting satisfied ${terms.client}s — current volume of ${input.totalReviews} needs to reach ${bench.avgReviews} (${input.industry} benchmark) for competitive social proof`);
  }
  quickWins.push(`Audit and optimize Google Business Profile: complete all fields, add ${terms.action}-relevant categories, update photos (recommended: 25+ images), verify hours and service descriptions`);
  quickWins.push(`Claim and optimize profiles on top 3 ${input.industry.toLowerCase()} directories and review platforms relevant to ${input.location}`);

  // Mid-term — growth
  if (input.negativePress) {
    midTerm.push(`Create and publish 6–10 authoritative content pieces targeting branded keywords to displace negative press from page 1 SERP positions`);
    midTerm.push(`Secure 3–5 earned media placements or industry mentions to build positive SERP footprint`);
  }
  if (input.googleRanking > 3) {
    midTerm.push(`Build branded content assets: publish 2 case studies, 3 ${terms.client} success stories, and 4 thought leadership articles targeting branded search queries`);
  }
  midTerm.push(`Establish automated review monitoring system with alerts for negative reviews (< 3 stars) and weekly sentiment reports`);
  if (input.glassdoor !== 'none') {
    midTerm.push(`Address employer brand: develop Glassdoor engagement strategy — encourage internal reviews, respond to existing feedback, update employer profile content`);
  }
  if (input.totalReviews < bench.avgReviews) {
    midTerm.push(`Scale review acquisition to ${Math.round(bench.avgReviews * 0.8)} reviews — implement CRM-triggered review requests at key ${terms.action} milestones`);
  }
  midTerm.push(`Develop FAQ and knowledge content targeting long-tail branded queries to control page 1–2 SERP composition`);

  // Long-term — authority
  longTerm.push(`Build sustained content authority: publish 2–4 pieces monthly targeting ${input.industry.toLowerCase()}-specific topics that reinforce ${input.companyName}'s expertise`);
  longTerm.push(`Develop proprietary review funnel integrated with CRM — automate ${terms.action}-to-review pipeline with timing optimization`);
  if (cat === 'High') {
    longTerm.push(`Implement crisis response protocol: define escalation matrix, pre-approve response templates, establish real-time sentiment monitoring dashboard`);
  }
  longTerm.push(`Establish quarterly competitive reputation benchmarking: track rating, volume, SERP position, and sentiment trends against top 5 ${input.location} competitors`);
  longTerm.push(`Build review-driven conversion optimization: A/B test review widget placement, testimonial formats, and trust badge positioning on key ${terms.action} pages`);

  return { quickWins, midTerm, longTerm };
}

function generateRoadmap(cat: RiskCategory, input: AuditInput, bench: typeof industryBenchmarks['Legal'], terms: typeof industryTerms['Legal']) {
  const phase1: string[] = [];
  const phase2: string[] = [];
  const phase3: string[] = [];

  // Phase 1 — Stabilization (0–30 days)
  phase1.push(`Complete Google Business Profile optimization — target 100% profile completeness score`);
  if (input.avgRating < 4.2) phase1.push(`Activate review generation workflow — target ${Math.max(10, Math.ceil(input.totalReviews * 0.2))} new reviews in first 30 days`);
  if (input.negativePress) phase1.push(`Initiate content suppression strategy: publish 3–4 high-authority pages targeting negative branded keywords`);
  phase1.push(`Set up review monitoring with real-time negative review alerts (< 3 stars)`);
  phase1.push(`Respond to 100% of existing unanswered reviews — prioritize negative reviews with resolution-oriented messaging`);
  phase1.push(`Audit top 10 branded SERP results and identify displacement opportunities for unowned or negative content`);

  // Phase 2 — Growth & Visibility (30–90 days)
  phase2.push(`Scale review acquisition to reach ${Math.round(bench.avgReviews * 0.7)} reviews — integrate review requests into ${terms.action} workflow`);
  phase2.push(`Publish 4–6 branded content pieces: case studies, ${terms.client} testimonials, and expertise articles for SERP control`);
  if (input.glassdoor !== 'none') phase2.push(`Execute Glassdoor improvement strategy — target 5+ new employer reviews and update company profile`);
  phase2.push(`Measure ${terms.action} conversion impact: establish baseline and track review-driven traffic and ${terms.action} rate changes`);
  phase2.push(`Optimize local SEO signals: build citations, ensure NAP consistency, and target Google Maps pack positioning`);
  if (input.negativePress) phase2.push(`Evaluate SERP displacement progress — adjust content strategy based on ranking movements of negative results`);

  // Phase 3 — Authority Reinforcement (90+ days)
  phase3.push(`Establish ongoing content authority cadence: 2–4 publications monthly targeting ${input.industry.toLowerCase()} expertise keywords`);
  phase3.push(`Implement competitive reputation tracking: monthly benchmarking against top 5 ${input.location} competitors`);
  phase3.push(`Refine and automate review funnel: optimize timing, channel, and messaging based on 60-day performance data`);
  if (cat === 'High') phase3.push(`Build crisis preparedness framework: documented protocols, pre-approved responses, and escalation procedures`);
  phase3.push(`Launch review-driven conversion optimization: integrate reviews and testimonials into key ${terms.action} touchpoints`);
  phase3.push(`Conduct quarterly reputation audit to track progress and recalibrate strategy against evolving ${input.industry.toLowerCase()} benchmarks`);

  return { phase1, phase2, phase3 };
}

export function generateMarkdown(input: AuditInput, result: AuditResult, mode: ProjectionMode): string {
  const terms = industryTerms[input.industry];
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
    md += `These gaps directly impact ${terms.action} predictability and create compounding conversion friction over time.\n\n`;
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
