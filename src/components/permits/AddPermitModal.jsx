import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Search } from "lucide-react";

export default function AddPermitModal({ project, allPermits, onClose, onAdded }) {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(null);

  const existingIds = new Set((project.identified_permits || []).map(ip => ip.permit_id));
  const available = allPermits.filter(p =>
    !existingIds.has(p.id) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.agency?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (permit) => {
    setSaving(permit.id);
    const newPermit = { permit_id: permit.id, permit_name: permit.name, category: permit.category, status: "not_started", why_required: permit.why || "" };
    const updatedPermits = [...(project.identified_permits || []), newPermit];

    // Also create a task for it
    await Promise.all([
      base44.entities.Project.update(project.id, { identified_permits: updatedPermits }),
      base44.entities.Task.create({
        project_id: project.id,
        permit_id: permit.id,
        title: `Apply for: ${permit.name}`,
        description: permit.why || "",
        task_type: "information_required",
        status: "pending",
        priority: permit.phase <= 2 ? "high" : "medium",
      }),
    ]);

    setSaving(null);
    onAdded({ ...project, identified_permits: updatedPermits });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--vt-green-dark)", fontFamily: "Georgia, serif" }}>Add Permit</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="px-5 py-3 border-b">
          <div className="flex items-center gap-2 border rounded px-3 py-2" style={{ borderColor: "var(--vt-gray-light)" }}>
            <Search size={14} className="text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search permits by name or agency..."
              className="flex-1 text-sm outline-none"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {available.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No additional permits found.</p>
          ) : available.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-slate-50" style={{ borderColor: "var(--vt-gray-light)" }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 truncate">{p.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.agency} · Phase {p.phase}</div>
              </div>
              <button
                onClick={() => handleAdd(p)}
                disabled={saving === p.id}
                className="px-3 py-1.5 text-xs font-semibold rounded bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 flex-shrink-0"
              >
                {saving === p.id ? "Adding…" : "Add"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}