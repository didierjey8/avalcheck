import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [phoneUser, setPhoneUser] = useState(localStorage.getItem("phone_user"));
  
  return (
    <AuthContext.Provider value={{ token, setToken, phoneUser, setPhoneUser }}>
      {children}
    </AuthContext.Provider>
  );
};
