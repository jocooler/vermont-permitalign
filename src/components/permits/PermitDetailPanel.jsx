import { useState } from "react";
import { X, ExternalLink, FileText, Clock, Building2, CheckCircle2, AlertCircle, Info, ClipboardEdit } from "lucide-react";
import { STATUS_CONFIG, CATEGORY_CONFIG } from "./PERMIT_DATA";
import PermitApplicationForm from "./PermitApplicationForm";

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

const TABS = ["overview", "apply"];

export default function PermitDetailPanel({ permit, projectId, projectData, ipData, onClose, onStatusChange, onNotesChange }) {
  const [tab, setTab] = useState("overview");
  if (!permit) return null;

  const cat = CATEGORY_CONFIG[permit.category] || CATEGORY_CONFIG.core;
  const currentStatus = ipData?.status || "not_started";
  const st = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.not_started;
  const notes = ipData?.notes || "";

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

        {/* Tabs */}
        <div className="flex border-b bg-slate-50 flex-shrink-0">
          <button
            onClick={() => setTab("overview")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${tab === "overview" ? "text-green-700 border-b-2 border-green-600 bg-white" : "text-slate-400 hover:text-slate-600"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setTab("apply")}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${tab === "apply" ? "text-green-700 border-b-2 border-green-600 bg-white" : "text-slate-400 hover:text-slate-600"}`}
          >
            <ClipboardEdit size={12} /> Apply
          </button>
        </div>

        {/* Apply Tab */}
        {tab === "apply" && (
          <PermitApplicationForm
            permit={permit}
            projectId={projectId}
            projectData={projectData}
            existingApp={null}
            onSave={(update) => { onStatusChange(permit.id, update.status); if (update.status === "submitted") setTab("overview"); }}
            onClose={onClose}
          />
        )}

        {/* Overview Body */}
        {tab === "overview" && (
        <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">

          {/* Status */}
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Application Status</div>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTS.map(s => {
                const cfg = STATUS_CONFIG[s];
                const isActive = s === currentStatus;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(permit.id, s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-semibold border-2 transition-all`}
                    style={{
                      borderColor: isActive ? cfg.color : "transparent",
                      background: isActive ? cfg.bg : "#f8fafc",
                      color: isActive ? cfg.color : "#64748b",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400 italic">{STATUS_DESCRIPTIONS[currentStatus]}</p>
          </div>

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

          {/* Timeline */}
          <div className="flex items-center gap-3 rounded-lg p-4 bg-slate-50 border border-slate-200">
            <Clock size={18} className="text-slate-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500">Typical Processing Time</div>
              <div className="text-sm font-semibold text-slate-700">~{permit.sla_days} business days</div>
            </div>
          </div>

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

          {/* Apply CTA */}
          <div className="rounded-lg p-4 bg-green-50 border border-green-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-green-800">Ready to apply?</div>
                <div className="text-xs text-green-600 mt-0.5">Fill out your application details and track submission.</div>
              </div>
              <button
                onClick={() => setTab("apply")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-700 text-white hover:bg-green-800 flex-shrink-0"
              >
                <ClipboardEdit size={14} /> Apply
              </button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}