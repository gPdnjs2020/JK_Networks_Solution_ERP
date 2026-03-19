import { useEffect, useState } from "react";

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
    await fetch(`${API}/transaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        partner_id: partnerId,
        qty,
        type,
      }),
    });

    alert("처리 완료");
    load();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>입출고</h1>

      <select onChange={(e) => setProductId(e.target.value)}>
        <option>상품</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setPartnerId(e.target.value)}>
        <option>거래처</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />

      <select onChange={(e) => setType(e.target.value)}>
        <option value="OUT">출고</option>
        <option value="IN">입고</option>
      </select>

      <button onClick={handle}>처리</button>
    </div>
  );
}