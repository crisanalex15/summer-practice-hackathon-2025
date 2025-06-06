import { useState } from "react";
import { X, Plus, Code, FileText, Tag, Lock, Globe, Key } from "lucide-react";
import { projectsAPI } from "../utils/api";

const NewProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    codeContent: "",
    tags: "",
    access: "public", // default public
    accessId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const newProject = await projectsAPI.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        codeContent: formData.codeContent.trim(),
        tags: formData.tags.trim(),
        access: formData.access,
        accessId: formData.accessId.trim(),
      });

      console.log("✅ Proiect creat cu succes:", newProject);

      // Reset form
      setFormData({
        title: "",
        description: "",
        codeContent: "",
        tags: "",
        access: "public",
        accessId: "",
      });

      onSuccess?.(newProject);
      onClose();
    } catch (error) {
      console.error("❌ Eroare la crearea proiectului:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
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
            <Plus
              size={20}
              style={{ marginRight: "0.5rem", color: "var(--primary)" }}
            />
            Proiect nou
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                background: "var(--error)",
                color: "white",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              <FileText size={16} style={{ marginRight: "0.5rem" }} />
              Titlul proiectului *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Introdu titlul proiectului..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "1rem",
                background: "var(--background)",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              <FileText size={16} style={{ marginRight: "0.5rem" }} />
              Descriere *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Descrie proiectul tău..."
              rows="3"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "1rem",
                background: "var(--background)",
                resize: "vertical",
                minHeight: "80px",
              }}
            />
          </div>

          {/* Code Content */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              <Code size={16} style={{ marginRight: "0.5rem" }} />
              Conținut cod *
            </label>
            <textarea
              name="codeContent"
              value={formData.codeContent}
              onChange={handleInputChange}
              required
              placeholder="// Adaugă codul tău aici..."
              rows="6"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "0.9rem",
                background: "var(--background)",
                resize: "vertical",
                minHeight: "120px",
                fontFamily: "monospace",
              }}
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              <Tag size={16} style={{ marginRight: "0.5rem" }} />
              Tags (opțional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="React, JavaScript, API, etc."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "1rem",
                background: "var(--background)",
              }}
            />
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-light)",
                marginTop: "0.25rem",
                margin: "0.25rem 0 0 0",
              }}
            >
              Separă tag-urile cu virgulă
            </p>
          </div>

          {/* Access Type */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              {formData.access === "public" ? (
                <Globe size={16} style={{ marginRight: "0.5rem" }} />
              ) : (
                <Lock size={16} style={{ marginRight: "0.5rem" }} />
              )}
              Tip de acces
            </label>
            <select
              name="access"
              value={formData.access}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "1rem",
                background: "var(--background)",
              }}
            >
              <option value="public">🌐 Public - vizibil pentru toți</option>
              <option value="private">🔒 Privat - acces cu cod</option>
            </select>
          </div>

          {/* Access ID (only show for private) */}
          {formData.access === "private" && (
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "var(--text)",
                }}
              >
                <Key size={16} style={{ marginRight: "0.5rem" }} />
                Cod de acces
              </label>
              <input
                type="text"
                name="accessId"
                value={formData.accessId}
                onChange={handleInputChange}
                placeholder="Introdu un cod de acces unic..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  fontSize: "1rem",
                  background: "var(--background)",
                  fontFamily: "monospace",
                }}
              />
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-light)",
                  marginTop: "0.25rem",
                  margin: "0.25rem 0 0 0",
                }}
              >
                Acest cod va fi necesar pentru accesarea proiectului
              </p>
            </div>
          )}

          <div style={{ marginBottom: "2rem" }}></div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              Anulează
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isLoading ||
                !formData.title.trim() ||
                !formData.description.trim() ||
                !formData.codeContent.trim()
              }
            >
              {isLoading ? "Se creează..." : "Creează proiect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
