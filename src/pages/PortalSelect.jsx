import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Mountain, FolderOpen, ClipboardList, BarChart3, ArrowRight } from "lucide-react";

export default function PortalSelect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing portal selection when landing here
    localStorage.removeItem("vt_portal_mode");
  }, []);

  const selectPortal = (mode) => {
    localStorage.setItem("vt_portal_mode", mode);
    if (mode === "applicant") {
      navigate(createPageUrl("Projects"));
    } else {
      navigate(createPageUrl("Dashboard"));
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #0f2d1f 0%, #1a3d2e 40%, #2d6a4f 100%)" }}>
      {/* Gov bar */}
      <div className="bg-green-950 text-white text-xs py-1.5 px-4 flex items-center gap-2">
        <Mountain size={13} className="opacity-80" />
        <span className="font-semibold tracking-wide uppercase opacity-90">An Official Vermont Government Website</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Mountain size={24} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-green-300">Vermont</div>
            <div className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Permit Program</div>
            </div>
            </div>
            <p className="text-green-300 text-sm mb-12 opacity-80">Vermont Permit Program</p>

        <h2 className="text-white text-lg font-semibold mb-8 text-center opacity-90">Select your portal to continue</h2>

        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Applicant Portal */}
          <button
            onClick={() => selectPortal("applicant")}
            className="group relative bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-5">
              <FolderOpen size={24} className="text-green-700" />
            </div>
            <h3 className="text-xl font-bold text-green-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>Applicant Portal</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              For property owners, developers, and project applicants. Manage your projects, track permit status, and find required permits.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li className="flex items-center gap-2"><FolderOpen size={13} className="text-green-600" /> My Projects</li>
              <li className="flex items-center gap-2"><ClipboardList size={13} className="text-green-600" /> Tasks</li>
              <li className="flex items-center gap-2"><ClipboardList size={13} className="text-green-600" /> Permit Finder</li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 group-hover:text-green-900">
              Enter Applicant Portal <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Staff Portal */}
          <button
            onClick={() => selectPortal("staff")}
            className="group relative bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
              <BarChart3 size={24} className="text-blue-700" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>Staff Portal</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              For agency staff and reviewers. Monitor applications, manage the review queue, and track system-wide performance metrics.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 mb-6">
              <li className="flex items-center gap-2"><BarChart3 size={13} className="text-blue-600" /> Review Queue</li>
              <li className="flex items-center gap-2"><BarChart3 size={13} className="text-blue-600" /> Progress Dashboard</li>
              <li className="flex items-center gap-2"><BarChart3 size={13} className="text-blue-600" /> Performance Metrics</li>
            </ul>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 group-hover:text-blue-900">
              Enter Staff Portal <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <p className="text-green-400 text-xs mt-10 opacity-60">⚠ DRAFT VERSION — FOR TESTING ONLY</p>
      </div>
    </div>
  );
}