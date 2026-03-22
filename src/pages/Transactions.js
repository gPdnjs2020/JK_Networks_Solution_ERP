import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";

const API = "http://127.0.0.1:5000";

export default function Transactions() {
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);

  const [productId, setProductId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [qty, setQty] = useState(1);
  const [type, setType] = useState("OUT");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const p = await fetch(`${API}/products`).then((r) => r.json());
    const pa = await fetch(`${API}/partners`).then((r) => r.json());
    setProducts(p);
    setPartners(pa);
  };

  const handle = async () => {
    if(!productId || !partnerId) return alert("상품과 거래처를 선택하세요.");
    
    await axios.post(`${API}/transaction`, {
      product_id: productId,
      partner_id: partnerId,
      qty: Number(qty), // 반드시 숫자화
      type,
    });
    alert("전표가 발행되었습니다.");
    load();
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 className="title">🔄 입출고 등록</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <select className="input" onChange={(e) => setProductId(e.target.value)}>
          <option value="">상품 선택</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} (재고: {p.stock})</option>)}
        </select>
        {/* ... 나머지 select/input 동일하되 class "input" 적용 ... */}
        <button className="btn btn-primary" onClick={handle}>거래 확정</button>
      </div>
    </div>
  );
}