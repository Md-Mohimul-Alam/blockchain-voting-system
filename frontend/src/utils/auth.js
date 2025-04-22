import jwt_decode from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  return token ? jwt_decode(token) : null;
};

export const isAuthenticated = () => !!localStorage.getItem("token");
