import { CompetitiveTrustScore, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props {
  trust: { scores: CompetitiveTrustScore[]; company_tier: string; summary: string };
  lang: AppLanguage;
}

function tierColor(tier: string) {
  if (tier.includes('1') || tier.toLowerCase().includes('leader')) return 'text-success border-success/40 bg-success/10';
  if (tier.includes('2') || tier.toLowerCase().includes('establish')) return 'text-warning border-warning/40 bg-warning/10';
  return 'text-muted-foreground border-border bg-secondary/30';
}

function scoreBar(val: number) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary/70 rounded-full" style={{ width: `${(val / 10) * 100}%` }} />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">{val}/10</span>
    </div>
  );
}

export default function CompetitiveTrustSection({ trust, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">{t(lang, 'section_competitive_trust')}</h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${tierColor(trust.company_tier)}`}>
          {trust.company_tier}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{trust.summary}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-secondary/40">
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_competitor')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_review_vol')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_authority')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_media')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_niche')}</th>
              <th className="text-left px-3 py-2 font-mono text-muted-foreground font-medium">{t(lang, 'comp_tier_col')}</th>
            </tr>
          </thead>
          <tbody>
            {trust.scores.map((c, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-background/30' : 'bg-secondary/20'}>
                <td className="px-3 py-2 font-medium">{c.competitor}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{c.review_volume_ratio}x</td>
                <td className="px-3 py-2">{scoreBar(c.authority_score)}</td>
                <td className="px-3 py-2">{scoreBar(c.media_mentions_score)}</td>
                <td className="px-3 py-2">{scoreBar(c.clinical_authority_score)}</td>
                <td className="px-3 py-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tierColor(c.overall_tier)}`}>
                    {c.overall_tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
