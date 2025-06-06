import { useState } from "react";
import { X, UserPlus, Mail, Send, Copy, Check } from "lucide-react";

const InviteCollaboratorsModal = ({ isOpen, onClose, onInviteSent }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  // Generate invite link (demo)
  const generateInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteId = Math.random().toString(36).substr(2, 9);
    return `${baseUrl}/invite/${inviteId}`;
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Simulate API call to send invite
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show success message
      setSuccess(`Invitația a fost trimisă cu succes la ${email}!`);

      // Generate and show invite link
      const link = generateInviteLink();
      setInviteLink(link);

      console.log("✅ Invitație trimisă către:", email);
      console.log("📧 Mesaj:", message);

      // Clear form
      setEmail("");
      setMessage("");

      onInviteSent?.({ email, message, inviteLink: link });
    } catch (error) {
      console.error("❌ Eroare la trimiterea invitației:", error);
      setError("Eroare la trimiterea invitației. Încearcă din nou.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Eroare la copierea link-ului:", error);
    }
  };

  const handleClose = () => {
    setEmail("");
    setMessage("");
    setError("");
    setSuccess("");
    setInviteLink("");
    setCopied(false);
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
          maxWidth: "500px",
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
            <UserPlus
              size={20}
              style={{ marginRight: "0.5rem", color: "var(--primary)" }}
            />
            Invită colaboratori
          </h2>
          <button
            onClick={handleClose}
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

        {/* Description */}
        <div
          style={{
            background: "var(--background)",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-light)",
              lineHeight: "1.5",
            }}
          >
            💡 <strong>Invită colaboratori</strong> pentru a lucra împreună la
            proiecte. Ei vor putea vizualiza proiectele publice și vor fi
            notificați despre actualizări.
          </p>
        </div>

        <form onSubmit={handleSendInvite}>
          {/* Success Message */}
          {success && (
            <div
              style={{
                background: "var(--success)",
                color: "white",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              ✅ {success}
            </div>
          )}

          {/* Error Message */}
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
              ❌ {error}
            </div>
          )}

          {/* Email Input */}
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
              <Mail size={16} style={{ marginRight: "0.5rem" }} />
              Email colaborator *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colaborator@example.com"
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

          {/* Message Input */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "var(--text)",
              }}
            >
              Mesaj personal (opțional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Salut! Te invit să colaborăm la proiectele mele..."
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

          {/* Invite Link */}
          {inviteLink && (
            <div
              style={{
                background: "var(--background)",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
                border: "1px solid var(--border)",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "var(--text)",
                }}
              >
                🔗 Link de invitație
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "stretch",
                }}
              >
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    fontSize: "0.9rem",
                    background: "var(--card)",
                    color: "var(--text-light)",
                  }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn btn-outline"
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copiat!" : "Copiază"}
                </button>
              </div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-light)",
                  marginTop: "0.5rem",
                  margin: "0.5rem 0 0 0",
                }}
              >
                Poți partaja acest link direct cu colaboratorii
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline"
              disabled={isLoading}
            >
              {inviteLink ? "Închide" : "Anulează"}
            </button>
            {!inviteLink && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !email.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      className="spinner"
                      style={{ width: "16px", height: "16px" }}
                    ></div>
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Trimite invitația
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Additional Info */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.8rem",
            color: "var(--text-light)",
          }}
        >
          <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
            ℹ️ Informații despre colaborare:
          </h4>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: "1.4" }}>
            <li>Colaboratorii pot vizualiza toate proiectele publice</li>
            <li>Pot adăuga comentarii și feedback</li>
            <li>Vor fi notificați despre actualizările proiectelor</li>
            <li>Nu pot modifica sau șterge proiecte (doar proprietarul)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InviteCollaboratorsModal;
