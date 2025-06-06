import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { auth } from "../utils/auth";

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Șterge eroarea pentru câmpul curent
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email-ul este obligatoriu";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email invalid";
    }

    if (!formData.password) {
      newErrors.password = "Parola este obligatorie";
    } else if (formData.password.length < 6) {
      newErrors.password = "Parola trebuie să aibă minim 6 caractere";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await auth.login(formData.email, formData.password);

      if (result.success) {
        console.log("✅ Login reușit:", result.user);
        onSuccess(result.user);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "Eroare de conectare. Încearcă din nou." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div className="card-header text-center">
        <h2 className="card-title">Bine ai venit înapoi!</h2>
        <p className="card-description">
          Conectează-te pentru a-ți accesa proiectele
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div
            className="form-error"
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              padding: "0.75rem",
              marginBottom: "1rem",
              color: "#DC2626",
            }}
          >
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <Mail
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-input ${errors.email ? "error" : ""}`}
            placeholder="exemplu@email.com"
            disabled={isLoading}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            <Lock
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Parola
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Introdu parola"
              disabled={isLoading}
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-light)",
              }}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", marginBottom: "1rem" }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="spinner" />
              Se conectează...
            </>
          ) : (
            "Conectează-te"
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-light text-sm">
          Nu ai cont?{" "}
          <button
            type="button"
            onClick={switchToRegister}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "inherit",
            }}
          >
            Înregistrează-te aici
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
