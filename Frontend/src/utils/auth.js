// 🔐 Sistema de autentificare cu management JWT
const AUTH_TOKEN_KEY = "authToken";
const USER_DATA_KEY = "userData";

// Opțiuni de stocare pentru token
export const StorageTypes = {
  LOCAL_STORAGE: "localStorage", // Persistent, vulnerabil la XSS
  SESSION_STORAGE: "sessionStorage", // Se șterge la închiderea tab-ului
  MEMORY: "memory", // Cel mai sigur, se pierde la refresh
};

// Stocare în memorie (cea mai sigură)
let memoryStorage = {
  token: null,
  userData: null,
};

class AuthManager {
  constructor(storageType = StorageTypes.SESSION_STORAGE) {
    this.storageType = storageType;
    this.apiUrl = "http://localhost:5086/api";
  }

  // 💾 Salvează token-ul
  saveToken(token, userData = null) {
    try {
      switch (this.storageType) {
        case StorageTypes.LOCAL_STORAGE:
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          if (userData)
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
          break;

        case StorageTypes.SESSION_STORAGE:
          sessionStorage.setItem(AUTH_TOKEN_KEY, token);
          if (userData)
            sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
          break;

        case StorageTypes.MEMORY:
          memoryStorage.token = token;
          memoryStorage.userData = userData;
          break;
      }

      console.log("✅ Token salvat cu succes");
      return true;
    } catch (error) {
      console.error("❌ Eroare la salvarea token-ului:", error);
      return false;
    }
  }

  // 📖 Citește token-ul
  getToken() {
    try {
      switch (this.storageType) {
        case StorageTypes.LOCAL_STORAGE:
          return localStorage.getItem(AUTH_TOKEN_KEY);

        case StorageTypes.SESSION_STORAGE:
          return sessionStorage.getItem(AUTH_TOKEN_KEY);

        case StorageTypes.MEMORY:
          return memoryStorage.token;

        default:
          return null;
      }
    } catch (error) {
      console.error("❌ Eroare la citirea token-ului:", error);
      return null;
    }
  }

  // 👤 Citește datele utilizatorului
  getUserData() {
    try {
      switch (this.storageType) {
        case StorageTypes.LOCAL_STORAGE:
          const localData = localStorage.getItem(USER_DATA_KEY);
          return localData ? JSON.parse(localData) : null;

        case StorageTypes.SESSION_STORAGE:
          const sessionData = sessionStorage.getItem(USER_DATA_KEY);
          return sessionData ? JSON.parse(sessionData) : null;

        case StorageTypes.MEMORY:
          return memoryStorage.userData;

        default:
          return null;
      }
    } catch (error) {
      console.error("❌ Eroare la citirea datelor utilizatorului:", error);
      return null;
    }
  }

  // 🗑️ Șterge toate datele de autentificare
  clearAuth() {
    try {
      switch (this.storageType) {
        case StorageTypes.LOCAL_STORAGE:
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_DATA_KEY);
          break;

        case StorageTypes.SESSION_STORAGE:
          sessionStorage.removeItem(AUTH_TOKEN_KEY);
          sessionStorage.removeItem(USER_DATA_KEY);
          break;

        case StorageTypes.MEMORY:
          memoryStorage.token = null;
          memoryStorage.userData = null;
          break;
      }

      console.log("✅ Date de autentificare șterse");
      return true;
    } catch (error) {
      console.error("❌ Eroare la ștergerea datelor:", error);
      return false;
    }
  }

  // ✅ Verifică dacă utilizatorul este autentificat
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Verifică dacă token-ul a expirat
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp < now) {
        console.log("⚠️ Token-ul a expirat");
        this.clearAuth();
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Token invalid:", error);
      this.clearAuth();
      return false;
    }
  }

  // 🔄 Schimbă tipul de stocare
  changeStorageType(newType) {
    const currentToken = this.getToken();
    const currentUserData = this.getUserData();

    // Șterge din storage-ul curent
    this.clearAuth();

    // Schimbă tipul
    this.storageType = newType;

    // Salvează în noul storage
    if (currentToken) {
      this.saveToken(currentToken, currentUserData);
    }
  }

  // 📊 Info despre storage
  getStorageInfo() {
    return {
      type: this.storageType,
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!this.getToken(),
      hasUserData: !!this.getUserData(),
      userData: this.getUserData(),
    };
  }

  // 🌐 HTTP Helper cu token automat
  async apiCall(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.apiUrl}${endpoint}`;

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Adaugă token-ul automat dacă există
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Dacă primim 401, token-ul probabil a expirat
      if (response.status === 401) {
        console.log("🔄 Token expirat, te deloghez...");
        this.clearAuth();
        // Poți să redirectezi către login aici
        window.location.href = "/login";
        return null;
      }

      return response;
    } catch (error) {
      console.error("❌ Eroare API:", error);
      throw error;
    }
  }

  // 🚪 Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Date de autentificare invalide");
      }

      const data = await response.json();

      // Salvează token-ul și datele utilizatorului
      this.saveToken(data.token, data.user);

      return {
        success: true,
        message: data.message,
        user: data.user,
      };
    } catch (error) {
      console.error("❌ Eroare la login:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 📝 Register
  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Eroare la înregistrare");
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
      };
    } catch (error) {
      console.error("❌ Eroare la register:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // 🚪 Logout
  logout() {
    this.clearAuth();
    console.log("👋 Delogat cu succes");
  }
}

// Export instanță default cu sessionStorage (recomandat pentru dezvoltare)
export const auth = new AuthManager(StorageTypes.SESSION_STORAGE);

// Export clasa pentru instanțe custom
export default AuthManager;
