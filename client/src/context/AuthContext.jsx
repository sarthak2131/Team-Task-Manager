import { createContext, useContext, useEffect, useState } from "react";

import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "team-task-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const response = await apiRequest("/auth/me", { token });
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        setToken("");
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    restoreSession();
  }, [token]);

  function saveSession(nextToken, nextUser) {
    localStorage.setItem(STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        initializing,
        saveSession,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
