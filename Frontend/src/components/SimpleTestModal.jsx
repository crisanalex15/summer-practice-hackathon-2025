import { X } from "lucide-react";

const SimpleTestModal = ({ isOpen, onClose }) => {
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
          maxWidth: "400px",
          position: "relative",
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
          <h2 style={{ margin: 0, color: "var(--primary)" }}>Test Modal</h2>
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
          >
            <X size={20} />
          </button>
        </div>

        <p>Acesta este un modal de test simplu!</p>

        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          Închide
        </button>
      </div>
    </div>
  );
};

export default SimpleTestModal;
