import { AuditResponse } from './types';

export function generateMarkdown(data: AuditResponse): string {
  const sep = '\n\n---\n\n';

  const scoreEmoji = data.overall_score >= 86 ? '🟢' : data.overall_score >= 66 ? '🟡' : data.overall_score >= 41 ? '🟠' : '🔴';

  const lines: string[] = [
    `# Reputation Audit: ${data.company}`,
    `> **Date:** ${data.data_date} | **Confidence:** ${data.confidence} | **Score:** ${scoreEmoji} ${data.overall_score}/100`,
    sep,

    `## Executive Summary`,
    `**${data.verdict}**`,
    ``,
    `${data.summary.main_activity}`,
    ``,
    `### Key Narratives`,
    data.summary.key_narratives.map(n => `- ${n}`).join('\n'),
    ``,
    `### Key Event of the Period`,
    `> ${data.summary.key_event}`,
    sep,

    `## Reputation Score: ${data.overall_score}/100`,
    `**Verdict:** ${data.verdict}`,
    sep,

    `## Sentiment Dynamics`,
    `| Month | Positive | Neutral | Negative | Event |`,
    `|---|---|---|---|---|`,
    ...data.sentiment_timeline.map(p =>
      `| ${p.month} | ${p.positive} | ${p.neutral} | ${p.negative} | ${p.event ?? '—'} |`
    ),
    sep,

    `## Source Analysis`,
    ...Object.entries(data.sources).map(([key, src]) => {
      const labels: Record<string, string> = {
        media: '📰 Media & News', reviews: '💬 Review Platforms',
        social: '📱 Social Networks', video: '🎥 YouTube / Video',
        employer: '💼 Employer Reputation', forums: '🔎 Forums & Communities',
      };
      return [
        `### ${labels[key] ?? key} — ${src.score}/10`,
        `**Sentiment:** ${src.sentiment} | **Mentions:** ${src.mention_count ?? '—'} | **Rating:** ${src.avg_rating ?? '—'}`,
        ``,
        src.summary,
        src.top_topics?.length ? `**Topics:** ${src.top_topics.join(', ')}` : '',
      ].filter(Boolean).join('\n');
    }),
    sep,

    `## ⚖️ Legal & Regulatory Footprint`,
    `**Risk Level:** ${data.legal.risk_level.toUpperCase()}`,
    ``,
    data.legal.summary,
    ``,
    `**Lawsuits:** ${data.legal.lawsuits.length ? data.legal.lawsuits.map(l => `\n- ${l}`).join('') : 'None found'}`,
    `**Fines:** ${data.legal.fines.length ? data.legal.fines.map(f => `\n- ${f}`).join('') : 'None found'}`,
    `**Complaints:** ${data.legal.complaints.length ? data.legal.complaints.map(c => `\n- ${c}`).join('') : 'None found'}`,
    sep,

    `## 👤 Top Management Reputation`,
    data.management.summary,
    ``,
    ...data.management.persons.map(p =>
      `**${p.name}** (${p.role}) — ${p.sentiment}\n${p.summary}`
    ),
    sep,

    `## 📊 Competitive Context (Share of Voice)`,
    data.competitors.summary,
    ``,
    `| Competitor | Mentions | Sentiment Score |`,
    `|---|---|---|`,
    ...data.competitors.data.map(c => `| ${c.name} | ${c.mentions} | ${c.sentiment_score} |`),
    sep,

    `## Flags`,
    `### 🔴 Red Flags`,
    data.red_flags.length
      ? data.red_flags.map(f => `- [${f.severity ?? 'info'}] ${f.text}`).join('\n')
      : '— None found',
    ``,
    `### 🟢 Green Flags`,
    data.green_flags.length
      ? data.green_flags.map(f => `- ${f.text}`).join('\n')
      : '— None found',
    sep,

    `## 🌍 ESG & Ethical Risks`,
    `**Overall:** ${data.esg.overall}`,
    ``,
    data.esg.summary,
    ``,
    `| Category | Assessment |`,
    `|---|---|`,
    `| Ecology | ${data.esg.ecology} |`,
    `| Labour Conditions | ${data.esg.labor} |`,
    `| Data Privacy | ${data.esg.data_privacy} |`,
    sep,

    `## 📋 Recommendations`,
    `### 🔴 Urgent — Fix immediately`,
    data.recommendations.urgent.map(r => `- ${r}`).join('\n') || '— None',
    ``,
    `### 🟡 Mid-term — 3–6 months`,
    data.recommendations.mid_term.map(r => `- ${r}`).join('\n') || '— None',
    ``,
    `### 🟢 Long-term — Strategic directions`,
    data.recommendations.long_term.map(r => `- ${r}`).join('\n') || '— None',
    sep,

    `## 🔎 Negative Exposure Mapping`,
    `> Total critical signals: **${data.negative_exposure?.total_critical ?? 0}**`,
    ``,
    data.negative_exposure?.summary ?? '',
    ``,
    `| Source | Type | Severity | Visibility | Action | Summary |`,
    `|---|---|---|---|---|---|`,
    ...(data.negative_exposure?.items ?? []).map(i =>
      `| ${i.source} | ${i.type} | ${i.severity} | ${i.visibility} | ${i.action} | ${i.summary} |`
    ),
    sep,

    `## 🛡️ Trust Signal Audit`,
    `**Trust Score:** ${data.trust_signals?.score ?? '—'}/10`,
    ``,
    data.trust_signals?.summary ?? '',
    ``,
    `| Signal | Status | Impact | Note |`,
    `|---|---|---|---|`,
    ...(data.trust_signals?.items ?? []).map(i =>
      `| ${i.name} | ${i.status} | ${i.impact} | ${i.note ?? '—'} |`
    ),
    sep,

    `## 📉 Intake Funnel Friction Analysis`,
    `**Total estimated acquisition loss:** ${data.funnel_analysis?.total_estimated_loss_pct ?? 0}%`,
    ``,
    data.funnel_analysis?.summary ?? '',
    ``,
    `| Step | Risk / Friction | Drop-off | Note |`,
    `|---|---|---|---|`,
    ...(data.funnel_analysis?.steps ?? []).map(s =>
      `| ${s.step} | ${s.risk} | −${s.drop_off_pct}% | ${s.note ?? '—'} |`
    ),
    sep,

    `## 🧠 Sentiment Heatmap`,
    `| Theme | Positive | Neutral | Negative | Risk |`,
    `|---|---|---|---|---|`,
    ...(data.sentiment_heatmap ?? []).map(r =>
      `| ${r.theme} | ${r.positive_pct}% | ${r.neutral_pct}% | ${r.negative_pct}% | ${r.risk} |`
    ),
    sep,

    `## 💰 LTV-Based Revenue Impact`,
    `| Metric | Value |`,
    `|---|---|`,
    `| LTV | $${data.ltv_roi_model?.ltv ?? '—'} |`,
    `| CAC | $${data.ltv_roi_model?.cac ?? '—'} |`,
    `| Retention Rate | ${data.ltv_roi_model?.retention_rate ?? '—'}% |`,
    `| Churn from reviews | ${data.ltv_roi_model?.churn_from_reviews_pct ?? '—'}% |`,
    ``,
    `### 🔴 Estimated Annual Revenue Loss`,
    `**$${data.ltv_roi_model?.estimated_annual_loss_min?.toLocaleString() ?? '—'} – $${data.ltv_roi_model?.estimated_annual_loss_max?.toLocaleString() ?? '—'}**`,
    ``,
    data.ltv_roi_model?.loss_explanation ?? '',
    sep,

    `## 🧩 Competitive Trust Gap`,
    `**Company Tier: ${data.competitive_trust?.company_tier ?? '—'}**`,
    ``,
    data.competitive_trust?.summary ?? '',
    ``,
    `| Competitor | Review Vol. | Authority | Media | Niche Auth. | Tier |`,
    `|---|---|---|---|---|---|`,
    ...(data.competitive_trust?.scores ?? []).map(c =>
      `| ${c.competitor} | ${c.review_volume_ratio}x | ${c.authority_score}/10 | ${c.media_mentions_score}/10 | ${c.clinical_authority_score}/10 | ${c.overall_tier} |`
    ),
    sep,

    `## 🎯 Priority Matrix`,
    `| Action | Impact | Effort | Priority | Category |`,
    `|---|---|---|---|---|`,
    ...(data.priority_matrix ?? []).map(p =>
      `| ${p.action} | ${p.impact} | ${p.effort} | ${p.priority} | ${p.category ?? '—'} |`
    ),
    sep,

    `## 📈 Reputation Trajectory Forecast`,
    `| Period | Without action | Optimised |`,
    `|---|---|---|`,
    `| Now | ${data.trajectory?.current_rating ?? '—'} | ${data.trajectory?.current_rating ?? '—'} |`,
    `| +6 months | ${data.trajectory?.unmanaged_6mo ?? '—'} | ${data.trajectory?.optimised_6mo ?? '—'} |`,
    `| +12 months | ${data.trajectory?.unmanaged_12mo ?? '—'} | ${data.trajectory?.optimised_12mo ?? '—'} |`,
    ``,
    `### Key Assumptions`,
    ...(data.trajectory?.key_assumptions ?? []).map(a => `- ${a}`),
    sep,

    `---`,
    `*Report generated by RepAudit | ${data.data_date}*`,
  ];

  return lines.join('\n');
}

export function copyMarkdownToClipboard(data: AuditResponse): Promise<void> {
  const md = generateMarkdown(data);
  return navigator.clipboard.writeText(md);
}

export function downloadMarkdown(data: AuditResponse): void {
  const md = generateMarkdown(data);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.company.replace(/\s+/g, '-')}-audit.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
