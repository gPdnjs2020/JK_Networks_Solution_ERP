import axios from "axios";

const API = "http://localhost:5000";

// 상품 목록
export const getProducts = async () => {
  const res = await axios.get(`${API}/products`);
  return res.data;
};

// 상품 추가
export const addProduct = async (product) => {
  const res = await axios.post(`${API}/products`, product);
  return res.data;
};