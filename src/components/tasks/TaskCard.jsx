import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#64748b", icon: Clock },
  in_progress: { label: "In Progress", color: "#2563eb", icon: Clock },
  completed: { label: "Completed", color: "#16a34a", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "#dc2626", icon: AlertCircle },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", bg: "bg-blue-50", border: "border-blue-200" },
  medium: { label: "Medium", bg: "bg-yellow-50", border: "border-yellow-200" },
  high: { label: "High", bg: "bg-red-50", border: "border-red-200" },
};

export default function TaskCard({ task, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;
  const isOverdue = task.status !== "completed" && task.due_date && new Date(task.due_date) < new Date();
  const isCompleted = task.status === "completed";

  const handleToggleComplete = async () => {
    setLoading(true);
    const newStatus = isCompleted ? "pending" : "completed";
    await base44.entities.Task.update(task.id, {
      status: newStatus,
      completed_date: newStatus === "completed" ? new Date().toISOString().split("T")[0] : null,
    });
    setLoading(false);
    onUpdated();
  };

  // Determine action link: permit tasks → project permits tab, profile task → project profile
  const getActionUrl = () => {
    if (!task.project_id) return null;
    if (task.title?.toLowerCase().includes("profile")) {
      return `${createPageUrl("ProjectProfile")}?id=${task.project_id}&back=project`;
    }
    return `${createPageUrl("Projects")}?project=${task.project_id}`;
  };

  const actionUrl = getActionUrl();

  return (
    <div className={`vt-card p-4 border-l-4 transition-all hover:shadow-md ${priority.bg} ${isCompleted ? "opacity-60" : ""}`} style={{ borderLeftColor: status.color }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={handleToggleComplete}
              disabled={loading}
              className="flex-shrink-0 hover:opacity-70 transition-opacity disabled:opacity-40"
            >
              {isCompleted ? (
                <CheckCircle2 size={20} className="text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-green-500 transition-colors" />
              )}
            </button>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 ml-8">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold" style={{ background: status.color + "20", color: status.color }}>
              <StatusIcon size={12} />
              {status.label}
            </span>

            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${priority.bg} border ${priority.border}`}>
              {priority.label} Priority
            </span>

            {task.due_date && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${isOverdue ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}

            {task.task_type && task.task_type !== "other" && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                {task.task_type.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {actionUrl && (
          <a
            href={actionUrl}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border hover:bg-green-50 transition-colors"
            style={{ borderColor: "var(--vt-green)", color: "var(--vt-green)" }}
          >
            {isCompleted ? <>View Project <ExternalLink size={11} /></> : <>Take Action <ExternalLink size={11} /></>}
          </a>
        )}
      </div>
    </div>
  );
}