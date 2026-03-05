import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Clock, CheckCircle2, AlertTriangle, ChevronRight, MessageSquare, ArrowUpRight, Download, Building2, Info } from "lucide-react";
import { STATUS_CONFIG } from "../components/permits/PERMIT_DATA";
import { usePermits } from "../components/permits/usePermits";
import { jsPDF } from "jspdf";

export default function ReviewQueue() {
  const { permits: allPermits } = usePermits();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCompleted, setShowCompleted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [infoRequestedText, setInfoRequestedText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

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

  // Build agency list with counts (exclude approved/denied from counts)
  const agencyCounts = {};
  allItems.forEach(({ ip }) => {
    if (ip.status === "approved" || ip.status === "denied") return;
    const agency = permitMeta[ip.permit_id]?.agency || ip.agency || "Unknown";
    agencyCounts[agency] = (agencyCounts[agency] || 0) + 1;
  });
  const agencies = Object.keys(agencyCounts).sort();

  // Filter by agency, then by status
  const agencyItems = selectedAgency
    ? allItems.filter(({ ip }) => (permitMeta[ip.permit_id]?.agency || ip.agency || "Unknown") === selectedAgency)
    : [];
  const baseItems = agencyItems
    .filter(i => showCompleted || (i.ip.status !== "approved" && i.ip.status !== "denied"));
  const filtered = filterStatus === "all" ? baseItems : baseItems.filter(i => i.ip.status === filterStatus);

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
    const updatedPermits = updated.identified_permits;
    const hasSubmitted = updatedPermits.some(ip => ["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status));
    const projectUpdate = { identified_permits: updatedPermits };
    if (hasSubmitted && project.status === "draft") projectUpdate.status = "in_progress";
    await base44.entities.Project.update(project.id, projectUpdate);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selected && selected.project.id === project.id) {
      setSelected({ project: updated, ip: updated.identified_permits.find(ip => ip.permit_id === permitId) });
    }
  };

  const handleSaveAll = async () => {
    if (!selected) return;
    setSaveStatus("saving");
    try {
      const updated = {
        ...selected.project,
        identified_permits: selected.project.identified_permits.map(ip =>
          ip.permit_id === selected.ip.permit_id 
            ? { ...ip, status: selectedStatus, reviewer_notes: noteText, info_requested: infoRequestedText }
            : ip
        )
      };
      const hasSubmitted = updated.identified_permits.some(ip => ["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status));
      const projectUpdate = { identified_permits: updated.identified_permits };
      if (hasSubmitted && selected.project.status === "draft") projectUpdate.status = "in_progress";
      await base44.entities.Project.update(selected.project.id, projectUpdate);
      setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelected({ project: updated, ip: updated.identified_permits.find(ip => ip.permit_id === selected.ip.permit_id) });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
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
    
    // Always include Applicant/Project Profile section
    y += 4;
    doc.setFont(undefined, "bold"); 
    doc.text("Applicant & Project Information", 20, y); 
    doc.setFont(undefined, "normal"); 
    y += 9;
    
    if (project.profile?.applicant_name) {
      addField("Applicant Name", project.profile.applicant_name);
      addField("Organization", project.profile.applicant_organization || "—");
      addField("Email", project.profile.applicant_email || "—");
      addField("Phone", project.profile.applicant_phone || "—");
    } else {
      addField("Applicant Name", "—");
      addField("Organization", "—");
      addField("Email", "—");
      addField("Phone", "—");
    }
    
    if (project.profile?.project_description) {
      addField("Project Description", project.profile.project_description);
    }
    if (project.profile?.anticipated_start_date) {
      addField("Anticipated Start", project.profile.anticipated_start_date);
    }
    if (project.profile?.anticipated_end_date) {
      addField("Anticipated End", project.profile.anticipated_end_date);
    }
    if (ip.reviewer_notes) {
      y += 4;
      doc.setFont(undefined, "bold"); doc.text("Reviewer Notes:", 20, y); y += 9;
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(ip.reviewer_notes, 160);
      doc.text(lines, 20, y);
    }

    if (ip.documents && ip.documents.length > 0) {
      y += 4;
      doc.setFont(undefined, "bold"); doc.text("Attached Documents:", 20, y); y += 9;
      doc.setFont(undefined, "normal");
      ip.documents.forEach(doc_item => {
        const docTitle = doc_item.title || doc_item.name || "Unnamed Document";
        doc.text(`• ${docTitle}`, 25, y);
        y += 6;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    doc.save(`permit-${ip.permit_id}-${project.name.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#2d6a4f" }}>Staff Portal</div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--vt-green-dark)" }}>Review Queue</h1>
        <p className="text-sm mt-1" style={{ color: "var(--vt-gray-mid)" }}>Select your agency to view active permit applications.</p>
      </div>

      {!selectedAgency && (
        <div className="mb-6 space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex gap-2">
              <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>How to use the Review Queue:</strong> Click on an agency tile to see all submitted applications. Use status filters to organize your workflow. You can update statuses, request additional information, add notes, and download application PDFs.
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex gap-2">
              <Info size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <strong>Key Definitions:</strong> <strong>Status</strong> = current stage in the permitting process. <strong>SLA</strong> = expected processing time in business days. <strong>Info Requested</strong> = applicant must submit additional information for review to continue.
              </div>
            </div>
          </div>
        </div>
      )}

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
                style={{ outline: isActive ? "2px solid #2d6a4f" : "none", background: isActive ? "#d8f3dc" : "white" }}
              >
                <Building2 size={16} className="mt-0.5 flex-shrink-0" style={{ color: isActive ? "#2d6a4f" : "#718096" }} />
                <div>
                  <div className="text-xs font-semibold leading-tight" style={{ color: isActive ? "var(--vt-green-dark)" : "var(--vt-gray-dark)" }}>
                    {agency}
                  </div>
                  <div className="text-lg font-bold mt-1" style={{ color: isActive ? "#2d6a4f" : "#718096" }}>
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
          <div className="flex items-center gap-3 flex-wrap mb-4">
            {["all", "submitted", "under_review", "info_requested"].map(s => {
              const cfg = STATUS_CONFIG[s];
              const count = s === "all" ? agencyItems.length : (statusCounts[s] || 0);
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="text-xs font-medium px-3 py-1 rounded-full border transition-all"
                  style={filterStatus === s
                    ? { background: cfg ? cfg.color : "#1a3d2e", color: "white", borderColor: "transparent" }
                    : { color: "#718096", borderColor: "#e2e8f0", background: "white" }
                  }
                >
                  {s === "all" ? `All (${count})` : `${cfg?.label || s} (${count})`}
                </button>
              );
            })}
            <button
              onClick={() => setShowCompleted(v => !v)}
              className="text-xs font-medium px-3 py-1 rounded-full border transition-all ml-auto"
              style={showCompleted
                ? { background: "#4a5568", color: "white", borderColor: "transparent" }
                : { color: "#718096", borderColor: "#e2e8f0", background: "white" }
              }
            >
              {showCompleted ? "✓ Completed" : "+ Show Completed"}
            </button>
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
                        style={{ outline: isSelected ? "2px solid #2d6a4f" : "none" }}
                        onClick={() => { 
                        setSelected({ project, ip }); 
                        setNoteText(ip.reviewer_notes || ""); 
                        setInfoRequestedText(ip.info_requested || ""); 
                        setSelectedStatus(ip.status); 
                        setSaveStatus(null); 
                      }}
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
                              style={{ color: "#2d6a4f" }}
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
                      const active = selectedStatus === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedStatus(s)}
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

                  {selectedStatus === "info_requested" && (
                    <div className="mb-5 p-3 rounded-lg border-l-4 border-amber-400 bg-amber-50">
                      <div className="text-xs font-bold text-amber-900 mb-2">📋 Information Requested</div>
                      <textarea
                        value={infoRequestedText}
                        onChange={(e) => setInfoRequestedText(e.target.value)}
                        placeholder="Specify what information is needed from the applicant..."
                        className="w-full border rounded px-2 py-1.5 text-xs resize-none"
                        style={{ borderColor: "#fbbf24", background: "white" }}
                      />
                      <p className="text-xs text-amber-700 mt-2">The applicant will see this information prominently in their permit view.</p>
                    </div>
                  )}

                  <div className="border-t pt-4" style={{ borderColor: "var(--vt-gray-light)" }}>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "var(--vt-gray)" }}>Reviewer Notes</label>
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="w-full border rounded px-3 py-2 text-xs resize-none"
                      style={{ borderColor: "var(--vt-gray-light)" }}
                    />
                  </div>

                  <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                    <button
                      onClick={handleSaveAll}
                      disabled={saveStatus === "saving"}
                      className="w-full py-2 text-sm font-semibold rounded transition-all"
                      style={{
                        background: saveStatus === "saved" ? "#10b981" : saveStatus === "error" ? "#ef4444" : "#2d6a4f",
                        color: "white"
                      }}
                    >
                      {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Error Saving" : "Save Changes"}
                    </button>
                  </div>

                  {selected.ip.info_requested && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                      <div className="text-xs font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>Additional Information Requested</div>
                      <div className="text-xs p-2.5 rounded" style={{ background: "var(--vt-gray-pale)", color: "var(--vt-gray)" }}>
                        {selected.ip.info_requested}
                      </div>
                    </div>
                  )}

                  {permitMeta[selected.ip.permit_id] && selected.ip.submitted_date && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                      <div className="text-xs" style={{ color: "var(--vt-gray-mid)" }}>
                        <div><span className="font-semibold">Expected Due Date: </span>
                          {new Date(new Date(selected.ip.submitted_date).getTime() + (permitMeta[selected.ip.permit_id].sla_days * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                    <button
                      onClick={(e) => handleDownloadPDF(e, selected.project, selected.ip)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded border transition-all hover:bg-green-50"
                      style={{ color: "#2d6a4f", borderColor: "#2d6a4f" }}
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