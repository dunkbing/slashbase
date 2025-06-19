import Bowser from "bowser";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AppLayout from "./components/layouts/applayout";
import Constants from "./constants";
import {
  DBConnectionsProvider,
  useDBConnections,
} from "./contexts/db-connection-context";
import DBPage from "./pages/db";
import HomePage from "./pages/home";
import LogoutPage from "./pages/logout";
import ProjectPage from "./pages/project";
import ProjectMembersPage from "./pages/project/members";
import NewDBPage from "./pages/project/newdb";
import AboutPage from "./pages/settings/about";
import AccountPage from "./pages/settings/account";
import AdvancedSettingsPage from "./pages/settings/advanced";
import GeneralSettingsPage from "./pages/settings/general";
import ManageRolesPage from "./pages/settings/roles";
import SupportPage from "./pages/settings/support";
import UsersPage from "./pages/settings/users";
import AddNewUserPage from "./pages/settings/usersAdd";
import { getConfig } from "./redux/configSlice";
import { getUser, selectIsAuthenticated } from "./redux/currentUserSlice";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { getProjects } from "./redux/projectsSlice";

// Inner App component that uses the context
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const isValidPlatform: boolean =
    Bowser.getParser(window.navigator.userAgent).getPlatformType(true) ===
    "desktop";

  const dispatch = useAppDispatch();
  const { getAllDBConnections } = useDBConnections();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (Constants.Build === "desktop") return;
    if (isAuthenticated) return;
    dispatch(getUser());
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    if (isAuthenticated || Constants.Build === "desktop") {
      dispatch(getProjects());
      getAllDBConnections();
      dispatch(getConfig());
    }
  }, [dispatch, isAuthenticated, getAllDBConnections]);

  useEffect(() => {
    if (Constants.Build === "desktop") return;
    if (isAuthenticated === null) return;
    if (location.pathname !== "/" && !isAuthenticated) {
      navigate(Constants.APP_PATHS.HOME.path);
    }
  }, [location.pathname, isAuthenticated, navigate]);

  if (!isValidPlatform) {
    return <NotSupportedPlatform />;
  }

  return (
    <div className="appcontainer">
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="project/:id" element={<ProjectPage />} />
          <Route path="project/:id/members" element={<ProjectMembersPage />} />
          <Route path="project/:id/newdb" element={<NewDBPage />} />
          <Route path="db/:id" element={<DBPage />} />
          <Route path="settings/account" element={<AccountPage />} />
          <Route path="settings/general" element={<GeneralSettingsPage />} />
          <Route path="settings/advanced" element={<AdvancedSettingsPage />} />
          <Route path="settings/about" element={<AboutPage />} />
          <Route path="settings/support" element={<SupportPage />} />
          <Route path="settings/users" element={<UsersPage />} />
          <Route path="settings/users/add" element={<AddNewUserPage />} />
          <Route path="settings/roles" element={<ManageRolesPage />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

// Main App component with context provider
function App() {
  return (
    <DBConnectionsProvider>
      <AppContent />
    </DBConnectionsProvider>
  );
}

export default App;

function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">
          <i className={`fas fa-home`} /> Go back to home
        </Link>
      </p>
    </div>
  );
}

function NotSupportedPlatform() {
  return (
    <div className="appcontainer">
      <h2>Slashbase is desktop only application!</h2>
      <p>Please use a desktop or laptop to continue...</p>
    </div>
  );
}
