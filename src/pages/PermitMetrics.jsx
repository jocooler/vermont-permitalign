import { useState } from "react";
import { BarChart2, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

// ── Static placeholder data representing the metrics ──────────────────────────
const SECTIONS = [
  {
    id: "input",
    label: "Input Measures",
    color: "bg-blue-700",
    border: "border-blue-600",
    headerBg: "bg-blue-50",
    groups: [
      {
        dimension: "Quantity",
        icon: BarChart2,
        iconColor: "text-blue-600",
        metrics: [
          { label: "Number of applications received", value: "—", trend: null },
          { label: "Applications received – Multi-family", value: "—", trend: null },
          { label: "Applications received – Mobile home", value: "—", trend: null },
          { label: "Applications received – Shelter", value: "—", trend: null },
          { label: "Applications received – Mixed-use", value: "—", trend: null },
          { label: "Applications received – ADU", value: "—", trend: null },
          { label: "Number in queue awaiting review", value: "—", trend: null },
          { label: "Number of pre-application meetings offered", value: "—", trend: null },
          { label: "Number of pre-application meetings accepted", value: "—", trend: null },
          { label: "Number of projects in flight", value: "—", trend: null },
          { label: "Number of projects requiring outside consultants", value: "—", trend: null },
          { label: "Number of pre-application meetings (future MDT intake)", value: "—", trend: null },
        ],
      },
      {
        dimension: "Quality",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        metrics: [
          { label: "First Pass Yield (% applications accepted on first submission)", value: "—", trend: null },
          { label: "% of projects using common intake system", value: "—", trend: null },
          { label: "% of projects requiring outside consultants", value: "—", trend: null },
          { label: "% of projects participating in pre-application meetings", value: "—", trend: null },
          { label: "Number of resubmittals per application", value: "—", trend: null },
          { label: "% of non-viable projects identified during pre-application screening", value: "—", trend: null },
          { label: "% of projects improved through pre-application feedback", value: "—", trend: null },
          { label: "Number of incomplete letters", value: "—", trend: null },
          { label: "Dated revisions", value: "—", trend: null },
        ],
      },
      {
        dimension: "Time",
        icon: Clock,
        iconColor: "text-amber-600",
        metrics: [
          { label: "Average time required to complete/submit an application", value: "—", trend: null },
          { label: "Time required to provide information for subsequent review", value: "—", trend: null },
          { label: "Average time required to participate in pre-application meeting", value: "—", trend: null },
          { label: "% of applicants receiving an estimated timeline at intake", value: "—", trend: null },
        ],
      },
      {
        dimension: "Cost",
        icon: DollarSign,
        iconColor: "text-purple-600",
        metrics: [
          { label: "Permit application fee", value: "—", trend: null },
          { label: "Application development cost", value: "—", trend: null },
          { label: "Total estimated construction cost at submission", value: "—", trend: null },
          { label: "Permit fees as % of project cost", value: "—", trend: null },
        ],
      },
    ],
  },
  {
    id: "process",
    label: "Process Measures",
    color: "bg-amber-600",
    border: "border-amber-500",
    headerBg: "bg-amber-50",
    groups: [
      {
        dimension: "Quantity",
        icon: BarChart2,
        iconColor: "text-blue-600",
        metrics: [
          { label: "Number of applications prioritized", value: "—", trend: null },
          { label: "Number of applications deemed complete", value: "—", trend: null },
          { label: "Number of applications deemed incomplete", value: "—", trend: null },
          { label: "Average number of revision requests per application", value: "—", trend: null },
          { label: "Number of projects prioritized", value: "—", trend: null },
          { label: "Number of concurrent permits processed", value: "—", trend: null },
          { label: "Number of educational opportunities offered", value: "—", trend: null },
          { label: "Number of attendees of education opportunities", value: "—", trend: null },
          { label: "Number of complaints received", value: "—", trend: null },
          { label: "Share of eligible projects managed by MDT (10+ units)", value: "—", trend: null },
          { label: "Share of MDT projects in priority counties", value: "—", trend: null },
        ],
      },
      {
        dimension: "Quality",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        metrics: [
          { label: "% of applications prioritized", value: "—", trend: null },
          { label: "% of applications deemed complete/incomplete", value: "—", trend: null },
          { label: "Applications received vs. permits issued ratio", value: "—", trend: null },
          { label: "Staff to permit ratio", value: "—", trend: null },
        ],
      },
      {
        dimension: "Time",
        icon: Clock,
        iconColor: "text-amber-600",
        metrics: [
          { label: "Total time per review step", value: "—", trend: null },
          { label: "Average days of discretionary review period", value: "—", trend: null },
          { label: "% of permits issued within 60 days post-hearing", value: "—", trend: null },
          { label: "Average days from application complete to decision", value: "—", trend: null },
          { label: "Average days to determine application completeness", value: "—", trend: null },
          { label: "Average days of weather related delay", value: "—", trend: null },
          { label: "Average days of customer-caused delay", value: "—", trend: null },
          { label: "Average days of external agency caused delay", value: "—", trend: null },
          { label: "Average days to review after last evidence received", value: "—", trend: null },
          { label: "Average days to issue decision after deliberations", value: "—", trend: null },
          { label: "Average days to issue notice of application", value: "—", trend: null },
          { label: "Average days to issue recess order following hearing", value: "—", trend: null },
        ],
      },
    ],
  },
  {
    id: "output",
    label: "Output Measures",
    color: "bg-green-700",
    border: "border-green-600",
    headerBg: "bg-green-50",
    groups: [
      {
        dimension: "Quantity",
        icon: BarChart2,
        iconColor: "text-blue-600",
        metrics: [
          { label: "Number of permits issued", value: "—", trend: null },
          { label: "Number of permits issued under expedited procedures", value: "—", trend: null },
          { label: "Backlog reduction of pending applications", value: "—", trend: null },
          { label: "Number of appeals", value: "—", trend: null },
          { label: "Number of withdrawals", value: "—", trend: null },
          { label: "Number approved on appeal", value: "—", trend: null },
          { label: "Number of projects stopped due to lost financing", value: "—", trend: null },
          { label: "Number of refunds issued", value: "—", trend: null },
        ],
      },
      {
        dimension: "Quality",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        metrics: [
          { label: "% of programs with expected processing times posted publicly", value: "—", trend: null },
          { label: "% of decisions overturned/upheld on appeal", value: "—", trend: null },
          { label: "% reconsideration requested", value: "—", trend: null },
          { label: "% of decisions appealed", value: "—", trend: null },
          { label: "Survey response rate", value: "—", trend: null },
          { label: "Applicant satisfaction (timeliness, clarity, ease of MDT process)", value: "—", trend: null },
          { label: "Customer satisfaction (overall)", value: "—", trend: null },
          { label: "Staff satisfaction (workload, coordination, usability)", value: "—", trend: null },
          { label: "Satisfaction with educational opportunities", value: "—", trend: null },
          { label: "Satisfaction with intake process", value: "—", trend: null },
        ],
      },
      {
        dimension: "Time",
        icon: Clock,
        iconColor: "text-amber-600",
        metrics: [
          { label: "Average days from application receipt to decision", value: "—", trend: null },
          { label: "Average total permitting time by type", value: "—", trend: null },
          { label: "% of permits issued within expected processing time", value: "—", trend: null },
          { label: "% of permits completed within ±20% of expected processing time", value: "—", trend: null },
          { label: "Average permit handling time per permit", value: "—", trend: null },
          { label: "Average days from pre-application meeting to all permits received", value: "—", trend: null },
          { label: "% of projects meeting the estimated timeline (MDT process)", value: "—", trend: null },
          { label: "Average number of discretionary days in the permitting process", value: "—", trend: null },
        ],
      },
      {
        dimension: "Cost",
        icon: DollarSign,
        iconColor: "text-purple-600",
        metrics: [
          { label: "Development cost per unit", value: "—", trend: null },
          { label: "Amount of refunds issued", value: "—", trend: null },
          { label: "Post construction cost", value: "—", trend: null },
        ],
      },
    ],
  },
  {
    id: "results",
    label: "Results Measures",
    color: "bg-purple-700",
    border: "border-purple-600",
    headerBg: "bg-purple-50",
    groups: [
      {
        dimension: "Quantity",
        icon: BarChart2,
        iconColor: "text-blue-600",
        metrics: [
          { label: "New/rehabilitated housing units approved – by type & affordability", value: "—", trend: null },
          { label: "Housing units built – by type and affordability", value: "—", trend: null },
          { label: "Number of permits avoided", value: "—", trend: null },
          { label: "Number of denied applications that could have been avoided through pre-application", value: "—", trend: null },
        ],
      },
      {
        dimension: "Quality",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        metrics: [
          { label: "% of projects abandoned due to permitting", value: "—", trend: null },
          { label: "Financing fall-out rate", value: "—", trend: null },
          { label: "% of projects completed after approval", value: "—", trend: null },
        ],
      },
      {
        dimension: "Time",
        icon: Clock,
        iconColor: "text-amber-600",
        metrics: [
          { label: "Average days from application to occupancy", value: "—", trend: null },
          { label: "Average days from permit to occupancy", value: "—", trend: null },
          { label: "Average reduction in total permitting time from baseline", value: "—", trend: null },
        ],
      },
      {
        dimension: "Cost",
        icon: DollarSign,
        iconColor: "text-purple-600",
        metrics: [
          { label: "Average cost reduction per housing project", value: "—", trend: null },
        ],
      },
    ],
  },
  {
    id: "indicators",
    label: "Indicators",
    color: "bg-slate-700",
    border: "border-slate-500",
    headerBg: "bg-slate-50",
    groups: [
      {
        dimension: "Quantity",
        icon: BarChart2,
        iconColor: "text-blue-600",
        metrics: [
          { label: "New housing units created statewide", value: "—", trend: null },
          { label: "Net change in housing stock", value: "—", trend: null },
          { label: "Permit application volume trend", value: "—", trend: null },
        ],
      },
      {
        dimension: "Quality",
        icon: CheckCircle2,
        iconColor: "text-emerald-600",
        metrics: [
          { label: "Share of units affordable to households ≤80% AMI", value: "—", trend: null },
          { label: "Housing units per 1,000 residents", value: "—", trend: null },
          { label: "Geographic distribution of new units", value: "—", trend: null },
        ],
      },
      {
        dimension: "Cost",
        icon: DollarSign,
        iconColor: "text-purple-600",
        metrics: [
          { label: "Median home price-to-income ratio", value: "—", trend: null },
        ],
      },
    ],
  },
];

const DIMENSION_COLORS = {
  Quantity: { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-800" },
  Quality: { bg: "bg-emerald-50", border: "border-emerald-200", label: "text-emerald-800" },
  Time: { bg: "bg-amber-50", border: "border-amber-200", label: "text-amber-800" },
  Cost: { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-800" },
};

function MetricRow({ metric }) {
  const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor = metric.trend === "up" ? "text-green-600" : metric.trend === "down" ? "text-red-500" : "text-slate-400";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-sm text-slate-700 leading-snug">{metric.label}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-slate-500 min-w-[2.5rem] text-right">{metric.value}</span>
        <TrendIcon size={14} className={trendColor} />
      </div>
    </div>
  );
}

function DimensionGroup({ group }) {
  const [open, setOpen] = useState(true);
  const c = DIMENSION_COLORS[group.dimension] || DIMENSION_COLORS.Quantity;
  const Icon = group.icon;
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className={group.iconColor} />
          <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{group.dimension}</span>
          <span className="text-xs text-slate-400 ml-1">({group.metrics.length})</span>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 bg-white">
          {group.metrics.map((m, i) => <MetricRow key={i} metric={m} />)}
        </div>
      )}
    </div>
  );
}

