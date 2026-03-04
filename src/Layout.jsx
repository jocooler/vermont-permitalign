import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState } from "react";
import { Menu, X, Mountain, ChevronRight, Home, FolderOpen, ClipboardList, BarChart3 } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", page: "Dashboard", icon: Home },
    { name: "My Projects", page: "Projects", icon: FolderOpen },
    { name: "Permit Finder", page: "PermitFinder", icon: ClipboardList },
    { name: "Review Queue", page: "ReviewQueue", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--vt-gray-pale)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&display=swap');
      `}</style>

      {/* Top Government Bar */}
      <div className="vt-header-bar text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain size={13} className="opacity-80" />
          <span className="font-semibold tracking-wide uppercase opacity-90">An Official Vermont Government Website</span>
        </div>
        <span className="opacity-70 hidden sm:block">Vermont Agency of Natural Resources</span>
      </div>

      {/* Main Navigation */}
      <nav className="vt-nav sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded" style={{ background: "var(--vt-green-dark)" }} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--vt-green-dark)", lineHeight: 1 }}>Vermont</div>
              <div className="font-bold text-sm leading-tight" style={{ color: "var(--vt-green-dark)", fontFamily: "'Source Serif 4', Georgia, serif" }}>Permitting System</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ name, page, icon: Icon }) => {
              const isActive = currentPageName === page;
              return (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all"
                  style={{
                    color: isActive ? "var(--vt-green)" : "var(--vt-gray)",
                    background: isActive ? "var(--vt-green-pale)" : "transparent",
                    borderBottom: isActive ? "2px solid var(--vt-green)" : "2px solid transparent",
                  }}
                >
                  <Icon size={15} />
                  {name}
                </Link>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "var(--vt-green-dark)" }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white px-4 pb-4 pt-2">
            {navLinks.map(({ name, page, icon: Icon }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded text-sm font-medium"
                style={{ color: "var(--vt-gray-dark)" }}
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
      <footer style={{ background: "var(--vt-green-dark)", color: "rgba(255,255,255,0.75)" }} className="py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="font-bold text-white mb-1" style={{ fontFamily: "'Source Serif 4', serif" }}>Vermont Permitting System</div>
            <div className="text-xs opacity-70">Agency of Natural Resources · Department of Environmental Conservation</div>
          </div>
          <div className="text-xs opacity-60">
            Version 0.1 Draft · For internal use and testing only
          </div>
        </div>
      </footer>
    </div>
  );
}