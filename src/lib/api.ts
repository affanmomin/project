import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type { CardsApiResponse, DateRangeParams } from "@/types";

// Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Environment variables (you can move these to .env file)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for Better Auth cookies
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Better Auth handles authentication via cookies automatically
    // No need to manually add Authorization header
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Redirect to login page
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: "Network Error. Please check your internet connection.",
      });
    }

    // Handle other errors
    return Promise.reject({
      status: error.response.status,
      message: error.response.data || "An unexpected error occurred",
      data: error.response.data,
    });
  }
);

// API methods
export const DASHBOARD_QUERIES = [
  "total-mentions",
  "negative-sentiment-percentage",
  "recurring-complaints",
  "alternatives-mentioned",
  "top-complaints",
  "top-alternatives",
  "recent-switching-leads",
  "complaint-trend",
] as const;

export const apiClient = {
  get: <T>(url: string, config = {}) =>
    api.get<T>(url, config).then((response) => response.data),

  post: <T>(url: string, data = {}, config = {}) =>
    api.post<T>(url, data, config).then((response) => response.data),

  put: <T>(url: string, data = {}, config = {}) =>
    api.put<T>(url, data, config).then((response) => response.data),

  delete: <T>(url: string, config = {}) =>
    api.delete<T>(url, config).then((response) => response.data),

  patch: <T>(url: string, data = {}, config = {}) =>
    api.patch<T>(url, data, config).then((response) => response.data),

  // Dashboard cards data
  getDashboardCards: (dateRange?: DateRangeParams) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: DASHBOARD_QUERIES,
      user_id: "4wCtOfZuvMHPmNVgIUMCDxL6BbE5sjIB",
      ...dateRange,
    });
  },

  // Competitors data
  getCompetitors: () => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["all-competitors"],
      user_id: "4wCtOfZuvMHPmNVgIUMCDxL6BbE5sjIB",
    });
  },

  // Leads data
  getLeads: () => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["all-leads"],
      user_id: "4wCtOfZuvMHPmNVgIUMCDxL6BbE5sjIB",
    });
  },

  addCompetitor: (name: string, userId?: string) => {
    return apiClient.post<{
      data: any; id: string; name: string 
}>("/api/competitors", {
      name,
      user_id: userId || "4wCtOfZuvMHPmNVgIUMCDxL6BbE5sjIB", // Fallback to default user_id
    });
  },

  removeCompetitor: (competitorId: string, userId?: string) => {
    return apiClient.delete<{ success: boolean }>(`/api/competitors/${competitorId}`, {
      data: {
        user_id: userId || "4wCtOfZuvMHPmNVgIUMCDxL6BbE5sjIB",
      }
    });
  }
};

export default api;
