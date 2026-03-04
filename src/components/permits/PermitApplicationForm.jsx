import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Send, Loader2, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { STATUS_CONFIG } from "./PERMIT_DATA";

const STEPS = [
  { id: "applicant", label: "Applicant Info" },
  { id: "project", label: "Project Details" },
  { id: "documents", label: "Documents & Submit" },
];

const CHECKLIST_BY_PERMIT = {
  "1": ["Engineered site plan", "Soil test results", "Designer certification"],
  "2": ["Survey plat", "Deed", "Lot layout plan"],
  "5": ["Sewer extension design", "Municipal acceptance letter"],
  "6.1": ["Stormwater Pollution Prevention Plan (SWPPP)", "Erosion control plan"],
  "6.2": ["Stormwater management plan", "Impervious surface calculation"],
  "29": ["Wetland delineation report", "Site plan showing wetland buffers"],
  "32.3": ["FEMA flood map", "Floodplain elevation certificate"],
  "32": ["Stream alteration plan", "Hydraulic analysis"],
  "47": ["Act 250 application form", "Land capability analysis", "Environmental impact statement"],
  "47.2": ["Energy compliance certificate", "Building plans"],
  "49": ["Building plans", "Fire protection system design"],
  "50": ["Electrical plans", "Licensed electrician certification"],
  "50.1": ["Electrical inspection sign-off"],
  "50.2": ["Plumbing plans", "Licensed plumber certification"],
  "54": ["Asbestos inspection report", "Abatement contractor certification"],
  "55.1": ["Lead paint inspection report", "RRP certification"],
  "66": ["Access permit application", "Traffic study (if required)"],
  "21": ["Water system design", "Source capacity study"],
  "22": ["Construction plans", "Engineer stamp"],
  "28.1": ["Shoreland impact assessment", "Site plan"],
  "28": ["Lake encroachment plan", "Hydrologic report"],
  "97": ["Jurisdictional determination", "Wetland mitigation plan"],
  "101": ["Historic properties survey", "Section 106 consultation record"],
};

