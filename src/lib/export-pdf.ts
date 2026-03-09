import { AuditResponse } from './types';

/**
 * PDF Export — clean white professional document
 */
export async function exportToPDF(data: AuditResponse): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Colors ──
  const C = {
    bg: [255, 255, 255] as [number, number, number],
    text: [30, 30, 30] as [number, number, number],
    heading: [15, 30, 60] as [number, number, number],
    accent: [59, 130, 246] as [number, number, number],
    muted: [120, 130, 150] as [number, number, number],
    divider: [220, 220, 220] as [number, number, number],
    tableHeader: [240, 242, 246] as [number, number, number],
    tableAlt: [248, 249, 252] as [number, number, number],
  };

  // ── Helpers ──
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
    doc.setTextColor(...C.muted);
    doc.text(
      `RepAudit  |  ${data.company}  |  ${data.data_date}`,
      pageW / 2, 8, { align: 'center' }
    );
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.2);
    doc.line(margin, 10, pageW - margin, 10);
    y = Math.max(y, 14);
  };

  const addFooter = (pageNum: number, total: number) => {
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(`${pageNum} / ${total}`, pageW - margin, pageH - 6, { align: 'right' });
  };

  const h1 = (text: string) => {
    checkY(14);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.heading);
    doc.text(text, margin, y);
    y += 10;
  };

  const h2 = (text: string) => {
    checkY(10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.accent);
    doc.text(text, margin, y);
    y += 7;
  };

  const h3 = (text: string) => {
    checkY(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.heading);
    doc.text(text, margin, y);
    y += 5;
  };

  const body = (text: string, indent = 0) => {
    if (!text) return;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.text);
    const lines = doc.splitTextToSize(text, contentW - indent);
    checkY(lines.length * 4.5 + 2);
    doc.text(lines, margin + indent, y);
    y += lines.length * 4.5 + 2;
  };

  const bullet = (text: string) => body(`• ${text}`, 4);

  const divider = () => {
    checkY(4);
    doc.setDrawColor(...C.divider);
    doc.setLineWidth(0.15);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const scoreBlock = () => {
    const score = data.overall_score ?? 0;

    doc.setFillColor(...C.heading);
    doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');

    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}`, margin + 14, y + 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(200, 210, 230);
    doc.text('/ 100', margin + 25, y + 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const vLines = doc.splitTextToSize(data.verdict ?? '', contentW - 50);
    doc.text(vLines, margin + 40, y + 10);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 230);
    doc.text(`Confidence: ${data.confidence ?? 'N/A'}  |  Data: ${data.data_date ?? ''}`, margin + 40, y + 22);

    y += 33;
  };

  const simpleTable = (headers: string[], rows: string[][], colWidths?: number[]) => {
    const cols = colWidths ?? headers.map(() => contentW / headers.length);
    const rowH = 6;

    checkY(rowH + rows.length * rowH + 4);

    // Header row
    doc.setFillColor(...C.tableHeader);
    doc.rect(margin, y, contentW, rowH, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.heading);
    let x = margin + 2;
    headers.forEach((h, i) => {
      doc.text(h, x, y + 4.2);
      x += cols[i];
    });
    y += rowH;

    // Data rows
    rows.forEach((row, ri) => {
      if (y + rowH > pageH - margin - 8) newPage();
      doc.setFillColor(...(ri % 2 === 0 ? C.bg : C.tableAlt));
      doc.rect(margin, y, contentW, rowH, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.text);
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

  // ── PAGE 1: COVER ─────────────────────────────────────────────────────────
  addHeader();
  y = 30;

  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.heading);
  doc.text('Reputation Audit', pageW / 2, y, { align: 'center' });
  y += 12;

  doc.setFontSize(18);
  doc.setTextColor(...C.accent);
  doc.text(data.company, pageW / 2, y, { align: 'center' });
  y += 20;

  scoreBlock();
  divider();

  h2('Summary');
  body(data.summary?.main_activity ?? '');
  y += 2;
  h3('Key Narratives');
  (data.summary?.key_narratives ?? []).forEach(n => bullet(n));
  y += 2;
  h3('Key Event');
  body(data.summary?.key_event ?? '');

  // ── SOURCE ANALYSIS ───────────────────────────────────────────────────────
  newPage();
  h2('Source Analysis');
  const sourceKeys = ['media', 'reviews', 'social', 'video', 'employer', 'forums'] as const;
  const sourceLabels: Record<string, string> = {
    media: 'Media & News', reviews: 'Review Platforms', social: 'Social Networks',
    video: 'YouTube / Video', employer: 'Employer Reputation', forums: 'Forums & Communities',
  };
  if (data.sources) {
    simpleTable(
      ['Source', 'Score', 'Sentiment', 'Mentions', 'Summary'],
      sourceKeys.map(k => {
        const s = data.sources?.[k];
        if (!s) return [sourceLabels[k], '—', '—', '—', '—'];
        return [sourceLabels[k], `${s.score}/10`, s.sentiment, String(s.mention_count ?? '—'), (s.summary ?? '').slice(0, 60) + ((s.summary?.length ?? 0) > 60 ? '…' : '')];
      }),
      [38, 18, 22, 20, 72]
    );
  }

  // ── LEGAL ──────────────────────────────────────────────────────────────────
  divider();
  h2('⚖️ Legal & Regulatory Footprint');
  body(`Risk Level: ${(data.legal?.risk_level ?? 'N/A').toUpperCase()}  |  ${data.legal?.summary ?? ''}`);
  if ((data.legal?.lawsuits?.length ?? 0) > 0) { h3('Lawsuits'); (data.legal?.lawsuits ?? []).forEach(l => bullet(l)); }
  if ((data.legal?.fines?.length ?? 0) > 0) { h3('Fines'); (data.legal?.fines ?? []).forEach(f => bullet(f)); }
  if ((data.legal?.complaints?.length ?? 0) > 0) { h3('Complaints'); (data.legal?.complaints ?? []).forEach(c => bullet(c)); }

  // ── MANAGEMENT ────────────────────────────────────────────────────────────
  divider();
  h2('👤 Top Management Reputation');
  body(data.management?.summary ?? '');
  (data.management?.persons ?? []).forEach(p => {
    h3(`${p.name} — ${p.role}`);
    body(p.summary, 4);
  });

  // ── COMPETITORS ───────────────────────────────────────────────────────────
  newPage();
  h2('📊 Competitive Context');
  body(data.competitors?.summary ?? '');
  if ((data.competitors?.data?.length ?? 0) > 0) {
    simpleTable(
      ['Competitor', 'Mentions', 'Sentiment Score'],
      (data.competitors?.data ?? []).map(c => [c.name, String(c.mentions ?? 0), String(c.sentiment_score ?? 0)]),
      [80, 40, 50]
    );
  }

  // ── FLAGS ─────────────────────────────────────────────────────────────────
  divider();
  h2('🔴 Red Flags / 🟢 Green Flags');
  if ((data.red_flags?.length ?? 0) > 0) { h3('Red Flags'); (data.red_flags ?? []).forEach(f => bullet(`[${f.severity ?? 'info'}] ${f.text}`)); }
  if ((data.green_flags?.length ?? 0) > 0) { h3('Green Flags'); (data.green_flags ?? []).forEach(f => bullet(f.text)); }

  // ── ESG ───────────────────────────────────────────────────────────────────
  divider();
  h2('🌍 ESG & Ethical Risks');
  body(`Overall: ${data.esg?.overall ?? 'N/A'}  |  ${data.esg?.summary ?? ''}`);
  if (data.esg) {
    simpleTable(
      ['Category', 'Assessment'],
      [['Ecology', data.esg.ecology ?? '—'], ['Labour', data.esg.labor ?? '—'], ['Data Privacy', data.esg.data_privacy ?? '—']],
      [40, 130]
    );
  }

  // ── RECOMMENDATIONS ───────────────────────────────────────────────────────
  newPage();
  h2('📋 Recommendations');
  h3('🔴 Urgent — Fix immediately');
  (data.recommendations?.urgent ?? []).forEach(r => bullet(r));
  h3('🟡 Mid-term — 3–6 months');
  (data.recommendations?.mid_term ?? []).forEach(r => bullet(r));
  h3('🟢 Long-term — Strategic');
  (data.recommendations?.long_term ?? []).forEach(r => bullet(r));

  // ── NEGATIVE EXPOSURE ─────────────────────────────────────────────────────
  if ((data.negative_exposure?.items?.length ?? 0) > 0) {
    newPage();
    h2('🔎 Negative Exposure Mapping');
    body(`Critical signals: ${data.negative_exposure?.total_critical ?? 0}  |  ${data.negative_exposure?.summary ?? ''}`);
    simpleTable(
      ['Source', 'Type', 'Severity', 'Visibility', 'Action', 'Summary'],
      (data.negative_exposure?.items ?? []).map(i => [i.source, i.type, i.severity, i.visibility, i.action, (i.summary ?? '').slice(0, 45)]),
      [25, 22, 20, 20, 20, 63]
    );
  }

  // ── TRUST SIGNALS ─────────────────────────────────────────────────────────
  if ((data.trust_signals?.items?.length ?? 0) > 0) {
    divider();
    h2(`🛡️ Trust Signal Audit — Score: ${data.trust_signals?.score ?? 0}/10`);
    body(data.trust_signals?.summary ?? '');
    simpleTable(
      ['Signal', 'Status', 'Impact', 'Note'],
      (data.trust_signals?.items ?? []).map(i => [i.name, i.status, i.impact, i.note ?? '—']),
      [60, 25, 25, 60]
    );
  }

  // ── FUNNEL ────────────────────────────────────────────────────────────────
  if ((data.funnel_analysis?.steps?.length ?? 0) > 0) {
    newPage();
    h2(`📉 Intake Funnel Friction — Total loss: ${data.funnel_analysis?.total_estimated_loss_pct ?? 0}%`);
    body(data.funnel_analysis?.summary ?? '');
    simpleTable(
      ['Step', 'Risk / Friction', 'Drop-off', 'Note'],
      (data.funnel_analysis?.steps ?? []).map(s => [s.step, s.risk, `−${s.drop_off_pct}%`, s.note ?? '—']),
      [45, 55, 20, 50]
    );
  }

  // ── HEATMAP ───────────────────────────────────────────────────────────────
  if ((data.sentiment_heatmap?.length ?? 0) > 0) {
    divider();
    h2('🧠 Sentiment Heatmap');
    simpleTable(
      ['Theme', 'Positive', 'Neutral', 'Negative', 'Risk'],
      (data.sentiment_heatmap ?? []).map(r => [r.theme, `${r.positive_pct}%`, `${r.neutral_pct}%`, `${r.negative_pct}%`, r.risk]),
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
        ['LTV', `$${m.ltv ?? 0}`],
        ['CAC', `$${m.cac ?? 0}`],
        ['Retention Rate', `${m.retention_rate ?? 0}%`],
        ['Churn from reviews', `${m.churn_from_reviews_pct ?? 0}%`],
        ['Est. Annual Loss', `$${(m.estimated_annual_loss_min ?? 0).toLocaleString()} – $${(m.estimated_annual_loss_max ?? 0).toLocaleString()}`],
      ],
      [60, 110]
    );
    y += 2;
    body(m.loss_explanation ?? '');
  }

  // ── COMPETITIVE TRUST ─────────────────────────────────────────────────────
  if ((data.competitive_trust?.scores?.length ?? 0) > 0) {
    divider();
    h2(`🧩 Competitive Trust Gap — Tier: ${data.competitive_trust?.company_tier ?? ''}`);
    body(data.competitive_trust?.summary ?? '');
    simpleTable(
      ['Competitor', 'Review Vol.', 'Authority', 'Media', 'Niche', 'Tier'],
      (data.competitive_trust?.scores ?? []).map(c => [
        c.competitor, `${c.review_volume_ratio}x`, `${c.authority_score}/10`,
        `${c.media_mentions_score}/10`, `${c.clinical_authority_score}/10`, c.overall_tier,
      ]),
      [40, 25, 22, 18, 18, 47]
    );
  }

  // ── PRIORITY MATRIX ───────────────────────────────────────────────────────
  if ((data.priority_matrix?.length ?? 0) > 0) {
    newPage();
    h2('🎯 Priority Matrix');
    simpleTable(
      ['Action', 'Impact', 'Effort', 'Priority', 'Category'],
      (data.priority_matrix ?? []).map(p => [p.action, p.impact, p.effort, p.priority, p.category ?? '—']),
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
        ['Now', String(tr.current_rating ?? 0), String(tr.current_rating ?? 0)],
        ['+6 months', String(tr.unmanaged_6mo ?? 0), String(tr.optimised_6mo ?? 0)],
        ['+12 months', String(tr.unmanaged_12mo ?? 0), String(tr.optimised_12mo ?? 0)],
      ],
      [50, 50, 70]
    );
    if ((tr.key_assumptions?.length ?? 0) > 0) {
      h3('Key Assumptions');
      (tr.key_assumptions ?? []).forEach(a => bullet(a));
    }
  }

  // ── PAGE NUMBERS ──────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  doc.save(`${data.company.replace(/\s+/g, '-')}-audit.pdf`);
}
