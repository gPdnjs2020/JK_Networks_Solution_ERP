import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // 임시 데이터 (나중에 API 연결)
  useEffect(() => {
    setProducts([
      { id: 1, name: "토너 A", stock: 10, price: 11000 },
      { id: 2, name: "프린터 B", stock: 5, price: 250000 },
    ]);
  }, []);

  // 상품 추가
  const addProduct = () => {
    if (!name || !price) return;

    const newProduct = {
      id: Date.now(),
      name,
      stock: 0,
      price: Number(price),
    };

    setProducts([...products, newProduct]);
    setName("");
    setPrice("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 상품관리</h1>

      {/* 상품 등록 */}
      <div style={cardStyle}>
        <h3>상품 등록</h3>

        <input
          placeholder="상품명"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="가격"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addProduct} style={buttonStyle}>
          등록
        </button>
      </div>

      {/* 상품 리스트 */}
      <div style={cardStyle}>
        <h3>상품 목록</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>상품명</th>
              <th style={th}>재고</th>
              <th style={th}>가격</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.stock}</td>
                <td style={td}>{p.price.toLocaleString()} 원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 스타일 */
const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};

const inputStyle = {
  marginRight: "10px",
  padding: "8px",
};

const buttonStyle = {
  padding: "8px 16px",
  background: "#03c75a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const th = {
  borderBottom: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};