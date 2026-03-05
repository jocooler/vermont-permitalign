import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Filter, CheckCircle2, Clock, AlertCircle, FolderOpen } from "lucide-react";
import TaskCard from "../components/tasks/TaskCard.jsx";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#64748b", icon: Clock },
  in_progress: { label: "In Progress", color: "#2563eb", icon: Clock },
  completed: { label: "Completed", color: "#16a34a", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "#dc2626", icon: AlertCircle },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", bg: "bg-blue-50", text: "text-blue-700" },
  medium: { label: "Medium", bg: "bg-yellow-50", text: "text-yellow-700" },
  high: { label: "High", bg: "bg-red-50", text: "text-red-700" },
};

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    base44.entities.Project.list("-created_date", 100).then(setProjects);
  }, []);

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p.name]));

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-due_date", 200),
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  const filteredTasks = tasks
    .filter((task) => {
      const statusMatch = filterStatus === "all" || task.status === filterStatus;
      const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
      const projectMatch = filterProject === "all" || task.project_id === filterProject;
      return statusMatch && priorityMatch && projectMatch;
    })
    .sort((a, b) => (priorityOrder[a.priority] ?? 999) - (priorityOrder[b.priority] ?? 999));

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status !== "completed" && t.due_date && new Date(t.due_date) < new Date()).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--vt-green-dark)", fontFamily: "Georgia, serif" }}>
              Tasks
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage your project tasks and requirements</p>
          </div>
          <a href={createPageUrl("Projects")} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-green-700 text-white hover:bg-green-800">
            Go to Projects
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="vt-card p-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          </div>
          <div className="vt-card p-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">Pending</div>
            <div className="text-2xl font-bold text-slate-800">{stats.pending}</div>
          </div>
          <div className="vt-card p-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="vt-card p-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-white"
            style={{ borderColor: "var(--vt-gray-light)" }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-white"
            style={{ borderColor: "var(--vt-gray-light)" }}
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-white"
            style={{ borderColor: "var(--vt-gray-light)" }}
          >
            <option value="all">All Priority</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id}>
                {task.project_id && projectMap[task.project_id] && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1 ml-1">
                    <FolderOpen size={11} />
                    {projectMap[task.project_id]}
                  </div>
                )}
                <TaskCard task={task} onUpdated={() => refetch()} />
              </div>
            ))
          ) : (
            <div className="vt-card p-8 text-center">
              <p className="text-slate-500">No tasks match your filters</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}