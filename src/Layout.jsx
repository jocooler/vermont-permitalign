import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";
import { Menu, X, Mountain, ChevronRight, Home, FolderOpen, ClipboardList, BarChart3, ArrowLeftRight } from "lucide-react";

const APPLICANT_LINKS = [
  { name: "Dashboard", page: "Dashboard", Icon: Home },
  { name: "My Projects", page: "Projects", Icon: FolderOpen },
  { name: "Tasks", page: "Tasks", Icon: ClipboardList },
  { name: "Permit Finder", page: "PermitFinder", Icon: ClipboardList },
];

const STAFF_LINKS = [
  { name: "Dashboard", page: "Dashboard", Icon: Home },
  { name: "Review Queue", page: "ReviewQueue", Icon: BarChart3 },
  { name: "Progress Dashboard", page: "PermitDashboard", Icon: BarChart3 },
  { name: "Performance Metrics", page: "PermitMetrics", Icon: BarChart3 },
];

const PORTAL_EXEMPT_PAGES = ["PortalSelect"];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalMode, setPortalMode] = useState(() => localStorage.getItem("vt_portal_mode") || null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("vt_portal_mode");
    if (!stored && !PORTAL_EXEMPT_PAGES.includes(currentPageName)) {
      navigate(createPageUrl("PortalSelect"));
    } else {
      setPortalMode(stored);
    }
  }, [currentPageName]);

  const navLinks = portalMode === "staff" ? STAFF_LINKS : APPLICANT_LINKS;
  const isStaff = portalMode === "staff";

  const handleSwitchPortal = () => {
    localStorage.removeItem("vt_portal_mode");
    navigate(createPageUrl("PortalSelect"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Draft Banner */}
      <div className="bg-amber-400 text-amber-900 text-xs py-1.5 px-4 flex items-center justify-center font-bold tracking-widest">
        ⚠ DRAFT VERSION - FOR TESTING ONLY ⚠
      </div>

      {/* Top Government Bar */}
      <div className={`text-white text-xs py-1.5 px-4 flex items-center justify-between ${isStaff ? "bg-blue-950" : "bg-green-950"}`}>
        <div className="flex items-center gap-2">
          <Mountain size={13} className="opacity-80" />
          <span className="font-semibold tracking-wide uppercase opacity-90">An Official Vermont Government Website</span>
        </div>
        <div className="flex items-center gap-3">
          {portalMode && (
            <span className={`font-bold uppercase tracking-widest px-2 py-0.5 rounded text-xs ${isStaff ? "bg-blue-700 text-blue-100" : "bg-green-700 text-green-100"}`}>
              {isStaff ? "Staff Portal" : "Applicant Portal"}
            </span>
          )}
          <span className="opacity-70 hidden sm:block">Vermont Permit Program</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white sticky top-0 z-50 shadow-sm border-b-4 ${isStaff ? "border-blue-700" : "border-green-700"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-green-800 flex items-center justify-center">
              <Mountain size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-800 leading-none">Vermont</div>
              <div className="font-bold text-sm leading-tight text-green-900" style={{ fontFamily: "Georgia, serif" }}>Permit Program</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, page, Icon }) => {
              const isActive = currentPageName === page;
              const activeClass = isStaff
                ? "text-blue-700 bg-blue-50 border-b-2 border-blue-600"
                : "text-green-700 bg-green-50 border-b-2 border-green-600";
              const hoverClass = isStaff
                ? "text-slate-600 hover:text-blue-700 hover:bg-blue-50 border-b-2 border-transparent"
                : "text-slate-600 hover:text-green-700 hover:bg-green-50 border-b-2 border-transparent";
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all ${isActive ? activeClass : hoverClass}`}
                >
                  <Icon size={15} />
                  {name}
                </Link>
              );
            })}
            <button
              onClick={handleSwitchPortal}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all ml-2 border-l border-slate-200"
            >
              <ArrowLeftRight size={13} /> Switch Portal
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded text-green-900" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2">
            {navLinks.map(({ name, page, Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-3 rounded text-sm font-medium text-slate-700 ${isStaff ? "hover:bg-blue-50" : "hover:bg-green-50"}`}
              >
                <Icon size={16} />
                {name}
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </Link>
            ))}
            <button
              onClick={handleSwitchPortal}
              className="flex items-center gap-2 px-3 py-3 rounded text-sm font-medium text-slate-500 hover:bg-slate-50 w-full mt-1 border-t"
            >
              <ArrowLeftRight size={16} /> Switch Portal
            </button>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-green-950 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>Vermont Permit Program - DRAFT</div>
            <div className="text-xs opacity-60">Vermont Permit Program</div>
          </div>
          <div className="text-xs opacity-50">Version 0.1 Draft · For internal use and testing only</div>
        </div>
      </footer>
    </div>
  );
}