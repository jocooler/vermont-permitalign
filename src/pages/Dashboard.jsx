import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { FolderOpen, ClipboardList, ArrowRight, CheckCircle2, Clock, AlertCircle, Plus, Mountain } from "lucide-react";
import { PERMITS } from "../components/permits/PERMIT_DATA";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [u, p] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.Project.list("-created_date", 5),
      ]);
      setUser(u);
      setProjects(p || []);
      setLoading(false);
    }
    load();
  }, []);

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => ["in_progress", "submitted", "under_review"].includes(p.status)).length,
    approved: projects.filter(p => p.status === "approved").length,
    draft: projects.filter(p => p.status === "draft").length,
  };

  const statusLabel = {
    draft: { label: "Draft", color: "#718096", bg: "#edf2f7" },
    in_progress: { label: "In Progress", color: "#2980b9", bg: "#ebf5fb" },
    submitted: { label: "Submitted", color: "#6d28d9", bg: "#ede9fe" },
    under_review: { label: "Under Review", color: "#b7791f", bg: "#fffbeb" },
    approved: { label: "Approved", color: "#15803d", bg: "#dcfce7" },
    denied: { label: "Denied", color: "#b91c1c", bg: "#fee2e2" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Welcome Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--vt-green)" }}>
            Vermont Agency of Natural Resources
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--vt-green-dark)" }}>
            {user ? `Welcome back, ${user.full_name?.split(" ")[0]}` : "Permitting Dashboard"}
          </h1>
          <p className="text-base" style={{ color: "var(--vt-gray)" }}>
            Track your permit applications, start new projects, and navigate the Vermont permitting process.
          </p>
        </div>
        <Link
          to={createPageUrl("Projects")}
          className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded transition-all"
          style={{ background: "var(--vt-green)", color: "white" }}
        >
          <Plus size={16} /> New Project
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Projects", value: stats.total, icon: FolderOpen, color: "var(--vt-green)" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "var(--vt-blue)" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "#15803d" },
          { label: "Drafts", value: stats.draft, icon: AlertCircle, color: "#718096" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="vt-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <Icon size={18} style={{ color }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--vt-gray-mid)" }}>{label}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: "var(--vt-green-dark)", fontFamily: "'Source Serif 4', serif" }}>
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--vt-green-dark)" }}>Recent Projects</h2>
            <Link to={createPageUrl("Projects")} className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--vt-green)" }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="vt-card p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="vt-card p-10 text-center">
              <FolderOpen size={32} className="mx-auto mb-3 opacity-30" style={{ color: "var(--vt-green)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--vt-gray-dark)" }}>No projects yet</p>
              <p className="text-sm mb-4" style={{ color: "var(--vt-gray-mid)" }}>Start by creating your first project</p>
              <Link to={createPageUrl("Projects")} className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded" style={{ background: "var(--vt-green)", color: "white" }}>
                <Plus size={15} /> Create Project
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => {
                const s = statusLabel[project.status] || statusLabel.draft;
                const permitCount = project.identified_permits?.length || 0;
                return (
                  <Link key={project.id} to={`${createPageUrl("Projects")}?id=${project.id}`} className="vt-card p-4 flex items-center gap-4 hover:shadow-md transition-all block">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--vt-green-pale)" }}>
                      <Mountain size={18} style={{ color: "var(--vt-green)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: "var(--vt-gray-dark)" }}>{project.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>
                        {project.town || project.address || "No location set"} · {permitCount} permit{permitCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                      <ArrowRight size={14} style={{ color: "var(--vt-gray-mid)" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + About */}
        <div className="space-y-6">
          <div className="vt-card p-5">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: "var(--vt-green-dark)" }}>Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Start a New Project", page: "Projects", icon: Plus, desc: "Create a project profile" },
                { label: "Find My Permits", page: "PermitFinder", icon: ClipboardList, desc: "See which permits apply" },
                { label: "Review Queue", page: "ReviewQueue", icon: CheckCircle2, desc: "Staff review dashboard" },
              ].map(({ label, page, icon: Icon, desc }) => (
                <Link key={page} to={createPageUrl(page)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all group">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--vt-green-pale)" }}>
                    <Icon size={15} style={{ color: "var(--vt-green)" }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--vt-gray-dark)" }}>{label}</div>
                    <div className="text-xs" style={{ color: "var(--vt-gray-mid)" }}>{desc}</div>
                  </div>
                  <ArrowRight size={13} className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-5" style={{ background: "var(--vt-green-dark)", color: "white" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2 opacity-70">Our Vision</div>
            <h3 className="font-bold mb-3" style={{ fontFamily: "'Source Serif 4', serif" }}>Aligned. Predictable. Transparent.</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 opacity-80" /> Permits aligned across agencies</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 opacity-80" /> Clear timelines & requirements</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 opacity-80" /> Real-time visibility into status</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 opacity-80" /> Information entered once, shared across agencies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}