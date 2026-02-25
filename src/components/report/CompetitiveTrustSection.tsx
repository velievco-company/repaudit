import { CompetitiveTrust, AppLanguage } from '@/lib/types';
import { t } from '@/lib/i18n';

interface Props { data: CompetitiveTrust; lang: AppLanguage; }

export default function CompetitiveTrustSection({ data, lang }: Props) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">{t(lang, 'section_competitive_trust')}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">{t(lang, 'comp_tier')}:</span>
        <span className="text-sm font-bold">{data.company_tier}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{data.summary}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2">{t(lang, 'comp_competitor')}</th>
            <th className="text-center py-2">{t(lang, 'comp_review_vol')}</th>
            <th className="text-center py-2">{t(lang, 'comp_authority')}</th>
            <th className="text-center py-2">{t(lang, 'comp_media')}</th>
            <th className="text-center py-2">{t(lang, 'comp_niche')}</th>
            <th className="text-center py-2">{t(lang, 'comp_tier_col')}</th>
          </tr></thead>
          <tbody>
            {data.scores.map((c, i) => (
              <tr key={i} className="border-b border-border/30">
                <td className="py-2 font-medium">{c.competitor}</td>
                <td className="py-2 text-center font-mono">{c.review_volume_ratio}x</td>
                <td className="py-2 text-center font-mono">{c.authority_score}/10</td>
                <td className="py-2 text-center font-mono">{c.media_mentions_score}/10</td>
                <td className="py-2 text-center font-mono">{c.clinical_authority_score}/10</td>
                <td className="py-2 text-center">{c.overall_tier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
