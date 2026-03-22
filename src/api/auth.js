import axios from "axios";

const API = "https://jk-networks-solution-erp.onrender.com";

// 로그인 API 호출
export const login = async (username, password) => {
  const res = await axios.post(`${API}/login`, { username, password });
  return res.data;
};

// 회원가입 API 호출 (추가됨!)
export const register = async (username, password, name) => {
  const res = await axios.post(`${API}/register`, { username, password, name });
  return res.data;
};