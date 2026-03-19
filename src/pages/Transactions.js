import { useEffect, useState } from "react";
import { calcVAT } from "../utils/calcVAT";

export default function Transactions() {
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  const [productId, setProductId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [qty, setQty] = useState(1);
  const [type, setType] = useState("OUT");

  useEffect(() => {
    setProducts([
      { id: 1, name: "토너 A", stock: 10, price: 11000 },
      { id: 2, name: "프린터 B", stock: 5, price: 250000 },
    ]);

    setPartners([
      { id: 1, name: "JK 고객사", balance: 11000 },
      { id: 2, name: "포항 컴퓨터", balance: 0 },
    ]);
  }, []);

  const handleTransaction = () => {
    if (!productId || !partnerId || !qty) return;

    const selectedProduct = products.find(p => p.id === Number(productId));
    const selectedPartner = partners.find(p => p.id === Number(partnerId));

    if (!selectedProduct || !selectedPartner) return;

    const total = selectedProduct.price * qty;

    // 👉 VAT 계산
    const { supply, vat } = calcVAT(total);

    // 상품 재고 업데이트
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          stock: type === "OUT"
            ? p.stock - qty
            : p.stock + qty
        };
      }
      return p;
    });

    // 거래처 잔액 업데이트
    const updatedPartners = partners.map(p => {
      if (p.id === selectedPartner.id) {
        return {
          ...p,
          balance: type === "OUT"
            ? p.balance + total
            : p.balance
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setPartners(updatedPartners);

    // 👉 전표 생성 (핵심)
    if (type === "OUT") {
      const newVoucher = {
        id: Date.now(),
        partner: selectedPartner.name,
        product: selectedProduct.name,
        qty,
        supply,
        vat,
        total,
        date: new Date().toISOString().slice(0, 10),
      };

      setVouchers([...vouchers, newVoucher]);
    }

    alert("처리 완료!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🔄 입출고 관리</h1>

      <div style={cardStyle}>
        <h3>입출고 처리</h3>

        <select value={productId} onChange={(e) => setProductId(e.target.value)} style={input}>
          <option value="">상품 선택</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (재고: {p.stock})
            </option>
          ))}
        </select>

        <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} style={input}>
          <option value="">거래처 선택</option>
          {partners.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          style={input}
        />

        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          <option value="OUT">출고(매출)</option>
          <option value="IN">입고</option>
        </select>

        <button onClick={handleTransaction} style={button}>
          처리
        </button>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const input = {
  padding: "8px",
  marginRight: "10px",
};

const button = {
  padding: "8px 16px",
  background: "#03c75a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};