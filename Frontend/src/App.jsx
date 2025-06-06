import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Code2, LogOut, User, Settings, Menu, X, Wifi } from "lucide-react";
import { auth } from "./utils/auth";
import { testBackendConnection, showDebugInfo } from "./utils/test-connection";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import NewProjectModal from "./components/NewProjectModal";
import ExploreProjectsModal from "./components/ExploreProjectsModal";
import InviteCollaboratorsModal from "./components/InviteCollaboratorsModal";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import { projectsAPI } from "./utils/api";
// import SimpleTestModal from "./components/SimpleTestModal";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState("login"); // 'login' sau 'register'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Functionality will be added later

  // Verifică autentificarea la încărcarea aplicației
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      if (auth.isAuthenticated()) {
        const userData = auth.getUserData();
        setCurrentUser(userData);
        console.log("✅ Utilizator autentificat:", userData);
      } else {
        setCurrentUser(null);
        console.log("❌ Utilizator neautentificat");
      }
    } catch (error) {
      console.error("Eroare la verificarea autentificării:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    console.log("🎉 Login reușit, utilizator setat:", user);
  };

  const handleRegisterSuccess = () => {
    setAuthView("login");
    // Afișează un mesaj de succes
    console.log("✅ Înregistrare reușită! Te poți conecta acum.");
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    console.log("👋 Delogat cu succes");
  };

  // Button handlers moved to Dashboard component

  // Loading screen
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner"
            style={{ width: "40px", height: "40px", marginBottom: "1rem" }}
          ></div>
          <p className="text-light">Se încarcă aplicația...</p>
        </div>
      </div>
    );
  }

  // Authentication views
  if (!currentUser) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
          padding: "1rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "500px" }}>
          {authView === "login" ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              switchToRegister={() => setAuthView("register")}
            />
          ) : (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              switchToLogin={() => setAuthView("login")}
            />
          )}

          {/* Debug Panel */}
          {/* <div
            className="card"
            style={{ marginTop: "1rem", textAlign: "center" }}
          >
            <h4 style={{ marginBottom: "1rem", color: "var(--primary)" }}>
              🔧 Debug Tools
            </h4>
            <div
              className="flex gap-2"
              style={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              <button
                className="btn btn-ghost text-xs"
                onClick={() => testBackendConnection()}
                style={{ padding: "0.5rem" }}
              >
                <Wifi size={14} />
                Test conexiune
              </button>
              <button
                className="btn btn-ghost text-xs"
                onClick={() => showDebugInfo()}
                style={{ padding: "0.5rem" }}
              >
                Debug info
              </button>
              <button
                className="btn btn-ghost text-xs"
                onClick={() =>
                  window.open("http://localhost:5086/swagger", "_blank")
                }
                style={{ padding: "0.5rem" }}
              >
                Open Swagger
              </button>
            </div>
            <p className="text-xs text-muted" style={{ marginTop: "0.5rem" }}>
              Deschide Console (F12) pentru a vedea rezultatele
            </p>
          </div>*/}
        </div>
      </div>
    );
  }

  // Main application
  return (
    <Router>
      <div
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Navigation Header */}
        <header
          style={{
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <nav
            className="container flex justify-between items-center"
            style={{ padding: "1rem" }}
          >
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Code2 size={32} style={{ color: "var(--primary)" }} />
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, var(--primary), var(--secondary))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: 0,
                }}
              >
                TechHub
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div
              className="flex items-center gap-4"
              style={{ display: window.innerWidth >= 768 ? "flex" : "none" }}
            >
              <div className="flex items-center gap-2">
                <User size={16} style={{ color: "var(--text-light)" }} />
                <span className="text-sm">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
              </div>

              <button className="btn btn-ghost" style={{ padding: "0.5rem" }}>
                <Settings size={16} />
              </button>

              <button
                className="btn btn-outline"
                onClick={handleLogout}
                style={{ padding: "0.5rem 1rem" }}
              >
                <LogOut size={16} />
                Delogare
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="btn btn-ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                display: window.innerWidth < 768 ? "block" : "none",
                padding: "0.5rem",
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div
              style={{
                background: "var(--card)",
                borderTop: "1px solid var(--border)",
                padding: "1rem",
                display: window.innerWidth < 768 ? "block" : "none",
              }}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <User size={16} style={{ color: "var(--text-light)" }} />
                  <span className="text-sm">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </span>
                </div>

                <button
                  className="btn btn-ghost"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Settings size={16} />
                  Setări
                </button>

                <button
                  className="btn btn-outline"
                  onClick={handleLogout}
                  style={{ justifyContent: "flex-start" }}
                >
                  <LogOut size={16} />
                  Delogare
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "2rem 0" }}>
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer
          style={{
            background: "var(--card)",
            borderTop: "1px solid var(--border)",
            padding: "1.5rem 0",
            textAlign: "center",
          }}
        >
          <div className="container">
            <p className="text-muted text-sm">
              © 2025 TechHub - Modern Project Management Platform
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// Componentă Dashboard temporară
const Dashboard = () => {
  const [storageInfo, setStorageInfo] = useState(null);

  // Modal states
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isExploreProjectsModalOpen, setIsExploreProjectsModalOpen] =
    useState(false);
  const [isInviteCollaboratorsModalOpen, setIsInviteCollaboratorsModalOpen] =
    useState(false);
  const [isProjectDetailsModalOpen, setIsProjectDetailsModalOpen] =
    useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Public projects states
  const [publicProjects, setPublicProjects] = useState([]);
  const [filteredPublicProjects, setFilteredPublicProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [selectedTag, setSelectedTag] = useState("all");

  // Private project access states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingPrivateProject, setPendingPrivateProject] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    setStorageInfo(auth.getStorageInfo());
    fetchPublicProjects(); // Încarcă proiectele publice la start
  }, []);

  useEffect(() => {
    filterPublicProjects();
  }, [publicProjects, searchQuery, selectedTag]);

  // Handler functions for action buttons
  const handleNewProject = () => {
    console.log("🎉 Deschidere modal 'Proiect nou'");
    setIsNewProjectModalOpen(true);
  };

  const handleExploreProjects = () => {
    console.log("🔍 Deschidere modal 'Explorează proiecte'");
    setIsExploreProjectsModalOpen(true);
  };

  const handleInviteCollaborators = () => {
    console.log("👥 Deschidere modal 'Invită colaboratori'");
    setIsInviteCollaboratorsModalOpen(true);
  };

  // Project selection handler
  const handleProjectSelect = (project, skipPinCheck = false) => {
    console.log("📋 Proiect selectat:", project);

    // Dacă skipPinCheck este true (proiect propriu), deschide direct
    if (skipPinCheck) {
      console.log("✅ Proiect propriu - se deschide direct");
      setSelectedProject(project);
      setIsProjectDetailsModalOpen(true);
      return;
    }

    // Verifică dacă proiectul este privat
    if (project.access === "private") {
      console.log("🔒 Proiect privat detectat, se cere pin-ul");
      setPendingPrivateProject(project);
      setPinInput("");
      setPinError("");
      setIsPinModalOpen(true);
    } else {
      // Proiect public - deschide direct
      setSelectedProject(project);
      setIsProjectDetailsModalOpen(true);
    }
  };

  // Validare pin pentru proiect privat
  const handlePinSubmit = () => {
    if (!pendingPrivateProject) return;

    const enteredPin = pinInput.trim();
    const requiredPin = pendingPrivateProject.accessId;

    if (enteredPin === requiredPin) {
      console.log("✅ Pin corect - se deschide proiectul privat");
      setSelectedProject(pendingPrivateProject);
      setIsProjectDetailsModalOpen(true);
      setIsPinModalOpen(false);
      setPendingPrivateProject(null);
      setPinInput("");
      setPinError("");
    } else {
      console.log("❌ Pin incorect");
      setPinError("Pin incorect! Te rog să încerci din nou.");
    }
  };

  // Anulare acces proiect privat
  const handlePinCancel = () => {
    setIsPinModalOpen(false);
    setPendingPrivateProject(null);
    setPinInput("");
    setPinError("");
  };

  // Fetch all projects for searching
  const fetchPublicProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const allProjects = await projectsAPI.getAll();
      setPublicProjects(allProjects);
      console.log("✅ Toate proiectele încărcate:", allProjects);
    } catch (error) {
      console.error("❌ Eroare la încărcarea proiectelor:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Filter projects with special logic for private ones
  const filterPublicProjects = () => {
    let filtered = [...publicProjects];

    // Filtrare inițială: afișează doar proiectele publice by default
    if (!searchQuery.trim()) {
      // Dacă nu e căutare, afișează doar proiectele publice
      filtered = filtered.filter((project) => project.access !== "private");
    } else {
      // Dacă există căutare, aplicăm logica specială
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((project) => {
        // Pentru proiectele publice, căutare normală
        if (project.access !== "private") {
          return (
            project.title?.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.tags?.toLowerCase().includes(query) ||
            project.user?.firstName?.toLowerCase().includes(query) ||
            project.user?.lastName?.toLowerCase().includes(query)
          );
        }
        // Pentru proiectele private, doar dacă numele coincide EXACT
        else {
          return project.title?.toLowerCase() === query;
        }
      });
    }

    // Filter by tag (se aplică și proiectelor private găsite)
    if (selectedTag !== "all") {
      filtered = filtered.filter((project) =>
        project.tags?.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    setFilteredPublicProjects(filtered);
  };

  // Get unique tags from public projects
  const getAvailableTags = () => {
    const allTags = publicProjects
      .flatMap((project) =>
        project.tags ? project.tags.split(",").map((tag) => tag.trim()) : []
      )
      .filter((tag) => tag.length > 0);
    return [...new Set(allTags)];
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
          Bine ai venit!
        </h1>
        <p
          className="text-light"
          style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
        >
          Gestionează-ți proiectele cu ușurință și colaborează eficient
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Status Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            width: "100%",
            justifyItems: "center",
          }}
        >
          <div
            className="card"
            style={{ textAlign: "center", width: "100%", maxWidth: "300px" }}
          >
            <h3
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
                fontSize: "1.3rem",
              }}
            >
              🔐 Autentificare
            </h3>
            <div className="text-sm text-light" style={{ lineHeight: "1.8" }}>
              <div>
                Status: <span className="badge badge-success">Conectat</span>
              </div>
              <div>
                Storage: <strong>{storageInfo?.type}</strong>
              </div>
              <div style={{ wordBreak: "break-all" }}>
                Email: <strong>{storageInfo?.userData?.email}</strong>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ textAlign: "center", width: "100%", maxWidth: "300px" }}
          >
            <h3
              style={{
                color: "var(--secondary)",
                marginBottom: "1rem",
                fontSize: "1.3rem",
              }}
            >
              📊 Proiecte
            </h3>
            <div className="text-sm text-light" style={{ lineHeight: "1.8" }}>
              <div>
                Active: <strong>0</strong>
              </div>
              <div>
                În review: <strong>0</strong>
              </div>
              <div>
                Finalizate: <strong>0</strong>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ textAlign: "center", width: "100%", maxWidth: "300px" }}
          >
            <h3
              style={{
                color: "var(--accent)",
                marginBottom: "1rem",
                fontSize: "1.3rem",
              }}
            >
              🚀 Backend API
            </h3>
            <div className="text-sm text-light" style={{ lineHeight: "1.8" }}>
              <div>
                Status: <span className="badge badge-success">Online</span>
              </div>
              <div>
                Endpoint: <strong>localhost:5086</strong>
              </div>
              <div>
                JWT: <strong>Activ</strong>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="card" style={{ width: "100%", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>
            ⚡ Acțiuni rapide
          </h3>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary"
              style={{ minWidth: "160px" }}
              onClick={handleNewProject}
            >
              ➕ Proiect nou
            </button>
            <button
              className="btn btn-secondary"
              style={{ minWidth: "160px" }}
              onClick={handleExploreProjects}
            >
              📁 Explorează proiecte
            </button>
          </div>
        </div>

        {/* Public Projects Search */}
        <div className="card" style={{ width: "100%", textAlign: "center" }}>
          <h3 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>
            🔍 Proiecte publice disponibile
          </h3>

          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută proiecte după nume, tags sau descriere..."
              style={{
                flex: "1",
                maxWidth: "400px",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "1rem",
                background: "var(--background)",
              }}
            />
            <button
              className="btn btn-primary"
              style={{ minWidth: "120px" }}
              onClick={fetchPublicProjects}
              disabled={isLoadingProjects}
            >
              {isLoadingProjects ? "🔄 Se încarcă..." : "🔄 Reîncarcă"}
            </button>
          </div>

          {/* Filter Options */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              className={`btn ${
                selectedTag === "all" ? "btn-primary" : "btn-outline"
              }`}
              style={{ fontSize: "0.9rem" }}
              onClick={() => setSelectedTag("all")}
            >
              🏷️ Toate
            </button>
            {getAvailableTags()
              .slice(0, 6)
              .map((tag) => (
                <button
                  key={tag}
                  className={`btn ${
                    selectedTag === tag ? "btn-primary" : "btn-outline"
                  }`}
                  style={{ fontSize: "0.9rem" }}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </button>
              ))}
          </div>

          {/* Results Section */}
          <div style={{ textAlign: "left" }}>
            <h4 style={{ marginBottom: "1rem", color: "var(--text-light)" }}>
              📋 {filteredPublicProjects.length} proiecte găsite
            </h4>

            {isLoadingProjects ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div
                  className="spinner"
                  style={{ margin: "0 auto 1rem" }}
                ></div>
                <p>Se încarcă proiectele publice...</p>
              </div>
            ) : filteredPublicProjects.length === 0 ? (
              <div
                className="card"
                style={{
                  textAlign: "center",
                  background: "var(--background)",
                  border: "2px dashed var(--border)",
                }}
              >
                <div style={{ padding: "2rem" }}>
                  <h5
                    style={{
                      color: "var(--text-light)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {publicProjects.length === 0
                      ? "📭 Nu există proiecte publice"
                      : "🔍 Nu s-au găsit rezultate"}
                  </h5>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                    {publicProjects.length === 0
                      ? "Încă nu există proiecte publice în platformă. Creează primul proiect public!"
                      : "Încearcă să modifici termenii de căutare sau să selectezi alt tag."}
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filteredPublicProjects.map((project) => (
                  <div
                    key={project.id}
                    className="card"
                    style={{
                      textAlign: "left",
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h5 style={{ margin: 0, color: "var(--primary)" }}>
                        {project.title}
                      </h5>
                      <span
                        className={`badge ${
                          project.access === "private"
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {project.access === "private"
                          ? "🔒 Privat"
                          : "🌐 Public"}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-light)",
                        marginBottom: "1rem",
                        lineHeight: "1.4",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {project.description}
                    </p>

                    {/* Tags */}
                    {project.tags && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {project.tags
                          .split(",")
                          .slice(0, 3)
                          .map((tag, index) => (
                            <span
                              key={index}
                              className="badge"
                              style={{ fontSize: "0.8rem" }}
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        {project.tags.split(",").length > 3 && (
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-light)",
                            }}
                          >
                            +{project.tags.split(",").length - 3} mai multe
                          </span>
                        )}
                      </div>
                    )}

                    {/* Author and Date */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.8rem",
                        color: "var(--text-light)",
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        👤 {project.user?.firstName} {project.user?.lastName}
                      </div>
                      <div>📅 {formatDate(project.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demo Info
        <div
          className="card"
          style={{
            background: "linear-gradient(135deg, #F0F9FF, #F0FDF4)",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "var(--primary)",
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
            }}
          >
            🎨 Modern Tech Design System
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              justifyItems: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <div>
              <div
                style={{
                  width: "100%",
                  height: "30px",
                  background: "var(--primary)",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div className="text-xs">Primary - #2F80ED</div>
            </div>
            <div>
              <div
                style={{
                  width: "100%",
                  height: "30px",
                  background: "var(--secondary)",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div className="text-xs">Secondary - #6C5CE7</div>
            </div>
            <div>
              <div
                style={{
                  width: "100%",
                  height: "30px",
                  background: "var(--accent)",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div className="text-xs">Accent - #00B894</div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Modaluri */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />

      <ExploreProjectsModal
        isOpen={isExploreProjectsModalOpen}
        onClose={() => setIsExploreProjectsModalOpen(false)}
        onProjectSelect={handleProjectSelect}
      />

      <InviteCollaboratorsModal
        isOpen={isInviteCollaboratorsModalOpen}
        onClose={() => setIsInviteCollaboratorsModalOpen(false)}
      />

      <ProjectDetailsModal
        isOpen={isProjectDetailsModalOpen}
        onClose={() => setIsProjectDetailsModalOpen(false)}
        project={selectedProject}
      />

      {/* Pin Modal for Private Projects */}
      {isPinModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "400px",
              position: "relative",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>🔒 Proiect privat</h3>
            <p style={{ marginBottom: "1rem" }}>
              Proiectul <strong>"{pendingPrivateProject?.title}"</strong> este
              privat.
            </p>

            {pinError && (
              <div style={{ color: "red", marginBottom: "1rem" }}>
                {pinError}
              </div>
            )}

            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Introdu AccessID..."
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "1rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handlePinSubmit();
                }
              }}
            />

            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={handlePinCancel} className="btn btn-outline">
                Anulează
              </button>
              <button onClick={handlePinSubmit} className="btn btn-primary">
                Deschide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente temporare pentru rute
const ProjectsPage = () => (
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1rem",
      textAlign: "center",
    }}
  >
    <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
      Proiectele mele
    </h1>
    <p
      className="text-light"
      style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
    >
      Această secțiune va afișa toate proiectele tale.
    </p>
    <div className="card" style={{ marginTop: "3rem", textAlign: "center" }}>
      <h3 style={{ marginBottom: "1rem" }}>🚧 În dezvoltare</h3>
      <p className="text-light">
        Funcționalitatea de gestionare proiecte va fi disponibilă în curând!
      </p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div
    style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 1rem",
      textAlign: "center",
    }}
  >
    <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Profilul meu</h1>
    <p
      className="text-light"
      style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
    >
      Gestionează setările contului tău aici.
    </p>
    <div className="card" style={{ marginTop: "3rem", textAlign: "center" }}>
      <h3 style={{ marginBottom: "1rem" }}>⚙️ Setări cont</h3>
      <p className="text-light">
        Funcționalitatea de management profil va fi disponibilă în curând!
      </p>
    </div>
  </div>
);

export default App;
