// API utility functions
import { auth } from "./auth";

const API_BASE_URL = "http://localhost:5086/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = auth.getToken();
  console.log(
    "🔑 Token pentru API request:",
    token ? `${token.substring(0, 20)}...` : "LIPSEȘTE"
  );
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
};

// Projects API
export const projectsAPI = {
  // Get all projects
  getAll: () => apiRequest("/projects"),

  // Get project by ID
  getById: (id) => apiRequest(`/projects/${id}`),

  // Create new project
  create: (projectData) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    }),

  // Update project
  update: (id, projectData) =>
    apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(projectData),
    }),

  // Delete project
  delete: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
    }),

  // Search projects
  search: (query) =>
    apiRequest(`/projects?search=${encodeURIComponent(query)}`),
};

// Comments API
export const commentsAPI = {
  // Get comments for project
  getByProject: (projectId) => apiRequest(`/comments?projectId=${projectId}`),

  // Create comment
  create: (commentData) =>
    apiRequest("/comments", {
      method: "POST",
      body: JSON.stringify(commentData),
    }),
};

// File Attachments API
export const filesAPI = {
  // Get files for project
  getByProject: (projectId) =>
    apiRequest(`/fileattachments?projectId=${projectId}`),

  // Upload file
  upload: (projectId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);

    const token = auth.getToken();

    return apiRequest("/fileattachments", {
      method: "POST",
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: formData,
    });
  },
};

// Test backend connection
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`);
    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? "Connection successful" : "Connection failed",
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      message: error.message,
    };
  }
};

export default {
  projectsAPI,
  commentsAPI,
  filesAPI,
  testConnection,
};
