import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, Legend
} from "recharts";
import { Building2, MapPin, ChevronRight, ArrowLeft, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

const PERMIT_STATUS_CONFIG = {
  not_started:   { label: "Not Started",   color: "#94a3b8" },
  in_progress:   { label: "In Progress",   color: "#3b82f6" },
  submitted:     { label: "Submitted",     color: "#8b5cf6" },
  under_review:  { label: "Under Review",  color: "#f59e0b" },
  info_requested:{ label: "Info Requested",color: "#ef4444" },
  approved:      { label: "Approved",      color: "#16a34a" },
  denied:        { label: "Denied",        color: "#b91c1c" },
};

const PROJECT_STATUS_CFG = {
  draft:         { color: "#718096", bg: "#edf2f7", label: "Draft" },
  in_progress:   { color: "#2980b9", bg: "#ebf5fb", label: "In Progress" },
  submitted:     { color: "#6d28d9", bg: "#ede9fe", label: "Submitted" },
  under_review:  { color: "#b7791f", bg: "#fffbeb", label: "Under Review" },
  approved:      { color: "#15803d", bg: "#dcfce7", label: "Approved" },
  denied:        { color: "#b91c1c", bg: "#fee2e2", label: "Denied" },
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-2.5 text-sm">
      <div className="font-semibold text-slate-800">{payload[0].name}</div>
      <div className="text-slate-600">{payload[0].value} permit{payload[0].value !== 1 ? "s" : ""}</div>
    </div>
  );
}

