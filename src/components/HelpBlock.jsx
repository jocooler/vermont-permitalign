import { AlertCircle, Lightbulb } from "lucide-react";

export default function HelpBlock({ title, text, type = "info" }) {
  const Icon = type === "tip" ? Lightbulb : AlertCircle;
  const bgColor = type === "tip" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200";
  const textColor = type === "tip" ? "text-blue-800" : "text-amber-800";
  const iconColor = type === "tip" ? "text-blue-600" : "text-amber-600";

  return (
    <div className={`border rounded-lg p-3 mb-4 ${bgColor}`}>
      <div className="flex gap-2">
        <Icon size={16} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
        <div>
          {title && <div className={`text-xs font-semibold ${textColor} mb-1`}>{title}</div>}
          <div className={`text-xs ${textColor}`}>{text}</div>
        </div>
      </div>
    </div>
  );
}