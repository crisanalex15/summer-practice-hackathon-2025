// 🔧 Utilitar pentru testarea conexiunii cu backend-ul

export const testBackendConnection = async () => {
  const apiUrl = "http://localhost:5086";

  try {
    console.log("🔍 Testez conexiunea cu backend-ul...");

    // Test simplu pentru a verifica dacă backend-ul răspunde
    const response = await fetch(`${apiUrl}/api/Projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`📡 Status răspuns: ${response.status}`);

    if (response.ok) {
      console.log("✅ Backend-ul funcționează!");
      const data = await response.json();
      console.log("📊 Răspuns primit:", data);
      return { success: true, data };
    } else {
      console.log("⚠️ Backend-ul răspunde dar cu eroare");
      return { success: false, error: `Status: ${response.status}` };
    }
  } catch (error) {
    console.error("❌ Eroare de conexiune:", error);

    if (error.message.includes("Failed to fetch")) {
      console.log("🔧 Verifică:");
      console.log("1. Backend-ul rulează pe localhost:5086?");
      console.log("2. CORS este configurat corect?");
      console.log("3. Nu există firewall/antivirus care blochează?");
    }

    return { success: false, error: error.message };
  }
};

// Test rapid pentru debugging
export const quickConnectionTest = () => {
  console.log("🚀 Pornesc testul de conexiune...");
  testBackendConnection();
};

// Debug info
export const showDebugInfo = () => {
  console.log("🔧 Info de debug:");
  console.log("Frontend URL:", window.location.origin);
  console.log("Backend URL:", "http://localhost:5086");
  console.log("User Agent:", navigator.userAgent);
  console.log("Browser supports fetch:", typeof fetch !== "undefined");
};
