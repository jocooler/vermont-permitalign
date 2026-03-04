import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, ArrowLeft, MapPin, Building2, CheckCircle2, Clock, AlertTriangle, ChevronRight, X } from "lucide-react";
import { PERMITS, STATUS_CONFIG, CATEGORY_CONFIG, determinePermits } from "../components/permits/PERMIT_DATA";
import PermitCard from "../components/permits/PermitCard";

const STATUS_OPTS = ["not_started","in_progress","submitted","under_review","info_requested","approved","denied"];

function ProjectForm({ onSave, onCancel, initial }) {
  const [form, setForm] = useState(initial || {
    name: "", description: "", address: "", town: "", parcel_id: "",
    project_type: "residential", unit_count: 4, disturbed_acres: 0,
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

  const siteToggles = [
    { key: "connects_municipal_sewer", label: "Connecting to municipal sewer" },
    { key: "own_water_system", label: "Creating own water system" },
    { key: "near_wetlands", label: "Near wetlands" },
    { key: "in_floodplain", label: "In FEMA floodplain" },
    { key: "near_stream", label: "Work near perennial stream" },
    { key: "near_lake_or_pond", label: "Within 250 ft of lake/pond >10 acres" },
    { key: "state_highway_access", label: "Access from state highway" },
    { key: "elevation_above_2500", label: "Above 2,500 ft elevation" },
    { key: "existing_structures", label: "Demolishing/renovating existing structures" },
    { key: "pre_1978_structures", label: "Pre-1978 structures on site" },
    { key: "federal_funding", label: "Federal funding or federal permits involved" },
  ];

  const conditions = {
    ...form.site_conditions,
    unit_count: Number(form.unit_count),
    disturbed_acres: Number(form.disturbed_acres),
    creating_lots: form.creating_lots,
  };
  const permits = determinePermits(conditions);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="vt-card p-6 mb-6">
        <h3 className="font-bold mb-4" style={{ color: "var(--vt-green-dark)" }}>Project Details</h3>
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
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Number of Units</label>
            <input type="number" className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.unit_count} onChange={e => set("unit_count", e.target.value)} min={1} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Acres Disturbed</label>
            <input type="number" step="0.1" className="w-full border rounded px-3 py-2 text-sm" style={{ borderColor: "var(--vt-gray-light)" }} value={form.disturbed_acres} onChange={e => set("disturbed_acres", e.target.value)} min={0} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--vt-gray)" }}>Description</label>
            <textarea rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" style={{ borderColor: "var(--vt-gray-light)" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the project and proposed activities..." />
          </div>
        </div>
      </div>

      <div className="vt-card p-6 mb-6">
        <h3 className="font-bold mb-1" style={{ color: "var(--vt-green-dark)" }}>Site Conditions</h3>
        <p className="text-xs mb-4" style={{ color: "var(--vt-gray-mid)" }}>Check all that apply to your site.</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {siteToggles.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!!form.site_conditions[key]}
                onChange={e => setSite(key, e.target.checked)}
                style={{ accentColor: "var(--vt-green)" }}
                className="w-4 h-4"
              />
              <span className="text-xs" style={{ color: "var(--vt-gray-dark)" }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {permits.length > 0 && (
        <div className="vt-card p-5 mb-6" style={{ borderLeft: "4px solid var(--vt-green)" }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--vt-green-dark)" }}>
            {permits.length} Permits Identified
          </h3>
          <div className="flex flex-wrap gap-2">
            {permits.map(p => {
              const cat = CATEGORY_CONFIG[p.category];
              return (
                <span key={p.id} className={cat.className} style={{ fontSize: "0.7rem" }}>{p.sheet} {p.name}</span>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded border" style={{ borderColor: "var(--vt-gray-light)", color: "var(--vt-gray)" }}>
          Cancel
        </button>
        <button
          onClick={() => {
            const identified = permits.map(p => ({ permit_id: p.id, permit_name: p.name, category: p.category, status: "not_started", why_required: p.why }));
            onSave({ ...form, unit_count: Number(form.unit_count), disturbed_acres: Number(form.disturbed_acres), identified_permits: identified });
          }}
          className="flex-1 px-4 py-2 text-sm font-semibold rounded"
          style={{ background: "var(--vt-green)", color: "white" }}
          disabled={!form.name}
        >
          Save Project
        </button>
      </div>
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