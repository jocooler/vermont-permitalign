import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState } from "react";
import { Menu, X, Mountain, ChevronRight, Home, FolderOpen, ClipboardList, BarChart3 } from "lucide-react";

const navLinks = [
  { name: "Dashboard", page: "Dashboard", Icon: Home },
  { name: "My Projects", page: "Projects", Icon: FolderOpen },
  { name: "Tasks", page: "Tasks", Icon: ClipboardList },
  { name: "Permit Finder", page: "PermitFinder", Icon: ClipboardList },
  { name: "Review Queue", page: "ReviewQueue", Icon: BarChart3 },
  { name: "Progress Dashboard", page: "PermitDashboard", Icon: BarChart3 },
  { name: "Performance Metrics", page: "PermitMetrics", Icon: BarChart3 },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Draft Banner */}
      <div className="bg-amber-400 text-amber-900 text-xs py-1.5 px-4 flex items-center justify-center font-bold tracking-widest">
        ⚠ DRAFT VERSION - FOR TESTING ONLY ⚠
      </div>

      {/* Top Government Bar */}
      <div className="bg-green-950 text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain size={13} className="opacity-80" />
          <span className="font-semibold tracking-wide uppercase opacity-90">An Official Vermont Government Website</span>
        </div>
        <span className="opacity-70 hidden sm:block">Vermont Agency of Natural Resources</span>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white border-b-4 border-green-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-green-800 flex items-center justify-center">
              <Mountain size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-800 leading-none">Vermont</div>
              <div className="font-bold text-sm leading-tight text-green-900" style={{ fontFamily: "Georgia, serif" }}>Permitting System</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, page, Icon }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all ${
                    isActive
                      ? "text-green-700 bg-green-50 border-b-2 border-green-600"
                      : "text-slate-600 hover:text-green-700 hover:bg-green-50 border-b-2 border-transparent"
                  }`}
                >
                  <Icon size={15} />
                  {name}
                </Link>
              );
            })}
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
                className="flex items-center gap-2 px-3 py-3 rounded text-sm font-medium text-slate-700 hover:bg-green-50"
              >
                <Icon size={16} />
                {name}
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </Link>
            ))}
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
            <div className="font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>Vermont Permitting System - DRAFT</div>
            <div className="text-xs opacity-60">Agency of Natural Resources · Department of Environmental Conservation</div>
          </div>
          <div className="text-xs opacity-50">Version 0.1 Draft · For internal use and testing only</div>
        </div>
      </footer>
    </div>
  );
}