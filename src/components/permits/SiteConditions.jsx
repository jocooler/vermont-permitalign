import { Check, Zap, AlertTriangle, Droplets, Building, Plug, DollarSign } from "lucide-react";

// A single condition card
function ConditionCard({ label, hint, value, onChange, autoDetected }) {
  return (
    <button
      type="button"
      onClick={() => !autoDetected && onChange(!value)}
      className={`w-full text-left rounded-xl border-2 p-3.5 transition-all ${
        autoDetected ? "cursor-default" : "cursor-pointer hover:border-green-400"
      } ${
        value
          ? "border-green-500 bg-green-50"
          : "border-slate-200 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            value ? "border-green-600 bg-green-600" : "border-slate-300 bg-white"
          }`}
        >
          {value && <Check size={11} color="white" strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${value ? "text-green-900" : "text-slate-700"}`}>
              {label}
            </span>
            {autoDetected && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                <Zap size={9} /> Auto-detected
              </span>
            )}
          </div>
          {hint && (
            <div className="text-xs mt-0.5 text-slate-500">{hint}</div>
          )}
        </div>
      </div>
    </button>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${color}`}>
        <Icon size={15} />
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {children}
      </div>
    </div>
  );
}

export default function SiteConditions({ form, autoDetectedFields, setSite, set }) {
  const sc = form.site_conditions;

  return (
    <div>
      {autoDetectedFields && autoDetectedFields.length > 0 && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-sm text-blue-800">
          <Zap size={15} className="mt-0.5 flex-shrink-0 text-blue-500" />
          <div>
            <span className="font-semibold">Parcel data auto-filled {autoDetectedFields.length} condition{autoDetectedFields.length !== 1 ? "s" : ""}</span>
            <span className="text-blue-600"> — review and adjust if needed.</span>
          </div>
        </div>
      )}

      {/* Environmental */}
      <Section icon={Droplets} title="Environmental" color="border-blue-200 text-blue-700">
        <ConditionCard
          label="Near wetlands"
          hint="Class I or II wetlands within or adjacent to the project area"
          value={sc.near_wetlands}
          onChange={v => setSite("near_wetlands", v)}
          autoDetected={autoDetectedFields?.includes("near_wetlands")}
        />
        <ConditionCard
          label="In a floodplain"
          hint="Within FEMA 100-year floodplain"
          value={sc.in_floodplain}
          onChange={v => setSite("in_floodplain", v)}
          autoDetected={autoDetectedFields?.includes("in_floodplain")}
        />
        <ConditionCard
          label="Near a perennial stream"
          hint="Stream crossings or work within 100m stream buffer"
          value={sc.near_stream}
          onChange={v => setSite("near_stream", v)}
          autoDetected={autoDetectedFields?.includes("near_stream")}
        />
        <ConditionCard
          label="Within 250 ft of lake or pond >10 ac"
          hint="Shoreland protection zone applies"
          value={sc.near_lake_or_pond}
          onChange={v => setSite("near_lake_or_pond", v)}
          autoDetected={autoDetectedFields?.includes("near_lake_or_pond")}
        />
        <ConditionCard
          label="Above 2,500 ft elevation"
          hint="May trigger Act 250 review"
          value={sc.elevation_above_2500}
          onChange={v => setSite("elevation_above_2500", v)}
          autoDetected={autoDetectedFields?.includes("elevation_above_2500")}
        />
      </Section>

      {/* Land & Access */}
      <Section icon={AlertTriangle} title="Land & Access" color="border-amber-200 text-amber-700">
        <ConditionCard
          label="Creating separate lots (subdivision)"
          hint="Dividing land into two or more parcels"
          value={form.creating_lots}
          onChange={v => set("creating_lots", v)}
          autoDetected={false}
        />
        <ConditionCard
          label="Access from a state highway"
          hint="Driveway or access point is off a VTrans-maintained road"
          value={sc.state_highway_access}
          onChange={v => setSite("state_highway_access", v)}
          autoDetected={autoDetectedFields?.includes("state_highway_access")}
        />
      </Section>

      {/* Structures */}
      <Section icon={Building} title="Structures" color="border-slate-300 text-slate-600">
        <ConditionCard
          label="Demolishing or renovating existing structures"
          hint="Any existing buildings on site"
          value={sc.existing_structures}
          onChange={v => setSite("existing_structures", v)}
          autoDetected={false}
        />
        <ConditionCard
          label="Existing structures built before 1978"
          hint="Potential lead-based paint hazard"
          value={sc.pre_1978_structures}
          onChange={v => setSite("pre_1978_structures", v)}
          autoDetected={false}
        />
      </Section>

      {/* Infrastructure */}
      <Section icon={Plug} title="Infrastructure" color="border-purple-200 text-purple-700">
        <ConditionCard
          label="Connecting to municipal sewer"
          hint="Project will tie into existing public sewer system"
          value={sc.connects_municipal_sewer}
          onChange={v => setSite("connects_municipal_sewer", v)}
          autoDetected={false}
        />
        <ConditionCard
          label="Creating own water system"
          hint="Project will serve 15+ connections or 25+ people"
          value={sc.own_water_system}
          onChange={v => setSite("own_water_system", v)}
          autoDetected={false}
        />
      </Section>

      {/* Funding */}
      <Section icon={DollarSign} title="Funding & Regulatory" color="border-green-200 text-green-700">
        <ConditionCard
          label="Project involves federal funding or federal permits"
          hint="e.g., Army Corps of Engineers involvement"
          value={sc.federal_funding}
          onChange={v => setSite("federal_funding", v)}
          autoDetected={false}
        />
      </Section>
    </div>
  );
}