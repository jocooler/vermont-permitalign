import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { FolderOpen, ClipboardList, ArrowRight, CheckCircle2, Clock, AlertCircle, Plus, Building2, XCircle, Home } from "lucide-react";

const STATUS_LABEL = {
  draft: { label: "Draft", textColor: "text-slate-600", bgColor: "bg-slate-100" },
  in_progress: { label: "In Progress", textColor: "text-blue-700", bgColor: "bg-blue-100" },
  submitted: { label: "Submitted", textColor: "text-purple-700", bgColor: "bg-purple-100" },
  under_review: { label: "Under Review", textColor: "text-amber-700", bgColor: "bg-amber-100" },
  approved: { label: "Approved", textColor: "text-green-700", bgColor: "bg-green-100" },
  denied: { label: "Denied", textColor: "text-red-700", bgColor: "bg-red-100" },
};

const STATUS_BAR_COLORS = {
  draft: "bg-slate-400",
  in_progress: "bg-blue-500",
  submitted: "bg-purple-500",
  under_review: "bg-amber-500",
  approved: "bg-emerald-500",
  denied: "bg-red-500",
};

export default function Dashboard() {
  const [allProjects, setAllProjects] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, all] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.Project.list("-created_date"),
      ]);
      setUser(u);
      setAllProjects(all || []);
      setRecentProjects((all || []).slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  const stats = {
    total: allProjects.length,
    inProgress: allProjects.filter(p => ["in_progress", "submitted", "under_review"].includes(p.status)).length,
    approved: allProjects.filter(p => p.status === "approved").length,
    denied: allProjects.filter(p => p.status === "denied").length,
    draft: allProjects.filter(p => p.status === "draft").length,
    totalUnits: allProjects.reduce((sum, p) => sum + (p.unit_count || 0), 0),
    approvedUnits: allProjects.filter(p => p.status === "approved").reduce((sum, p) => sum + (p.unit_count || 0), 0),
    totalPermits: allProjects.reduce((sum, p) => sum + (p.identified_permits?.length || 0), 0),
    approvedPermits: allProjects.reduce((sum, p) => sum + (p.identified_permits?.filter(ip => ip.status === "approved").length || 0), 0),
  };

  // Status breakdown for bar chart
  const statusCounts = Object.entries(
    allProjects.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  const statCards = [
    { label: "Total Projects", value: stats.total, Icon: FolderOpen, iconBg: "bg-green-700", cardBorder: "border-l-4 border-green-600", valueColor: "text-green-900" },
    { label: "In Progress", value: stats.inProgress, Icon: Clock, iconBg: "bg-blue-600", cardBorder: "border-l-4 border-blue-500", valueColor: "text-blue-900" },
    { label: "Approved", value: stats.approved, Icon: CheckCircle2, iconBg: "bg-emerald-600", cardBorder: "border-l-4 border-emerald-500", valueColor: "text-emerald-900" },
    { label: "Denied", value: stats.denied, Icon: XCircle, iconBg: "bg-red-500", cardBorder: "border-l-4 border-red-400", valueColor: "text-red-900" },
    { label: "Units in Pipeline", value: stats.totalUnits, Icon: Home, iconBg: "bg-purple-600", cardBorder: "border-l-4 border-purple-500", valueColor: "text-purple-900" },
    { label: "Units Approved", value: stats.approvedUnits, Icon: Building2, iconBg: "bg-teal-600", cardBorder: "border-l-4 border-teal-500", valueColor: "text-teal-900" },
    { label: "Permits Tracked", value: stats.totalPermits, Icon: ClipboardList, iconBg: "bg-slate-600", cardBorder: "border-l-4 border-slate-500", valueColor: "text-slate-900" },
    { label: "Permits Approved", value: stats.approvedPermits, Icon: CheckCircle2, iconBg: "bg-amber-600", cardBorder: "border-l-4 border-amber-500", valueColor: "text-amber-900" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Welcome Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-1">Vermont Agency of Natural Resources</div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            {user ? `Welcome back, ${user.full_name?.split(" ")[0]}` : "Permitting Dashboard"}
          </h1>
          <p className="text-base text-slate-600">Track permit applications, start new projects, and navigate the Vermont permitting process.</p>
        </div>
        <Link to={createPageUrl("Projects") + "?new=1"} className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded bg-green-700 text-white hover:bg-green-800 transition-colors">
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statCards.map(({ label, value, Icon, iconBg, cardBorder, valueColor }) => (
          <div key={label} className={`vt-card p-4 ${cardBorder}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-500 leading-tight">{label}</span>
            </div>
            <div className={`text-3xl font-bold ${valueColor}`} style={{ fontFamily: "Georgia, serif" }}>
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Breakdown */}
          {!loading && allProjects.length > 0 && (
            <div className="vt-card p-5">
              <h3 className="font-bold text-sm uppercase tracking-wide text-green-900 mb-4">Projects by Status</h3>
              <div className="space-y-2.5">
                {statusCounts.map(([status, count]) => {
                  const cfg = STATUS_LABEL[status] || STATUS_LABEL.draft;
                  const barColor = STATUS_BAR_COLORS[status] || "bg-slate-400";
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-28 text-center flex-shrink-0 ${cfg.textColor} ${cfg.bgColor}`}>{cfg.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-green-900">Recent Projects</h2>
              <Link to={createPageUrl("Projects")} className="text-sm font-medium flex items-center gap-1 text-green-700 hover:text-green-900">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="vt-card p-4 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="vt-card p-10 text-center">
                <FolderOpen size={32} className="mx-auto mb-3 text-green-300" />
                <p className="font-semibold text-slate-700 mb-1">No projects yet</p>
                <p className="text-sm text-slate-500 mb-4">Start by creating your first project</p>
                <Link to={createPageUrl("Projects")} className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">
                  <Plus size={15} /> Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map(project => {
                  const s = STATUS_LABEL[project.status] || STATUS_LABEL.draft;
                  const permitCount = project.identified_permits?.length || 0;
                  const approvedPermits = project.identified_permits?.filter(ip => ip.status === "approved").length || 0;
                  return (
                    <Link key={project.id} to={`${createPageUrl("Projects")}?project=${project.id}`} className="vt-card p-4 flex items-center gap-4 hover:shadow-md transition-all block">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50">
                        <Building2 size={18} className="text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate text-slate-800">{project.name}</div>
                        <div className="text-xs mt-0.5 text-slate-500">
                          {project.town || project.address || "No location"}{project.unit_count ? ` · ${project.unit_count} units` : ""} · {approvedPermits}/{permitCount} permits done
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.textColor} ${s.bgColor}`}>{s.label}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions + Vision */}
        <div className="space-y-6">
          <div className="vt-card p-5">
            <h3 className="font-bold text-sm uppercase tracking-wide text-green-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Start a New Project", page: "Projects", query: "?new=1", Icon: Plus, desc: "Create a project profile", iconBg: "bg-green-50", iconColor: "text-green-700" },
                { label: "Find My Permits", page: "PermitFinder", query: "", Icon: ClipboardList, desc: "See which permits apply", iconBg: "bg-blue-50", iconColor: "text-blue-700" },
                { label: "Review Queue", page: "ReviewQueue", query: "", Icon: CheckCircle2, desc: "Staff review dashboard", iconBg: "bg-amber-50", iconColor: "text-amber-700" },
              ].map(({ label, page, query, Icon, desc, iconBg, iconColor }) => (
                <Link key={page} to={createPageUrl(page) + query} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon size={15} className={iconColor} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{label}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </div>
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity text-slate-400" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-5 text-white" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 60%, #3a7d5c 100%)" }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 text-green-300">Our Vision</div>
            <h3 className="font-bold mb-3 text-lg" style={{ fontFamily: "Georgia, serif" }}>Aligned. Predictable. Transparent.</h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-300" /> <span className="opacity-90">Permits aligned across agencies</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-300" /> <span className="opacity-90">Clear timelines & requirements</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-300" /> <span className="opacity-90">Real-time visibility into status</span></li>
              <li className="flex items-start gap-2.5"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-emerald-300" /> <span className="opacity-90">Information entered once, shared across agencies</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}