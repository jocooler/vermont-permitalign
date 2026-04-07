import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PERMITS = [
  {
    permit_key: '1',
    name: 'Wastewater System & Potable Water Supply Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'core',
    phase: 2,
    sla_days: 30,
    sheet: '#1',
    why: 'Required for wastewater disposal and potable water supply systems',
    description: 'Permit for wastewater systems and potable water supply. Processing time varies by design flow: ≤500 gal/day = 30 days, >500 gal/day = 45 days.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'Variable - see https://dec.vermont.gov/water/ww-systems',
    trigger_key: 'wastewater_system'
  },
  {
    permit_key: '1.2',
    name: 'Underground Injection Control (UIC) Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 2,
    sla_days: 120,
    sheet: '#1.2',
    why: 'Required for underground injection of treated wastewater or stormwater',
    description: 'Permit for underground injection systems. Administrative fee: $240. Review fees: $500 (≤10,000 gpd) or $1,500 (>10,000 gpd) plus per-gallon charges. Annual operating fee varies by type.',
    url: 'https://dec.vermont.gov/water/underground-injection-control',
    fees: '$240 admin + $500-$1,500 application + annual operating fee',
    trigger_key: 'uic_permit'
  },
  {
    permit_key: '2',
    name: 'Land Subdivision Review',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 1,
    sla_days: 30,
    sheet: '#2',
    why: 'Required when creating 6 or more lots for water and wastewater review',
    description: 'Fact sheet for land subdivision review. Processing: ≤500 gal/day = 30 days, >500 gal/day = 45 days. May trigger Act 250 review.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'See Application Fee Schedule',
    trigger_key: 'land_subdivision'
  },
  {
    permit_key: '3',
    name: 'Campground Wastewater Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'core',
    phase: 2,
    sla_days: 30,
    sheet: '#3',
    why: 'Required for all campgrounds with wastewater systems',
    description: 'Permit for campground wastewater and potable water. Processing: ≤500 gal/day = 30 days, >500 gal/day = 45 days.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'Variable - see https://dec.vermont.gov/water/ww-systems',
    trigger_key: 'campground'
  },
  {
    permit_key: '5',
    name: 'Extension of Sewer Lines',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 2,
    sla_days: 30,
    sheet: '#5',
    why: 'Required for municipal sewer line extensions',
    description: 'Permit for extending municipal sewer lines. Processing: ≤500 gal/day = 30 days, >500 gal/day = 45 days.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'Variable - see https://dec.vermont.gov/water/ww-systems',
    trigger_key: 'sewer_extension'
  },
  {
    permit_key: '6',
    name: 'Stormwater General Permits for Construction',
    agency: 'DEC - Watershed Management',
    category: 'core',
    phase: 3,
    sla_days: 40,
    sheet: '#6.1',
    why: 'Required when disturbing ≥1 acre of land during construction',
    description: 'NPDES general permit for construction sites disturbing ≥1 acre. Includes stormwater pollution prevention plan (SWPPP). Processing: 40 days.',
    url: 'https://dec.vermont.gov/watershed/stormwater',
    fees: 'Variable - see fee table at DEC website',
    trigger_key: 'stormwater_construction'
  },
  {
    permit_key: '6.2',
    name: 'Stormwater Permit - New Development & Redevelopment',
    agency: 'DEC - Watershed Management',
    category: 'likely',
    phase: 2,
    sla_days: 60,
    sheet: '#6.2',
    why: 'Required for projects creating or expanding impervious surfaces',
    description: 'Operational stormwater permit for permanent stormwater management systems in new development or redevelopment. Must meet 2017 Vermont Stormwater Manual standards.',
    url: 'https://dec.vermont.gov/watershed/stormwater',
    fees: 'Variable - see fee table at DEC website',
    trigger_key: 'stormwater_development'
  },
  {
    permit_key: '9',
    name: 'Indirect Discharge Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 2,
    sla_days: 90,
    sheet: '#9',
    why: 'Required for discharges to public sewer systems (industrial or food processing)',
    description: 'Permit for indirect discharges to municipal wastewater treatment. Processing: ≤10,000 gpd = 90 days, >10,000 gpd = 120 days (or 150-180 with hearing).',
    url: 'https://dec.vermont.gov/water/indirect-discharge',
    fees: 'Administrative fee + review fee based on capacity and discharge type',
    trigger_key: 'indirect_discharge'
  },
  {
    permit_key: '11',
    name: 'Licensed Designer Certification',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 1,
    sla_days: 30,
    sheet: '#11',
    why: 'Designer must be licensed to prepare wastewater and water supply system plans',
    description: 'Certification requirement for designers of wastewater and water supply systems. Legal Authority: 3 V.S.A. § 2822.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'Varies',
    trigger_key: 'designer_certification'
  },
  {
    permit_key: '14',
    name: 'Construction Permit - Stationary Air Sources',
    agency: 'DEC - Air Quality & Climate',
    category: 'conditional',
    phase: 2,
    sla_days: 150,
    sheet: '#14',
    why: 'Required for new or modified air emission sources (boilers, generators, etc.)',
    description: 'Permit for constructing air contaminant sources. Major sources: $15,000 (175 days). Minor sources: $2,000 base + supplementary fees (150 days). Amendments: $150 (30 days).',
    url: 'https://dec.vermont.gov/air-quality/permits',
    fees: '$2,000-$15,000 depending on source type',
    trigger_key: 'air_construction'
  },
  {
    permit_key: '20',
    name: 'Bottled Water Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'conditional',
    phase: 2,
    sla_days: 30,
    sheet: '#20',
    why: 'Required for bottled water operations',
    description: 'Annual permit for bottled water facilities. Annual fee: $1,390. Amendment: $150. Processing: 30 days.',
    url: 'https://dec.vermont.gov/water',
    fees: '$1,390 annual',
    trigger_key: 'bottled_water'
  },
  {
    permit_key: '21',
    name: 'Public Water System Operating Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'core',
    phase: 2,
    sla_days: 120,
    sheet: '#21',
    why: 'Required to operate any public water system',
    description: 'Operating permit for public water systems. No application fee. Annual operating fee varies by system type. Processing: 120 days. Apply 30 days before operation starts.',
    url: 'https://dec.vermont.gov/water/drinking-water/public-drinking-water-systems',
    fees: 'No application fee; annual operating fee varies',
    trigger_key: 'water_system_operating'
  },
  {
    permit_key: '22',
    name: 'Public Water System Construction Permit',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'core',
    phase: 2,
    sla_days: 120,
    sheet: '#22',
    why: 'Required before constructing new water treatment or distribution systems',
    description: 'Construction permit for water systems. Community/Non-Transient: $900. Transient: $500. Treatment plants: $0.003/gal design capacity. Amendment: $150. Processing: 120 days.',
    url: 'https://dec.vermont.gov/water/drinking-water/public-drinking-water-systems',
    fees: '$500-$900 + design capacity charges',
    trigger_key: 'water_system_construction'
  },
  {
    permit_key: '23',
    name: 'Public Community Water Source Approval',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'core',
    phase: 2,
    sla_days: 180,
    sheet: '#23',
    why: 'Required for new water sources (wells, surface water, etc.)',
    description: 'Source approval for public water systems. PCWS: $945/source. NTNC: $770/source. TNC: $385/source. Amendment: $150. Processing: 180 days.',
    url: 'https://dec.vermont.gov/water/drinking-water/public-drinking-water-systems',
    fees: '$385-$945 per source',
    trigger_key: 'water_source_approval'
  },
  {
    permit_key: '27',
    name: 'Water Quality Certification (Section 401)',
    agency: 'DEC - Watershed Management',
    category: 'likely',
    phase: 2,
    sla_days: 90,
    sheet: '#27',
    why: 'Required for any federally licensed/permitted activity affecting waters',
    description: 'State water quality certification for federal permits. Fee: 1% of project cost (min $200, max $20,000). Processing: 3 months + 30-day public notice.',
    url: 'https://dec.vermont.gov/watershed/business-support/water-quality-certification-',
    fees: '1% of project cost ($200-$20,000)',
    trigger_key: 'water_quality_cert'
  },
  {
    permit_key: '28',
    name: 'Lake Encroachment Permit',
    agency: 'DEC - Watershed Management',
    category: 'conditional',
    phase: 2,
    sla_days: 90,
    sheet: '#28',
    why: 'Required for structures or activities in lakes (docks, erosion control, etc.)',
    description: 'Permit for lake encroachment activities. Non-structural erosion: $155. Structural erosion: $250. Other projects: $300 + 1% construction cost (max $20,000). Processing: 90 days.',
    url: 'https://dec.vermont.gov/watershed/lakes-ponds/permit',
    fees: '$155-$300 + 1% construction cost',
    trigger_key: 'lake_encroachment'
  },
  {
    permit_key: '28.1',
    name: 'Shoreland Protection Permit',
    agency: 'DEC - Watershed Management',
    category: 'conditional',
    phase: 2,
    sla_days: 45,
    sheet: '#28.1',
    why: 'Required for development in shoreland areas (within 250 feet of water)',
    description: 'Shoreland permit for lake/pond frontage development. Registration: $100 (15 days). Permit: $125 + $0.50/sq ft impervious surface (45 days + 30-day public comment).',
    url: 'https://dec.vermont.gov/watershed/lakes-ponds/permit/shoreland',
    fees: '$100-$125 + $0.50/sq ft impervious surface',
    trigger_key: 'shoreland_protection'
  },
  {
    permit_key: '29',
    name: 'Wetlands Permit',
    agency: 'DEC - Watershed Management',
    category: 'likely',
    phase: 2,
    sla_days: 90,
    sheet: '#29',
    why: 'Required for any impact to wetlands or their buffers (Class I, II, or III)',
    description: 'Wetlands permit for impacts to Class I/II wetlands or buffers. Min fee: $240. Per sq ft: $0.75 (Class I/II wetlands) or $0.25 (buffers). Max $200 for cropland conversion. Processing: 90-120 days.',
    url: 'https://dec.vermont.gov/watershed/wetlands',
    fees: '$240 + $0.25-$0.75/sq ft',
    trigger_key: 'wetlands_permit'
  },
  {
    permit_key: '32',
    name: 'Stream Alteration/Stream Crossing Structures',
    agency: 'DEC - Watershed Management',
    category: 'likely',
    phase: 3,
    sla_days: 40,
    sheet: '#32',
    why: 'Required for work in streams (crossings, bridge work, channel modifications)',
    description: 'Permit for stream alterations and crossing structures. Individual: $350. General (culverts/bridges): $200. Emergency: No fee. Processing: 40 days.',
    url: 'https://dec.vermont.gov/watershed/rivers/river-management',
    fees: '$200-$350',
    trigger_key: 'stream_alteration'
  },
  {
    permit_key: '33',
    name: 'Underground Storage Tank Permit',
    agency: 'DEC - Waste Management & Prevention',
    category: 'conditional',
    phase: 2,
    sla_days: 60,
    sheet: '#33',
    why: 'Required for all underground storage tanks (fuel, chemicals, etc.)',
    description: 'Permit for underground storage tanks. Annual fee: $125/tank/year. Construction: 60 days. Operating: 30 days. Municipalities exempt from annual fee.',
    url: 'https://dec.vermont.gov/waste-management/storage-tanks',
    fees: '$125/tank/year',
    trigger_key: 'ust_permit'
  },
  {
    permit_key: '45',
    name: 'Dam Safety Permit',
    agency: 'DEC - Water Investment (formerly Water Safety)',
    category: 'conditional',
    phase: 2,
    sla_days: 120,
    sheet: '#45',
    why: 'Required for construction or modification of dams',
    description: 'Permit for dam construction. May also require Stream Alteration Permit, Wetlands Conditional Use, and/or Army Corps of Engineers permit. 10 VSA Chapter 43.',
    url: 'https://dec.vermont.gov/facilities-engineering/dam-safety/dam-ownership-and-',
    fees: 'Variable',
    trigger_key: 'dam_safety'
  },
  {
    permit_key: '47',
    name: 'Act 250 Land Use Permit',
    agency: 'Natural Resources Board',
    category: 'likely',
    phase: 1,
    sla_days: 60,
    sheet: '#47',
    why: 'Required for subdivisions, earth extraction, and large-scale development',
    description: 'Vermont\'s primary land use statute. Triggered by: subdivisions of 6+ lots, earth extraction >2,500 cy, housing >10 units, commercial/industrial >25,000 sq ft, etc. Processing: 60-80 days average.',
    url: 'https://nrb.vermont.gov/',
    fees: '$7.40/$1,000 (first $15M) + $3.12/$1,000 (above $15M). Min $187.50. Max $165,000. Plus $125/lot.',
    trigger_key: 'act_250'
  },
  {
    permit_key: '49',
    name: 'Fire Prevention & Building Permit',
    agency: 'Dept of Public Safety - Fire Safety Division',
    category: 'core',
    phase: 2,
    sla_days: 30,
    sheet: '#49',
    why: 'Required for all new construction and major renovations',
    description: 'Building and fire safety permit. Fee: $8/1,000 construction value (min $50, max $185,000). Processing: ~30 days (90% reviewed within 30 days).',
    url: 'https://firesafety.vermont.gov',
    fees: '$8/$1,000 construction value',
    trigger_key: 'fire_building_permit'
  },
  {
    permit_key: '50',
    name: 'Electrical Permit - Installation',
    agency: 'Dept of Public Safety - Fire Safety Division',
    category: 'core',
    phase: 2,
    sla_days: 5,
    sheet: '#50',
    why: 'Required for electrical installation work',
    description: 'Electrical permit for new installation. Fee based on component size/number. Inspection: within 5 days of request.',
    url: 'https://firesafety.vermont.gov',
    fees: 'Variable per Vermont Electrical Safety Rules',
    trigger_key: 'electrical_permit'
  },
  {
    permit_key: '50.2',
    name: 'Plumbing Permit - Installation',
    agency: 'Dept of Public Safety - Fire Safety Division',
    category: 'core',
    phase: 2,
    sla_days: 10,
    sheet: '#50.2',
    why: 'Required for plumbing work (new installation or significant alterations)',
    description: 'Plumbing permit. Fee based on component size/number and priority classification. Processing: applicant may proceed after filing work notice.',
    url: 'https://firesafety.vermont.gov',
    fees: 'Variable per Vermont Plumbing Safety Rules',
    trigger_key: 'plumbing_permit'
  },
  {
    permit_key: '51',
    name: 'Lodging Establishment License',
    agency: 'Dept of Health - Environmental Health Division',
    category: 'conditional',
    phase: 2,
    sla_days: 30,
    sheet: '#51',
    why: 'Required for hotels, motels, B&Bs, and other lodging facilities',
    description: 'License for lodging establishments. Tier I (1-10 rooms): $130. Tier II (11-20): $185. Tier III (21-50): $250. Tier IV (51-200): $340. Tier V (201+): $1,000. Processing: 30 days.',
    url: 'https://www.healthvermont.gov/health-environment/food-lodging/lodging-licensing',
    fees: '$130-$1,000 depending on capacity',
    trigger_key: 'lodging_license'
  },
  {
    permit_key: '53',
    name: 'Food Service Establishment License',
    agency: 'Dept of Health - Environmental Health Division',
    category: 'conditional',
    phase: 2,
    sla_days: 30,
    sheet: '#53',
    why: 'Required for restaurants, cafes, food trucks, and food service operations',
    description: 'License for food service. Tiers based on seating capacity: $105 (0-25 seats) to $1,000 (600+ seats). Caterers, bakeries, and vendors have specific fees. Processing: 30 days.',
    url: 'https://www.healthvermont.gov/health-environment/food-lodging/retail-food-licensing',
    fees: '$105-$1,000 depending on operation type',
    trigger_key: 'food_service_license'
  },
  {
    permit_key: '54',
    name: 'Asbestos Control Program',
    agency: 'Dept of Health - Environmental Health Division',
    category: 'conditional',
    phase: 2,
    sla_days: 10,
    sheet: '#54',
    why: 'Required when disturbing asbestos-containing materials in buildings',
    description: 'Asbestos notification and contractor approval. Fee based on ACM quantity. Notification: 10 working days advance. Contractors must be certified.',
    url: 'https://www.healthvermont.gov/environment/asbestos-lead',
    fees: 'Varies by quantity of ACM',
    trigger_key: 'asbestos_program'
  },
  {
    permit_key: '55',
    name: 'Lead Abatement Permit',
    agency: 'Dept of Health - Environmental Health Division',
    category: 'conditional',
    phase: 2,
    sla_days: 10,
    sheet: '#55',
    why: 'Required when abating lead paint or lead-contaminated dust',
    description: 'Lead abatement permit. Permit fee: $50. Revision: $25. Applies to pre-1978 buildings undergoing renovation/demolition.',
    url: 'https://www.healthvermont.gov/health-environment/asbestos-lead-buildings/lead',
    fees: '$50 permit + $25 revision',
    trigger_key: 'lead_abatement'
  },
  {
    permit_key: '90',
    name: 'Malt & Vinous Beverage License',
    agency: 'Dept of Liquor Control',
    category: 'conditional',
    phase: 2,
    sla_days: 60,
    sheet: '#90',
    why: 'Required to sell beer and wine',
    description: 'License for on- or off-premise sale of malt and vinous beverages (beer, wine). Fees vary by license type and hours of operation.',
    url: 'https://liquorcontrol.vermont.gov/licensing',
    fees: 'Variable by license type',
    trigger_key: 'liquor_license_beer_wine'
  },
  {
    permit_key: 'agr-soil',
    name: 'Agricultural Soils & Septic Suitability Review',
    agency: 'DEC - Drinking Water & Groundwater Protection',
    category: 'likely',
    phase: 1,
    sla_days: 45,
    sheet: 'Agricultural Soils',
    why: 'Required in rural areas to assess soil suitability for septic systems and development',
    description: 'Agricultural soil testing and analysis for septic system design and rural development. Determines groundwater impact potential, soil permeability, and system feasibility. Common in rural Vermont development.',
    url: 'https://dec.vermont.gov/water/ww-systems',
    fees: 'Testing/analysis fees vary by scope ($500-$2,000)',
    trigger_key: 'agricultural_soils_rural'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow staff/admin to populate permits
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    // Get existing permits to avoid duplicates
    const existing = await base44.asServiceRole.entities.PermitType.list('-created_date', 1000);
    const existingKeys = new Set(existing.map(p => p.permit_key));

    // Filter out duplicates
    const newPermits = PERMITS.filter(p => !existingKeys.has(p.permit_key));

    if (newPermits.length === 0) {
      return Response.json({
        message: 'All permits already exist',
        total: PERMITS.length,
        skipped: PERMITS.length,
        created: 0
      });
    }

    // Create permits in batch
    const created = await Promise.all(
      newPermits.map(p => base44.asServiceRole.entities.PermitType.create(p))
    );

    return Response.json({
      message: 'Permits populated successfully',
      total: PERMITS.length,
      created: created.length,
      skipped: existingKeys.size,
      details: created.map(p => ({ permit_key: p.permit_key, name: p.name }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});