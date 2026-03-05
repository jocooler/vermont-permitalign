import { HelpCircle } from "lucide-react";
import { useState } from "react";

export default function HelpIcon({ text, title, width = "w-48" }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center justify-center ml-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        title="Click for help"
      >
        <HelpCircle size={14} />
      </button>
      {show && (
        <div className={`absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 ${width} bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-lg pointer-events-none`}>
          {title && <div className="font-semibold mb-1 text-blue-200">{title}</div>}
          <div className="leading-relaxed">{text}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}