export default function PermitApplicationForm({ permit, projectId, projectData, existingApp, onSave, onClose }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    applicant_name: existingApp?.applicant_name || projectData?.created_by || "",
    applicant_email: existingApp?.applicant_email || "",
    applicant_phone: existingApp?.applicant_phone || "",
    organization: existingApp?.organization || "",
    project_address: existingApp?.project_address || projectData?.address || "",
    project_description: existingApp?.project_description || projectData?.description || "",
    parcel_id: existingApp?.parcel_id || projectData?.parcel_id || "",
    consultant_name: existingApp?.consultant_name || "",
    consultant_email: existingApp?.consultant_email || "",
    special_notes: existingApp?.special_notes || "",
    checklist: existingApp?.checklist || {},
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCheck = (item, val) => setForm(f => ({ ...f, checklist: { ...f.checklist, [item]: val } }));

  const checklist = CHECKLIST_BY_PERMIT[permit.id] || ["Application form", "Site plan", "Supporting documentation"];
  const allChecked = checklist.every(item => form.checklist[item]);

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      project_id: projectId,
      permit_id: permit.id,
      permit_name: permit.name,
      agency: permit.agency,
      category: permit.category,
      sla_days: permit.sla_days,
      status: "submitted",
      submitted_date: new Date().toISOString().split("T")[0],
      ...form,
    };
    if (existingApp?.id) {
      await base44.entities.PermitApplication.update(existingApp.id, data);
    } else {
      await base44.entities.PermitApplication.create(data);
    }
    onSave({ status: "submitted", submitted_date: data.submitted_date });
    setSaving(false);
    setSaved(true);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    const data = {
      project_id: projectId,
      permit_id: permit.id,
      permit_name: permit.name,
      agency: permit.agency,
      category: permit.category,
      sla_days: permit.sla_days,
      status: existingApp?.status || "in_progress",
      ...form,
    };
    if (existingApp?.id) {
      await base44.entities.PermitApplication.update(existingApp.id, data);
    } else {
      await base44.entities.PermitApplication.create(data);
    }
    onSave({ status: data.status });
    setSaving(false);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-green-800 mb-2" style={{ fontFamily: "Georgia, serif" }}>Application Submitted</h3>
        <p className="text-sm text-slate-500 mb-1">Your application for <strong>{permit.name}</strong> has been recorded.</p>
        <p className="text-xs text-slate-400 mb-6">Submit directly to: <span className="font-semibold">{permit.agency}</span></p>
        {permit.url && (
          <a
            href={permit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-green-700 text-white hover:bg-green-800 mb-3"
          >
            <ExternalLink size={14} /> Go to Agency Portal
          </a>
        )}
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 underline">Close</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Step tabs */}
      <div className="flex border-b bg-slate-50 flex-shrink-0">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              step === i
                ? "text-green-700 border-b-2 border-green-600 bg-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">

        {/* Step 0: Applicant */}
        {step === 0 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 mb-4">Primary applicant contact information.</p>
            <Field label="Full Name *" value={form.applicant_name} onChange={v => set("applicant_name", v)} placeholder="Jane Smith" />
            <Field label="Email *" value={form.applicant_email} onChange={v => set("applicant_email", v)} placeholder="jane@example.com" type="email" />
            <Field label="Phone" value={form.applicant_phone} onChange={v => set("applicant_phone", v)} placeholder="(802) 555-0100" />
            <Field label="Organization / Company" value={form.organization} onChange={v => set("organization", v)} placeholder="Smith Development LLC" />
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-400 mb-3">Consultant / Engineer (if applicable)</p>
              <Field label="Consultant Name" value={form.consultant_name} onChange={v => set("consultant_name", v)} placeholder="John Engineer, PE" />
              <Field label="Consultant Email" value={form.consultant_email} onChange={v => set("consultant_email", v)} placeholder="john@eng.com" type="email" />
            </div>
          </div>
        )}

        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 mb-4">Project and site information for this application.</p>
            <Field label="Site Address" value={form.project_address} onChange={v => set("project_address", v)} placeholder="123 Maple St, Burlington VT" />
            <Field label="Parcel ID (SPAN)" value={form.parcel_id} onChange={v => set("parcel_id", v)} placeholder="273-086-10023" />
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Project Description</label>
              <textarea
                rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                style={{ borderColor: "var(--vt-gray-light)" }}
                value={form.project_description}
                onChange={e => set("project_description", e.target.value)}
                placeholder="Describe the proposed work relevant to this permit..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-500">Special Notes / Questions</label>
              <textarea
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
                style={{ borderColor: "var(--vt-gray-light)" }}
                value={form.special_notes}
                onChange={e => set("special_notes", e.target.value)}
                placeholder="Any questions or special circumstances..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Checklist & Submit */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Required Documents Checklist</div>
              <p className="text-xs text-slate-400 mb-4">Confirm you have gathered all required materials before submitting.</p>
              <div className="space-y-2">
                {checklist.map(item => (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.checklist[item]
                        ? "border-green-300 bg-green-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!form.checklist[item]}
                      onChange={e => setCheck(item, e.target.checked)}
                      className="accent-green-600 w-4 h-4 flex-shrink-0"
                    />
                    <span className={`text-sm ${form.checklist[item] ? "text-green-800 font-medium" : "text-slate-600"}`}>{item}</span>
                    {form.checklist[item] && <CheckCircle2 size={14} className="text-green-500 ml-auto flex-shrink-0" />}
                  </label>
                ))}
              </div>
            </div>

            {permit.info_sheet_url && (
              <a
                href={permit.info_sheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <FileText size={15} className="text-green-700" />
                <div className="flex-1 text-sm font-semibold text-green-800">Download Official Application Form</div>
                <ExternalLink size={13} className="text-green-500" />
              </a>
            )}

            {!allChecked && (
              <div className="flex items-start gap-2 rounded-lg p-3 bg-amber-50 border border-amber-200 text-xs text-amber-700">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                Check all items above to confirm your application package is complete before submitting.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 border-t px-6 py-4 flex items-center justify-between gap-3 bg-white">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
        >
          Save Draft
        </button>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving || !form.applicant_name || !form.applicant_email}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Mark as Submitted
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1 text-slate-500">{label}</label>
      <input
        type={type}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
        style={{ borderColor: "var(--vt-gray-light)" }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}