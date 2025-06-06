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

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState("login"); // 'login' sau 'register'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setStorageInfo(auth.getStorageInfo());
  }, []);

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
            <button className="btn btn-primary" style={{ minWidth: "160px" }}>
              ➕ Proiect nou
            </button>
            <button className="btn btn-secondary" style={{ minWidth: "160px" }}>
              📁 Explorează proiecte
            </button>
            <button className="btn btn-accent" style={{ minWidth: "160px" }}>
              👥 Invită colaboratori
            </button>
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
