import { ReactNode, createContext, useContext, useEffect, useMemo, useReducer } from "react";

import { User } from "@/features/auth/schema";
import { toast } from "sonner";

import HttpClient from "@/lib/HttpClient";

import LoadingOverlay from "@/components/LoadingOverlay";

type State = {
  isAuthenticating: boolean;
  isAppLoading: boolean;
  user: User | null;
  sidebarOpen: boolean;
};

type Actions = {
  setIsAppLoading: (value: boolean) => void;
  setSidebarOpen: (value: boolean) => void;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

export const AppContext = createContext<[State, Actions]>([
  {
    isAuthenticating: true,
    isAppLoading: false,
    user: null,
    sidebarOpen: false,
  },
  {
    setIsAppLoading: () => {},
    setSidebarOpen: () => {},
    login: async () => {
      console.warn("login function not implemented");
      return false;
    },
    logout: () => {
      console.warn("logout function not implemented");
    },
  },
]);
AppContext.displayName = "AppContext";

interface AppProviderProps {
  children: ReactNode;
}

function reducer(state: State, { type, payload }: { type: string; payload: any }) {
  return {
    ...state,
    [type]: payload,
  };
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
    isAuthenticating: true,
    isAppLoading: false,
    user: null,
    sidebarOpen: true,
  });

  const setIsAppLoading = (value: boolean) => {
    dispatch({ type: "isAppLoading", payload: value });
  };

  const setSidebarOpen = (value: boolean) => {
    dispatch({ type: "sidebarOpen", payload: value });
  };

  const login = async (email: string, password: string) => {
    return HttpClient.Post("/api/v1/auth/login", { email, password })
      .then((response) => {
        HttpClient.setToken(response.access_token);
        localStorage.setItem("access_token", response.access_token);
        dispatch({
          type: "user",
          payload: response.user,
        });
        toast.success("Login successful!");
        return true;
      })
      .catch((error) => {
        console.error("Login failed:", error);
        toast.error("Login failed. Please check your credentials.");
        return false;
      });
  };

  const logout = () => {
    HttpClient.setToken("");
    localStorage.removeItem("access_token");
    dispatch({
      type: "user",
      payload: null,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      HttpClient.setToken(token);
      HttpClient.Get("/api/v1/auth/me")
        .then((response) => {
          dispatch({
            type: "user",
            payload: response,
          });
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          toast.error("Session expired. Please log in again.");
        })
        .finally(() => {
          dispatch({ type: "isAuthenticating", payload: false });
        });
    } else {
      dispatch({ type: "isAuthenticating", payload: false });
    }
  }, []);

  const value = useMemo((): [State, Actions] => {
    return [
      state as State,
      {
        setIsAppLoading,
        setSidebarOpen,
        login,
        logout,
      },
    ];
  }, [state]);

  return (
    <AppContext.Provider value={value}>
      {children}
      <LoadingOverlay isLoading={state.isAppLoading} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext<[State, Actions]>(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
