import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskForm({ onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "other",
    priority: "medium",
    due_date: "",
    project_id: "",
    permit_id: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.project_id) {
      alert("Please fill in title and project");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Task.create({
        ...formData,
        status: "pending",
      });
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--vt-green-dark)", fontFamily: "Georgia, serif" }}>
            Create Task
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project *</label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              <option value="">Select a project</option>
              {/* Projects will need to be fetched */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Task Type</label>
            <select
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              <option value="other">General Task</option>
              <option value="document_upload">Document Upload</option>
              <option value="information_required">Information Required</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-700 hover:bg-green-800"
            >
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}