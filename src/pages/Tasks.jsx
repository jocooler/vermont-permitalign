import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Filter, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import TaskCard from "../components/tasks/TaskCard.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";

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
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.list("-due_date", 100),
  });

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filterStatus === "all" || task.status === filterStatus;
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

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
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-green-700 hover:bg-green-800"
          >
            <Plus size={16} /> New Task
          </Button>
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
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-2 text-sm bg-white"
              style={{ borderColor: "var(--vt-gray-light)" }}
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-white"
            style={{ borderColor: "var(--vt-gray-light)" }}
          >
            <option value="all">All Priority</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdated={() => refetch()}
              />
            ))
          ) : (
            <div className="vt-card p-8 text-center">
              <p className="text-slate-500 mb-4">No tasks match your filters</p>
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus size={16} /> Create Task
              </Button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}