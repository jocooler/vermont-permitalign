import { useState } from "react";
import { ChevronDown, ChevronRight, Mountain, FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";

const SECTIONS = [
  {
    id: "overview",
    title: "1. Product Overview",
    content: [
      {
        heading: "1.1 Product Name",
        body: "Vermont Permit Path — a web-based permitting guidance and tracking system for the Vermont Agency of Natural Resources."
      },
      {
        heading: "1.2 Purpose",
        body: "Vermont Permit Path streamlines the Vermont development permitting process by helping applicants identify which permits are required for their project, track application status across agencies, and manage associated tasks — while giving agency staff a consolidated review queue and performance analytics."
      },
      {
        heading: "1.3 Status",
        body: "DRAFT — Version 0.1. For internal testing and review only. Not yet in production use."
      },
      {
        heading: "1.4 Primary Users",
        body: "Two distinct user roles:\n• Applicant Portal: Property owners, developers, project applicants, and consultants submitting permit applications.\n• Staff Portal: Agency reviewers and staff monitoring, reviewing, and approving submitted applications."
      }
    ]
  },
  {
    id: "architecture",
    title: "2. System Architecture",
    content: [
      {
        heading: "2.1 Technology Stack",
        body: "Frontend: React + Tailwind CSS + Vite (SPA)\nBackend: Base44 BaaS (managed database, authentication, serverless functions)\nMapping: Leaflet.js + ESRI-Leaflet (loaded from CDN at runtime)\nCharts: Recharts\nPDF Generation: jsPDF\nAuthentication: Base44 Auth (email-based)"
      },
      {
        heading: "2.2 Data Entities",
        body: "Project — core record tying together parcel, site conditions, permit list, applicant profile, and status lifecycle.\nPermitType — master catalog of all permit types with agency, phase, trigger logic, SLA, and reference URLs.\nPermitApplication — individual permit application record per project/permit pairing (with status, notes, documents, reviewer info).\nTask — action items attached to a project or permit (auto-generated on project creation; can be manually created).\nUser — built-in auth entity (name, email, role)."
      },
      {
        heading: "2.3 External GIS Integrations",
        body: "Vermont Parcel Data (VCGI ESRI FeatureServer) — parcel lookup by address, SPAN, or map click; returns geometry, acres, town, owner.\nVermont Significant Wetland Inventory (VSVI) — detects Class I/II wetlands intersecting the parcel.\nFEMA NFHL Flood Zones (Layer 28) — detects SFHA A/V flood zones via POST requests; falls back to secondary endpoint.\nUSGS National Hydrography Dataset (NHD) — perennial stream flowlines within ~100m, and lakes/ponds (>10 acres) within ~250ft.\nUSGS Elevation Point Query Service (EPQS) — centroid elevation in feet.\nUS Census TIGER Roads (MapServer Layer 6) — detects state/US/interstate routes within ~50m buffer."
      }
    ]
  },
  {
    id: "portals",
    title: "3. Portal Structure",
    content: [
      {
        heading: "3.1 Portal Selection",
        body: "On first load, users select either Applicant Portal or Staff Portal. Selection is stored in localStorage. A 'Switch Portal' link in the nav bar allows switching at any time."
      },
      {
        heading: "3.2 Applicant Portal Navigation",
        body: "Dashboard — overview stats and recent projects.\nMy Projects — full project management.\nTasks — cross-project task list.\nPermit Finder — standalone permit lookup tool."
      },
      {
        heading: "3.3 Staff Portal Navigation",
        body: "Dashboard — system-wide overview stats.\nReview Queue — agency-filtered permit application review.\nProgress Dashboard — permit status analytics and charts.\nPerformance Metrics — SLA and processing time analytics.\nSettings — system configuration."
      }
    ]
  },
  {
    id: "features-applicant",
    title: "4. Applicant Features",
    content: [
      {
        heading: "4.1 Dashboard",
        body: "Displays: Total Projects, In Progress, Approved, Denied counts; Units in Pipeline; Units Approved; Total Permits Tracked; Permits Approved.\nShows a status breakdown bar chart for all projects.\nLists 5 most recently created projects with status badges and permit completion progress.\nQuick action links: New Project, Find My Permits, My Projects."
      },
      {
        heading: "4.2 Project Creation (3-Step Wizard)",
        body: "Step 1 — Project Details: name, town, parcel ID (SPAN), site address, number of residential units (slider, 1–20), estimated acres disturbed during construction (slider, 0–5 in 0.25 increments), optional description. Inline warnings at 10+ units (Act 250 trigger) and ≥1 acre disturbed (stormwater permit trigger). 'Map' button opens the ParcelPicker.\nStep 2 — Site Conditions: checkboxes for 13 environmental/site conditions (near wetlands, in floodplain, near stream, near lake/pond, state highway access, elevation above 2,500 ft, existing structures, pre-1978 structures, connects municipal sewer, own water system, near shoreland, federal funding, soil test completed). Auto-detected conditions from the parcel picker are flagged and locked.\nStep 3 — Review & Save: displays computed permit list grouped by phase with count. On save, creates the project record and auto-generates tasks for each identified permit plus a 'Complete Project Profile' high-priority task."
      },
      {
        heading: "4.3 Parcel Picker (GIS Map Tool)",
        body: "Full-screen modal with CARTO basemap tile layer and Vermont parcel feature layer (visible at zoom ≥13).\nSearch modes: address (LIKE query) or SPAN (exact match).\nMap click: queries parcel at click location via bounding box REST query.\nOn parcel selection, immediately runs 6 parallel GIS checks: wetlands (VSVI), floodplain (FEMA NFHL POST), streams (NHD), lakes (NHD), elevation (USGS EPQS), state highway (TIGER RTTYP filter).\nDisplays results as color-coded pills: green = no hazard, amber = caution, red = floodplain.\nParcel attributes returned: SPAN, town, owner name, address, acreage.\nSupports read-only mode (display-only, no selection) for viewing an already-saved parcel on a map."
      },
      {
        heading: "4.4 Project Detail View",
        body: "Header card showing project name, location, SPAN, permit completion ratio (X/Y), and open task count.\nTwo tabs:\n  Permits Tab — permits grouped by Phase (1–4). Each permit card shows name, agency, status badge, SLA, and links to agency resources. 'Add Permit' button opens a searchable modal to attach additional permits.\n  Tasks Tab — list of tasks sorted by priority (profile task first, then high→medium→low, completed last). Inline task creation form.\nPermit status update via slide-out PermitDetailPanel. When any permit moves past 'draft' status, project status auto-advances to 'in_progress'.\nEdit Profile link → ProjectProfile page.\nDelete Project (with confirmation dialog) — cascades to delete all associated tasks."
      },
      {
        heading: "4.5 Project Profile",
        body: "Dedicated page for reusable applicant and project information: applicant name, organization, email, phone, mailing address, project description, anticipated start/end dates.\nThis data is used to pre-fill permit intake forms and populate PDF reports."
      },
      {
        heading: "4.6 Permit Detail Panel",
        body: "Slide-out panel showing: permit name, agency, sheet reference, SLA, category badge, description, agency URL, info sheet PDF link.\nStatus update dropdown (7 states: Not Started → In Progress → Submitted → Under Review → Info Requested → Approved / Denied).\nNotes field; info-requested banner if reviewer has flagged additional info needed.\nLinks to intake form, fee processing, and application form sub-flows."
      },
      {
        heading: "4.7 Tasks",
        body: "Standalone Tasks page shows all tasks across all projects.\nTask fields: title, description, type (document upload, information required, review, other), status (pending, in progress, completed, cancelled), priority (high, medium, low), due date, assigned-to email, notes.\nTask cards show status color coding, priority badge, overdue indicator, and link back to project/permit.\nStatus toggle on card (e.g. click to mark complete)."
      },
      {
        heading: "4.8 Permit Finder",
        body: "Standalone tool allowing users to answer site condition questions and immediately see which permits would apply, without creating a project."
      }
    ]
  },
  {
    id: "features-staff",
    title: "5. Staff Features",
    content: [
      {
        heading: "5.1 Review Queue",
        body: "Displays all permit applications with status: submitted, under_review, info_requested (approved/denied optionally shown via toggle).\nAgency tile view: one tile per agency showing pending application count. Click an agency to filter the queue to that agency.\nStatus filter pills: All / Submitted / Under Review / Info Requested.\nEach queue row shows permit name, project name/town, expected SLA, status badge, PDF download button.\nClick a row → navigates to PermitReviewDetail page.\nDetail panel (old inline) supports: status change (5 states), info-requested text box, reviewer notes, save, and PDF download."
      },
      {
        heading: "5.2 Permit Review Detail",
        body: "Full-page review view showing project map (read-only ParcelPicker), project metadata, site conditions, applicant profile.\nStatus management with full workflow transitions.\nPDF generation including project info, applicant profile, permit metadata, reviewer notes, and attached document list.\nLinks to view project profile and navigate back to review queue."
      },
      {
        heading: "5.3 Progress Dashboard",
        body: "System-wide permit analytics with filters: Project Type, Town, Department.\nKey metrics: Total Permits, Approved, Pending Review, Not Started.\nPie chart: permits by status.\nBar chart: department approval rate (% approved per agency).\nProject status filter cards (clickable) → drill-down project list.\nAll Projects table with stacked mini status bars per project."
      },
      {
        heading: "5.4 Performance Metrics",
        body: "SLA compliance tracking, processing time distributions, and other system-wide analytics."
      },
      {
        heading: "5.5 Settings",
        body: "System configuration page (admin-facing)."
      }
    ]
  },
  {
    id: "permit-logic",
    title: "6. Permit Determination Logic",
    content: [
      {
        heading: "6.1 Trigger System",
        body: "Each PermitType record stores a trigger_key string. At runtime, this key maps to a JavaScript predicate function that evaluates the project's site conditions and project attributes.\nTrigger keys include: always, unit_count_gte_10_or_elevation, federal_funding, near_wetlands_and_federal_funding, creating_lots, near_wetlands, in_floodplain, near_stream, near_lake_or_pond, state_highway_access, own_water_system, unit_count_lte_9, disturbed_acres_gte_1, existing_structures, pre_1978_structures, unit_count_gte_4, connects_municipal_sewer, agricultural_soils_rural."
      },
      {
        heading: "6.2 Permit Phases",
        body: "Phase 1 — Pre-Application & Planning: permits needed early to inform site design (longest lead times).\nPhase 2 — Pre-Construction: required before breaking ground.\nPhase 3 — During Construction: must be active while construction is underway.\nPhase 4 — Post-Construction & Occupancy: required before occupancy or final utility energization."
      },
      {
        heading: "6.3 Permit Categories",
        body: "Core — always required given the trigger conditions.\nLikely Required — very likely needed, applicant should plan for it.\nConditional — depends on specific project details not captured in automated checks."
      },
      {
        heading: "6.4 Permit Lifecycle (7 Statuses)",
        body: "not_started → in_progress → submitted → under_review → info_requested → approved | denied"
      }
    ]
  },
  {
    id: "data-model",
    title: "7. Data Model",
    content: [
      {
        heading: "7.1 Project Entity",
        body: "Fields: name*, project_type* (residential/commercial/industrial/agricultural/mixed_use), description, address, town, parcel_id (SPAN), parcel_acres (from GIS), unit_count, disturbed_acres, status (draft/in_progress/submitted/under_review/approved/denied), latitude, longitude.\nNested: site_conditions (13 boolean flags), identified_permits (array of permit assignments with status, notes, why_required), profile (applicant contact and project schedule info)."
      },
      {
        heading: "7.2 PermitType Entity",
        body: "Fields: permit_key*, name*, agency*, category* (core/likely/conditional), phase* (1–4), sla_days, why, trigger_key, sheet, description, url, info_sheet_url, is_active."
      },
      {
        heading: "7.3 PermitApplication Entity",
        body: "Fields: project_id*, permit_id*, permit_name, agency, status, category, notes, submitted_date, decision_date, sla_days, reviewer_notes, info_requested, location (object), attached_documents (array), site_conditions (object)."
      },
      {
        heading: "7.4 Task Entity",
        body: "Fields: project_id*, title*, task_type* (document_upload/information_required/review/other), status (pending/in_progress/completed/cancelled), priority (low/medium/high), description, permit_id, due_date, completed_date, assigned_to, notes."
      }
    ]
  },
  {
    id: "nonfunctional",
    title: "8. Non-Functional Requirements",
    content: [
      {
        heading: "8.1 Performance",
        body: "GIS checks (6 parallel queries) should complete within 10 seconds each (individual timeout). The parcel feature layer renders at zoom level 13+. PDF generation is client-side (no server round-trip)."
      },
      {
        heading: "8.2 Reliability",
        body: "FEMA floodplain check uses two fallback endpoints. TIGER roads replaces VTrans GIS endpoint to avoid CORS. GIS failures are handled gracefully — any single check failure returns null without blocking the others."
      },
      {
        heading: "8.3 Responsiveness",
        body: "Full mobile + desktop responsive layout. Navigation collapses to hamburger menu on mobile. Map picker is full-screen modal."
      },
      {
        heading: "8.4 Security",
        body: "Authentication required (Base44 Auth). Portal mode (applicant/staff) stored in localStorage — no server-side enforcement of portal separation in current draft. Admin-only functions must verify role before execution."
      },
      {
        heading: "8.5 Accessibility",
        body: "Uses semantic HTML. Color-coded status badges include text labels. Icons are supplementary to text labels."
      }
    ]
  },
  {
    id: "outstanding",
    title: "9. Known Gaps & Future Work",
    content: [
      {
        heading: "9.1 Known Limitations",
        body: "Portal mode (applicant vs. staff) is localStorage-based — any user can switch without server-side access control. This is intentional for the draft/demo phase.\nVTrans state highway data was replaced with US Census TIGER roads due to CORS restrictions; TIGER does not include town highways, only state/US/interstate routes.\nNo real-time applicant notifications (no email/webhook on status change yet).\nPermit intake forms are partially wired — some permit-specific workflows are stubs."
      },
      {
        heading: "9.2 Future Enhancements",
        body: "Role-based access control enforced server-side.\nEmail notifications to applicants when permit status changes or info is requested.\nDocument upload and storage per permit application.\nIntegration with Vermont e-permitting systems.\nShoreland setback and riparian buffer calculations.\nMobile-optimized map picker.\nAct 250 threshold calculator.\nPublic-facing permit status lookup (no login required)."
      }
    ]
  }
];

function Section({ section }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        {open ? <ChevronDown size={16} className="text-green-700 flex-shrink-0" /> : <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />}
        <span className="font-bold text-green-900">{section.title}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white border-t border-slate-100 divide-y divide-slate-50">
          {section.content.map((item, i) => (
            <div key={i} className="py-4">
              <div className="text-sm font-semibold text-slate-800 mb-2">{item.heading}</div>
              <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{item.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RequirementsDoc() {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(26, 61, 46);
    doc.text("Vermont Permit Path", 20, y); y += 10;

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("Software Requirements Document", 20, y); y += 7;

    doc.setFontSize(9);
    doc.setTextColor(140, 140, 140);
    doc.text(`Generated: ${new Date().toLocaleDateString()} · DRAFT v0.1`, 20, y); y += 10;

    doc.setDrawColor(200, 220, 200);
    doc.line(20, y, 190, y); y += 8;

    SECTIONS.forEach(section => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setTextColor(26, 61, 46);
      doc.setFont(undefined, "bold");
      doc.text(section.title, 20, y); y += 8;

      section.content.forEach(item => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.setFont(undefined, "bold");
        doc.text(item.heading, 22, y); y += 6;

        doc.setFont(undefined, "normal");
        doc.setTextColor(80, 80, 80);
        const lines = doc.splitTextToSize(item.body, 160);
        lines.forEach(line => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(line, 22, y); y += 5;
        });
        y += 4;
      });
      y += 6;
    });

    doc.save("vermont-permit-path-requirements.pdf");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="rounded-xl mb-8 p-6 flex items-start justify-between gap-4" style={{ background: "linear-gradient(135deg, #1a3d2e 0%, #2d6a4f 100%)" }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Mountain size={18} className="text-green-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-green-300">Vermont Agency of Natural Resources</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>Software Requirements Document</h1>
          <p className="text-green-200 text-sm">Vermont Permit Path · Draft v0.1 · {new Date().toLocaleDateString()}</p>
          <div className="mt-3 inline-block bg-amber-400 text-amber-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded">
            ⚠ Draft — Internal Use Only
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
        >
          <Download size={15} /> Export PDF
        </button>
      </div>

      {/* TOC */}
      <div className="vt-card p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={15} className="text-green-700" />
          <span className="text-xs font-bold uppercase tracking-widest text-green-800">Table of Contents</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-1">
          {SECTIONS.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={e => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-sm text-green-700 hover:text-green-900 hover:underline py-0.5"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        {SECTIONS.map(section => (
          <div key={section.id} id={section.id}>
            <Section section={section} />
          </div>
        ))}
      </div>

      <div className="mt-8 text-xs text-slate-400 text-center">
        Vermont Permit Path · Requirements Document · Draft v0.1 · {new Date().toFullYear?.() || new Date().getFullYear()}
      </div>
    </div>
  );
}