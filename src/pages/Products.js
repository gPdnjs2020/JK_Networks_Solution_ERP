import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  };

  const addProduct = async () => {
    await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price) }),
    });

    setName("");
    setPrice("");
    loadProducts();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 상품관리</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={price} onChange={(e) => setPrice(e.target.value)} />
      <button onClick={addProduct}>등록</button>

      {products.map((p) => (
        <div key={p.id}>
          {p.name} / {p.stock} / {p.price}
        </div>
      ))}
    </div>
  );
}