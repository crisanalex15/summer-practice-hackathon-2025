import { useState, useEffect } from "react";
import {
  X,
  Search,
  Eye,
  Star,
  Calendar,
  User,
  Tag,
  MessageCircle,
  Paperclip,
} from "lucide-react";
import { projectsAPI } from "../utils/api";
import { auth } from "../utils/auth";

const ExploreProjectsModal = ({ isOpen, onClose, onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  // Available tags for filtering
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery, selectedTag]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError("");

    try {
      const fetchedProjects = await projectsAPI.getAll();

      // Obține ID-ul utilizatorului curent
      const currentUser = auth.getUserData();
      const currentUserId = currentUser?.id;

      console.log("🔍 DEBUG - Toate proiectele:", fetchedProjects);
      console.log("👤 DEBUG - Utilizator curent:", currentUser);
      console.log("🆔 DEBUG - ID utilizator curent:", currentUserId);
      console.log(
        "🔗 DEBUG - Primele 3 userId din proiecte:",
        fetchedProjects
          .slice(0, 3)
          .map((p) => ({ id: p.id, userId: p.userId, title: p.title }))
      );

      // Filtrează doar proiectele utilizatorului curent
      const userProjects = fetchedProjects.filter(
        (project) => project.userId === currentUserId
      );

      console.log(
        "✅ DEBUG - Proiecte filtrate pentru utilizator:",
        userProjects
      );

      setProjects(userProjects);

      // Extract unique tags doar din proiectele utilizatorului
      const allTags = userProjects
        .flatMap((project) =>
          project.tags ? project.tags.split(",").map((tag) => tag.trim()) : []
        )
        .filter((tag) => tag.length > 0);

      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);

      console.log(
        "✅ Proiectele utilizatorului încărcate:",
        userProjects.length
      );
      console.log("🏷️ Tag-uri unice găsite:", uniqueTags);
    } catch (error) {
      console.error("❌ Eroare la încărcarea proiectelor:", error);
      setError(`Eroare la încărcarea proiectelor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.tags?.toLowerCase().includes(query) ||
          project.user?.firstName?.toLowerCase().includes(query) ||
          project.user?.lastName?.toLowerCase().includes(query)
      );
    }

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((project) =>
        project.tags?.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    setFilteredProjects(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { text: "În Review", class: "badge-warning" }, // InReview
      1: { text: "Aprobat", class: "badge-success" }, // Approved
      2: { text: "Necesită Modificări", class: "badge-error" }, // NeedsChanges
    };

    const config = statusConfig[status] || {
      text: "Necunoscut",
      class: "badge-secondary",
    };
    return (
      <span className={`badge ${config.class}`} style={{ fontSize: "0.8rem" }}>
        {config.text}
      </span>
    );
  };

  const handleProjectView = (project) => {
    // Pentru proiectele proprii, nu cerem pin-ul
    // Setăm direct selectedProject în loc să trecem prin logica de pin
    console.log("📋 Proiect propriu selectat:", project);
    onProjectSelect?.(project, true); // true = skip pin check
    onClose();
  };

  if (!isOpen) return null;

  return (
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
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <Search
              size={20}
              style={{ marginRight: "0.5rem", color: "var(--primary)" }}
            />
            Proiectele mele
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-light)",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
            className="btn-ghost"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* Search Bar */}
          <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-light)",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută proiecte după nume, descriere, tags sau autor..."
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "0.9rem",
                background: "var(--background)",
              }}
            />
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              fontSize: "0.9rem",
              background: "var(--background)",
              minWidth: "150px",
            }}
          >
            <option value="all">🏷️ Toate tag-urile</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            marginRight: "-1rem",
            paddingRight: "1rem",
          }}
        >
          {error && (
            <div
              style={{
                background: "var(--error)",
                color: "white",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Se încarcă proiectele tale...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-light)",
              }}
            >
              {projects.length === 0 ? (
                <p>Nu ai încă niciun proiect. Creează primul tău proiect!</p>
              ) : (
                <p>
                  Nu s-au găsit proiecte care să corespundă criteriilor de
                  căutare.
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "1rem",
              }}
            >
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="card"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    ":hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "var(--shadow-lg)",
                    },
                  }}
                  onClick={() => handleProjectView(project)}
                >
                  {/* Project Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        color: "var(--primary)",
                        fontSize: "1.1rem",
                        lineHeight: "1.3",
                      }}
                    >
                      {project.title}
                    </h4>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Description */}
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
                            style={{ fontSize: "0.75rem" }}
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

                  {/* Access Info - Always show, default to public if not specified */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                      fontSize: "0.8rem",
                    }}
                  >
                    <span
                      className={`badge ${
                        (project.access || "public") === "public"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                      style={{ fontSize: "0.75rem" }}
                    >
                      {(project.access || "public") === "public"
                        ? "🌐 Public"
                        : "🔒 Privat"}
                    </span>
                    {project.accessId &&
                      (project.access || "public") === "private" && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-light)",
                            fontFamily: "monospace",
                          }}
                        >
                          ID: {project.accessId}
                        </span>
                      )}
                  </div>

                  {/* Author and Stats */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid var(--border)",
                      fontSize: "0.8rem",
                      color: "var(--text-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <User size={14} />
                      <span>
                        {project.user?.firstName} {project.user?.lastName}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <MessageCircle size={12} />
                        <span>{project.commentsCount || 0}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <Paperclip size={12} />
                        <span>{project.attachmentsCount || 0}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <Calendar size={12} />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        fontSize: "0.9rem",
                        padding: "0.5rem",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectView(project);
                      }}
                    >
                      <Eye size={16} style={{ marginRight: "0.5rem" }} />
                      Vezi detalii
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "var(--text-light)",
            flexShrink: 0,
          }}
        >
          {filteredProjects.length > 0 && (
            <p>
              Se afișează {filteredProjects.length} din {projects.length}{" "}
              proiectele tale
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreProjectsModal;
