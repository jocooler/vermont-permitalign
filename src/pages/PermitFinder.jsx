import { useState } from "react";
import { ArrowRight, ArrowLeft, ExternalLink } from "lucide-react";
import { CATEGORY_CONFIG, determinePermits } from "../components/permits/PERMIT_DATA";
import { usePermits } from "../components/permits/usePermits";
import StepIndicator from "../components/permits/StepIndicator";
import Toggle from "../components/permits/Toggle";

const STEPS = [
  { id: "basic", label: "Project Basics" },
  { id: "site", label: "Site Conditions" },
  { id: "results", label: "Your Permits" },
];

const defaultConditions = {
  unit_count: 4,
  disturbed_acres: 0,
  creating_lots: false,
  connects_municipal_sewer: false,
  own_water_system: false,
  near_wetlands: false,
  in_floodplain: false,
  near_stream: false,
  near_lake_or_pond: false,
  state_highway_access: false,
  elevation_above_2500: false,
  existing_structures: false,
  pre_1978_structures: false,
  federal_funding: false,
};

export default function PermitFinder() {
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState(defaultConditions);
  const [expandedPermit, setExpandedPermit] = useState(null);

  const set = (key, val) => setConditions(prev => ({ ...prev, [key]: val }));

  const matchedPermits = determinePermits(conditions);
  const byCategory = {
    core: matchedPermits.filter(p => p.category === "core"),
    likely: matchedPermits.filter(p => p.category === "likely"),
    conditional: matchedPermits.filter(p => p.category === "conditional"),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="rounded-xl mb-8 p-6" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div className="text-xs font-bold uppercase tracking-widest text-green-300 mb-1">Vermont Permitting System</div>
        <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>Permit Finder</h1>
        <p className="text-sm text-green-100 opacity-80">
          Answer a few questions about your project to see which permits apply.
        </p>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Step 0: Project Basics */}
      {step === 0 && (
        <div className="vt-card p-6">
          <h2 className="font-bold mb-1" style={{ color: "var(--vt-green-dark)" }}>Project Basics</h2>
          <p className="text-sm mb-6" style={{ color: "var(--vt-gray-mid)" }}>Tell us about the scale of your project.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>
                Number of residential units
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={1} max={20}
                  value={conditions.unit_count}
                  onChange={e => set("unit_count", Number(e.target.value))}
                  className="flex-1" style={{ accentColor: "var(--vt-green)" }}
                />
                <div className="w-16 text-center font-bold text-lg rounded-lg py-1" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>
                  {conditions.unit_count}
                </div>
              </div>
              {conditions.unit_count >= 10 && (
                <div className="mt-2 text-xs flex items-start gap-1.5 p-2 rounded" style={{ background: "#fff7ed", color: "#92400e" }}>
                  ⚠ At 10+ units, Act 250 land use permit may be triggered.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--vt-gray-dark)" }}>
                Estimated acres of land disturbed during construction
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={5} step={0.25}
                  value={conditions.disturbed_acres}
                  onChange={e => set("disturbed_acres", Number(e.target.value))}
                  className="flex-1" style={{ accentColor: "var(--vt-green)" }}
                />
                <div className="w-16 text-center font-bold text-lg rounded-lg py-1" style={{ background: "var(--vt-green-pale)", color: "var(--vt-green-dark)" }}>
                  {conditions.disturbed_acres}
                </div>
              </div>
              {conditions.disturbed_acres >= 1 && (
                <div className="mt-2 text-xs flex items-start gap-1.5 p-2 rounded" style={{ background: "#fff7ed", color: "#92400e" }}>
                  ⚠ At ≥1 acre disturbed, stormwater permits are required.
                </div>
              )}
            </div>

            <div className="space-y-1 border-t pt-4" style={{ borderColor: "var(--vt-gray-light)" }}>
              <Toggle label="Creating separate lots (subdivision)" hint="Dividing land into two or more parcels" value={conditions.creating_lots} onChange={v => set("creating_lots", v)} />
              <Toggle label="Connecting to municipal sewer" hint="Project will tie into existing public sewer system" value={conditions.connects_municipal_sewer} onChange={v => set("connects_municipal_sewer", v)} />
              <Toggle label="Creating own water system" hint="Project will serve 15+ connections or 25+ people" value={conditions.own_water_system} onChange={v => set("own_water_system", v)} />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm"
              style={{ background: "var(--vt-green)", color: "white" }}
            >
              Next: Site Conditions <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Site Conditions */}
      {step === 1 && (
        <div className="vt-card p-6">
          <h2 className="font-bold mb-1" style={{ color: "var(--vt-green-dark)" }}>Site Conditions</h2>
          <p className="text-sm mb-5" style={{ color: "var(--vt-gray-mid)" }}>Check all conditions that apply to your site.</p>

          <div className="space-y-1">
            <Toggle label="Site is near wetlands" hint="Class I or II wetlands within or adjacent to the project area" value={conditions.near_wetlands} onChange={v => set("near_wetlands", v)} />
            <Toggle label="Site is in a floodplain" hint="Within FEMA 100-year floodplain" value={conditions.in_floodplain} onChange={v => set("in_floodplain", v)} />
            <Toggle label="Work near a perennial stream" hint="Stream crossings or work within stream buffer" value={conditions.near_stream} onChange={v => set("near_stream", v)} />
            <Toggle label="Within 250 ft of a lake or pond >10 acres" hint="Shoreland protection zone" value={conditions.near_lake_or_pond} onChange={v => set("near_lake_or_pond", v)} />
            <Toggle label="Access from a state highway" hint="Driveway or access point is off a VTrans-maintained road" value={conditions.state_highway_access} onChange={v => set("state_highway_access", v)} />
            <Toggle label="Site is above 2,500 ft elevation" hint="May trigger Act 250 review" value={conditions.elevation_above_2500} onChange={v => set("elevation_above_2500", v)} />
            <Toggle label="Demolishing or renovating existing structures" hint="Any existing buildings on site" value={conditions.existing_structures} onChange={v => set("existing_structures", v)} />
            <Toggle label="Existing structures built before 1978" hint="Potential lead-based paint hazard" value={conditions.pre_1978_structures} onChange={v => set("pre_1978_structures", v)} />
            <Toggle label="Project involves federal funding or federal permits" hint="e.g., Army Corps of Engineers involvement" value={conditions.federal_funding} onChange={v => set("federal_funding", v)} />
          </div>

          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(0)} className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm" style={{ background: "var(--vt-gray-light)", color: "var(--vt-gray-dark)" }}>
              <ArrowLeft size={15} /> Back
            </button>
            <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded font-semibold text-sm" style={{ background: "var(--vt-green)", color: "white" }}>
              See My Permits <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {step === 2 && (
        <div>
          <div className="rounded-xl mb-6 p-5 flex items-center justify-between gap-4" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #3a7d5c 100%)" }}>
            <div>
              <div className="text-lg font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                {matchedPermits.length} permit{matchedPermits.length !== 1 ? "s" : ""} identified
              </div>
              <div className="text-xs mt-0.5 text-green-200">
                {conditions.unit_count} units · {conditions.disturbed_acres} acres disturbed
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {byCategory.core.length > 0 && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.core.length} core</span>}
                {byCategory.likely.length > 0 && <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.likely.length} likely</span>}
                {byCategory.conditional.length > 0 && <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-semibold">{byCategory.conditional.length} conditional</span>}
              </div>
            </div>
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded whitespace-nowrap"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              <ArrowLeft size={12} /> Adjust
            </button>
          </div>

          {matchedPermits.length === 0 && (
            <div className="vt-card p-8 text-center text-sm mb-4" style={{ color: "var(--vt-gray-mid)" }}>
              No permits identified based on your inputs. Try adjusting your project details.
            </div>
          )}

          {[
            { key: "core", title: "Core Permits", subtitle: "Almost always required for your project type", permits: byCategory.core, accent: "border-l-4 border-green-500", titleColor: "text-green-800", subtitleColor: "text-green-600", bg: "bg-green-50" },
            { key: "likely", title: "Likely Required", subtitle: "Based on your site conditions", permits: byCategory.likely, accent: "border-l-4 border-amber-400", titleColor: "text-amber-800", subtitleColor: "text-amber-600", bg: "bg-amber-50" },
            { key: "conditional", title: "Conditional Permits", subtitle: "May apply depending on additional thresholds", permits: byCategory.conditional, accent: "border-l-4 border-indigo-400", titleColor: "text-indigo-800", subtitleColor: "text-indigo-600", bg: "bg-indigo-50" },
          ].map(({ key, title, subtitle, permits, accent, titleColor, subtitleColor, bg }) => permits.length > 0 && (
            <div key={key} className="mb-6">
              <div className={`mb-3 p-3 rounded-lg ${bg} ${accent}`}>
                <h3 className={`font-bold text-sm ${titleColor}`}>{title} <span className="font-normal opacity-70">({permits.length})</span></h3>
                <p className={`text-xs ${subtitleColor}`}>{subtitle}</p>
              </div>
              <div className="space-y-2">
                {permits.map(permit => {
                  const expanded = expandedPermit === permit.id;
                  const cat = CATEGORY_CONFIG[permit.category];
                  return (
                    <div key={permit.id} className="vt-card overflow-hidden">
                      <button
                        className="w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50 transition-all"
                        onClick={() => setExpandedPermit(expanded ? null : permit.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono font-bold opacity-40">{permit.sheet}</span>
                            <span className={cat.className}>{cat.label}</span>
                          </div>
                          <div className="font-semibold text-sm" style={{ color: "var(--vt-gray-dark)" }}>{permit.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--vt-gray-mid)" }}>{permit.agency}</div>
                        </div>
                        <span className="text-xs font-medium flex-shrink-0 mt-1" style={{ color: "var(--vt-gray-mid)" }}>
                          {expanded ? "Hide ▲" : "Details ▼"}
                        </span>
                      </button>

                      {expanded && (
                        <div className="px-4 pb-4 pt-2 border-t" style={{ borderColor: "var(--vt-gray-light)" }}>
                          <p className="text-sm mb-3" style={{ color: "var(--vt-gray)" }}>{permit.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--vt-gray-mid)" }}>
                              Typical processing: <strong>{permit.sla_days} business days</strong>
                            </span>
                            <a
                              href={permit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 font-semibold hover:underline"
                              style={{ color: "var(--vt-green)" }}
                              onClick={e => e.stopPropagation()}
                            >
                              Agency page <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="vt-card p-4 mt-2" style={{ borderLeft: "4px solid var(--vt-green)" }}>
            <p className="text-xs" style={{ color: "var(--vt-gray)" }}>
              <strong>Note:</strong> This tool provides guidance only. Permit requirements depend on your specific site, project details, and current regulations. Contact the relevant agency for definitive requirements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}