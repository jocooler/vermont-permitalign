import { FileText, Clock, ChevronRight } from "lucide-react";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "./PERMIT_DATA";

export default function PermitCard({ permit, status, onClick }) {
  const cat = CATEGORY_CONFIG[permit.category] || CATEGORY_CONFIG.core;
  const st = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;

  const categoryAccent = {
    core: "border-l-4 border-green-500",
    likely: "border-l-4 border-amber-400",
    conditional: "border-l-4 border-indigo-400",
  }[permit.category] || "border-l-4 border-slate-300";

  return (
    <div
      className={`vt-card p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all ${categoryAccent}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-bold opacity-40">{permit.sheet}</span>
            <span className={cat.className}>{cat.label}</span>
          </div>
          <h4 className="font-semibold text-sm leading-snug" style={{ color: "var(--vt-gray-dark)" }}>{permit.name}</h4>
          <div className="text-xs mt-1" style={{ color: "var(--vt-gray-mid)" }}>{permit.agency}</div>
        </div>
        <ChevronRight size={16} style={{ color: "var(--vt-gray-mid)" }} className="flex-shrink-0 mt-1" />
      </div>

      <p className="text-xs leading-relaxed" style={{ color: "var(--vt-gray)" }}>{permit.why}</p>

      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
           <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
           {st.label}
         </div>
        <div className="flex items-center gap-1.5">
          {permit.info_sheet_url && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <FileText size={10} /> Info Sheet
            </span>
          )}
          <div className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
            <Clock size={10} />
            <span>~{permit.sla_days}d</span>
          </div>
        </div>
      </div>
    </div>
  );
}