// Phases:
// 1 = Pre-Application / Planning
// 2 = Pre-Construction
// 3 = During Construction
// 4 = Post-Construction / Occupancy

export const PHASE_CONFIG = {
  1: {
    label: "Phase 1 — Pre-Application & Planning",
    description: "Secure these early — they inform site design and may take the longest.",
    color: "#6d28d9",
    bg: "#ede9fe",
    border: "border-l-purple-500",
  },
  2: {
    label: "Phase 2 — Pre-Construction",
    description: "Required before breaking ground.",
    color: "#d97706",
    bg: "#fffbeb",
    border: "border-l-amber-500",
  },
  3: {
    label: "Phase 3 — During Construction",
    description: "Must be in place while construction is active.",
    color: "#0369a1",
    bg: "#e0f2fe",
    border: "border-l-sky-600",
  },
  4: {
    label: "Phase 4 — Post-Construction & Occupancy",
    description: "Required before occupancy or final utility energization.",
    color: "#15803d",
    bg: "#dcfce7",
    border: "border-l-green-600",
  },
};

export const STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "#718096", bg: "#edf2f7" },
  in_progress: { label: "In Progress", color: "#2980b9", bg: "#ebf5fb" },
  submitted: { label: "Submitted", color: "#6d28d9", bg: "#ede9fe" },
  under_review: { label: "Under Review", color: "#b7791f", bg: "#fffbeb" },
  info_requested: { label: "Info Requested", color: "#c05621", bg: "#fff5e6" },
  approved: { label: "Approved", color: "#15803d", bg: "#dcfce7" },
  denied: { label: "Denied", color: "#b91c1c", bg: "#fee2e2" },
};

export const CATEGORY_CONFIG = {
  core: { label: "Core", className: "vt-badge-core" },
  likely: { label: "Likely Required", className: "vt-badge-likely" },
  conditional: { label: "Conditional", className: "vt-badge-conditional" },
};

// Trigger functions keyed by trigger_key stored on each PermitType record
const TRIGGERS = {
  always: () => true,
  unit_count_gte_10_or_elevation: (c) => c.unit_count >= 10 || c.elevation_above_2500,
  federal_funding: (c) => c.federal_funding,
  near_wetlands_and_federal_funding: (c) => c.near_wetlands && c.federal_funding,
  creating_lots: (c) => c.creating_lots,
  near_wetlands: (c) => c.near_wetlands,
  in_floodplain: (c) => c.in_floodplain,
  near_stream: (c) => c.near_stream,
  near_lake_or_pond: (c) => c.near_lake_or_pond,
  state_highway_access: (c) => c.state_highway_access,
  own_water_system: (c) => c.own_water_system,
  unit_count_lte_9: (c) => c.unit_count <= 9,
  disturbed_acres_gte_1: (c) => c.disturbed_acres >= 1,
  existing_structures: (c) => c.existing_structures,
  pre_1978_structures: (c) => c.pre_1978_structures,
  unit_count_gte_4: (c) => c.unit_count >= 4,
  connects_municipal_sewer: (c) => c.connects_municipal_sewer,
};

// Convert a DB PermitType record to the shape the UI expects
export function dbPermitToLocal(dbPermit) {
  return {
    id: dbPermit.permit_key,
    name: dbPermit.name,
    agency: dbPermit.agency,
    category: dbPermit.category,
    phase: dbPermit.phase,
    sla_days: dbPermit.sla_days,
    why: dbPermit.why,
    trigger: TRIGGERS[dbPermit.trigger_key] || (() => false),
    sheet: dbPermit.sheet,
    description: dbPermit.description,
    url: dbPermit.url,
    info_sheet_url: dbPermit.info_sheet_url,
  };
}

export function determinePermits(allPermits, conditions) {
  return allPermits.filter(p => p.trigger(conditions));
}