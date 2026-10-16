import { useState, useEffect, useRef } from 'react';
import { BarChart3, Users, Eye, RefreshCw, FileSpreadsheet, Download, AlertCircle, Globe } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { apiFetch } from '../../config/api';

const NAVY = '#132552';
const RUST = '#8e3400';
const BRAND_GRADIENT = `linear-gradient(135deg, ${NAVY} 0%, ${RUST} 100%)`;
// One colour per platform, in the order the backend lists them
const PLATFORM_COLORS = [NAVY, RUST, '#2f7d6d', '#c99a2e', '#6b5b95', '#5b7fa6'];

const formatNumber = (n) => Number(n || 0).toLocaleString('en-US');

const monthLabel = (month) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const shortMonth = (month) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: '2-digit', timeZone: 'UTC' });

const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
const countryName = (code) => {
  try {
    return (code && code.length === 2 && regionNames?.of(code)) || code;
  } catch {
    return code;
  }
};

// Percentage change vs the previous month, or null when there is nothing to compare
const change = (current, previous) => {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

function Change({ value }) {
  if (value === null || value === undefined) return <span className="text-xs text-gray-400">—</span>;
  const up = value >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(value)}%
    </span>
  );
}

function StatCard({ label, value, delta, icon }) {
  const Icon = icon;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-semibold tabular-nums text-gray-900">{value}</div>
      {delta !== undefined && <div className="mt-1"><Change value={delta} /> <span className="text-xs text-gray-400">vs previous month</span></div>}
    </div>
  );
}

