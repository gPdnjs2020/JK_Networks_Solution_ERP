import { useEffect, useState } from "react";
import "../styles/global.css";

const API = "https://jk-erp-backend.onrender.com";

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`${API}/partners`);
    setPartners(await res.json());
  };

  const add = async () => {
    await fetch(`${API}/partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>거래처</h1>

      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={add}>등록</button>

      {partners.map((p) => (
        <div key={p.id}>
          {p.name} / {p.balance}
        </div>
      ))}
    </div>
  );

}

