import { useState, useEffect } from "react";

const useBackendStatus = () => {
  const [status, setStatus] = useState({
    isOnline: false,
    endpoint: null,
    responseTime: null,
    lastCheck: null,
    error: null,
    isChecking: true,
  });

  const checkBackendHealth = async (baseUrl) => {
    const startTime = Date.now();
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000, // 5 seconds timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          isOnline: true,
          endpoint: baseUrl,
          responseTime,
          lastCheck: new Date().toISOString(),
          error: null,
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        isOnline: false,
        endpoint: baseUrl,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        error: error.message,
      };
    }
  };

  const testEndpoints = async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }));

    // Lista de endpoint-uri posibile
    const possibleEndpoints = [
      "http://localhost:5000",
      "http://localhost:5086",
      "http://localhost:7000",
      "http://localhost:7086",
      "https://localhost:5001",
      "https://localhost:7001",
    ];

    // Testez toate endpoint-urile în paralel
    const promises = possibleEndpoints.map((endpoint) =>
      checkBackendHealth(endpoint)
    );

    try {
      const results = await Promise.all(promises);

      // Găsesc primul endpoint care funcționează
      const workingEndpoint = results.find((result) => result.isOnline);

      if (workingEndpoint) {
        setStatus({
          ...workingEndpoint,
          isChecking: false,
        });
      } else {
        // Dacă niciun endpoint nu funcționează, folosesc primul cu cea mai mică latență
        const bestAttempt = results.reduce((best, current) =>
          current.responseTime < best.responseTime ? current : best
        );

        setStatus({
          ...bestAttempt,
          isChecking: false,
        });
      }
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isChecking: false,
        error: "Eroare la testarea endpoint-urilor: " + error.message,
      }));
    }
  };

  // Testez endpoint-urile la mount și apoi la fiecare 30 secunde
  useEffect(() => {
    testEndpoints();

    const interval = setInterval(() => {
      testEndpoints();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    refresh: testEndpoints,
  };
};

export default useBackendStatus;
