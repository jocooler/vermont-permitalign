import { X, AlertCircle, FileText, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default function PermitInfoModal({ permit, onClose, onProceed }) {
  const calculateFee = () => {
    const baseFeatures = {
      "Wastewater System & Potable Water Supply Permit": 350,
      "Stormwater General Permits for Construction": 275,
      "Stormwater Permit - New Development & Redevelopment": 400,
      "Act 250 Land Use Permit": 500,
      "Fire Prevention & Building Permit": 300,
    };
    return baseFeatures[permit.name] || 250;
  };

  const fee = calculateFee();
  const requiredDocs = getRequiredDocs(permit.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 overflow-y-auto py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-green-900 rounded-t-xl flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Permit Information</div>
            <h2 className="text-lg font-bold text-white leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              {permit.sheet} — {permit.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-green-300 hover:text-white p-1.5 rounded flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Description */}
          <div>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-green-700" />
              About This Permit
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{permit.description}</p>
          </div>

          {/* Why it's required */}
          <div className="rounded-lg p-4 bg-amber-50 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
              <AlertCircle size={16} />
              Why This Permit Applies
            </h3>
            <p className="text-sm text-amber-800">{permit.why}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-green-700" />
              Processing Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-2xl font-bold text-green-700 min-w-fit">{permit.sla_days}</div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Business Days</div>
                  <p className="text-xs text-slate-600">Typical processing time from submission to decision</p>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-green-700" />
              What You'll Need
            </h3>
            <div className="space-y-2">
              {requiredDocs.map((doc, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee */}
          <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <DollarSign size={16} />
              Application Fee
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-700">${fee.toFixed(2)}</span>
              <span className="text-sm text-blue-700">+ $15 processing fee</span>
            </div>
            <p className="text-xs text-blue-600 mt-2">You'll pay this fee at the end of your application submission.</p>
          </div>

          {/* Resources */}
          {permit.url && (
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Agency Resources</h3>
              <a
                href={permit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-700 font-semibold hover:text-green-900 underline"
              >
                Visit {permit.agency} Website
                <span>↗</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 rounded-b-xl flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded font-medium text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-6 py-2 rounded font-semibold text-sm bg-green-700 text-white hover:bg-green-800"
          >
            Start Application
          </button>
        </div>
      </div>
    </div>
  );
}

function getRequiredDocs(permitId) {
  const docs = {
    "1": ["Site plan showing system location", "Soil evaluation / site test pit report", "Designer's plans and specifications"],
    "2": ["Survey plat with lot lines", "Site plan", "Wastewater design for each lot"],
    "5": ["Engineering plans for sewer extension", "Municipal approval letter", "Site plan"],
    "6.1": ["Stormwater Pollution Prevention Plan (SWPPP)", "Site plan with drainage", "Erosion control plan"],
    "6.2": ["Stormwater management plan", "Hydrologic calculations", "Site plan"],
    "29": ["Wetland delineation report", "Site plan showing wetland boundaries", "Mitigation plan (if applicable)"],
    "32.3": ["FEMA Elevation Certificate", "Site plan with flood zone boundary", "Floodplain development permit"],
    "32": ["Site plan showing stream location", "Engineering plans for crossing", "Photos of existing stream"],
    "47": ["Act 250 application form", "Site plan", "Environmental review materials"],
    "49": ["Architectural plans", "Structural plans", "Fire protection system plans"],
    "50": ["Electrical plans", "Load calculations", "Equipment specifications"],
    "54": ["Asbestos survey report", "Notification to DEC", "Contractor certifications"],
    "66": ["Traffic study", "Site plan showing access", "VTrans permit application"],
  };
  return docs[permitId] || ["Site plan", "Application form", "Supporting documentation as required"];
}