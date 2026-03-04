import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ArrowLeft, ArrowRight, MapPin, Building2, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { PERMITS, STATUS_CONFIG, CATEGORY_CONFIG, determinePermits } from "../components/permits/PERMIT_DATA";
import PermitCard from "../components/permits/PermitCard";

const STATUS_OPTS = ["not_started","in_progress","submitted","under_review","info_requested","approved","denied"];

const FORM_STEPS = [
  { id: "details", label: "Project Details" },
  { id: "site", label: "Site Conditions" },
  { id: "review", label: "Review & Save" },
];

function FormStepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {FORM_STEPS.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                style={{
                  background: done ? "#2d6a4f" : active ? "#1a3d2e" : "white",
                  borderColor: done || active ? (done ? "#2d6a4f" : "#1a3d2e") : "#cbd5e1",
                  color: done || active ? "white" : "#94a3b8",
                }}
              >
                {done ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span className="text-xs font-semibold hidden sm:block whitespace-nowrap" style={{ color: active ? "#1a3d2e" : done ? "#2d6a4f" : "#94a3b8" }}>
                {step.label}
              </span>
            </div>
            {idx < FORM_STEPS.length - 1 && (
              <div className="w-16 h-0.5 mb-5 mx-2" style={{ background: done ? "#2d6a4f" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
      <button
        role="checkbox"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor: value ? "var(--vt-green)" : "var(--vt-gray-light)",
          background: value ? "var(--vt-green)" : "white",
        }}
      >
        {value && <CheckCircle2 size={12} color="white" />}
      </button>
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--vt-gray-dark)" }}>{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>{hint}</div>}
      </div>
    </label>
  );
}

function ProjectForm({ onSave, onCancel, initial }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initial || {
    name: "", description: "", address: "", town: "", parcel_id: "",
    project_type: "residential", unit_count: 4, disturbed_acres: 0,
    creating_lots: false,
    site_conditions: {
      near_wetlands: false, in_floodplain: false, near_stream: false,
      near_lake_or_pond: false, state_highway_access: false,
      elevation_above_2500: false, existing_structures: false,
      pre_1978_structures: false, connects_municipal_sewer: false,
      own_water_system: false, federal_funding: false,
    }
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSite = (k, v) => setForm(f => ({ ...f, site_conditions: { ...f.site_conditions, [k]: v } }));

  const conditions = {
    ...form.site_conditions,
    unit_count: Number(form.unit_count),
    disturbed_acres: Number(form.disturbed_acres),
    creating_lots: form.creating_lots,
  };
  const permits = determinePermits(conditions);
  const byCategory = {
    core: permits.filter(p => p.category === "core"),
    likely: permits.filter(p => p.category === "likely"),
    conditional: permits.filter(p => p.category === "conditional"),
  };

  const handleSave = () => {
    const identified = permits.map(p => ({ permit_id: p.id, permit_name: p.name, category: p.category, status: "not_started", why_required: p.why }));
    onSave({ ...form, unit_count: Number(form.unit_count), disturbed_acres: Number(form.disturbed_acres), identified_permits: identified });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FormStepIndicator currentStep={step} />

      {/* Step 0: Project Details */}
      {step === 0 && (
        <div className="vt-card p-6">
          <h3 className="font-bold mb-1" style={{ color: "var(--vt-green-dark)" }}>Project Details</h3>
          <p className="text-sm mb-5" style={{ color: "var(--vt-gray-mid)" }}>Tell us the basics about your project.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Project Name *</label>
              <input className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Maple Street Residences" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Town / Municipality</label>
              <input className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.town} onChange={e => set("town", e.target.value)} placeholder="e.g. Burlington" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Parcel ID</label>
              <input className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.parcel_id} onChange={e => set("parcel_id", e.target.value)} placeholder="e.g. 000-000-00000" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Site Address</label>
              <input className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>Number of residential units</label>
              <div className="flex items-center gap-3">
                <input type="range" min={1} max={20} value={form.unit_count} onChange={e => set("unit_count", Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--vt-green)" }} />
                <div className="w-16 text-center font-bold text-lg rounded-lg py-1" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>{form.unit_count}</div>
              </div>
              {form.unit_count >= 10 && (
                <div className="mt-2 text-xs flex items-start gap-1.5 p-2 rounded" style={{ background: "#fff7ed", color: "#92400e" }}>
                  <Info size={13} className="mt-0.5 flex-shrink-0" /> At 10+ units, Act 250 land use permit may be triggered.
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>Estimated acres disturbed during construction</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={5} step={0.25} value={form.disturbed_acres} onChange={e => set("disturbed_acres", Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--vt-green)" }} />
                <div className="w-16 text-center font-bold text-lg rounded-lg py-1" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>{form.disturbed_acres}</div>
              </div>
              {form.disturbed_acres >= 1 && (
                <div className="mt-2 text-xs flex items-start gap-1.5 p-2 rounded" style={{ background: "#fff7ed", color: "#92400e" }}>
                  <Info size={13} className="mt-0.5 flex-shrink-0" /> At ≥1 acre disturbed, stormwater permits are required.
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Description</label>
              <textarea rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" style={{ borderColor: "var(--vt-gray-light)" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the project and proposed activities..." />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded border" style={{ borderColor: "var(--vt-gray-light)", color: "var(--vt-gray)" }}>Cancel</button>
            <button onClick={() => setStep(1)} disabled={!form.name} className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm disabled:opacity-50" style={{ background: "var(--vt-green)", color: "white" }}>
              Next: Site Conditions <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Site Conditions */}
      {step === 1 && (
        <div className="vt-card p-6">
          <h3 className="font-bold mb-1" style={{ color: "var(--vt-green-dark)" }}>Site Conditions</h3>
          <p className="text-sm mb-5" style={{ color: "var(--vt-gray-mid)" }}>Check all conditions that apply to your site.</p>
          <div className="space-y-1">
            <Toggle label="Creating separate lots (subdivision)" hint="Dividing land into two or more parcels" value={form.creating_lots} onChange={v => set("creating_lots", v)} />
            <Toggle label="Connecting to municipal sewer" hint="Project will tie into existing public sewer system" value={form.site_conditions.connects_municipal_sewer} onChange={v => setSite("connects_municipal_sewer", v)} />
            <Toggle label="Creating own water system" hint="Project will serve 15+ connections or 25+ people" value={form.site_conditions.own_water_system} onChange={v => setSite("own_water_system", v)} />
            <Toggle label="Site is near wetlands" hint="Class I or II wetlands within or adjacent to the project area" value={form.site_conditions.near_wetlands} onChange={v => setSite("near_wetlands", v)} />
            <Toggle label="Site is in a floodplain" hint="Within FEMA 100-year floodplain" value={form.site_conditions.in_floodplain} onChange={v => setSite("in_floodplain", v)} />
            <Toggle label="Work near a perennial stream" hint="Stream crossings or work within stream buffer" value={form.site_conditions.near_stream} onChange={v => setSite("near_stream", v)} />
            <Toggle label="Within 250 ft of a lake or pond >10 acres" hint="Shoreland protection zone" value={form.site_conditions.near_lake_or_pond} onChange={v => setSite("near_lake_or_pond", v)} />
            <Toggle label="Access from a state highway" hint="Driveway or access point is off a VTrans-maintained road" value={form.site_conditions.state_highway_access} onChange={v => setSite("state_highway_access", v)} />
            <Toggle label="Site is above 2,500 ft elevation" hint="May trigger Act 250 review" value={form.site_conditions.elevation_above_2500} onChange={v => setSite("elevation_above_2500", v)} />
            <Toggle label="Demolishing or renovating existing structures" hint="Any existing buildings on site" value={form.site_conditions.existing_structures} onChange={v => setSite("existing_structures", v)} />
            <Toggle label="Existing structures built before 1978" hint="Potential lead-based paint hazard" value={form.site_conditions.pre_1978_structures} onChange={v => setSite("pre_1978_structures", v)} />
            <Toggle label="Project involves federal funding or federal permits" hint="e.g., Army Corps of Engineers involvement" value={form.site_conditions.federal_funding} onChange={v => setSite("federal_funding", v)} />
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm" style={{ background: "var(--vt-gray-light)", color: "var(--vt-gray-dark)" }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm" style={{ background: "var(--vt-green)", color: "white" }}>
              Review Permits <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review & Save */}
      {step === 2 && (
        <div>
          <div className="rounded-xl mb-5 p-5 flex items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #3a7d5c 100%)" }}>
            <div>
              <div className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{form.name}</div>
              <div className="text-xs mt-0.5 text-green-200">{form.town} · {form.unit_count} units · {form.disturbed_acres} acres disturbed</div>
              <div className="flex gap-2 mt-2">
                {byCategory.core.length > 0 && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.core.length} core</span>}
                {byCategory.likely.length > 0 && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.likely.length} likely</span>}
                {byCategory.conditional.length > 0 && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.conditional.length} conditional</span>}
              </div>
            </div>
            <div className="text-center bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white">{permits.length}</div>
              <div className="text-xs text-green-200">permits</div>
            </div>
          </div>

          {[
            { key: "core", title: "Core Permits", permits: byCategory.core, accent: "border-l-4 border-green-500", titleColor: "text-green-800", bg: "bg-green-50" },
            { key: "likely", title: "Likely Required", permits: byCategory.likely, accent: "border-l-4 border-amber-400", titleColor: "text-amber-800", bg: "bg-amber-50" },
            { key: "conditional", title: "Conditional", permits: byCategory.conditional, accent: "border-l-4 border-indigo-400", titleColor: "text-indigo-800", bg: "bg-indigo-50" },
          ].map(({ key, title, permits: catPermits, accent, titleColor, bg }) => catPermits.length > 0 && (
            <div key={key} className={`vt-card p-4 mb-3 ${accent}`}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${titleColor}`}>{title} ({catPermits.length})</div>
              <div className="flex flex-wrap gap-2">
                {catPermits.map(p => (
                  <span key={p.id} className="text-xs bg-white border rounded-full px-2 py-0.5 font-medium" style={{ color: "var(--vt-gray-dark)", borderColor: "var(--vt-gray-light)" }}>{p.sheet} {p.name}</span>
                ))}
              </div>
            </div>
          ))}

          {permits.length === 0 && (
            <div className="vt-card p-5 mb-4 text-sm text-center" style={{ color: "var(--vt-gray-mid)" }}>No permits identified based on current conditions.</div>
          )}

          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm" style={{ background: "var(--vt-gray-light)", color: "var(--vt-gray-dark)" }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm" style={{ background: "var(--vt-green)", color: "white" }}>
              Save Project <CheckCircle2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectDetail({ project, onBack, onStatusChange }) {
  const permits = PERMITS.filter(p => (project.identified_permits || []).some(ip => ip.permit_id === p.id));
  const ipMap = {};
  (project.identified_permits || []).forEach(ip => { ipMap[ip.permit_id] = ip; });

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "var(--vt-green)" }}>
        <ArrowLeft size={15} /> All Projects
      </button>

      <div className="rounded-xl mb-6 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{project.name}</h2>
            {(project.town || project.address) && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-green-200">
                <MapPin size={14} /> {[project.address, project.town].filter(Boolean).join(", ")}
              </div>
            )}
            {project.description && <p className="mt-2 text-sm text-green-100 opacity-80">{project.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{project.unit_count || "—"}</div>
              <div className="text-xs text-green-200">units</div>
            </div>
            <div className="text-center bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>{permits.length}</div>
              <div className="text-xs text-green-200">permits</div>
            </div>
          </div>
        </div>
      </div>

      {permits.length === 0 ? (
        <div className="vt-card p-8 text-center text-sm" style={{ color: "var(--vt-gray-mid)" }}>No permits identified yet.</div>
      ) : (
        <div>
          {["core", "likely", "conditional"].map(cat => {
            const catPermits = permits.filter(p => p.category === cat);
            if (!catPermits.length) return null;
            const cfg = CATEGORY_CONFIG[cat];
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cfg.className}>{cfg.label}</span>
                  <span className="text-xs" style={{ color: "var(--vt-gray-mid)" }}>— {catPermits.length} permit{catPermits.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {catPermits.map(p => (
                    <PermitCard
                      key={p.id}
                      permit={p}
                      status={ipMap[p.id]?.status || "not_started"}
                      onClick={() => {
                        const current = ipMap[p.id]?.status || "not_started";
                        const next = STATUS_OPTS[(STATUS_OPTS.indexOf(current) + 1) % STATUS_OPTS.length];
                        onStatusChange(p.id, next);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <p className="text-xs mt-2" style={{ color: "var(--vt-gray-mid)" }}>Click any permit card to cycle its status.</p>
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = new URLSearchParams(window.location.search);
  const [view, setView] = useState(params.get("new") ? "new" : "list"); // list | new | detail
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Project.list("-created_date").then(p => { setProjects(p || []); setLoading(false); });
  }, []);

  const handleSave = async (data) => {
    const saved = await base44.entities.Project.create({ ...data, status: "draft" });
    setProjects(prev => [saved, ...prev]);
    setSelected(saved);
    setView("detail");
  };

  const handleStatusChange = async (permitId, newStatus) => {
    const updated = {
      ...selected,
      identified_permits: (selected.identified_permits || []).map(ip =>
        ip.permit_id === permitId ? { ...ip, status: newStatus } : ip
      )
    };
    await base44.entities.Project.update(selected.id, { identified_permits: updated.identified_permits });
    setSelected(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const statusCfg = {
    draft: { color: "#718096", bg: "#edf2f7", label: "Draft" },
    in_progress: { color: "#2980b9", bg: "#ebf5fb", label: "In Progress" },
    submitted: { color: "#6d28d9", bg: "#ede9fe", label: "Submitted" },
    under_review: { color: "#b7791f", bg: "#fffbeb", label: "Under Review" },
    approved: { color: "#15803d", bg: "#dcfce7", label: "Approved" },
    denied: { color: "#b91c1c", bg: "#fee2e2", label: "Denied" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {view === "list" && (
        <>
          <div className="rounded-xl mb-8 p-6 flex items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Vermont Permitting System</div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>My Projects</h1>
              <p className="text-sm mt-1 text-green-200">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setView("new")} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded bg-white hover:bg-green-50 transition-colors" style={{ color: "var(--vt-green-dark)" }}>
              <Plus size={15} /> New Project
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="vt-card p-5 animate-pulse h-20" />)}</div>
          ) : projects.length === 0 ? (
            <div className="vt-card p-12 text-center">
              <Building2 size={36} className="mx-auto mb-3 opacity-20" style={{ color: "var(--vt-green)" }} />
              <p className="font-semibold mb-1">No projects yet</p>
              <p className="text-sm mb-5" style={{ color: "var(--vt-gray-mid)" }}>Create your first project to get started</p>
              <button onClick={() => setView("new")} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded" style={{ background: "var(--vt-green)", color: "white" }}>
                <Plus size={14} /> Create Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => {
                const s = statusCfg[p.status] || statusCfg.draft;
                const permitCount = (p.identified_permits || []).length;
                const approved = (p.identified_permits || []).filter(ip => ip.status === "approved").length;
                return (
                  <div key={p.id} className="vt-card p-5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all border-l-4 hover:border-green-500" style={{ borderLeftColor: s.color }} onClick={() => { setSelected(p); setView("detail"); }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-700">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800">{p.name}</div>
                      <div className="text-xs mt-1 flex items-center gap-3 text-slate-500">
                        {p.town && <span className="flex items-center gap-1"><MapPin size={11} />{p.town}</span>}
                        {p.unit_count && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">{p.unit_count} units</span>}
                        {permitCount > 0 && <span>{approved}/{permitCount} permits done</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {permitCount > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-1">
                          <span className="text-xs text-slate-400">{Math.round((approved/permitCount)*100)}%</span>
                          <div className="w-24 h-2 rounded-full bg-slate-100">
                            <div className="h-2 rounded-full transition-all bg-green-500" style={{ width: `${permitCount ? (approved / permitCount) * 100 : 0}%` }} />
                          </div>
                        </div>
                      )}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{s.label}</span>
                      <ChevronRight size={15} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {view === "new" && (
        <div>
          <button onClick={() => setView("list")} className="flex items-center gap-1.5 text-sm font-medium mb-6 text-green-700 hover:text-green-900">
            <ArrowLeft size={15} /> Back to Projects
          </button>
          <div className="rounded-xl mb-6 p-5" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">New Project</div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Create New Project</h1>
          </div>
          <ProjectForm onSave={handleSave} onCancel={() => setView("list")} />
        </div>
      )}

      {view === "detail" && selected && (
        <ProjectDetail
          project={selected}
          onBack={() => { setView("list"); }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}