import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart2, Clock, DollarSign, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Build the sections dynamically given computed metrics
function buildSections(m) {
  return [
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
            { label: "Number of applications received (projects)", value: m.totalProjects },
            { label: "Applications received – Multi-family", value: m.multiFamily },
            { label: "Applications received – Mobile home", value: m.mobileHome },
            { label: "Applications received – Shelter / supportive housing", value: m.shelter },
            { label: "Applications received – Mixed-use", value: m.mixedUse },
            { label: "Applications received – ADU / small residential", value: m.adu },
            { label: "Number in queue awaiting review", value: m.inQueue },
            { label: "Number of projects in flight (active)", value: m.inFlight },
            { label: "Total permit applications across all projects", value: m.totalPermitApplications },
          ],
        },
        {
          dimension: "Quality",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          metrics: [
            { label: "First Pass Yield (% permits approved without info-request)", value: m.firstPassYield },
            { label: "% of applications with info requested by reviewer", value: m.pctInfoRequested },
            { label: "% of permits approved out of all decisions made", value: m.approvalRate },
            { label: "% of permits denied out of all decisions made", value: m.denialRate },
          ],
        },
        {
          dimension: "Time",
          icon: Clock,
          iconColor: "text-amber-600",
          metrics: [
            { label: "Avg. days from project creation to first permit submission", value: m.avgDaysToFirstSubmit },
          ],
        },
        {
          dimension: "Cost",
          icon: DollarSign,
          iconColor: "text-purple-600",
          metrics: [
            { label: "Permit application fee", value: "—" },
            { label: "Application development cost", value: "—" },
            { label: "Total estimated construction cost at submission", value: "—" },
            { label: "Permit fees as % of project cost", value: "—" },
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
            { label: "Number of permits submitted (across all projects)", value: m.permitsSubmitted },
            { label: "Number of permits currently under review", value: m.permitsUnderReview },
            { label: "Number of permits with info requested", value: m.permitsInfoRequested },
            { label: "Number of permits approved", value: m.permitsApproved },
            { label: "Number of permits denied", value: m.permitsDenied },
            { label: "Number of permits not yet started", value: m.permitsNotStarted },
            { label: "Number of complaints received", value: "—" },
            { label: "Share of eligible projects (10+ units) with Act 250", value: m.pctAct250Eligible },
          ],
        },
        {
          dimension: "Quality",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          metrics: [
            { label: "% of permits submitted out of all identified", value: m.pctPermitsSubmitted },
            { label: "% of permits approved out of submitted", value: m.pctApprovedOfSubmitted },
            { label: "Applications received vs. permits issued ratio", value: m.appToPermitRatio },
            { label: "Staff to permit ratio", value: "—" },
          ],
        },
        {
          dimension: "Time",
          icon: Clock,
          iconColor: "text-amber-600",
          metrics: [
            { label: "Avg. days from permit submission to decision (approved/denied)", value: m.avgDaysSubmitToDecision },
            { label: "% of permits issued within 60-day SLA", value: m.pctWithin60Days },
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
            { label: "Number of permits issued (approved)", value: m.permitsApproved },
            { label: "Number of projects fully permitted (all permits approved)", value: m.fullyPermitted },
            { label: "Number of projects denied", value: m.projectsDenied },
            { label: "Number of withdrawals / drafts abandoned", value: m.drafts },
            { label: "Number of refunds issued", value: "—" },
          ],
        },
        {
          dimension: "Quality",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          metrics: [
            { label: "% of projects approved", value: m.pctProjectsApproved },
            { label: "% of projects denied", value: m.pctProjectsDenied },
            { label: "% of permits approved vs. total decisions", value: m.approvalRate },
            { label: "Applicant satisfaction (timeliness, clarity)", value: "—" },
            { label: "Customer satisfaction (overall)", value: "—" },
          ],
        },
        {
          dimension: "Time",
          icon: Clock,
          iconColor: "text-amber-600",
          metrics: [
            { label: "Avg. days from project creation to approved status", value: m.avgDaysToApproval },
            { label: "Avg. days from permit submission to decision", value: m.avgDaysSubmitToDecision },
            { label: "% of permits completed within ±20% of SLA", value: m.pctWithinSLA },
          ],
        },
        {
          dimension: "Cost",
          icon: DollarSign,
          iconColor: "text-purple-600",
          metrics: [
            { label: "Development cost per unit", value: "—" },
            { label: "Amount of refunds issued", value: "—" },
            { label: "Post construction cost", value: "—" },
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
            { label: "Total housing units in pipeline (all projects)", value: m.totalUnits },
            { label: "Housing units in approved projects", value: m.approvedUnits },
            { label: "Housing units in denied projects (lost)", value: m.deniedUnits },
            { label: "Housing units currently under review", value: m.underReviewUnits },
            { label: "Number of denied applications", value: m.projectsDenied },
          ],
        },
        {
          dimension: "Quality",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          metrics: [
            { label: "% of pipeline units in approved projects", value: m.pctUnitsApproved },
            { label: "% of projects abandoned / denied", value: m.pctProjectsDenied },
            { label: "% of projects completed after approval", value: "—" },
          ],
        },
        {
          dimension: "Time",
          icon: Clock,
          iconColor: "text-amber-600",
          metrics: [
            { label: "Avg. days from project creation to approval", value: m.avgDaysToApproval },
            { label: "Avg. days from permit submission to decision", value: m.avgDaysSubmitToDecision },
            { label: "Average reduction in total permitting time from baseline", value: "—" },
          ],
        },
        {
          dimension: "Cost",
          icon: DollarSign,
          iconColor: "text-purple-600",
          metrics: [
            { label: "Average cost reduction per housing project", value: "—" },
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
            { label: "New housing units approved statewide (this system)", value: m.approvedUnits },
            { label: "Total units in pipeline", value: m.totalUnits },
            { label: "Permit application volume trend", value: `${m.totalProjects} projects` },
          ],
        },
        {
          dimension: "Quality",
          icon: CheckCircle2,
          iconColor: "text-emerald-600",
          metrics: [
            { label: "Share of units affordable to households ≤80% AMI", value: "—" },
            { label: "Housing units per 1,000 residents", value: "—" },
            { label: "Geographic distribution of new units", value: `${m.distinctTowns} towns` },
          ],
        },
        {
          dimension: "Cost",
          icon: DollarSign,
          iconColor: "text-purple-600",
          metrics: [
            { label: "Median home price-to-income ratio", value: "—" },
          ],
        },
      ],
    },
  ];
}