// Ranked list with proportional bars
function BarList({ title, items, format = (name) => name }) {
  const max = Math.max(1, ...items.map(i => i.pageviews));
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data</p>
      ) : (
        <ul className="space-y-2">
          {items.map(item => (
            <li key={item.name} className="relative">
              <div className="absolute inset-y-0 left-0 rounded bg-[#132552]/10" style={{ width: `${(item.pageviews / max) * 100}%` }} />
              <div className="relative flex justify-between gap-3 px-2 py-1 text-sm">
                <span className="truncate text-gray-700" title={format(item.name)}>{format(item.name)}</span>
                <span className="tabular-nums text-gray-900 font-medium">{formatNumber(item.pageviews)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function DigitalAnalytics() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const reportRef = useRef(null);

  const load = async (month) => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, trendRes] = await Promise.all([
        apiFetch(`/api/analytics/overview${month ? `?month=${month}` : ''}`),
        apiFetch('/api/analytics/trend?months=12')
      ]);
      const overviewData = await overviewRes.json();
      const trendData = await trendRes.json();
      if (!overviewData.success) throw new Error(overviewData.message || 'Could not load analytics');
      setOverview(overviewData);
      setTrend(trendData.success ? trendData.rows : []);
      setSelectedProject(current =>
        overviewData.platforms.some(p => p.project === current) ? current : overviewData.platforms[0]?.project
      );
    } catch (err) {
      setError(err.message || 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const collectNow = async () => {
    setCollecting(true);
    setError('');
    try {
      const response = await apiFetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: overview?.month })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Collection failed');
      await load(overview?.month);
    } catch (err) {
      setError(err.message || 'Collection failed');
    } finally {
      setCollecting(false);
    }
  };

  const platforms = overview?.platforms || [];
  const reported = platforms.filter(p => p.report && !p.report.error);
  const totals = platforms.reduce((sum, p) => ({
    pageviews: sum.pageviews + (p.report?.pageviews || 0),
    visitors: sum.visitors + (p.report?.visitors || 0),
    prevPageviews: sum.prevPageviews + (p.previous?.pageviews || 0),
    prevVisitors: sum.prevVisitors + (p.previous?.visitors || 0)
  }), { pageviews: 0, visitors: 0, prevPageviews: 0, prevVisitors: 0 });
  const selected = platforms.find(p => p.project === selectedProject);
  const colorFor = (project) => PLATFORM_COLORS[Math.max(0, platforms.findIndex(p => p.project === project)) % PLATFORM_COLORS.length];

  // Trend: total page views per month, split by platform
  const trendMonths = [...new Set(trend.map(r => r.month))].sort();
  const trendMax = Math.max(1, ...trendMonths.map(m => trend.filter(r => r.month === m).reduce((s, r) => s + r.pageviews, 0)));

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const summary = platforms.map(p => ({
      Platform: p.label,
      Month: monthLabel(overview.month),
      'Page views': p.report?.pageviews || 0,
      Visitors: p.report?.visitors || 0,
      'Previous month page views': p.previous?.pageviews ?? '',
      'Change (%)': change(p.report?.pageviews || 0, p.previous?.pageviews) ?? '',
      Status: p.report?.error ? `Error: ${p.report.error}` : p.report ? (p.report.is_complete ? 'Complete' : 'In progress') : 'No data'
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Summary');

    const sheets = [
      ['Top pages', 'top_pages', 'Page'],
      ['Countries', 'countries', 'Country'],
      ['Referrers', 'referrers', 'Referrer'],
      ['Devices', 'devices', 'Device'],
      ['Browsers', 'browsers', 'Browser'],
      ['Operating systems', 'operating_systems', 'Operating system']
    ];
    for (const [sheetName, field, column] of sheets) {
      const rows = reported.flatMap(p => (p.report[field] || []).map(item => ({
        Platform: p.label,
        [column]: field === 'countries' ? countryName(item.name) : item.name,
        'Page views': item.pageviews,
        Visitors: item.visitors
      })));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName);
    }
    const daily = reported.flatMap(p => (p.report.daily || []).map(d => ({ Platform: p.label, Date: d.date, 'Page views': d.pageviews, Visitors: d.visitors })));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(daily), 'Daily');

    XLSX.writeFile(wb, `GoGMI_Digital_Analytics_${overview.month}.xlsx`);
  };

  const exportPdf = () => {
    html2pdf().set({
      margin: 10,
      filename: `GoGMI_Digital_Analytics_${overview.month}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css'] }
    }).from(reportRef.current).save();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Digital Analytics</h1>
            <p className="text-gray-500 mt-1">Monthly traffic across GoGMI websites on Vercel</p>
          </div>
          {overview && (
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={overview.month}
                onChange={(e) => load(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#132552]/15"
                aria-label="Report month"
              >
                {(overview.months.includes(overview.month) ? overview.months : [overview.month, ...overview.months]).map(m => (
                  <option key={m} value={m}>{monthLabel(m)}</option>
                ))}
              </select>
              <button
                onClick={collectNow}
                disabled={collecting || !overview.configured}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                title="Fetch the latest figures for this month from Vercel"
              >
                <RefreshCw className={`w-4 h-4 ${collecting ? 'animate-spin' : ''}`} />
                {collecting ? 'Collecting...' : 'Collect now'}
              </button>
              <button
                onClick={exportExcel}
                disabled={!platforms.some(p => p.report)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button
                onClick={exportPdf}
                disabled={!platforms.some(p => p.report)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50"
                style={{ background: BRAND_GRADIENT }}
              >
                <Download className="w-4 h-4" /> PDF report
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {overview && !overview.configured && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            Analytics collection is not set up yet. An administrator needs to add the
            <code className="mx-1 px-1 bg-amber-100 rounded">VERCEL_ANALYTICS_TOKEN</code>
            setting to the intranet backend on Vercel.
          </div>
        )}

        {loading && !overview ? (
          <div className="py-24 text-center text-sm text-gray-500">Loading analytics...</div>
        ) : overview && (
          <div ref={reportRef}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {monthLabel(overview.month)}
              {platforms.some(p => p.report && !p.report.error && !p.report.is_complete) && (
                <span className="ml-2 align-middle text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">In progress</span>
              )}
            </h2>

            {/* Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Page views (all platforms)" value={formatNumber(totals.pageviews)} delta={change(totals.pageviews, totals.prevPageviews)} icon={Eye} />
              <StatCard label="Visitors (all platforms)" value={formatNumber(totals.visitors)} delta={change(totals.visitors, totals.prevVisitors)} icon={Users} />
              <StatCard label="Platforms reporting" value={`${reported.length} of ${platforms.length}`} icon={Globe} />
            </div>

            {/* Platform comparison */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Platforms</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-6 py-3 text-left font-semibold">Platform</th>
                      <th className="px-6 py-3 text-right font-semibold">Page views</th>
                      <th className="px-6 py-3 text-right font-semibold">Visitors</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {platforms.map(p => (
                      <tr
                        key={p.project}
                        onClick={() => setSelectedProject(p.project)}
                        className={`cursor-pointer hover:bg-gray-50 ${p.project === selectedProject ? 'bg-gray-50' : ''}`}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: colorFor(p.project) }} />
                            <span className="font-medium text-gray-900">{p.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          {formatNumber(p.report?.pageviews)} <Change value={p.report ? change(p.report.pageviews, p.previous?.pageviews) : null} />
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums">
                          {formatNumber(p.report?.visitors)} <Change value={p.report ? change(p.report.visitors, p.previous?.visitors) : null} />
                        </td>
                        <td className="px-6 py-3">
                          {!p.report ? (
                            <span className="text-xs text-gray-400">No data yet</span>
                          ) : p.report.error ? (
                            <span className="text-xs text-red-600" title={p.report.error}>
                              {/not enabled/i.test(p.report.error) ? 'Web Analytics not enabled in Vercel' : 'Collection failed'}
                            </span>
                          ) : (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.report.is_complete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {p.report.is_complete ? 'Complete' : 'In progress'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 12-month trend */}
            {trendMonths.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8" style={{ breakInside: 'avoid' }}>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-gray-400" /> Page views by month</h3>
                  <div className="flex flex-wrap gap-3">
                    {platforms.map(p => (
                      <span key={p.project} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colorFor(p.project) }} /> {p.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-3 h-48">
                  {trendMonths.map(m => {
                    const rows = trend.filter(r => r.month === m);
                    const total = rows.reduce((s, r) => s + r.pageviews, 0);
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                        <span className="text-[10px] tabular-nums text-gray-500 mb-1">{formatNumber(total)}</span>
                        <div className="w-full max-w-[48px] flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${(total / trendMax) * 100}%` }} title={`${monthLabel(m)}: ${formatNumber(total)} page views`}>
                          {rows.map(r => (
                            <div key={r.project_name} style={{ height: `${total ? (r.pageviews / total) * 100 : 0}%`, background: colorFor(r.project_name) }} />
                          ))}
                        </div>
                        <span className={`text-[11px] mt-1.5 ${m === overview.month ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{shortMonth(m)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected platform detail */}
            {selected?.report && !selected.report.error && (
              <div style={{ breakInside: 'avoid' }}>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{selected.label}</h3>
                <p className="text-xs text-gray-500 mb-4">Select a platform in the table above to see its details.</p>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Daily page views</h4>
                  <div className="flex items-end gap-0.5 h-28">
                    {(() => {
                      const dayMax = Math.max(1, ...selected.report.daily.map(d => d.pageviews));
                      return selected.report.daily.map(d => (
                        <div key={d.date} className="flex-1 rounded-t" style={{ height: `${(d.pageviews / dayMax) * 100}%`, background: colorFor(selected.project), minHeight: d.pageviews ? 2 : 0 }} title={`${d.date}: ${formatNumber(d.pageviews)} page views, ${formatNumber(d.visitors)} visitors`} />
                      ));
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BarList title="Top pages" items={selected.report.top_pages} />
                  <BarList title="Countries" items={selected.report.countries} format={countryName} />
                  <BarList title="Referrers" items={selected.report.referrers} />
                  <BarList title="Devices" items={selected.report.devices} format={(n) => n.charAt(0).toUpperCase() + n.slice(1)} />
                  <BarList title="Browsers" items={selected.report.browsers} />
                  <BarList title="Operating systems" items={selected.report.operating_systems} />
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-8">
              Source: Vercel Web Analytics (production traffic only). Collected daily; a month is final once it has ended.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
