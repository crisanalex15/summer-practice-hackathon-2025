import { useState, useEffect } from "react";
import {
  X,
  Eye,
  User,
  Calendar,
  Tag,
  MessageCircle,
  Paperclip,
  Code,
  FileText,
  Edit3,
  Save,
  Download,
  Send,
  Trash2,
} from "lucide-react";
import { projectsAPI, commentsAPI } from "../utils/api";
import { auth } from "../utils/auth";

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  const [fullProject, setFullProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    codeContent: "",
    tags: "",
    status: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Comment states
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  // User state
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // ChatGPT integration states
  const [chatGptResponse, setChatGptResponse] = useState("");
  const [isLoadingChatGpt, setIsLoadingChatGpt] = useState(false);
  const [chatGptError, setChatGptError] = useState("");
  const [showChatGptPanel, setShowChatGptPanel] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      fetchProjectDetails();
      const userData = auth.getUserData();
      setCurrentUser(userData);
    }
  }, [isOpen, project]);

  useEffect(() => {
    if (fullProject && currentUser) {
      const ownerCheck = fullProject.userId === currentUser.id;
      setIsOwner(ownerCheck);
      console.log("🔍 Owner check:", {
        projectUserId: fullProject.userId,
        currentUserId: currentUser.id,
        isOwner: ownerCheck,
      });
    }
  }, [fullProject, currentUser]);

  const fetchProjectDetails = async () => {
    if (!project?.id) return;

    setIsLoading(true);
    setError("");

    try {
      const projectDetails = await projectsAPI.getById(project.id);
      setFullProject(projectDetails);

      // Initialize edit data
      setEditData({
        title: projectDetails.title || "",
        description: projectDetails.description || "",
        codeContent: projectDetails.codeContent || "",
        tags: projectDetails.tags || "",
        status: projectDetails.status || 0,
      });
    } catch (error) {
      console.error("❌ Eroare la încărcarea detaliilor:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!fullProject?.id) return;

    setIsSaving(true);
    try {
      const updateData = {
        title: editData.title,
        description: editData.description,
        codeContent: editData.codeContent,
        tags: editData.tags,
        status: editData.status,
        access: fullProject.access,
        accessId: fullProject.accessId,
      };

      console.log("📤 Se trimite update pentru proiect:", updateData);

      const updatedProject = await projectsAPI.update(
        fullProject.id,
        updateData
      );

      setFullProject(updatedProject);
      setIsEditing(false);
      setError(""); // Clear any previous errors
      console.log("✅ Proiect actualizat cu succes:", updatedProject);
    } catch (error) {
      console.error("❌ Eroare la actualizarea proiectului:", error);
      setError("Nu s-au putut salva modificările: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCode = () => {
    // Use current edit data if editing, otherwise use saved project data
    const codeToDownload = isEditing
      ? editData.codeContent
      : fullProject?.codeContent;
    const titleToUse = isEditing ? editData.title : fullProject?.title;

    if (!codeToDownload) return;

    const blob = new Blob([codeToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titleToUse || "proiect"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("✅ Cod descărcat ca fișier TXT");
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !fullProject?.id) return;

    setIsAddingComment(true);
    try {
      const comment = await commentsAPI.create({
        content: newComment.trim(),
        projectId: fullProject.id,
      });

      // Add new comment to the project
      setFullProject((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), comment],
      }));

      setNewComment("");
      console.log("✅ Comentariu adăugat cu succes");
    } catch (error) {
      console.error("❌ Eroare la adăugarea comentariului:", error);
      setError("Nu s-a putut adăuga comentariul: " + error.message);
    } finally {
      setIsAddingComment(false);
    }
  };

  // ChatGPT integration functions
  const callChatGPT = async (prompt, codeContent) => {
    setIsLoadingChatGpt(true);
    setChatGptError("");
    setShowChatGptPanel(true);

    try {
      // Using OpenAI API
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "Ești un expert programator care ajută cu review-uri și fix-uri de cod. Răspunde în română.",
              },
              {
                role: "user",
                content: `${prompt}\n\nCod pentru analiză:\n\`\`\`\n${codeContent}\n\`\`\``,
              },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;

        if (response.status === 429) {
          errorMessage =
            "🚦 Prea multe cereri! Ai depășit limita de 3 requests/minut. Te rog să aștepți 1-2 minute și încearcă din nou.";
        } else if (response.status === 401) {
          errorMessage =
            "🔑 API Key invalid sau expirat. Verifică cheia în fișierul .env";
        } else if (response.status === 403) {
          errorMessage =
            "❌ Acces interzis. Verifică permisiunile API Key-ului.";
        } else if (response.status === 500) {
          errorMessage =
            "🔧 Eroare server OpenAI. Încearcă din nou în câteva minute.";
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const chatGptReply =
        data.choices[0]?.message?.content || "Nu am primit un răspuns valid.";
      setChatGptResponse(chatGptReply);
      console.log("✅ ChatGPT răspuns primit:", chatGptReply);
    } catch (error) {
      console.error("❌ Eroare ChatGPT:", error);
      setChatGptError(error.message);
    } finally {
      setIsLoadingChatGpt(false);
    }
  };

  const handleCodeReview = () => {
    const codeToReview = isEditing
      ? editData.codeContent
      : fullProject?.codeContent;
    if (!codeToReview || !codeToReview.trim()) {
      setError("Nu există cod pentru review!");
      return;
    }

    const prompt =
      "Te rog să faci un review detaliat al acestui cod. Identifică probleme potențiale, sugerează îmbunătățiri și oferă feedback constructiv despre calitatea codului, performanță, securitate și best practices.";
    callChatGPT(prompt, codeToReview);
  };

  const handleCodeFix = () => {
    const codeToFix = isEditing
      ? editData.codeContent
      : fullProject?.codeContent;
    if (!codeToFix || !codeToFix.trim()) {
      setError("Nu există cod pentru fix!");
      return;
    }

    const prompt =
      "Te rog să analizezi acest cod și să sugerezi fix-uri concrete pentru problemele găsite. Oferă o versiune îmbunătățită a codului cu explicații pentru modificările făcute.";
    callChatGPT(prompt, codeToFix);
  };

  const applyChatGptSuggestion = () => {
    if (!chatGptResponse) return;

    // Extract code blocks from ChatGPT response
    const codeBlockRegex = /```[\s\S]*?\n([\s\S]*?)```/g;
    const matches = [...chatGptResponse.matchAll(codeBlockRegex)];

    if (matches.length > 0) {
      // Use the first code block found
      const suggestedCode = matches[0][1].trim();
      setEditData({ ...editData, codeContent: suggestedCode });
      console.log("✅ Cod aplicat din sugestia ChatGPT");
    } else {
      setError(
        "Nu am găsit un bloc de cod în răspunsul ChatGPT pentru a-l aplica."
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      0: { text: "În Review", class: "badge-warning" },
      1: { text: "Aprobat", class: "badge-success" },
      2: { text: "Respins", class: "badge-error" },
    };

    const config = statusConfig[status] || {
      text: "Necunoscut",
      class: "badge-secondary",
    };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusOptions = () => [
    { value: 0, label: "În Review" },
    { value: 1, label: "Aprobat" },
    { value: 2, label: "Respins" },
  ];

  if (!isOpen || !project) return null;

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
        className="card modal-card"
        style={{
          width: "100%",
          maxWidth: "1000px",
          maxHeight: "90vh",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          margin: "0 0.5rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
            marginBottom: "1.5rem",
            flexShrink: 0,
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#333",
                    background: "white",
                    border: "1px solid var(--border)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    flex: 1,
                  }}
                />
              ) : (
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    color: "var(--primary)",
                  }}
                >
                  {fullProject?.title || project.title}
                </h2>
              )}

              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      status: parseInt(e.target.value),
                    })
                  }
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    padding: "0.75rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    marginRight: "1rem",
                  }}
                >
                  {getStatusOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                getStatusBadge(fullProject?.status || project.status)
              )}
            </div>

            {/* Author and Date */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.9rem",
                color: "var(--text-light)",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
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
                  gap: "0.25rem",
                }}
              >
                <Calendar size={14} />
                <span>{formatDate(project.createdAt)}</span>
              </div>
              {isOwner && (
                <span style={{ color: "var(--primary)", fontWeight: "500" }}>
                  • Proiectul tău
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              minWidth: "fit-content",
            }}
          >
            {isOwner && (
              <>
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="btn btn-primary"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Save size={14} style={{ marginRight: "0.3rem" }} />
                      {isSaving ? "Salvez..." : "Salvează"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        // Reset edit data
                        setEditData({
                          title: fullProject?.title || "",
                          description: fullProject?.description || "",
                          codeContent: fullProject?.codeContent || "",
                          tags: fullProject?.tags || "",
                          status: fullProject?.status || 0,
                        });
                      }}
                      className="btn btn-outline"
                      style={{
                        fontSize: "0.8rem",
                        padding: "0.4rem 0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Anulează
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-outline"
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.4rem 0.8rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Edit3 size={14} style={{ marginRight: "0.3rem" }} />
                    Editează
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-light)",
                cursor: "pointer",
                padding: "0.4rem",
                borderRadius: "4px",
                minWidth: "32px",
                minHeight: "32px",
              }}
              className="btn-ghost"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            marginBottom: "1.5rem",
            flexShrink: 0,
            overflowX: "auto",
            gap: "0.25rem",
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
            style={{
              padding: "0.6rem 0.8rem",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "overview"
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              color:
                activeTab === "overview"
                  ? "var(--primary)"
                  : "var(--text-light)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            <Eye size={14} style={{ marginRight: "0.3rem" }} />
            Prezentare
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`tab ${activeTab === "code" ? "tab-active" : ""}`}
            style={{
              padding: "0.6rem 0.8rem",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "code"
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              color:
                activeTab === "code" ? "var(--primary)" : "var(--text-light)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            <Code size={14} style={{ marginRight: "0.3rem" }} />
            Cod
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`tab ${activeTab === "comments" ? "tab-active" : ""}`}
            style={{
              padding: "0.6rem 0.8rem",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "comments"
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              color:
                activeTab === "comments"
                  ? "var(--primary)"
                  : "var(--text-light)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            <MessageCircle size={14} style={{ marginRight: "0.3rem" }} />
            Comentarii ({fullProject?.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`tab ${activeTab === "files" ? "tab-active" : ""}`}
            style={{
              padding: "0.6rem 0.8rem",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "files"
                  ? "2px solid var(--primary)"
                  : "2px solid transparent",
              color:
                activeTab === "files" ? "var(--primary)" : "var(--text-light)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              whiteSpace: "nowrap",
              minWidth: "fit-content",
            }}
          >
            <Paperclip size={14} style={{ marginRight: "0.3rem" }} />
            Fișiere ({fullProject?.fileAttachments?.length || 0})
          </button>
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
              <button
                onClick={() => setError("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  marginLeft: "1rem",
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
              <p>Se încarcă detaliile proiectului...</p>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div>
                  {/* Description */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>
                      📋 Descriere
                    </h4>
                    {isEditing ? (
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          padding: "0.75rem",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          background: "white",
                          color: "#333",
                          fontSize: "1rem",
                          lineHeight: "1.6",
                          resize: "vertical",
                        }}
                        placeholder="Introduceți descrierea proiectului..."
                      />
                    ) : (
                      <p
                        style={{
                          fontSize: "1rem",
                          lineHeight: "1.6",
                          color: "var(--text-light)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {fullProject?.description || project.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>
                      🏷️ Tags
                    </h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.tags}
                        onChange={(e) =>
                          setEditData({ ...editData, tags: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "var(--background)",
                          fontSize: "1rem",
                        }}
                        placeholder="Ex: React, JavaScript, Frontend (separate prin virgulă)"
                      />
                    ) : fullProject?.tags || project.tags ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {(fullProject?.tags || project.tags)
                          .split(",")
                          .filter((tag) => tag.trim())
                          .map((tag, index) => (
                            <span
                              key={index}
                              className="badge"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {tag.trim()}
                            </span>
                          ))}
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-light)" }}>
                        Nu sunt specificate tag-uri.
                      </p>
                    )}
                  </div>

                  {/* Statistics */}
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>
                      📊 Statistici
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div
                        className="card"
                        style={{
                          background: "var(--background)",
                          textAlign: "center",
                          padding: "1rem",
                        }}
                      >
                        <div
                          style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
                        >
                          {fullProject?.comments?.length ||
                            project.commentsCount ||
                            0}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-light)",
                          }}
                        >
                          Comentarii
                        </div>
                      </div>
                      <div
                        className="card"
                        style={{
                          background: "var(--background)",
                          textAlign: "center",
                          padding: "1rem",
                        }}
                      >
                        <div
                          style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}
                        >
                          {fullProject?.fileAttachments?.length ||
                            project.attachmentsCount ||
                            0}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-light)",
                          }}
                        >
                          Fișiere
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Tab */}
              {activeTab === "code" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <h4 style={{ margin: 0, color: "var(--text)" }}>
                      💻 Conținut cod
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {isEditing &&
                        isOwner &&
                        (fullProject?.codeContent || editData.codeContent) && (
                          <>
                            <button
                              onClick={handleCodeReview}
                              disabled={isLoadingChatGpt}
                              className="btn btn-secondary"
                              style={{
                                fontSize: "0.8rem",
                                padding: "0.4rem 0.8rem",
                                whiteSpace: "nowrap",
                                opacity: isLoadingChatGpt ? 0.6 : 1,
                              }}
                            >
                              🤖 Review
                            </button>
                            <button
                              onClick={handleCodeFix}
                              disabled={isLoadingChatGpt}
                              className="btn btn-accent"
                              style={{
                                fontSize: "0.8rem",
                                padding: "0.4rem 0.8rem",
                                whiteSpace: "nowrap",
                                opacity: isLoadingChatGpt ? 0.6 : 1,
                              }}
                            >
                              🔧 Fix
                            </button>
                          </>
                        )}
                      {(fullProject?.codeContent || editData.codeContent) && (
                        <button
                          onClick={handleDownloadCode}
                          className="btn btn-outline"
                          style={{
                            fontSize: "0.8rem",
                            padding: "0.4rem 0.8rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <Download
                            size={14}
                            style={{ marginRight: "0.3rem" }}
                          />
                          Descarcă TXT
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {isEditing ? (
                      <textarea
                        value={editData.codeContent}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            codeContent: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          minHeight: "400px",
                          padding: "1rem",
                          border: "none",
                          background: "white",
                          color: "#333",
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                          fontFamily: "monospace",
                          resize: "vertical",
                        }}
                        placeholder="Introduceți codul proiectului..."
                      />
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          padding: "1rem",
                          fontSize: "0.9rem",
                          lineHeight: "1.4",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          overflow: "auto",
                          maxHeight: "400px",
                        }}
                      >
                        {fullProject?.codeContent ||
                          "Nu există conținut de cod disponibil."}
                      </pre>
                    )}
                  </div>

                  {/* ChatGPT Response Panel */}
                  {showChatGptPanel && (
                    <div
                      style={{
                        marginTop: "1.5rem",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1rem",
                        }}
                      >
                        <h5 style={{ margin: 0, color: "var(--text)" }}>
                          🤖 ChatGPT Response
                        </h5>
                        <button
                          onClick={() => setShowChatGptPanel(false)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-light)",
                            cursor: "pointer",
                            padding: "0.25rem",
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {isLoadingChatGpt ? (
                        <div style={{ textAlign: "center", padding: "2rem" }}>
                          <div
                            className="spinner"
                            style={{ margin: "0 auto 1rem" }}
                          ></div>
                          <p style={{ color: "var(--text-light)" }}>
                            ChatGPT analizează codul...
                          </p>
                        </div>
                      ) : chatGptError ? (
                        <div
                          style={{
                            background: "var(--error)",
                            color: "white",
                            padding: "1rem",
                            borderRadius: "4px",
                            marginBottom: "1rem",
                          }}
                        >
                          <div style={{ marginBottom: "0.5rem" }}>
                            {chatGptError}
                          </div>
                          {chatGptError.includes("429") ||
                          chatGptError.includes("Rate limit") ? (
                            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                              💡 <strong>Soluții:</strong>
                              <br />• Așteaptă 1-2 minute între cereri
                              <br />• Tier-ul gratuit: 3 cereri/minut
                              <br />• Consideră upgrade la Pay-as-you-go pentru
                              mai multe cereri
                            </div>
                          ) : null}
                        </div>
                      ) : chatGptResponse ? (
                        <>
                          <div
                            style={{
                              background: "white",
                              border: "1px solid var(--border)",
                              borderRadius: "4px",
                              padding: "1rem",
                              marginBottom: "1rem",
                              maxHeight: "300px",
                              overflow: "auto",
                              whiteSpace: "pre-wrap",
                              fontSize: "0.9rem",
                              lineHeight: "1.5",
                            }}
                          >
                            {chatGptResponse}
                          </div>
                          {isEditing && chatGptResponse.includes("```") && (
                            <button
                              onClick={applyChatGptSuggestion}
                              className="btn btn-primary"
                              style={{
                                fontSize: "0.8rem",
                                padding: "0.4rem 0.8rem",
                              }}
                            >
                              ✨ Aplică Sugestia
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === "comments" && (
                <div>
                  <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>
                    💬 Comentarii
                  </h4>

                  {/* Add Comment Form - Show for non-owners or always show */}
                  {(!isOwner || isOwner) && currentUser && (
                    <div
                      style={{
                        marginBottom: "2rem",
                        padding: "1rem",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    >
                      <h5
                        style={{ marginBottom: "1rem", color: "var(--text)" }}
                      >
                        Adaugă un comentariu
                      </h5>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Scrie comentariul tău aici..."
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          padding: "0.75rem",
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                          background: "white",
                          color: "#333",
                          fontSize: "1rem",
                          lineHeight: "1.5",
                          resize: "vertical",
                          marginBottom: "1rem",
                        }}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isAddingComment}
                        className="btn btn-primary"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <Send size={16} style={{ marginRight: "0.5rem" }} />
                        {isAddingComment ? "Se adaugă..." : "Adaugă comentariu"}
                      </button>
                    </div>
                  )}

                  {/* Comments List */}
                  {fullProject?.comments && fullProject.comments.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {fullProject.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="card"
                          style={{
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.9rem",
                                color: "var(--text-light)",
                              }}
                            >
                              <User size={14} />
                              <span>
                                {comment.admin?.firstName}{" "}
                                {comment.admin?.lastName}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-light)",
                              }}
                            >
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              lineHeight: "1.5",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--text-light)",
                        background: "var(--background)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <MessageCircle
                        size={48}
                        style={{ marginBottom: "1rem", opacity: 0.5 }}
                      />
                      <p>Nu există comentarii pentru acest proiect.</p>
                      {!currentUser && (
                        <p style={{ fontSize: "0.9rem" }}>
                          Conectați-vă pentru a adăuga comentarii.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === "files" && (
                <div>
                  <h4 style={{ marginBottom: "1rem", color: "var(--text)" }}>
                    📎 Fișiere atașate
                  </h4>
                  {fullProject?.fileAttachments &&
                  fullProject.fileAttachments.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {fullProject.fileAttachments.map((file) => (
                        <div
                          key={file.id}
                          className="card"
                          style={{
                            background: "var(--background)",
                            border: "1px solid var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Paperclip size={16} />
                            <div>
                              <div style={{ fontWeight: "500" }}>
                                {file.fileName}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "var(--text-light)",
                                }}
                              >
                                {file.contentType} • Încărcat la{" "}
                                {formatDate(file.uploadedAt)}
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn btn-outline"
                            style={{
                              fontSize: "0.8rem",
                              padding: "0.25rem 0.5rem",
                            }}
                            onClick={() => {
                              if (file.fileUrl) {
                                window.open(file.fileUrl, "_blank");
                              }
                            }}
                          >
                            Descarcă
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--text-light)",
                        background: "var(--background)",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Paperclip
                        size={48}
                        style={{ marginBottom: "1rem", opacity: 0.5 }}
                      />
                      <p>Nu există fișiere atașate pentru acest proiect.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
