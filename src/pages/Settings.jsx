import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit2, ArrowLeft, Save, X, Check, Info } from "lucide-react";
import HelpIcon from "../components/HelpIcon";

const CATEGORIES = ["core", "likely", "conditional"];
const PHASES = [1, 2, 3, 4];

export default function Settings() {
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);

  function getEmptyForm() {
    return {
      permit_key: "",
      name: "",
      agency: "",
      category: "likely",
      phase: 2,
      sla_days: 30,
      why: "",
      trigger_key: "",
      sheet: "",
      description: "",
      url: "",
      info_sheet_url: "",
      is_active: true,
    };
  }

  useEffect(() => {
    loadPermits();
  }, []);

  const loadPermits = async () => {
    const data = await base44.entities.PermitType.list("-permit_key");
    setPermits(data || []);
    setLoading(false);
  };

  const handleEdit = (permit) => {
    setEditingId(permit.id);
    setFormData(permit);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData(getEmptyForm());
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.permit_key || !formData.name || !formData.agency) {
      alert("Please fill in required fields: Permit Key, Name, Agency");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await base44.entities.PermitType.update(editingId, formData);
      } else {
        await base44.entities.PermitType.create(formData);
      }
      await loadPermits();
      setShowForm(false);
      setEditingId(null);
      setFormData(getEmptyForm());
    } catch (error) {
      alert("Error saving permit: " + error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this permit?")) {
      await base44.entities.PermitType.delete(id);
      await loadPermits();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(getEmptyForm());
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-xl mb-8 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Administration</div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Settings</h1>
        <p className="text-sm mt-1 text-green-200">Manage permits and system configuration</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex gap-2">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Permit Management:</strong> Add, edit, or deactivate permits here. Each permit defines its agency, processing time, category, and required project phases. Changes apply system-wide to all new projects.
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="text-xs text-blue-900 space-y-2">
            <div><strong>Phase:</strong> The project lifecycle stage when this permit is needed (1=Pre-App, 2=Pre-Const, 3=During Const, 4=Post-Const)</div>
            <div><strong>SLA Days:</strong> Expected processing time in business days from submission to decision</div>
            <div><strong>Category:</strong> Core=always needed, Likely=usually needed, Conditional=depends on project conditions</div>
          </div>
        </div>
      </div>

      {showForm ? (
        <PermitForm
          permit={editingId ? permits.find(p => p.id === editingId) : null}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-green-900">Permits ({permits.length})</h2>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded bg-green-700 text-white hover:bg-green-800"
            >
              <Plus size={16} /> New Permit
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="vt-card p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : permits.length === 0 ? (
            <div className="vt-card p-12 text-center">
              <p className="font-semibold text-slate-600 mb-4">No permits defined yet</p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-green-700 text-white hover:bg-green-800"
              >
                <Plus size={14} /> Create First Permit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {permits.map(permit => (
                <div key={permit.id} className="vt-card p-4 flex items-start justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800">{permit.sheet || "—"} {permit.name}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        permit.category === "core" ? "bg-green-100 text-green-700" :
                        permit.category === "likely" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {permit.category}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Phase {permit.phase}
                      </span>
                      {!permit.is_active && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      <div><strong>Key:</strong> {permit.permit_key} | <strong>Agency:</strong> {permit.agency} | <strong>SLA:</strong> {permit.sla_days} days</div>
                      {permit.description && <div className="text-slate-600">{permit.description.substring(0, 100)}{permit.description.length > 100 ? "..." : ""}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(permit)}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(permit.id)}
                      className="p-2 rounded hover:bg-red-50 text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PermitForm({ permit, formData, setFormData, onSave, onCancel, saving }) {
  return (
    <div className="vt-card p-6 border-l-4 border-l-green-600">
      <h2 className="text-lg font-bold text-green-900 mb-4">
        {permit ? "Edit Permit" : "Create New Permit"}
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Permit Key *
              <HelpIcon text="Unique identifier for this permit (e.g., '1', '47', '6.1'). Use consistent naming." width="w-40" />
            </label>
            <input
              type="text"
              value={formData.permit_key}
              onChange={e => setFormData({ ...formData, permit_key: e.target.value })}
              placeholder="e.g. 1, 47, 6.1"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name *
              <HelpIcon text="Full, descriptive name of the permit that applicants will see." width="w-44" />
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full permit name"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agency *
              <HelpIcon text="Name of the agency that reviews this permit (e.g., 'DEC', 'DEC')." width="w-40" />
            </label>
            <input
              type="text"
              value={formData.agency}
              onChange={e => setFormData({ ...formData, agency: e.target.value })}
              placeholder="e.g. DEC, DEC"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
              <HelpIcon text="Core = always required. Likely = usually required. Conditional = depends on project details." width="w-52" />
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phase
              <HelpIcon text="1=Pre-App, 2=Pre-Const, 3=During Const, 4=Post-Const. Determines when applicant needs to apply." width="w-48" />
            </label>
            <select
              value={formData.phase}
              onChange={e => setFormData({ ...formData, phase: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              {PHASES.map(p => (
                <option key={p} value={p}>Phase {p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              SLA Days
              <HelpIcon text="Expected processing time in business days for this permit." width="w-40" />
            </label>
            <input
              type="number"
              value={formData.sla_days}
              onChange={e => setFormData({ ...formData, sla_days: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Sheet Reference</label>
          <input
            type="text"
            value={formData.sheet}
            onChange={e => setFormData({ ...formData, sheet: e.target.value })}
            placeholder="e.g. #1, #49"
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
            style={{ borderColor: "var(--vt-gray-light)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description (Why)</label>
          <textarea
            value={formData.why}
            onChange={e => setFormData({ ...formData, why: e.target.value })}
            placeholder="Brief explanation"
            rows={2}
            className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400"
            style={{ borderColor: "var(--vt-gray-light)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Complete permit description"
            rows={3}
            className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-400"
            style={{ borderColor: "var(--vt-gray-light)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Agency URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Info Sheet URL</label>
            <input
              type="text"
              value={formData.info_sheet_url}
              onChange={e => setFormData({ ...formData, info_sheet_url: e.target.value })}
              placeholder="https://..."
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger Key</label>
            <input
              type="text"
              value={formData.trigger_key}
              onChange={e => setFormData({ ...formData, trigger_key: e.target.value })}
              placeholder="Function identifier"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs font-semibold text-slate-700">Active</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-semibold rounded border"
          style={{ borderColor: "var(--vt-gray-light)", color: "var(--vt-gray)" }}
        >
          <X size={15} className="inline mr-1" /> Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-60"
        >
          <Save size={15} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}