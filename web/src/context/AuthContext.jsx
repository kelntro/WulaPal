import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = (redirect) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    if (redirect) {
      redirect("/login", { replace: true }); // ✅ Use navigate passed as argument
    }
  };  
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;
    
        if (Date.now() < exp) {
          setUser(JSON.parse(storedUser)); // ✅ Valid session
        } else {
          logout(); // ✅ Expired token
        }
      } catch (err) {
        logout(); // ✅ Invalid token
      }
    } else {
      setUser(null); // ✅ No session found — mark as not logged in
    }
    

    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const exp = payload.exp * 1000;
          if (Date.now() >= exp) {
            logout();
          }
        } catch {
          logout();
        }
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
