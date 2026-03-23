import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://jk-erp-backend.onrender.com";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });

  const load = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error("로딩 실패", err);
    }
  };

  useEffect(() => { load(); }, []);

  const addProduct = async () => {
    if (!form.name || !form.price) return alert("내용을 입력하세요.");
    await axios.post(`${API}/products`, { ...form, price: Number(form.price) });
    setForm({ name: "", price: "" });
    load();
  };

  // --- 추가된 삭제 함수 ---
  const deleteProduct = async (id) => {
    if (!window.confirm("이 상품을 정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      load();
    } catch (err) {
      alert("삭제 실패!");
    }
  };

  // --- 추가된 수량 조절 함수 ---
  const changeStock = async (id, currentStock, delta) => {
    const newStock = currentStock + delta;
    if (newStock < 0) return alert("재고는 0보다 작을 수 없습니다.");

    try {
      await axios.patch(`${API}/products/${id}/stock`, { stock: newStock });
      load();
    } catch (err) {
      alert("수정 실패!");
    }
  };

  return (
    <div>
      <h1 className="title">📦 상품 재고 관리</h1>

      <div className="card">
        <h3>새 상품 등록</h3>
        <div className="input-group">
          <input placeholder="상품명" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="단가 (원)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <button className="btn btn-primary" onClick={addProduct}>등록하기</button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>상품명</th>
                <th>현재 재고 (조절)</th>
                <th>판매 단가</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <button className="btn" style={smallBtn} onClick={() => changeStock(p.id, p.stock, -1)}>-</button>
                      <span style={{ color: p.stock < 5 ? 'red' : 'inherit', minWidth: '40px', fontWeight: 'bold' }}>
                        {p.stock} 개
                      </span>
                      <button className="btn" style={smallBtn} onClick={() => changeStock(p.id, p.stock, 1)}>+</button>
                    </div>
                  </td>
                  <td>{p.price.toLocaleString()} 원</td>
                  <td>
                    <button className="btn" style={delBtn} onClick={() => deleteProduct(p.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- 인라인 스타일 (CSS 파일에 넣으셔도 됩니다) ---
const smallBtn = {
  padding: '2px 8px',
  fontSize: '14px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  cursor: 'pointer'
};

const delBtn = {
  padding: '4px 10px',
  fontSize: '13px',
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  border: '1px solid #f87171',
  cursor: 'pointer'
};