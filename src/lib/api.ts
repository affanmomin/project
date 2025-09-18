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
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or your auth store
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Handle token refresh or logout logic here
      localStorage.removeItem("token");
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
};

export default api;
