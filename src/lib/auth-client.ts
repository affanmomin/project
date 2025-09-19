import { apiClient } from "./api";

interface SessionData {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  token: string;
  expiresAt: string;
}

// Simple session storage for caching
let sessionCache: SessionData | null = null;
let isChecking = false;

// Custom auth client that works with your backend endpoints
export const authClient = {
  signIn: {
    email: async (data: { email: string; password: string }) => {
      const result = await apiClient.post("/api/signin", data);
      // Clear cache after successful login
      sessionCache = null;
      return result;
    }
  },
  signUp: {
    email: async (data: { email: string; password: string; name?: string }) => {
      const result = await apiClient.post("/api/signup", data);
      return result;
    }
  },
  signOut: async () => {
    const result = await apiClient.post("/api/signout");
    // Clear cache after logout
    sessionCache = null;
    return result;
  },
  getSession: async () => {
    // Return cached session if available
    if (sessionCache !== null) {
      return sessionCache;
    }
    
    // Prevent multiple simultaneous requests
    if (isChecking) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!isChecking) {
            resolve(sessionCache);
          } else {
            setTimeout(checkCache, 50);
          }
        };
        checkCache();
      });
    }
    
    try {
      isChecking = true;
      const session = await apiClient.get("/api/me") as SessionData;
      sessionCache = session;
      return session;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'status' in error && (error as any).status === 401) {
        sessionCache = null;
        return null;
      }
      throw error;
    } finally {
      isChecking = false;
    }
  }
};

// Stable useSession hook - only checks once per mount
import { useEffect, useState } from "react";

export function useSession() {
  const [data, setData] = useState<SessionData | null>(sessionCache);
  const [isPending, setIsPending] = useState(sessionCache === null);

  useEffect(() => {
    // Don't check if we already have cached data
    if (sessionCache !== null) {
      setData(sessionCache);
      setIsPending(false);
      return;
    }

    let mounted = true;
    
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (mounted) {
          setData(session as SessionData | null);
          setIsPending(false);
        }
      } catch (error: unknown) {
        if (mounted) {
          setData(null);
          setIsPending(false);
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
    };
  }, []); // CRITICAL: Empty dependency array

  // Function to manually refresh session (for after login/logout)
  const refreshSession = () => {
    sessionCache = null;
    setIsPending(true);
    authClient.getSession().then((session) => {
      setData(session as SessionData | null);
      setIsPending(false);
    }).catch(() => {
      setData(null);
      setIsPending(false);
    });
  };

  return { data, isPending, refreshSession };
}

export const getSession = authClient.getSession;
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;