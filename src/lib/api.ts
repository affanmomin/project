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
  "top-complaints-short",
  "top-features-short",
  "top-alternatives-short",
  // "top-alternatives",
  // "top-complaints",
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
  getDashboardCards: (dateRange?: DateRangeParams,user_id?:string) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: DASHBOARD_QUERIES,
      user_id: user_id,
      ...dateRange,
    });
  },

  // Competitors data
  getCompetitors: (user_id?:string) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["all-competitors"],
      user_id: user_id ,
    });
  },

  // Leads data
  getLeads: (user_id?: string) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["all-leads"],
      user_id: user_id,
    });
  },

  // Features data
  getFeatures: (user_id?: string) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["top-features"],
      user_id: user_id,
    });
  },

  // Complaints data
  getComplaints: (user_id?: string) => {
    return apiClient.post<CardsApiResponse>("/cards", {
      queries: ["top-complaints"],
      user_id: user_id,
    });
  },

  addCompetitor: (name: string, userId?: string, platforms?: Array<{source_id: string, username: string}>) => {
    return apiClient.post<{
      data: any; id: string; name: string 
}>("/api/competitors", {
      name,
      user_id: userId,
      platforms: platforms || [],
    });
  },

  removeCompetitor: (competitorId: string, userId?: string) => {
    return apiClient.delete<{ success: boolean }>(`/api/competitors/${competitorId}`, {
      data: {
        user_id: userId,
      }
    });
  },
    getUserCompetitors: (userId?: string) => {
    return apiClient.get<{
      success: boolean;
      data: Array<{
        competitor_id: string;
        id: string;
        name: string;
        slug: string;
        created_at: string;
        user_id: string;
      }>;
      pagination: {
        limit: number;
        offset: number;
        count: number;
      };
    }>(`/api/competitors?user_id=${userId}`);
  },

  getSources: () => {
    return apiClient.get<{
      success: boolean;
      data: Array<{
        id: string;
        competitor_id: string;
        platform: string;
        enabled: boolean;
        last_scraped_at: string;
        created_at: string;
        competitor_name: string | null;
        user_id: string | null;
      }>;
    }>("/api/sources");
  },

  toggleSource: (sourceId: string, enabled: boolean, username?: string) => {
    return apiClient.patch<{
      success: boolean;
      data: {
        id: string;
        competitor_id: string;
        platform: string;
        enabled: boolean;
        last_scraped_at: string;
        created_at: string;
        competitor_name: string | null;
        user_id: string | null;
        username?: string;
      };
    }>(`/api/sources/${sourceId}/toggle`, {
      enabled,
      ...(username && { username }),
    });
  },

  getCompetitorSources: (competitorId: string) => {
    return apiClient.get<{
      success: boolean;
      data: Array<{
        id: string;
        platform: string;
        enabled: boolean;
        last_scraped_at: string;
        created_at: string;
        linked_at: string;
        link_updated_at: string;
      }>;
      competitor_id: string;
    }>(`/api/competitors/${competitorId}/sources`);
  },
};

export default api;
