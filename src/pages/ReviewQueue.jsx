import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, CheckCircle2, AlertTriangle, Filter, ChevronRight, MessageSquare, ArrowUpRight } from "lucide-react";
import { STATUS_CONFIG } from "../components/permits/PERMIT_DATA";
import { usePermits } from "../components/permits/usePermits";

const ALL_STATUSES = ["submitted", "under_review", "info_requested", "approved", "denied"];

export default function ReviewQueue() {
  const { permits: allPermits } = usePermits();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    base44.entities.Project.list("-updated_date", 50).then(p => { setProjects(p || []); setLoading(false); });
  }, []);

  // Flatten all permit applications across projects for the queue
  const allItems = [];
  projects.forEach(project => {
    (project.identified_permits || []).forEach(ip => {
      if (["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status)) {
        allItems.push({ project, ip });
      }
    });
  });

  const filtered = filterStatus === "all" ? allItems : allItems.filter(i => i.ip.status === filterStatus);

  const statusCounts = {};
  allItems.forEach(({ ip }) => {
    statusCounts[ip.status] = (statusCounts[ip.status] || 0) + 1;
  });

  const handleStatusChange = async (project, permitId, newStatus) => {
    const updated = {
      ...project,
      identified_permits: project.identified_permits.map(ip =>
        ip.permit_id === permitId ? { ...ip, status: newStatus } : ip
      )
    };
    await base44.entities.Project.update(project.id, { identified_permits: updated.identified_permits });
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selected && selected.project.id === project.id) {
      setSelected({ project: updated, ip: updated.identified_permits.find(ip => ip.permit_id === permitId) });
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selected) return;
    const updated = {
      ...selected.project,
      identified_permits: selected.project.identified_permits.map(ip =>
        ip.permit_id === selected.ip.permit_id ? { ...ip, reviewer_notes: noteText } : ip
      )
    };
    await base44.entities.Project.update(selected.project.id, { identified_permits: updated.identified_permits });
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelected({ project: updated, ip: { ...selected.ip, reviewer_notes: noteText } });
    setNoteText("");
  };

  const permitMeta = {};
  allPermits.forEach(p => { permitMeta[p.id] = p; });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--vt-green)" }}>Staff Portal</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--vt-green-dark)" }}>Review Queue</h1>
        <p className="text-sm mt-1" style={{ color: "var(--vt-gray-mid)" }}>Active permit applications awaiting review or action.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { status: "submitted", label: "Awaiting Review", icon: Clock, color: "#6d28d9" },
          { status: "under_review", label: "Under Review", icon: ArrowUpRight, color: "#b7791f" },
          { status: "info_requested", label: "Info Requested", icon: MessageSquare, color: "#c05621" },
          { status: "approved", label: "Approved", icon: CheckCircle2, color: "#15803d" },
        ].map(({ status, label, icon: Icon, color }) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}
            className="vt-card p-4 text-left transition-all hover:shadow-md"
            style={{ outline: filterStatus === status ? `2px solid ${color}` : "none" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={15} style={{ color }} />
              <span className="text-xs font-semibold" style={{ color: "var(--vt-gray-mid)" }}>{label}</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: "var(--vt-green-dark)", fontFamily: "'Source Serif 4', serif" }}>
              {statusCounts[status] || 0}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Queue List */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={14} style={{ color: "var(--vt-gray-mid)" }} />
            <div className="flex gap-2 flex-wrap">
              {["all", ...ALL_STATUSES].map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="text-xs font-medium px-3 py-1 rounded-full border transition-all"
                    style={filterStatus === s
                      ? { background: cfg ? cfg.color : "var(--vt-green-dark)", color: "white", borderColor: "transparent" }
                      : { color: "var(--vt-gray-mid)", borderColor: "var(--vt-gray-light)", background: "white" }
                    }
                  >
                    {s === "all" ? `All (${allItems.length})` : (cfg?.label || s)}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="vt-card p-4 h-16 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="vt-card p-10 text-center text-sm" style={{ color: "var(--vt-gray-mid)" }}>
              No applications in this status.
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(({ project, ip }, idx) => {
                const st = STATUS_CONFIG[ip.status] || STATUS_CONFIG.not_started;
                const meta = permitMeta[ip.permit_id];
                const isSelected = selected?.project.id === project.id && selected?.ip.permit_id === ip.permit_id;
                return (
                  <button
                    key={`${project.id}-${ip.permit_id}`}
                    className="w-full vt-card p-4 text-left flex items-center gap-4 hover:shadow-md transition-all"
                    style={{ outline: isSelected ? "2px solid var(--vt-green)" : "none" }}
                    onClick={() => setSelected({ project, ip })}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: "var(--vt-gray-dark)" }}>
                        {ip.permit_name}
                      </div>
                      <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--vt-gray-mid)" }}>
                        <span className="truncate">{project.name}</span>
                        {project.town && <span>· {project.town}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {meta && (
                        <span className="text-xs hidden sm:block" style={{ color: "var(--vt-gray-mid)" }}>~{meta.sla_days}d</span>
                      )}
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                      <ChevronRight size={14} style={{ color: "var(--vt-gray-mid)" }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80 lg:flex-shrink-0 flex items-end lg:items-start justify-center lg:justify-start">
            {/* Mobile backdrop */}
            <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={() => setSelected(null)} />
            <div className="vt-card p-5 lg:sticky lg:top-20 w-full max-w-lg lg:max-w-none relative z-10 rounded-t-2xl lg:rounded-lg max-h-[85vh] lg:max-h-none overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-sm" style={{ color: "var(--vt-green-dark)" }}>{selected.ip.permit_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>{selected.project.name}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-xs" style={{ color: "var(--vt-gray-mid)" }}>✕</button>
              </div>

              <div className="space-y-2 mb-5">
                {["submitted","under_review","info_requested","approved","denied"].map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const active = selected.ip.status === s;
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected.project, selected.ip.permit_id, s)}
                      className="w-full text-left px-3 py-2 rounded text-xs font-medium transition-all flex items-center gap-2"
                      style={{
                        background: active ? cfg.bg : "transparent",
                        color: active ? cfg.color : "var(--vt-gray)",
                        border: active ? `1px solid ${cfg.color}40` : "1px solid transparent",
                      }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                      {cfg.label}
                      {active && <CheckCircle2 size={12} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t pt-4" style={{ borderColor: "var(--vt-gray-light)" }}>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--vt-gray)" }}>Reviewer Notes</label>
                {selected.ip.reviewer_notes && (
                  <div className="p-2.5 rounded text-xs mb-2" style={{ background: "var(--vt-gray-pale)", color: "var(--vt-gray)" }}>
                    {selected.ip.reviewer_notes}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full border rounded px-3 py-2 text-xs resize-none mb-2"
                  style={{ borderColor: "var(--vt-gray-light)" }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="w-full py-1.5 text-xs font-semibold rounded transition-all"
                  style={{ background: noteText.trim() ? "var(--vt-green)" : "var(--vt-gray-light)", color: noteText.trim() ? "white" : "var(--vt-gray-mid)" }}
                >
                  Save Note
                </button>
              </div>

              {permitMeta[selected.ip.permit_id] && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                  <div className="text-xs" style={{ color: "var(--vt-gray-mid)" }}>
                    <div className="mb-1"><span className="font-semibold">Agency: </span>{permitMeta[selected.ip.permit_id].agency}</div>
                    <div><span className="font-semibold">SLA: </span>{permitMeta[selected.ip.permit_id].sla_days} business days</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}