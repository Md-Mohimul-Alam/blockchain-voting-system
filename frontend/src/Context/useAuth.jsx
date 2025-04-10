import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Import the context from AuthContext.jsx

export const useAuth = () => {
  return useContext(AuthContext);
};