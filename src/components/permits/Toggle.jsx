import { Check } from "lucide-react";

export default function Toggle({ label, hint, value, onChange }) {
  return (
    <label
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-all select-none"
      onClick={() => onChange(!value)}
    >
      <div
        className="mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all"
        style={{
          borderColor: value ? "var(--vt-green)" : "var(--vt-gray-light)",
          background: value ? "var(--vt-green)" : "white",
        }}
      >
        {value && <Check size={11} color="white" strokeWidth={3} />}
      </div>
      <div>
        <div className="text-sm font-medium" style={{ color: "var(--vt-gray-dark)" }}>{label}</div>
        {hint && <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>{hint}</div>}
      </div>
    </label>
  );
}