function SectionCard({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={`vt-card overflow-hidden border-l-4 ${section.border}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 ${section.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${section.color}`} />
          <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Georgia, serif" }}>{section.label}</h2>
          <span className="text-xs text-slate-400">
            ({section.groups.reduce((acc, g) => acc + g.metrics.length, 0)} metrics)
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="p-5 grid sm:grid-cols-2 gap-4">
          {section.groups.map((group, i) => (
            <DimensionGroup key={i} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PermitMetrics() {
  const totalMetrics = SECTIONS.reduce((acc, s) => acc + s.groups.reduce((a, g) => a + g.metrics.length, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="rounded-xl mb-8 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Vermont Permitting System</div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>Performance Metrics Dashboard</h1>
        <p className="text-sm text-green-200 opacity-80">Comprehensive tracking across Input, Process, Output, and Results measures</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {SECTIONS.map(s => (
            <div key={s.id} className="bg-white/10 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold text-white">{s.groups.reduce((a, g) => a + g.metrics.length, 0)}</div>
              <div className="text-xs text-green-200">{s.label}</div>
            </div>
          ))}
          <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-white">{totalMetrics}</div>
            <div className="text-xs text-green-200">Total Metrics</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(DIMENSION_COLORS).map(([dim, c]) => (
          <div key={dim} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${c.bg} ${c.border}`}>
            <div className={`w-2 h-2 rounded-full ${c.bg.replace("bg-", "bg-").replace("-50", "-400")}`} />
            <span className={`text-xs font-semibold ${c.label}`}>{dim}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-500">
          <Minus size={12} /> = Data not yet collected
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <p className="text-xs text-center text-slate-400 mt-8">All values shown as "—" indicate metrics pending data collection and integration. This framework supports future data connections.</p>
    </div>
  );
}