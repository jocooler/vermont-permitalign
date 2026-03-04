import { CheckCircle2 } from "lucide-react";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2"
                style={{
                  background: done ? "#2d6a4f" : active ? "#1a3d2e" : "white",
                  borderColor: done || active ? (done ? "#2d6a4f" : "#1a3d2e") : "#cbd5e1",
                  color: done || active ? "white" : "#94a3b8",
                }}
              >
                {done ? <CheckCircle2 size={16} /> : idx + 1}
              </div>
              <span
                className="text-xs font-semibold hidden sm:block whitespace-nowrap"
                style={{ color: active ? "#1a3d2e" : done ? "#2d6a4f" : "#94a3b8" }}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-16 h-0.5 mb-5 mx-2" style={{ background: done ? "#2d6a4f" : "#e2e8f0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}