/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Dashboard from './pages/Dashboard';
import PermitDashboard from './pages/PermitDashboard';
import PermitFinder from './pages/PermitFinder';
import PermitMetrics from './pages/PermitMetrics';
import PermitReviewDetail from './pages/PermitReviewDetail';
import PortalSelect from './pages/PortalSelect';
import ProjectProfile from './pages/ProjectProfile';
import Projects from './pages/Projects';
import ReviewQueue from './pages/ReviewQueue';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import RequirementsDoc from './pages/RequirementsDoc';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "PermitDashboard": PermitDashboard,
    "PermitFinder": PermitFinder,
    "PermitMetrics": PermitMetrics,
    "PermitReviewDetail": PermitReviewDetail,
    "PortalSelect": PortalSelect,
    "ProjectProfile": ProjectProfile,
    "Projects": Projects,
    "ReviewQueue": ReviewQueue,
    "Settings": Settings,
    "Tasks": Tasks,
    "RequirementsDoc": RequirementsDoc,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};