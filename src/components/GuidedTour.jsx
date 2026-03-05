import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function GuidedTour({ steps, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md p-6 border-2 border-green-600">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded transition-colors"
        >
          <X size={18} className="text-slate-600" />
        </button>

        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-widest text-green-700 mb-1">
            Guide {currentStep + 1} of {steps.length}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
        </div>

        <p className="text-sm text-slate-700 mb-6 leading-relaxed">{step.description}</p>

        {step.visual && (
          <div className="mb-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            {step.visual}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentStep ? "bg-green-600" : "bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
          >
            {currentStep === steps.length - 1 ? "Done" : "Next"} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}