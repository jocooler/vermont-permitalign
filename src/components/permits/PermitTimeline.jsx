import { CheckCircle2, Clock, AlertCircle, Zap } from "lucide-react";
import { format, addBusinessDays } from "date-fns";

const MILESTONES = [
  { id: "submitted", label: "Application Submitted", icon: Zap },
  { id: "under_review", label: "Under Review", icon: Clock },
  { id: "public_comment", label: "Public Comment Period", icon: AlertCircle },
  { id: "approved", label: "Approved / Finalized", icon: CheckCircle2 },
];

export default function PermitTimeline({ permit, permit_status, submitted_date, decision_date, sla_days }) {
  const currentStatusMap = {
    not_started: null,
    in_progress: "submitted",
    submitted: "submitted",
    under_review: "under_review",
    info_requested: "under_review",
    approved: "approved",
    denied: "approved",
  };

  const currentMilestone = currentStatusMap[permit_status] || null;
  const completedMilestones = [];

  // Build completion timeline
  if (permit_status !== "not_started" && permit_status !== "in_progress") {
    completedMilestones.push("submitted");
  }
  if (["approved", "denied"].includes(permit_status)) {
    completedMilestones.push("under_review");
    completedMilestones.push("approved");
  }

  // Calculate estimated dates
  const getEstimatedDate = (milestoneId) => {
    if (milestoneId === "submitted" && submitted_date) {
      return submitted_date;
    }
    if (milestoneId === "under_review" && submitted_date && sla_days) {
      return addBusinessDays(new Date(submitted_date), sla_days);
    }
    if (milestoneId === "public_comment" && submitted_date && sla_days) {
      const reviewEnd = addBusinessDays(new Date(submitted_date), sla_days);
      return addBusinessDays(reviewEnd, 14); // Assume 2 week public comment period
    }
    if (milestoneId === "approved" && decision_date) {
      return decision_date;
    }
    return null;
  };

  const isCompleted = (milestoneId) => completedMilestones.includes(milestoneId);
  const isCurrent = (milestoneId) => currentMilestone === milestoneId;

  return (
    <div className="py-4">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Application Timeline</div>
      <div className="space-y-3">
        {MILESTONES.map((ms, idx) => {
          const Icon = ms.icon;
          const completed = isCompleted(ms.id);
          const current = isCurrent(ms.id);
          const isInfoRequested = current && permit_status === "info_requested";
          const estimatedDate = getEstimatedDate(ms.id);

          return (
            <div key={ms.id} className="flex gap-4">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    completed ? "bg-green-100" : current && isInfoRequested ? "bg-yellow-100" : current ? "bg-blue-100" : "bg-slate-100"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`${
                      completed ? "text-green-600" : current && isInfoRequested ? "text-yellow-600" : current ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                </div>
                {idx !== MILESTONES.length - 1 && (
                  <div className={`w-0.5 h-12 mt-1 ${completed ? "bg-green-200" : current && isInfoRequested ? "bg-yellow-200" : "bg-slate-200"}`} />
                )}
              </div>

              {/* Content */}
              <div className="pt-0.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold ${completed ? "text-green-700" : current && isInfoRequested ? "text-yellow-700" : current ? "text-blue-700" : "text-slate-600"}`}>
                    {ms.label}
                  </span>
                  {completed && <span className="text-xs text-green-600 font-medium">Completed</span>}
                  {current && isInfoRequested && <span className="text-xs text-yellow-600 font-medium">Information Requested</span>}
                  {current && !isInfoRequested && <span className="text-xs text-blue-600 font-medium">In Progress</span>}
                </div>

                {estimatedDate && (
                  <div className="text-xs text-slate-500 mt-1">
                    {completed || current ? "Date: " : "Est. "}
                    <span className="font-mono">{format(new Date(estimatedDate), "MMM d, yyyy")}</span>
                  </div>
                )}

                {ms.id === "public_comment" && !submitted_date && (
                  <div className="text-xs text-slate-400 italic mt-1">Estimated 2 weeks after review period</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sla_days && submitted_date && (
        <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          <div className="font-medium text-slate-600 mb-1">Processing Timeline</div>
          <div>Typical agency review: ~{sla_days} business days</div>
          {submitted_date && (
            <div>Submitted: {format(new Date(submitted_date), "MMM d, yyyy")}</div>
          )}
        </div>
      )}
    </div>
  );
}