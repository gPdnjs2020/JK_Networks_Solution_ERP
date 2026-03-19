import axios from "axios";

const API = "http://localhost:5000";

// 로그인
export const login = async (username, password) => {
  const res = await axios.post(`${API}/login`, {
    username,
    password,
  });

  return res.data;
};