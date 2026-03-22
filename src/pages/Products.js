import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:5000";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });

  const load = async () => {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
  };

  useEffect(() => { load(); }, []);

  const addProduct = async () => {
    if (!form.name || !form.price) return alert("내용을 입력하세요.");
    await axios.post(`${API}/products`, { ...form, price: Number(form.price) });
    setForm({ name: "", price: "" });
    load();
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
        <table>
          <thead>
            <tr>
              <th>ID</th><th>상품명</th><th>현재 재고</th><th>판매 단가</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><strong>{p.name}</strong></td>
                <td style={{ color: p.stock < 5 ? 'red' : 'inherit' }}>{p.stock} 개</td>
                <td>{p.price.toLocaleString()} 원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}