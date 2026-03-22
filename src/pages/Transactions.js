import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://jk-erp-backend.onrender.com";

export default function Transactions() {
  const [data, setData] = useState({ products: [], partners: [] });
  const [form, setForm] = useState({ productId: "", partnerId: "", qty: 1, type: "OUT" });

  useEffect(() => {
    const fetchAll = async () => {
      const [p, pa] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/partners`)
      ]);
      setData({ products: p.data, partners: pa.data });
    };
    fetchAll();
  }, []);

  const handleTransaction = async () => {
    try {
      await axios.post(`${API}/transaction`, {
        product_id: form.productId,
        partner_id: form.partnerId,
        qty: Number(form.qty),
        type: form.type
      });
      alert(`${form.type === 'OUT' ? '출고' : '입고'} 처리가 완료되었습니다.`);
    } catch (e) {
      alert("처리 중 오류가 발생했습니다. 재고를 확인하세요.");
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 className="title">🔄 입출고 관리</h1>
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label>거래 유형</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={`btn ${form.type === 'OUT' ? 'btn-primary' : ''}`}
              style={{ flex: 1, border: '1px solid #ddd' }}
              onClick={() => setForm({ ...form, type: 'OUT' })}
            >🔻 출고 (매출)</button>
            <button
              className={`btn ${form.type === 'IN' ? 'btn-primary' : ''}`}
              style={{ flex: 1, border: '1px solid #ddd' }}
              onClick={() => setForm({ ...form, type: 'IN' })}
            >▲ 입고 (매입)</button>
          </div>

          <label>상품 선택</label>
          <select onChange={e => setForm({ ...form, productId: e.target.value })}>
            <option>상품을 선택하세요</option>
            {data.products.map(p => <option key={p.id} value={p.id}>{p.name} (현재: {p.stock})</option>)}
          </select>

          <label>거래처 선택</label>
          <select onChange={e => setForm({ ...form, partnerId: e.target.value })}>
            <option>거래처를 선택하세요</option>
            {data.partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <label>수량</label>
          <input type="number" min="1" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} />

          <button className="btn btn-primary" style={{ marginTop: '10px', padding: '15px' }} onClick={handleTransaction}>
            거래 확정 및 전표 발행
          </button>
        </div>
      </div>
    </div>
  );
}