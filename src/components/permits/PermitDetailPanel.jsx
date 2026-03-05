import { useState } from "react";
import { X, ExternalLink, FileText, Clock, Building2, ChevronRight, CheckCircle2, AlertCircle, Info, ClipboardList } from "lucide-react";
import { STATUS_CONFIG, CATEGORY_CONFIG } from "./PERMIT_DATA";
import PermitIntakeForm from "./PermitIntakeForm";
import PermitTimeline from "./PermitTimeline";
import PermitInfoModal from "./PermitInfoModal";
import ApplicantFeeModal from "./ApplicantFeeModal";

const STATUS_OPTS = ["not_started", "in_progress", "submitted", "under_review", "info_requested", "approved", "denied"];

const STATUS_DESCRIPTIONS = {
  not_started: "Application has not been started yet.",
  in_progress: "Application is being prepared.",
  submitted: "Application has been submitted to the agency.",
  under_review: "Agency is reviewing the application.",
  info_requested: "Agency has requested additional information.",
  approved: "Permit has been approved.",
  denied: "Permit application was denied.",
};

export default function PermitDetailPanel({ permit, project, ipData, onClose, onStatusChange, onNotesChange }) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);

  if (!permit) return null;

  const cat = CATEGORY_CONFIG[permit.category] || CATEGORY_CONFIG.core;
  const currentStatus = ipData?.status || "not_started";
  const st = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.not_started;
  const notes = ipData?.notes || "";
  const infoRequested = ipData?.info_requested || "";

  const categoryAccentColor = {
    core: "#16a34a",
    likely: "#d97706",
    conditional: "#6366f1",
  }[permit.category] || "#64748b";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b" style={{ borderLeftColor: categoryAccentColor, borderLeftWidth: 4 }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-400">{permit.sheet}</span>
                <span className={cat.className}>{cat.label}</span>
              </div>
              <h2 className="font-bold text-lg leading-snug" style={{ color: "var(--vt-green-dark)", fontFamily: "Georgia, serif" }}>
                {permit.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                <Building2 size={13} />
                {permit.agency}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">

          {/* Status */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Application Status</div>
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: STATUS_CONFIG[currentStatus]?.color || "#64748b" }}
              />
              <span className="text-sm font-semibold" style={{ color: STATUS_CONFIG[currentStatus]?.color || "#64748b" }}>
                {STATUS_CONFIG[currentStatus]?.label || "Unknown"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 italic">{STATUS_DESCRIPTIONS[currentStatus]}</p>
          </div>

          {/* Info Requested Alert */}
           {currentStatus === "info_requested" && infoRequested && (
             <div className="rounded-lg p-4 border-l-4 border-amber-500 bg-amber-50 border border-amber-200">
               <div className="flex items-start gap-2">
                 <AlertCircle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" style={{ minWidth: "20px" }} />
                 <div className="flex-1">
                   <div className="text-xs font-bold text-amber-900 mb-2 uppercase tracking-wide">Action Required: Information Requested</div>
                   <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap mb-3">{infoRequested}</p>
                   <p className="text-xs text-amber-700 italic">Submit your response using the button below to keep your application on track.</p>
                 </div>
               </div>
             </div>
           )}

          {/* Why Required */}
          <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Info size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-800 mb-1">Why this permit applies</div>
                <p className="text-sm text-amber-700">{permit.why}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">About This Permit</div>
            <p className="text-sm leading-relaxed text-slate-600">{permit.description}</p>
          </div>

          {/* Timeline Visualization */}
          <PermitTimeline
            permit={permit}
            permit_status={currentStatus}
            submitted_date={ipData?.submitted_date}
            decision_date={ipData?.decision_date}
            sla_days={permit.sla_days}
          />

          {/* Links */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Resources</div>
            <div className="space-y-2">
              {permit.info_sheet_url && (
                <a
                  href={permit.info_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
                >
                  <FileText size={16} className="text-green-700 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-green-800">Official Information Sheet</div>
                    <div className="text-xs text-green-600">DEC Permit Handbook — Sheet {permit.sheet}</div>
                  </div>
                  <ExternalLink size={13} className="text-green-500 group-hover:text-green-700" />
                </a>
              )}
              {permit.url && (
                <a
                  href={permit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                >
                  <ExternalLink size={16} className="text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700">Agency Website</div>
                    <div className="text-xs text-slate-400 truncate">{permit.agency}</div>
                  </div>
                  <ExternalLink size={13} className="text-slate-300 group-hover:text-slate-500" />
                </a>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              {currentStatus === "info_requested" ? "Submit Requested Information" : "Application"}
            </div>
            <button
              onClick={() => setShowIntakeForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
              style={{
                background: currentStatus === "info_requested" ? "#d97706" : "#16a34a",
                color: "white"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.9"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              <ClipboardList size={15} /> {currentStatus === "info_requested" ? "Submit Response" : "Start / Complete Application"}
            </button>
            {(currentStatus === "submitted" || currentStatus === "under_review" || currentStatus === "approved") && (
              <p className="mt-2 text-xs text-center text-green-700">Application previously submitted for this permit.</p>
            )}
            {currentStatus === "info_requested" && (
              <p className="mt-2 text-xs text-center text-amber-700">Upload documents and provide information requested by the agency above.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Notes</div>
            <textarea
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
              style={{ borderColor: "var(--vt-gray-light)" }}
              placeholder="Add notes about this permit application, contacts, requirements, etc."
              value={notes}
              onChange={e => onNotesChange(permit.id, e.target.value)}
            />
          </div>
        </div>
      </div>

      {showInfoModal && (
        <PermitInfoModal
          permit={permit}
          onClose={() => setShowInfoModal(false)}
          onProceed={() => {
            setShowInfoModal(false);
            setShowIntakeForm(true);
          }}
        />
      )}

      {showIntakeForm && (
        <PermitIntakeForm
          permit={permit}
          project={project}
          isInfoRequest={currentStatus === "info_requested"}
          onClose={() => setShowIntakeForm(false)}
          onPaymentComplete={() => {
            setShowIntakeForm(false);
            if (currentStatus !== "info_requested") {
              setShowFeeModal(true);
            } else {
              onStatusChange(permit.id, "under_review");
            }
          }}
          onFeePaid={() => {
            setShowFeeModal(false);
            onStatusChange(permit.id, "submitted");
          }}
        />
      )}

      {showFeeModal && (
        <ApplicantFeeModal
          permit={permit}
          project={project}
          onClose={() => setShowFeeModal(false)}
          onPaymentComplete={() => {
            setShowFeeModal(false);
            onFeePaid();
          }}
        />
      )}
    </div>
  );
}