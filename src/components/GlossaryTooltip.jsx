import { HelpCircle } from "lucide-react";
import { useState } from "react";

const GLOSSARY = {
  phase: {
    title: "Project Phase",
    definition: "The stage of the project lifecycle when a permit is needed.",
    details: [
      "Phase 1: Pre-Application (planning & design)",
      "Phase 2: Pre-Construction (before work begins)",
      "Phase 3: During Construction (active work)",
      "Phase 4: Post-Construction (after completion)",
    ]
  },
  sla: {
    title: "Service Level Agreement (SLA)",
    definition: "The expected processing time in business days for a permit decision.",
    details: [
      "SLA is a target, not a guarantee",
      "Times vary by agency and permit complexity",
      "Some permits have no fixed SLA",
    ]
  },
  category: {
    title: "Permit Category",
    definition: "How critical the permit is for your project.",
    details: [
      "Core: Always required for this project type",
      "Likely: Usually required based on site conditions",
      "Conditional: Required only if specific conditions apply",
    ]
  },
  status: {
    title: "Permit Status",
    definition: "Current stage of the permit application process.",
    details: [
      "Not Started: Not yet submitted",
      "In Progress: Application being prepared",
      "Submitted: Sent to agency",
      "Under Review: Agency reviewing",
      "Info Requested: Additional info needed",
      "Approved: Granted",
      "Denied: Rejected",
    ]
  }
};

export default function GlossaryTooltip({ term, children }) {
  const [show, setShow] = useState(false);
  const glossary = GLOSSARY[term];

  if (!glossary) return children;

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-white text-xs p-3 rounded-lg shadow-lg pointer-events-none">
          <div className="font-bold text-blue-300 mb-1.5">{glossary.title}</div>
          <div className="text-slate-200 mb-2 leading-relaxed">{glossary.definition}</div>
          {glossary.details && (
            <ul className="space-y-1 text-slate-300 text-xs">
              {glossary.details.map((detail, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blue-300 font-bold flex-shrink-0">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}