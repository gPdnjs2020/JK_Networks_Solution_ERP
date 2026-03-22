import { useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login"; // 로그아웃 시 로그인 페이지로 이동
  };

  return { user, loginUser, logout, isLoggedIn: !!user };
}