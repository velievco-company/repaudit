import { AuditResponse } from './types';
import { generateMarkdown } from './export-markdown';

/**
 * PDF Export — uses jsPDF (install: npm i jspdf)
 * Renders the markdown report as a clean PDF with RepAudit branding.
 */
export async function exportToPDF(data: AuditResponse): Promise<void> {
  // Dynamic import so jsPDF is only loaded when needed
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage();
    y = margin;
    addHeader();
  };

  const checkY = (needed: number) => {
    if (y + needed > pageH - margin - 8) newPage();
  };

  const addHeader = () => {
    doc.setFontSize(7);
    doc.setTextColor(100, 120, 150);
    doc.text(
      `RepAudit  |  ${data.company}  |  ${data.data_date}`,
      pageW / 2, 8, { align: 'center' }
    );
    doc.setDrawColor(40, 60, 100);
    doc.setLineWidth(0.2);
    doc.line(margin, 10, pageW - margin, 10);
    y = Math.max(y, 14);
  };

  const addFooter = (pageNum: number, total: number) => {
    doc.setFontSize(7);
    doc.setTextColor(100, 120, 150);
    doc.text(`${pageNum} / ${total}`, pageW - margin, pageH - 6, { align: 'right' });
  };

  const h1 = (text: string) => {
    checkY(14);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(230, 235, 245);
    doc.text(text, margin, y);
    y += 10;
  };

  const h2 = (text: string) => {
    checkY(10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 126, 255);
    doc.text(text, margin, y);
    y += 7;
  };

  const h3 = (text: string) => {
    checkY(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 210, 230);
    doc.text(text, margin, y);
    y += 5;
  };

  const body = (text: string, indent = 0) => {
    if (!text) return;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(170, 185, 210);
    const lines = doc.splitTextToSize(text, contentW - indent);
    checkY(lines.length * 4.5 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4.5 + 2;
  };

  const bullet = (text: string) => body(`• ${text}`, 4);

  const divider = () => {
    checkY(4);
    doc.setDrawColor(30, 45, 80);
    doc.setLineWidth(0.15);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const scoreBlock = () => {
    const color = data.overall_score >= 86 ? [52, 211, 153] :
      data.overall_score >= 66 ? [74, 222, 128] :
      data.overall_score >= 41 ? [251, 191, 36] : [248, 113, 113];

    doc.setFillColor(10, 14, 26);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');

    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${data.overall_score}`, margin + 14, y + 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100, 120, 150);
    doc.text('/ 100', margin + 25, y + 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 230, 245);
    const vLines = doc.splitTextToSize(data.verdict, contentW - 50);
    doc.text(vLines, margin + 40, y + 10);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 120, 150);
    doc.text(`Confidence: ${data.confidence}  |  Data: ${data.data_date}`, margin + 40, y + 22);

    y += 33;
  };

  const simpleTable = (headers: string[], rows: string[][], colWidths?: number[]) => {
    const cols = colWidths ?? headers.map(() => contentW / headers.length);
    const rowH = 6;

    checkY(rowH + rows.length * rowH + 4);

    // Header row
    doc.setFillColor(20, 30, 55);
    doc.rect(margin, y, contentW, rowH, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(130, 160, 220);
    let x = margin + 2;
    headers.forEach((h, i) => {
      doc.text(h, x, y + 4.2);
      x += cols[i];
    });
    y += rowH;

    // Data rows
    rows.forEach((row, ri) => {
      if (y + rowH > pageH - margin - 8) newPage();
      doc.setFillColor(ri % 2 === 0 ? 14 : 18, ri % 2 === 0 ? 20 : 26, ri % 2 === 0 ? 38 : 48);
      doc.rect(margin, y, contentW, rowH, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(170, 185, 210);
      x = margin + 2;
      row.forEach((cell, i) => {
        const cellText = doc.splitTextToSize(String(cell ?? '—'), (cols[i] ?? 30) - 2);
        doc.text(cellText[0] ?? '', x, y + 4.2);
        x += cols[i];
      });
      y += rowH;
    });
    y += 3;
  };

  // ── DARK BACKGROUND ──────────────────────────────────────────────────────
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── PAGE 1: COVER ─────────────────────────────────────────────────────────
  addHeader();
  y = 30;

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(230, 235, 245);
  doc.text('Reputation Audit', pageW / 2, y, { align: 'center' });
  y += 12;

  doc.setFontSize(18);
  doc.setTextColor(45, 126, 255);
  doc.text(data.company, pageW / 2, y, { align: 'center' });
  y += 20;

  scoreBlock();
  divider();

  h2('Summary');
  body(data.summary.main_activity);
  y += 2;
  h3('Key Narratives');
  data.summary.key_narratives.forEach(n => bullet(n));
  y += 2;
  h3('Key Event');
  body(data.summary.key_event);

  // ── SOURCE ANALYSIS ───────────────────────────────────────────────────────
  newPage();
  h2('Source Analysis');
  const sourceKeys = ['media', 'reviews', 'social', 'video', 'employer', 'forums'] as const;
  const sourceLabels: Record<string, string> = {
    media: 'Media & News', reviews: 'Review Platforms', social: 'Social Networks',
    video: 'YouTube / Video', employer: 'Employer Reputation', forums: 'Forums & Communities',
  };
  simpleTable(
    ['Source', 'Score', 'Sentiment', 'Mentions', 'Summary'],
    sourceKeys.map(k => {
      const s = data.sources[k];
      return [sourceLabels[k], `${s.score}/10`, s.sentiment, String(s.mention_count ?? '—'), s.summary.slice(0, 60) + (s.summary.length > 60 ? '…' : '')];
    }),
    [38, 18, 22, 20, 72]
  );

  // ── LEGAL ──────────────────────────────────────────────────────────────────
  divider();
  h2('⚖️ Legal & Regulatory Footprint');
  body(`Risk Level: ${data.legal.risk_level.toUpperCase()}  |  ${data.legal.summary}`);
  if (data.legal.lawsuits.length) { h3('Lawsuits'); data.legal.lawsuits.forEach(l => bullet(l)); }
  if (data.legal.fines.length) { h3('Fines'); data.legal.fines.forEach(f => bullet(f)); }
  if (data.legal.complaints.length) { h3('Complaints'); data.legal.complaints.forEach(c => bullet(c)); }

  // ── MANAGEMENT ────────────────────────────────────────────────────────────
  divider();
  h2('👤 Top Management Reputation');
  body(data.management.summary);
  data.management.persons.forEach(p => {
    h3(`${p.name} — ${p.role}`);
    body(p.summary, 4);
  });

  // ── COMPETITORS ───────────────────────────────────────────────────────────
  newPage();
  h2('📊 Competitive Context');
  body(data.competitors.summary);
  if (data.competitors.data.length) {
    simpleTable(
      ['Competitor', 'Mentions', 'Sentiment Score'],
      data.competitors.data.map(c => [c.name, String(c.mentions), String(c.sentiment_score)]),
      [80, 40, 50]
    );
  }

  // ── FLAGS ─────────────────────────────────────────────────────────────────
  divider();
  h2('🔴 Red Flags / 🟢 Green Flags');
  if (data.red_flags.length) { h3('Red Flags'); data.red_flags.forEach(f => bullet(`[${f.severity ?? 'info'}] ${f.text}`)); }
  if (data.green_flags.length) { h3('Green Flags'); data.green_flags.forEach(f => bullet(f.text)); }

  // (ESG removed)

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  newPage();
  h2('📋 Recommendations');
  h3('🔴 Urgent — Fix immediately');
  data.recommendations.urgent.forEach(r => bullet(r));
  h3('🟡 Mid-term — 3–6 months');
  data.recommendations.mid_term.forEach(r => bullet(r));
  h3('🟢 Long-term — Strategic');
  data.recommendations.long_term.forEach(r => bullet(r));

  // ── NEGATIVE EXPOSURE ─────────────────────────────────────────────────────
  if (data.negative_exposure?.items?.length) {
    newPage();
    h2('🔎 Negative Exposure Mapping');
    body(`Critical signals: ${data.negative_exposure.total_critical}  |  ${data.negative_exposure.summary}`);
    simpleTable(
      ['Source', 'Type', 'Severity', 'Visibility', 'Action', 'Summary'],
      data.negative_exposure.items.map(i => [i.source, i.type, i.severity, i.visibility, i.action, i.summary.slice(0, 45)]),
      [25, 22, 20, 20, 20, 63]
    );
  }

  // ── TRUST SIGNALS ─────────────────────────────────────────────────────────
  if (data.trust_signals?.items?.length) {
    divider();
    h2(`🛡️ Trust Signal Audit — Score: ${data.trust_signals.score}/10`);
    body(data.trust_signals.summary);
    simpleTable(
      ['Signal', 'Status', 'Impact', 'Note'],
      data.trust_signals.items.map(i => [i.name, i.status, i.impact, i.note ?? '—']),
      [60, 25, 25, 60]
    );
  }

  // ── FUNNEL ────────────────────────────────────────────────────────────────
  if (data.funnel_analysis?.steps?.length) {
    newPage();
    h2(`📉 Intake Funnel Friction — Total loss: ${data.funnel_analysis.total_estimated_loss_pct}%`);
    body(data.funnel_analysis.summary);
    simpleTable(
      ['Step', 'Risk / Friction', 'Drop-off', 'Note'],
      data.funnel_analysis.steps.map(s => [s.step, s.risk, `−${s.drop_off_pct}%`, s.note ?? '—']),
      [45, 55, 20, 50]
    );
  }

  // ── HEATMAP ───────────────────────────────────────────────────────────────
  if (data.sentiment_heatmap?.length) {
    divider();
    h2('🧠 Sentiment Heatmap');
    simpleTable(
      ['Theme', 'Positive', 'Neutral', 'Negative', 'Risk'],
      data.sentiment_heatmap.map(r => [r.theme, `${r.positive_pct}%`, `${r.neutral_pct}%`, `${r.negative_pct}%`, r.risk]),
      [50, 28, 28, 28, 36]
    );
  }

  // ── LTV ───────────────────────────────────────────────────────────────────
  if (data.ltv_roi_model) {
    newPage();
    h2('💰 LTV-Based Revenue Impact');
    const m = data.ltv_roi_model;
    simpleTable(
      ['Metric', 'Value'],
      [
        ['LTV', `$${m.ltv}`],
        ['CAC', `$${m.cac}`],
        ['Retention Rate', `${m.retention_rate}%`],
        ['Churn from reviews', `${m.churn_from_reviews_pct}%`],
        ['Est. Annual Loss', `$${m.estimated_annual_loss_min.toLocaleString()} – $${m.estimated_annual_loss_max.toLocaleString()}`],
      ],
      [60, 110]
    );
    y += 2;
    body(m.loss_explanation);
  }

  // ── COMPETITIVE TRUST ─────────────────────────────────────────────────────
  if (data.competitive_trust?.scores?.length) {
    divider();
    h2(`🧩 Competitive Trust Gap — Tier: ${data.competitive_trust.company_tier}`);
    body(data.competitive_trust.summary);
    simpleTable(
      ['Competitor', 'Review Vol.', 'Authority', 'Media', 'Niche', 'Tier'],
      data.competitive_trust.scores.map(c => [
        c.competitor, `${c.review_volume_ratio}x`, `${c.authority_score}/10`,
        `${c.media_mentions_score}/10`, `${c.clinical_authority_score}/10`, c.overall_tier,
      ]),
      [40, 25, 22, 18, 18, 47]
    );
  }

  // ── PRIORITY MATRIX ───────────────────────────────────────────────────────
  if (data.priority_matrix?.length) {
    newPage();
    h2('🎯 Priority Matrix');
    simpleTable(
      ['Action', 'Impact', 'Effort', 'Priority', 'Category'],
      data.priority_matrix.map(p => [p.action, p.impact, p.effort, p.priority, p.category ?? '—']),
      [70, 20, 20, 22, 38]
    );
  }

  // ── TRAJECTORY ────────────────────────────────────────────────────────────
  if (data.trajectory) {
    divider();
    h2('📈 Reputation Trajectory Forecast');
    const tr = data.trajectory;
    simpleTable(
      ['Period', 'Without action', 'Optimised'],
      [
        ['Now', String(tr.current_rating), String(tr.current_rating)],
        ['+6 months', String(tr.unmanaged_6mo), String(tr.optimised_6mo)],
        ['+12 months', String(tr.unmanaged_12mo), String(tr.optimised_12mo)],
      ],
      [50, 50, 70]
    );
    if (tr.key_assumptions.length) {
      h3('Key Assumptions');
      tr.key_assumptions.forEach(a => bullet(a));
    }
  }

  // ── PAGE NUMBERS ──────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(10, 14, 26);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    addFooter(i, totalPages);
  }

  doc.save(`${data.company.replace(/\s+/g, '-')}-audit.pdf`);
}