function computeMetrics(projects) {
  const allPermits = projects.flatMap(p => p.identified_permits || []);

  const totalProjects = projects.length;
  const totalUnits = projects.reduce((s, p) => s + (p.unit_count || 0), 0);
  const approvedUnits = projects.filter(p => p.status === "approved").reduce((s, p) => s + (p.unit_count || 0), 0);
  const deniedUnits = projects.filter(p => p.status === "denied").reduce((s, p) => s + (p.unit_count || 0), 0);
  const underReviewUnits = projects.filter(p => ["under_review", "submitted"].includes(p.status)).reduce((s, p) => s + (p.unit_count || 0), 0);

  // Project type counts
  const multiFamily = projects.filter(p => ["residential", "commercial"].includes(p.project_type) && (p.unit_count || 0) >= 4).length;
  const mobileHome = projects.filter(p => p.name?.toLowerCase().includes("mobile") || p.description?.toLowerCase().includes("mobile")).length;
  const shelter = projects.filter(p => p.name?.toLowerCase().includes("shelter") || p.description?.toLowerCase().includes("shelter") || p.description?.toLowerCase().includes("supportive")).length;
  const mixedUse = projects.filter(p => p.project_type === "mixed_use").length;
  const adu = projects.filter(p => (p.unit_count || 0) <= 3 && p.project_type === "residential").length;

  // Status counts
  const inQueue = projects.filter(p => p.status === "submitted").length;
  const inFlight = projects.filter(p => ["in_progress", "submitted", "under_review"].includes(p.status)).length;
  const projectsDenied = projects.filter(p => p.status === "denied").length;
  const drafts = projects.filter(p => p.status === "draft").length;

  // Fully permitted = all identified permits approved
  const fullyPermitted = projects.filter(p =>
    (p.identified_permits || []).length > 0 &&
    (p.identified_permits || []).every(ip => ip.status === "approved")
  ).length;

  // Permit counts
  const totalPermitApplications = allPermits.length;
  const permitsApproved = allPermits.filter(ip => ip.status === "approved").length;
  const permitsDenied = allPermits.filter(ip => ip.status === "denied").length;
  const permitsSubmitted = allPermits.filter(ip => ["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status)).length;
  const permitsUnderReview = allPermits.filter(ip => ip.status === "under_review").length;
  const permitsInfoRequested = allPermits.filter(ip => ip.status === "info_requested").length;
  const permitsNotStarted = allPermits.filter(ip => ip.status === "not_started").length;

  // Rates
  const decisioned = permitsApproved + permitsDenied;
  const approvalRate = decisioned > 0 ? pct(permitsApproved, decisioned) : "—";
  const denialRate = decisioned > 0 ? pct(permitsDenied, decisioned) : "—";
  const firstPassYield = permitsSubmitted > 0 ? pct(permitsApproved, permitsSubmitted) : "—";
  const pctInfoRequested = permitsSubmitted > 0 ? pct(permitsInfoRequested, permitsSubmitted) : "—";
  const pctPermitsSubmitted = totalPermitApplications > 0 ? pct(permitsSubmitted, totalPermitApplications) : "—";
  const pctApprovedOfSubmitted = permitsSubmitted > 0 ? pct(permitsApproved, permitsSubmitted) : "—";
  const pctProjectsApproved = totalProjects > 0 ? pct(projects.filter(p => p.status === "approved").length, totalProjects) : "—";
  const pctProjectsDenied = totalProjects > 0 ? pct(projectsDenied, totalProjects) : "—";
  const pctUnitsApproved = totalUnits > 0 ? pct(approvedUnits, totalUnits) : "—";
  const appToPermitRatio = permitsApproved > 0 ? (totalProjects / permitsApproved).toFixed(2) : "—";

  // Act 250 eligible (10+ units) with act 250 permit
  const act250Eligible = projects.filter(p => (p.unit_count || 0) >= 10);
  const act250HasPermit = act250Eligible.filter(p => (p.identified_permits || []).some(ip => ip.permit_id === "47")).length;
  const pctAct250Eligible = act250Eligible.length > 0 ? pct(act250HasPermit, act250Eligible.length) : "—";

  // Avg days to first submission (created_date to first submitted permit)
  // We use project created_date vs submitted_date if available; estimate from status
  const avgDaysToFirstSubmit = "—"; // no submit timestamp on permits
  const avgDaysSubmitToDecision = "—"; // no submitted_date field on permits
  const avgDaysToApproval = "—"; // no decision_date field populated

  // SLA: permits approved that had an sla_days — we can't measure actual elapsed time without timestamps
  const pctWithin60Days = "—";
  const pctWithinSLA = "—";

  const distinctTowns = new Set(projects.map(p => p.town).filter(Boolean)).size;

  return {
    totalProjects, totalUnits, approvedUnits, deniedUnits, underReviewUnits,
    multiFamily, mobileHome, shelter, mixedUse, adu,
    inQueue, inFlight, projectsDenied, drafts, fullyPermitted,
    totalPermitApplications, permitsApproved, permitsDenied, permitsSubmitted,
    permitsUnderReview, permitsInfoRequested, permitsNotStarted,
    approvalRate, denialRate, firstPassYield, pctInfoRequested,
    pctPermitsSubmitted, pctApprovedOfSubmitted, pctProjectsApproved, pctProjectsDenied,
    pctUnitsApproved, appToPermitRatio, pctAct250Eligible,
    avgDaysToFirstSubmit, avgDaysSubmitToDecision, avgDaysToApproval,
    pctWithin60Days, pctWithinSLA, distinctTowns,
  };
}

function pct(numerator, denominator) {
  if (!denominator) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

const DIMENSION_COLORS = {
  Quantity: { bg: "bg-blue-50", border: "border-blue-200", label: "text-blue-800" },
  Quality: { bg: "bg-emerald-50", border: "border-emerald-200", label: "text-emerald-800" },
  Time: { bg: "bg-amber-50", border: "border-amber-200", label: "text-amber-800" },
  Cost: { bg: "bg-purple-50", border: "border-purple-200", label: "text-purple-800" },
};

function MetricRow({ metric }) {
  const isLive = metric.value !== "—" && metric.value !== undefined;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-sm text-slate-700 leading-snug">{metric.label}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-sm font-bold min-w-[3rem] text-right ${isLive ? "text-slate-800" : "text-slate-400"}`}>
          {metric.value ?? "—"}
        </span>
        {!isLive && <Minus size={12} className="text-slate-300" />}
      </div>
    </div>
  );
}

function DimensionGroup({ group }) {
  const [open, setOpen] = useState(true);
  const c = DIMENSION_COLORS[group.dimension] || DIMENSION_COLORS.Quantity;
  const Icon = group.icon;
  const liveCount = group.metrics.filter(m => m.value !== "—" && m.value !== undefined).length;
  return (
    <div className={`rounded-lg border ${c.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${c.bg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className={group.iconColor} />
          <span className={`text-xs font-bold uppercase tracking-widest ${c.label}`}>{group.dimension}</span>
          <span className="text-xs text-slate-400 ml-1">({liveCount}/{group.metrics.length} live)</span>
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
  const totalMetrics = section.groups.reduce((a, g) => a + g.metrics.length, 0);
  const liveMetrics = section.groups.reduce((a, g) => a + g.metrics.filter(m => m.value !== "—" && m.value !== undefined).length, 0);
  return (
    <div className={`vt-card overflow-hidden border-l-4 ${section.border}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-6 py-4 ${section.headerBg} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${section.color}`} />
          <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Georgia, serif" }}>{section.label}</h2>
          <span className="text-xs text-slate-400">({liveMetrics}/{totalMetrics} live)</span>
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list().then(data => {
      setProjects(data || []);
      setLoading(false);
    });
  }, []);

  const metrics = computeMetrics(projects);
  const sections = buildSections(metrics);
  const totalMetrics = sections.reduce((acc, s) => acc + s.groups.reduce((a, g) => a + g.metrics.length, 0), 0);
  const liveMetrics = sections.reduce((acc, s) => acc + s.groups.reduce((a, g) => a + g.metrics.filter(m => m.value !== "—" && m.value !== undefined).length, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="rounded-xl mb-8 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Vermont Permitting System</div>
        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>Performance Metrics Dashboard</h1>
        <p className="text-sm text-green-200 opacity-80">
          {loading ? "Loading data…" : `${liveMetrics} of ${totalMetrics} metrics populated from live data · ${projects.length} projects`}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {sections.map(s => {
            const live = s.groups.reduce((a, g) => a + g.metrics.filter(m => m.value !== "—" && m.value !== undefined).length, 0);
            const total = s.groups.reduce((a, g) => a + g.metrics.length, 0);
            return (
              <div key={s.id} className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <div className="text-xl font-bold text-white">{loading ? "—" : live}</div>
                <div className="text-xs text-green-200">{s.label}</div>
                <div className="text-xs text-green-300 opacity-60">of {total}</div>
              </div>
            );
          })}
          <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold text-white">{loading ? "—" : liveMetrics}</div>
            <div className="text-xs text-green-200">Total Live</div>
            <div className="text-xs text-green-300 opacity-60">of {totalMetrics}</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(DIMENSION_COLORS).map(([dim, c]) => (
          <div key={dim} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${c.bg} ${c.border}`}>
            <span className={`text-xs font-semibold ${c.label}`}>{dim}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-500">
          <Minus size={12} /> = Requires additional data collection
        </div>
      </div>

      {/* Sections */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="vt-card p-8 animate-pulse h-24" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}

      <p className="text-xs text-center text-slate-400 mt-8">
        Metrics marked "—" require additional data fields (e.g. submission timestamps, cost data, survey responses) not yet collected in this system.
      </p>
    </div>
  );
}