export default function PermitDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectStatus, setActiveProjectStatus] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    base44.entities.Project.list("-created_date").then(p => {
      setProjects(p || []);
      setLoading(false);
    });
  }, []);

  // Flatten all permits across all projects
  const allPermits = useMemo(() =>
    projects.flatMap(p =>
      (p.identified_permits || []).map(ip => ({ ...ip, project: p }))
    ), [projects]);

  // Permit status breakdown for pie chart
  const permitStatusData = useMemo(() => {
    const counts = {};
    allPermits.forEach(ip => {
      const s = ip.status || "not_started";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([status, count]) => ({
        name: PERMIT_STATUS_CONFIG[status]?.label || status,
        value: count,
        color: PERMIT_STATUS_CONFIG[status]?.color || "#94a3b8",
        status,
      }))
      .sort((a, b) => b.value - a.value);
  }, [allPermits]);

  // Per-project permit bar chart data
  const projectBarData = useMemo(() =>
    projects.slice(0, 8).map(p => {
      const permits = p.identified_permits || [];
      const approved = permits.filter(ip => ip.status === "approved").length;
      const submitted = permits.filter(ip => ip.status === "submitted" || ip.status === "under_review").length;
      const inProgress = permits.filter(ip => ip.status === "in_progress").length;
      const notStarted = permits.filter(ip => !ip.status || ip.status === "not_started").length;
      return {
        name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
        Approved: approved,
        "In Review": submitted,
        "In Progress": inProgress,
        "Not Started": notStarted,
      };
    }), [projects]);

  // Project status breakdown for clickable cards
  const projectStatusBreakdown = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      const s = p.status || "draft";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(PROJECT_STATUS_CFG).map(([status, cfg]) => ({
      status,
      ...cfg,
      count: counts[status] || 0,
    })).filter(s => s.count > 0);
  }, [projects]);

  const filteredProjects = activeProjectStatus
    ? projects.filter(p => (p.status || "draft") === activeProjectStatus)
    : [];

  const totalPermits = allPermits.length;
  const approvedPermits = allPermits.filter(ip => ip.status === "approved").length;
  const pendingPermits = allPermits.filter(ip => ["submitted", "under_review", "info_requested"].includes(ip.status)).length;
  const notStartedPermits = allPermits.filter(ip => !ip.status || ip.status === "not_started").length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="vt-card p-6 animate-pulse h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">Vermont ANR</div>
        <h1 className="text-3xl font-bold text-green-900" style={{ fontFamily: "Georgia, serif" }}>
          Permit Progress Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Permit status across all active projects</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Permits", value: totalPermits, color: "border-slate-400", iconBg: "bg-slate-100", textColor: "text-slate-800" },
          { label: "Approved", value: approvedPermits, color: "border-green-500", iconBg: "bg-green-50", textColor: "text-green-800" },
          { label: "Pending Review", value: pendingPermits, color: "border-amber-400", iconBg: "bg-amber-50", textColor: "text-amber-800" },
          { label: "Not Started", value: notStartedPermits, color: "border-slate-300", iconBg: "bg-slate-50", textColor: "text-slate-600" },
        ].map(({ label, value, color, iconBg, textColor }) => (
          <div key={label} className={`vt-card p-5 border-l-4 ${color}`}>
            <div className={`text-2xl font-bold mb-1 ${textColor}`} style={{ fontFamily: "Georgia, serif" }}>{value}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-5 gap-6 mb-8">

        {/* Pie: Permit Status Breakdown */}
        <div className="vt-card p-5 lg:col-span-2">
          <h2 className="font-bold text-green-900 mb-4 text-sm uppercase tracking-wide">Permits by Status</h2>
          {permitStatusData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No permit data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={permitStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {permitStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {permitStatusData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-slate-600">{name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar: Per-Project Breakdown */}
        <div className="vt-card p-5 lg:col-span-3">
          <h2 className="font-bold text-green-900 mb-4 text-sm uppercase tracking-wide">Permit Progress by Project</h2>
          {projectBarData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No projects yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={projectBarData} barSize={10} margin={{ left: -10, right: 10, bottom: 30 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="Approved" fill="#16a34a" stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="In Review" fill="#f59e0b" stackId="a" />
                <Bar dataKey="In Progress" fill="#3b82f6" stackId="a" />
                <Bar dataKey="Not Started" fill="#e2e8f0" stackId="a" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Project Status Filter Cards */}
      <div className="mb-6">
        <h2 className="font-bold text-green-900 mb-3 text-sm uppercase tracking-wide">Projects by Status — click to filter</h2>
        <div className="flex flex-wrap gap-3">
          {projectStatusBreakdown.map(({ status, label, color, bg, count }) => (
            <button
              key={status}
              onClick={() => setActiveProjectStatus(activeProjectStatus === status ? null : status)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all"
              style={{
                borderColor: activeProjectStatus === status ? color : "transparent",
                background: activeProjectStatus === status ? bg : "#f8fafc",
                color: activeProjectStatus === status ? color : "#64748b",
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: color, color: "white" }}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Project List */}
      {activeProjectStatus && (
        <div className="vt-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-green-900">
              {PROJECT_STATUS_CFG[activeProjectStatus]?.label} Projects ({filteredProjects.length})
            </h3>
            <button onClick={() => setActiveProjectStatus(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {filteredProjects.map(p => {
              const permits = p.identified_permits || [];
              const approved = permits.filter(ip => ip.status === "approved").length;
              const pct = permits.length ? Math.round((approved / permits.length) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  to={createPageUrl("Projects")}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      {p.town && <><MapPin size={10} />{p.town} · </>}
                      {permits.length} permits
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {permits.length > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-400">{approved}/{permits.length} done</span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-200">
                          <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All Projects Table */}
      {!activeProjectStatus && projects.length > 0 && (
        <div className="vt-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-green-900 text-sm uppercase tracking-wide">All Projects</h2>
            <Link to={createPageUrl("Projects")} className="text-xs font-semibold text-green-700 hover:text-green-900 flex items-center gap-1">
              Manage <ChevronRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {projects.map(p => {
              const s = PROJECT_STATUS_CFG[p.status] || PROJECT_STATUS_CFG.draft;
              const permits = p.identified_permits || [];
              const approved = permits.filter(ip => ip.status === "approved").length;
              const pct = permits.length ? Math.round((approved / permits.length) * 100) : 0;

              // Mini permit status bars
              const statusCounts = {};
              permits.forEach(ip => { const st = ip.status || "not_started"; statusCounts[st] = (statusCounts[st] || 0) + 1; });

              return (
                <Link
                  key={p.id}
                  to={createPageUrl("Projects")}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                    {p.town && <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{p.town}</div>}
                  </div>

                  {/* Mini stacked bar */}
                  {permits.length > 0 && (
                    <div className="hidden sm:flex flex-col items-end gap-1.5 w-36">
                      <span className="text-xs text-slate-400">{approved}/{permits.length} permits done</span>
                      <div className="w-full h-2 rounded-full overflow-hidden flex gap-px bg-slate-100">
                        {Object.entries(statusCounts).map(([st, cnt]) => (
                          <div
                            key={st}
                            style={{ width: `${(cnt / permits.length) * 100}%`, background: PERMIT_STATUS_CONFIG[st]?.color || "#94a3b8" }}
                            title={`${PERMIT_STATUS_CONFIG[st]?.label}: ${cnt}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0" style={{ color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                  <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="vt-card p-12 text-center">
          <Building2 size={36} className="mx-auto mb-3 text-green-200" />
          <p className="font-semibold text-slate-600 mb-1">No projects yet</p>
          <p className="text-sm text-slate-400 mb-4">Create a project to start tracking permit progress</p>
          <Link to={createPageUrl("Projects") + "?new=1"} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-green-700 text-white hover:bg-green-800">
            + New Project
          </Link>
        </div>
      )}
    </div>
  );
}