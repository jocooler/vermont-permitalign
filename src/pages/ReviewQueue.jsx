import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, CheckCircle2, AlertTriangle, ChevronRight, MessageSquare, ArrowUpRight, Download, Building2 } from "lucide-react";
import { STATUS_CONFIG } from "../components/permits/PERMIT_DATA";
import { usePermits } from "../components/permits/usePermits";
import { jsPDF } from "jspdf";

export default function ReviewQueue() {
  const { permits: allPermits } = usePermits();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    base44.entities.Project.list("-updated_date", 50).then(p => { setProjects(p || []); setLoading(false); });
  }, []);

  const permitMeta = {};
  allPermits.forEach(p => { permitMeta[p.id] = p; });

  // Flatten all permit applications across projects for the queue
  const allItems = [];
  projects.forEach(project => {
    (project.identified_permits || []).forEach(ip => {
      if (["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status)) {
        allItems.push({ project, ip });
      }
    });

  });

  // Build agency list with counts
  const agencyCounts = {};
  allItems.forEach(({ ip }) => {
    const agency = permitMeta[ip.permit_id]?.agency || ip.agency || "Unknown";
    agencyCounts[agency] = (agencyCounts[agency] || 0) + 1;
  });
  const agencies = Object.keys(agencyCounts).sort();

  // Filter by agency, then by status
  const agencyItems = selectedAgency
    ? allItems.filter(({ ip }) => (permitMeta[ip.permit_id]?.agency || ip.agency || "Unknown") === selectedAgency)
    : [];
  const filtered = filterStatus === "all" ? agencyItems : agencyItems.filter(i => i.ip.status === filterStatus);

  const statusCounts = {};
  agencyItems.forEach(({ ip }) => {
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

  const handleDownloadPDF = (e, project, ip) => {
    e.stopPropagation();
    const doc = new jsPDF();
    const meta = permitMeta[ip.permit_id];

    doc.setFontSize(18);
    doc.setTextColor(26, 61, 46);
    doc.text("Vermont Permitting System", 20, 20);

    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text(`Permit Application: ${ip.permit_name}`, 20, 35);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 44);

    doc.setDrawColor(200, 220, 200);
    doc.line(20, 50, 190, 50);

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    let y = 60;

    const addField = (label, value) => {
      doc.setFont(undefined, "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont(undefined, "normal");
      doc.text(value || "—", 70, y);
      y += 9;
    };

    addField("Project", project.name);
    addField("Address", project.address || "—");
    addField("Town", project.town || "—");
    addField("Parcel ID", project.parcel_id || "—");
    addField("Project Type", project.project_type || "—");
    y += 4;
    addField("Permit", ip.permit_name);
    addField("Permit ID", ip.permit_id);
    addField("Agency", meta?.agency || ip.agency || "—");
    addField("Status", STATUS_CONFIG[ip.status]?.label || ip.status);
    addField("Category", ip.category || "—");
    if (meta?.sla_days) addField("SLA", `${meta.sla_days} business days`);
    y += 4;
    if (project.profile?.applicant_name) {
      doc.setFont(undefined, "bold"); doc.text("Applicant Information", 20, y); doc.setFont(undefined, "normal"); y += 9;
      addField("Name", project.profile.applicant_name);
      addField("Organization", project.profile.applicant_organization || "—");
      addField("Email", project.profile.applicant_email || "—");
      addField("Phone", project.profile.applicant_phone || "—");
    }
    if (ip.reviewer_notes) {
      y += 4;
      doc.setFont(undefined, "bold"); doc.text("Reviewer Notes:", 20, y); y += 9;
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(ip.reviewer_notes, 160);
      doc.text(lines, 20, y);
    }

    doc.save(`permit-${ip.permit_id}-${project.name.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--vt-green)" }}>Staff Portal</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--vt-green-dark)" }}>Review Queue</h1>
        <p className="text-sm mt-1" style={{ color: "var(--vt-gray-mid)" }}>Select your agency to view active permit applications.</p>
      </div>

      {/* Agency Tiles */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="vt-card p-4 h-20 animate-pulse" />)}
        </div>
      ) : agencies.length === 0 ? (
        <div className="vt-card p-10 text-center text-sm mb-8" style={{ color: "var(--vt-gray-mid)" }}>
          No applications in the review queue yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
          {agencies.map(agency => {
            const isActive = selectedAgency === agency;
            return (
              <button
                key={agency}
                onClick={() => { setSelectedAgency(isActive ? null : agency); setSelected(null); setFilterStatus("all"); }}
                className="vt-card p-4 text-left transition-all hover:shadow-md flex items-start gap-3"
                style={{ outline: isActive ? "2px solid var(--vt-green)" : "none", background: isActive ? "var(--vt-green-pale)" : "white" }}
              >
                <Building2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: isActive ? "var(--vt-green)" : "var(--vt-gray-mid)" }} />
                <div>
                  <div className="text-xs font-semibold leading-tight" style={{ color: isActive ? "var(--vt-green-dark)" : "var(--vt-gray-dark)" }}>
                    {agency}
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ color: isActive ? "var(--vt-green)" : "var(--vt-gray-mid)" }}>
                    {agencyCounts[agency]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Queue for selected agency */}
      {selectedAgency && (
        <>
          {/* Status filter pills */}
          <div className="flex gap-2 flex-wrap mb-4">
            {["all", "submitted", "under_review", "info_requested", "approved", "denied"].map(s => {
              const cfg = STATUS_CONFIG[s];
              const count = s === "all" ? agencyItems.length : (statusCounts[s] || 0);
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
                  {s === "all" ? `All (${count})` : `${cfg?.label || s} (${count})`}
                </button>
              );
            })}
          </div>

          <div className="flex gap-6">
            {/* Queue List */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="vt-card p-10 text-center text-sm" style={{ color: "var(--vt-gray-mid)" }}>
                  No applications in this status.
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(({ project, ip }) => {
                    const st = STATUS_CONFIG[ip.status] || STATUS_CONFIG.not_started;
                    const meta = permitMeta[ip.permit_id];
                    const isSelected = selected?.project.id === project.id && selected?.ip.permit_id === ip.permit_id;
                    return (
                      <div
                        key={`${project.id}-${ip.permit_id}`}
                        className="vt-card p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                        style={{ outline: isSelected ? "2px solid var(--vt-green)" : "none" }}
                        onClick={() => { setSelected({ project, ip }); setNoteText(""); }}
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
                          {meta && <span className="text-xs hidden sm:block" style={{ color: "var(--vt-gray-mid)" }}>~{meta.sla_days}d</span>}
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                          <button
                            onClick={(e) => handleDownloadPDF(e, project, ip)}
                            title="Download PDF"
                            className="p-1.5 rounded hover:bg-green-50 transition-all"
                            style={{ color: "var(--vt-green)" }}
                          >
                            <Download size={14} />
                          </button>
                          <ChevronRight size={14} style={{ color: "var(--vt-gray-mid)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            {selected && (
              <div className="fixed inset-0 z-50 lg:relative lg:inset-auto lg:w-80 lg:flex-shrink-0 flex items-end lg:items-start justify-center lg:justify-start">
                <div className="absolute inset-0 bg-black/40 lg:hidden" onClick={() => setSelected(null)} />
                <div className="bg-white p-5 lg:sticky lg:top-20 w-full max-w-lg lg:max-w-none relative z-10 rounded-t-2xl lg:rounded-lg max-h-[85vh] lg:max-h-none overflow-y-auto shadow-xl border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-bold text-sm" style={{ color: "var(--vt-green-dark)" }}>{selected.ip.permit_name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>{selected.project.name}</div>
                    </div>
                    <button onClick={() => setSelected(null)} className="text-xs p-1" style={{ color: "var(--vt-gray-mid)" }}>✕</button>
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

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                    <button
                      onClick={(e) => handleDownloadPDF(e, selected.project, selected.ip)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded border transition-all hover:bg-green-50"
                      style={{ color: "var(--vt-green)", borderColor: "var(--vt-green)" }}
                    >
                      <Download size={13} /> Download Application PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}