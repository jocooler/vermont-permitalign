import { useState } from "react";
import { X, ArrowLeft, ArrowRight, CheckCircle2, Upload, FileText, Building2, User, Phone, Mail, Calendar, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Per-permit specific questions beyond the universal fields
const PERMIT_SPECIFIC_FIELDS = {
  "1": [
    { key: "system_type", label: "Type of Wastewater System", type: "select", options: ["Conventional Septic", "Mound System", "Shared System", "Connection to Municipal Sewer"] },
    { key: "daily_flow", label: "Estimated Daily Wastewater Flow (gallons/day)", type: "number", placeholder: "e.g. 450" },
    { key: "soil_test_done", label: "Has a soil test / site evaluation been completed?", type: "yesno" },
    { key: "designer_name", label: "Licensed Designer Name", type: "text", placeholder: "Name of PE or designer" },
  ],
  "2": [
    { key: "lot_count", label: "Number of lots being created", type: "number", placeholder: "e.g. 3" },
    { key: "lot_sizes", label: "Approximate lot sizes (describe)", type: "textarea", placeholder: "e.g. Lot 1: 2 acres, Lot 2: 1.5 acres..." },
    { key: "survey_complete", label: "Is a survey plat complete?", type: "yesno" },
  ],
  "5": [
    { key: "sewer_district", label: "Sewer District / Municipality", type: "text", placeholder: "e.g. Burlington DPW" },
    { key: "connection_size", label: "Proposed connection size (inches)", type: "text", placeholder: "e.g. 6-inch" },
    { key: "extension_length", label: "Approximate length of sewer extension (feet)", type: "number", placeholder: "e.g. 200" },
  ],
  "6.1": [
    { key: "disturbed_area", label: "Total disturbed area (acres)", type: "number", placeholder: "e.g. 1.5" },
    { key: "receiving_waters", label: "Nearest receiving water body", type: "text", placeholder: "e.g. Winooski River" },
    { key: "swppp_prepared", label: "Has a Stormwater Pollution Prevention Plan (SWPPP) been prepared?", type: "yesno" },
  ],
  "6.2": [
    { key: "impervious_area", label: "New impervious surface area (acres)", type: "number", placeholder: "e.g. 1.2" },
    { key: "treatment_type", label: "Proposed stormwater treatment type", type: "select", options: ["Detention Pond", "Bioretention / Rain Garden", "Infiltration Trench", "Green Roof", "Other"] },
  ],
  "29": [
    { key: "wetland_class", label: "Wetland class (if known)", type: "select", options: ["Class I", "Class II", "Class III", "Unknown"] },
    { key: "wetland_impact_area", label: "Area of wetland impact (sq ft)", type: "number", placeholder: "e.g. 2500" },
    { key: "delineation_done", label: "Has a wetland delineation been completed?", type: "yesno" },
    { key: "delineator_name", label: "Wetland Scientist / Delineator Name", type: "text", placeholder: "Name and credentials" },
  ],
  "32.3": [
    { key: "flood_zone", label: "FEMA Flood Zone designation", type: "select", options: ["Zone A", "Zone AE", "Zone AH", "Zone AO", "Zone X (shaded)", "Unknown"] },
    { key: "base_flood_elevation", label: "Base Flood Elevation (BFE) if known", type: "text", placeholder: "e.g. 152 ft NAVD88" },
    { key: "lowest_floor_elevation", label: "Proposed lowest floor elevation", type: "text", placeholder: "e.g. 154 ft NAVD88" },
  ],
  "32": [
    { key: "stream_name", label: "Name of stream", type: "text", placeholder: "e.g. Muddy Brook" },
    { key: "crossing_type", label: "Type of crossing or work", type: "select", options: ["New Culvert", "Bridge", "Bank Stabilization", "Utility Crossing", "Other"] },
    { key: "crossing_length", label: "Length of stream crossing or work area (ft)", type: "number", placeholder: "e.g. 40" },
  ],
  "47": [
    { key: "act250_application_type", label: "Type of Act 250 Application", type: "select", options: ["New Permit", "Amendment", "Extension of Time"] },
    { key: "total_project_acres", label: "Total project acreage", type: "number", placeholder: "e.g. 15" },
    { key: "nrb_district", label: "Natural Resources Board District (1–9)", type: "text", placeholder: "e.g. District 4" },
  ],
  "49": [
    { key: "building_use", label: "Building occupancy type", type: "select", options: ["R-2 (Multifamily)", "R-3 (1-2 family)", "Mixed Use", "Other"] },
    { key: "num_stories", label: "Number of stories", type: "number", placeholder: "e.g. 3" },
    { key: "sprinklered", label: "Will the building be fully sprinklered?", type: "yesno" },
    { key: "construction_type", label: "Construction type (IBC)", type: "text", placeholder: "e.g. Type V-A" },
  ],
  "66": [
    { key: "highway_route", label: "State highway route number", type: "text", placeholder: "e.g. VT Route 2" },
    { key: "access_type", label: "Type of access", type: "select", options: ["New Driveway", "Widening Existing", "Utility Work", "Other"] },
    { key: "vtrans_district", label: "VTrans District", type: "text", placeholder: "e.g. District 5" },
  ],
};

const STEPS = ["Applicant Info", "Project Details", "Specific Questions", "Documents", "Review & Submit"];

function FieldInput({ field, value, onChange }) {
  const base = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400";
  const style = { borderColor: "var(--vt-gray-light)" };

  if (field.type === "select") return (
    <select className={base} style={style} value={value || ""} onChange={e => onChange(e.target.value)}>
      <option value="">Select...</option>
      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  if (field.type === "textarea") return (
    <textarea rows={3} className={`${base} resize-none`} style={style} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || ""} />
  );

  if (field.type === "yesno") return (
    <div className="flex gap-3">
      {["Yes", "No"].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="flex-1 py-2 rounded border-2 text-sm font-semibold transition-all"
          style={{
            borderColor: value === opt ? "var(--vt-green)" : "var(--vt-gray-light)",
            background: value === opt ? "var(--vt-green-pale)" : "white",
            color: value === opt ? "var(--vt-green-dark)" : "var(--vt-gray)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      className={base}
      style={style}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder || ""}
    />
  );
}

export default function PermitIntakeForm({ permit, project, onClose, onSubmitted }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Pre-fill from project profile if available
  const profile = project?.profile || {};
  const [applicant, setApplicant] = useState({
    name: profile.applicant_name || "", 
    organization: profile.applicant_organization || "", 
    email: profile.applicant_email || "", 
    phone: profile.applicant_phone || "", 
    mailing_address: profile.applicant_mailing_address || "",
  });
  const [projectInfo, setProjectInfo] = useState({
    site_address: project?.address || "",
    town: project?.town || "",
    parcel_id: project?.parcel_id || "",
    project_description: profile.project_description || project?.description || "",
    anticipated_start_date: profile.anticipated_start_date || "",
    anticipated_end_date: profile.anticipated_end_date || "",
  });
  const [specificAnswers, setSpecificAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]); // [{name, url}]

  const specificFields = PERMIT_SPECIFIC_FIELDS[permit.id] || [];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFiles(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFiles(prev => [...prev, { name: file.name, url: file_url }]);
    }
    setUploadingFiles(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    await base44.entities.PermitApplication.create({
      project_id: project.id,
      permit_id: permit.id,
      permit_name: permit.name,
      agency: permit.agency,
      category: permit.category,
      status: "submitted",
      submitted_date: new Date().toISOString().split("T")[0],
      sla_days: permit.sla_days,
      notes: JSON.stringify({
        applicant,
        project_info: projectInfo,
        specific_answers: specificAnswers,
        uploaded_files: uploadedFiles,
      }),
    });
    setSaving(false);
    onSubmitted();
  };

  const canAdvanceStep0 = applicant.name.trim() && applicant.email.trim();
  const canAdvanceStep1 = projectInfo.site_address.trim() && projectInfo.town.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-5 border-b bg-green-900 rounded-t-xl flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Permit Intake Application</div>
            <h2 className="text-lg font-bold text-white leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              {permit.sheet} — {permit.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-green-200">
              <Building2 size={13} />{permit.agency}
            </div>
          </div>
          <button onClick={onClose} className="text-green-300 hover:text-white p-1.5 rounded flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Step Indicators */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1 last:flex-none">
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    background: i < step ? "var(--vt-green)" : i === step ? "var(--vt-green-dark)" : "var(--vt-gray-light)",
                    color: i <= step ? "white" : "var(--vt-gray)",
                  }}
                >
                  {i < step ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block truncate ${i === step ? "text-green-800" : "text-slate-400"}`}>{s}</span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1">

          {/* Step 0: Applicant Info */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-900 mb-0.5">Applicant Information</h3>
                <p className="text-sm text-slate-500">Who is submitting this application?</p>
              </div>
              {[
                { key: "name", label: "Full Name *", placeholder: "First and Last Name", icon: User },
                { key: "organization", label: "Organization / Company", placeholder: "Optional", icon: Building2 },
                { key: "email", label: "Email Address *", placeholder: "you@example.com", icon: Mail, type: "email" },
                { key: "phone", label: "Phone Number", placeholder: "(802) 555-0100", icon: Phone },
                { key: "mailing_address", label: "Mailing Address", placeholder: "Street, City, State, ZIP", icon: null },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={applicant[f.key]}
                    onChange={e => setApplicant(a => ({ ...a, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Project Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-900 mb-0.5">Project & Site Details</h3>
                <p className="text-sm text-slate-500">Confirm site information for this permit application.</p>
              </div>
              {[
                { key: "site_address", label: "Site Address *", placeholder: "Street address" },
                { key: "town", label: "Town / Municipality *", placeholder: "e.g. Burlington" },
                { key: "parcel_id", label: "Parcel ID (SPAN)", placeholder: "e.g. 273-086-10023" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>{f.label}</label>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                    style={{ borderColor: "var(--vt-gray-light)" }}
                    value={projectInfo[f.key]}
                    onChange={e => setProjectInfo(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Project Description</label>
                <textarea
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400"
                  style={{ borderColor: "var(--vt-gray-light)" }}
                  value={projectInfo.project_description}
                  onChange={e => setProjectInfo(p => ({ ...p, project_description: e.target.value }))}
                  placeholder="Describe the proposed work..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Anticipated Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400" style={{ borderColor: "var(--vt-gray-light)" }} value={projectInfo.anticipated_start_date} onChange={e => setProjectInfo(p => ({ ...p, anticipated_start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Anticipated End Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400" style={{ borderColor: "var(--vt-gray-light)" }} value={projectInfo.anticipated_end_date} onChange={e => setProjectInfo(p => ({ ...p, anticipated_end_date: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Permit-Specific Questions */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-green-900 mb-0.5">Permit-Specific Questions</h3>
                <p className="text-sm text-slate-500">Answer questions specific to this permit application.</p>
              </div>
              {specificFields.length === 0 ? (
                <div className="rounded-lg p-5 bg-slate-50 border border-slate-200 text-sm text-slate-500 text-center">
                  No permit-specific questions for this permit. Proceed to documents.
                </div>
              ) : (
                specificFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--vt-gray)" }}>{field.label}</label>
                    <FieldInput
                      field={field}
                      value={specificAnswers[field.key]}
                      onChange={v => setSpecificAnswers(a => ({ ...a, [field.key]: v }))}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Step 3: Document Uploads */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-green-900 mb-0.5">Supporting Documents</h3>
                <p className="text-sm text-slate-500">Upload any plans, surveys, reports, or forms required for this permit.</p>
              </div>

              <div className="rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-green-400 transition-colors">
                <Upload size={28} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-600 mb-1">Drag & drop or click to upload</p>
                <p className="text-xs text-slate-400 mb-3">PDF, PNG, JPG, DWG up to 50MB each</p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded font-semibold text-sm bg-green-700 text-white hover:bg-green-800">
                  <Upload size={14} /> Choose Files
                  <input type="file" multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.dwg,.doc,.docx" onChange={handleFileUpload} />
                </label>
              </div>

              {uploadingFiles && (
                <div className="text-sm text-green-700 text-center animate-pulse">Uploading files...</div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Uploaded ({uploadedFiles.length})</div>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
                      <FileText size={15} className="text-green-700 flex-shrink-0" />
                      <span className="text-sm font-medium text-green-800 truncate flex-1">{f.name}</span>
                      <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-lg p-4 bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <div className="font-semibold mb-1 flex items-center gap-1.5"><AlertCircle size={14} /> Typical required documents for this permit:</div>
                <ul className="list-disc ml-4 space-y-0.5 text-xs">
                  {getRequiredDocs(permit.id).map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-green-900 mb-0.5">Review & Submit</h3>
                <p className="text-sm text-slate-500">Review your application before submitting.</p>
              </div>

              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                <SummarySection title="Applicant" icon={User}>
                  <SummaryRow label="Name" value={applicant.name} />
                  <SummaryRow label="Email" value={applicant.email} />
                  {applicant.phone && <SummaryRow label="Phone" value={applicant.phone} />}
                  {applicant.organization && <SummaryRow label="Organization" value={applicant.organization} />}
                </SummarySection>
                <SummarySection title="Site" icon={Building2}>
                  <SummaryRow label="Address" value={projectInfo.site_address} />
                  <SummaryRow label="Town" value={projectInfo.town} />
                  {projectInfo.parcel_id && <SummaryRow label="SPAN" value={projectInfo.parcel_id} />}
                </SummarySection>
                {Object.keys(specificAnswers).length > 0 && (
                  <SummarySection title="Specific Answers" icon={FileText}>
                    {specificFields.filter(f => specificAnswers[f.key]).map(f => (
                      <SummaryRow key={f.key} label={f.label} value={String(specificAnswers[f.key])} />
                    ))}
                  </SummarySection>
                )}
                <SummarySection title="Documents" icon={FileText}>
                  {uploadedFiles.length === 0
                    ? <p className="text-xs text-slate-400 italic">No documents uploaded</p>
                    : uploadedFiles.map((f, i) => <SummaryRow key={i} label={`File ${i + 1}`} value={f.name} />)
                  }
                </SummarySection>
              </div>

              <div className="rounded-lg p-4 bg-blue-50 border border-blue-200 text-sm text-blue-700">
                By submitting, you confirm that the information provided is accurate and complete to the best of your knowledge. This application will be recorded and the permit status will be updated to "Submitted."
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl flex justify-between items-center gap-3">
          <button
            onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm"
            style={{ background: "var(--vt-gray-light)", color: "var(--vt-gray-dark)" }}
          >
            <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={(step === 0 && !canAdvanceStep0) || (step === 1 && !canAdvanceStep1)}
              className="flex items-center gap-2 px-5 py-2 rounded font-semibold text-sm bg-green-700 text-white hover:bg-green-800 disabled:opacity-40"
            >
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 rounded font-semibold text-sm bg-green-700 text-white hover:bg-green-800 disabled:opacity-60"
            >
              {saving ? "Submitting…" : <><CheckCircle2 size={14} /> Submit Application</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySection({ title, icon: Icon, children }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
        <Icon size={12} /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-slate-400 w-28 flex-shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-slate-700 font-medium">{value || "—"}</span>
    </div>
  );
}

function getRequiredDocs(permitId) {
  const docs = {
    "1": ["Site plan showing system location", "Soil evaluation / site test pit report", "Designer's plans and specifications"],
    "2": ["Survey plat with lot lines", "Site plan", "Wastewater design for each lot"],
    "5": ["Engineering plans for sewer extension", "Municipal approval letter", "Site plan"],
    "6.1": ["Stormwater Pollution Prevention Plan (SWPPP)", "Site plan with drainage", "Erosion control plan"],
    "6.2": ["Stormwater management plan", "Hydrologic calculations", "Site plan"],
    "29": ["Wetland delineation report", "Site plan showing wetland boundaries", "Mitigation plan (if applicable)"],
    "32.3": ["FEMA Elevation Certificate", "Site plan with flood zone boundary", "Floodplain development permit"],
    "32": ["Site plan showing stream location", "Engineering plans for crossing", "Photos of existing stream"],
    "47": ["Act 250 application form", "Site plan", "Environmental review materials", "Traffic study (if applicable)"],
    "49": ["Architectural plans", "Structural plans", "Fire protection system plans", "Energy compliance forms"],
    "50": ["Electrical plans", "Load calculations", "Equipment specifications"],
    "54": ["Asbestos survey report", "Notification to DEC", "Contractor certifications"],
    "66": ["Traffic study", "Site plan showing access", "VTrans permit application"],
  };
  return docs[permitId] || ["Site plan", "Application form", "Supporting documentation as required by agency"];
}