import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, ArrowLeft, MapPin, Clock, Building2, AlertCircle, FileText, CheckCircle2, Download } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { STATUS_CONFIG } from "../components/permits/PERMIT_DATA";
import { usePermits } from "../components/permits/usePermits";
import ParcelPicker from "../components/permits/ParcelPicker";
import { jsPDF } from "jspdf";

export default function PermitReviewDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const permitId = searchParams.get("permitId");

  const { permits: allPermits } = usePermits();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [infoRequestedText, setInfoRequestedText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (projectId) {
      base44.entities.Project.list().then(projects => {
        const p = projects.find(pr => pr.id === projectId);
        setProject(p);
        setLoading(false);
      });
    }
  }, [projectId]);

  const permitMeta = {};
  allPermits.forEach(p => { permitMeta[p.id] = p; });

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10 text-center">Loading...</div>;
  if (!project) return <div className="max-w-6xl mx-auto px-4 py-10 text-center">Project not found</div>;

  const selectedPermit = project.identified_permits?.find(ip => ip.permit_id === permitId);
  if (!selectedPermit) return <div className="max-w-6xl mx-auto px-4 py-10 text-center">Permit not found</div>;

  const pendingPermits = project.identified_permits?.filter(ip => !["approved", "denied"].includes(ip.status)) || [];
  const permitMeta_selected = permitMeta[selectedPermit.permit_id];

  const handleSaveAll = async () => {
    setSaveStatus("saving");
    try {
      const updated = {
        ...project,
        identified_permits: project.identified_permits.map(ip =>
          ip.permit_id === selectedPermit.permit_id
            ? { ...ip, status: selectedStatus, reviewer_notes: noteText, info_requested: infoRequestedText }
            : ip
        )
      };
      const hasSubmitted = updated.identified_permits.some(ip => ["submitted", "under_review", "info_requested", "approved", "denied"].includes(ip.status));
      const projectUpdate = { identified_permits: updated.identified_permits };
      if (hasSubmitted && project.status === "draft") projectUpdate.status = "in_progress";

      await base44.entities.Project.update(project.id, projectUpdate);

      const permitApps = await base44.entities.PermitApplication.filter({
        project_id: project.id,
        permit_id: selectedPermit.permit_id
      });
      if (permitApps?.length > 0) {
        await base44.entities.PermitApplication.update(permitApps[0].id, {
          status: selectedStatus,
          reviewer_notes: noteText,
          info_requested: infoRequestedText
        });
      }

      setProject(updated);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const meta = permitMeta[selectedPermit.permit_id];

    doc.setFontSize(18);
    doc.setTextColor(26, 61, 46);
    doc.text("Vermont Permitting System", 20, 20);

    doc.setFontSize(13);
    doc.setTextColor(40, 40, 40);
    doc.text(`Permit Application: ${selectedPermit.permit_name}`, 20, 35);

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
    addField("Permit", selectedPermit.permit_name);
    addField("Permit ID", selectedPermit.permit_id);
    addField("Agency", meta?.agency || selectedPermit.agency || "—");
    addField("Status", STATUS_CONFIG[selectedPermit.status]?.label || selectedPermit.status);
    addField("Category", selectedPermit.category || "—");
    if (meta?.sla_days) addField("SLA", `${meta.sla_days} business days`);

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

    if (noteText) {
      y += 4;
      doc.setFont(undefined, "bold"); doc.text("Reviewer Notes:", 20, y); y += 9;
      doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(noteText, 160);
      doc.text(lines, 20, y);
    }

    doc.save(`permit-${selectedPermit.permit_id}-${project.name.replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(createPageUrl("ReviewQueue"))}
          className="p-2 rounded hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#2d6a4f" }}>Permit Review</div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--vt-green-dark)" }}>
            {selectedPermit.permit_name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--vt-gray-mid)" }}>{project.name} · {project.town}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Map & Project Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Map */}
          <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
            <div className="h-96 w-full">
              <ParcelPicker
                onParcelSelect={() => {}}
                initialAddress={project.address}
                initialTown={project.town}
                readOnly={true}
                latitude={project.latitude}
                longitude={project.longitude}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--vt-green-dark)" }}>Project Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Project Name</div>
                <div className="text-sm font-medium text-slate-900">{project.name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Project Type</div>
                <div className="text-sm font-medium text-slate-900 capitalize">{project.project_type}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Address</div>
                <div className="text-sm font-medium text-slate-900">{project.address}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Town / Municipality</div>
                <div className="text-sm font-medium text-slate-900">{project.town}</div>
              </div>
              {project.parcel_id && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Parcel ID (SPAN)</div>
                  <div className="text-sm font-medium text-slate-900">{project.parcel_id}</div>
                </div>
              )}
              {project.latitude && project.longitude && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Coordinates</div>
                  <div className="text-sm font-medium text-slate-900">
                    {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}
                  </div>
                </div>
              )}
            </div>

            {project.profile?.project_description && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-xs font-semibold text-slate-400 mb-2">Project Description</div>
                <p className="text-sm text-slate-700">{project.profile.project_description}</p>
              </div>
            )}

            {(project.profile?.anticipated_start_date || project.profile?.anticipated_end_date) && (
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                {project.profile?.anticipated_start_date && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Anticipated Start</div>
                    <div className="text-sm font-medium text-slate-900">{project.profile.anticipated_start_date}</div>
                  </div>
                )}
                {project.profile?.anticipated_end_date && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Anticipated End</div>
                    <div className="text-sm font-medium text-slate-900">{project.profile.anticipated_end_date}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Applicant Information */}
          {project.profile?.applicant_name && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: "var(--vt-green-dark)" }}>Applicant Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Applicant Name</div>
                  <div className="text-sm font-medium text-slate-900">{project.profile.applicant_name}</div>
                </div>
                {project.profile.applicant_organization && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Organization</div>
                    <div className="text-sm font-medium text-slate-900">{project.profile.applicant_organization}</div>
                  </div>
                )}
                {project.profile.applicant_email && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Email</div>
                    <div className="text-sm font-medium text-slate-900">{project.profile.applicant_email}</div>
                  </div>
                )}
                {project.profile.applicant_phone && (
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">Phone</div>
                    <div className="text-sm font-medium text-slate-900">{project.profile.applicant_phone}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Pending Permits */}
          {pendingPermits.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-lg mb-4" style={{ color: "var(--vt-green-dark)" }}>Other Permits for This Project</h3>
              <div className="space-y-2">
                {pendingPermits.map(ip => {
                  const st = STATUS_CONFIG[ip.status] || STATUS_CONFIG.not_started;
                  const meta = permitMeta[ip.permit_id];
                  const isSelected = ip.permit_id === selectedPermit.permit_id;
                  return (
                    <div
                      key={ip.permit_id}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                      onClick={() => navigate(createPageUrl(`PermitReviewDetail?projectId=${project.id}&permitId=${ip.permit_id}`))}
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{ip.permit_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">#{ip.permit_id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {meta && <span className="text-xs text-slate-500">~{meta.sla_days}d</span>}
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Permit Details & Controls */}
        <div className="space-y-4">
          {/* Permit Overview */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--vt-green-dark)" }}>Permit Details</h3>
            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Permit</div>
                <div className="text-sm font-medium text-slate-900">{selectedPermit.permit_name}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Permit ID</div>
                <div className="text-sm font-medium text-slate-900">#{selectedPermit.permit_id}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Agency</div>
                <div className="text-sm font-medium text-slate-900">{permitMeta_selected?.agency || selectedPermit.agency}</div>
              </div>
              {permitMeta_selected?.sla_days && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-1">Expected Processing</div>
                  <div className="text-sm font-medium text-slate-900">{permitMeta_selected.sla_days} business days</div>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-1">Category</div>
                <div className="text-sm font-medium text-slate-900 capitalize">{selectedPermit.category}</div>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h4 className="text-sm font-bold mb-3" style={{ color: "var(--vt-gray-dark)" }}>Update Status</h4>
            <div className="space-y-2 mb-4">
              {["submitted", "under_review", "info_requested", "approved", "denied"].map(s => {
                const cfg = STATUS_CONFIG[s];
                const active = selectedStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedStatus(s);
                      setNoteText(selectedPermit.reviewer_notes || "");
                      setInfoRequestedText(selectedPermit.info_requested || "");
                    }}
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
              <div className="mb-4 p-3 rounded-lg border-l-4 border-amber-400 bg-amber-50">
                <div className="text-xs font-bold text-amber-900 mb-2">📋 Information Requested</div>
                <textarea
                  value={infoRequestedText}
                  onChange={(e) => setInfoRequestedText(e.target.value)}
                  placeholder="Specify what information is needed..."
                  className="w-full border rounded px-2 py-1.5 text-xs resize-none"
                  style={{ borderColor: "#fbbf24", background: "white" }}
                  rows={3}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "var(--vt-gray)" }}>Reviewer Notes</label>
              <textarea
                rows={3}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add notes about this permit..."
                className="w-full border rounded px-3 py-2 text-xs resize-none"
                style={{ borderColor: "var(--vt-gray-light)" }}
              />
            </div>

            <button
              onClick={handleSaveAll}
              disabled={saveStatus === "saving"}
              className="w-full py-2 text-sm font-semibold rounded transition-all mt-4"
              style={{
                background: saveStatus === "saved" ? "#10b981" : saveStatus === "error" ? "#ef4444" : "#2d6a4f",
                color: "white"
              }}
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved" : saveStatus === "error" ? "Error" : "Save Changes"}
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded border transition-all hover:bg-green-50"
            style={{ color: "#2d6a4f", borderColor: "#2d6a4f" }}
          >
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}