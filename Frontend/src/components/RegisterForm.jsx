import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Check } from "lucide-react";
import { auth } from "../utils/auth";

const RegisterForm = ({ onSuccess, switchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Prenumele este obligatoriu";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Prenumele trebuie să aibă minim 2 caractere";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Numele este obligatoriu";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Numele trebuie să aibă minim 2 caractere";
    }

    if (!formData.email) {
      newErrors.email = "Email-ul este obligatoriu";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email invalid";
    }

    if (!formData.password) {
      newErrors.password = "Parola este obligatorie";
    } else if (formData.password.length < 6) {
      newErrors.password = "Parola trebuie să aibă minim 6 caractere";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Parola trebuie să conțină cel puțin o literă mare, o literă mică și o cifră";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmarea parolei este obligatorie";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Parolele nu coincid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await auth.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });

      if (result.success) {
        console.log("✅ Înregistrare reușită");
        onSuccess();
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: "Eroare de înregistrare. Încearcă din nou." });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, label: "", color: "" };

    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Foarte slabă", color: "#E74C3C" },
      { strength: 2, label: "Slabă", color: "#F39C12" },
      { strength: 3, label: "Medie", color: "#F1C40F" },
      { strength: 4, label: "Bună", color: "#27AE60" },
      { strength: 5, label: "Foarte bună", color: "#00B894" },
    ];

    return levels[score];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="card" style={{ maxWidth: "450px", margin: "0 auto" }}>
      <div className="card-header text-center">
        <h2 className="card-title">Creează cont nou</h2>
        <p className="card-description">
          Înregistrează-te pentru a începe să lucrezi cu proiecte
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

        <div style={{ display: "flex", gap: "1rem" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="firstName" className="form-label">
              <User
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              Prenume
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`form-input ${errors.firstName ? "error" : ""}`}
              placeholder="Ion"
              disabled={isLoading}
            />
            {errors.firstName && (
              <div className="form-error">{errors.firstName}</div>
            )}
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="lastName" className="form-label">
              Nume
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`form-input ${errors.lastName ? "error" : ""}`}
              placeholder="Popescu"
              disabled={isLoading}
            />
            {errors.lastName && (
              <div className="form-error">{errors.lastName}</div>
            )}
          </div>
        </div>

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
              placeholder="Parola sigură"
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

          {formData.password && (
            <div
              style={{
                marginTop: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: "#E0E0E0",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(passwordStrength.strength / 5) * 100}%`,
                    background: passwordStrength.color,
                    transition: "all 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: passwordStrength.color,
                  fontWeight: "500",
                }}
              >
                {passwordStrength.label}
              </span>
            </div>
          )}

          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            <Check
              size={16}
              style={{ display: "inline", marginRight: "0.5rem" }}
            />
            Confirmă parola
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Repetă parola"
              disabled={isLoading}
              style={{ paddingRight: "3rem" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="form-error">{errors.confirmPassword}</div>
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
              Se înregistrează...
            </>
          ) : (
            "Creează contul"
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-light text-sm">
          Ai deja cont?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "inherit",
            }}
          >
            Conectează-te aici
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
