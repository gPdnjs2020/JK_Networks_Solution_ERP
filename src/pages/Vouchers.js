import { useEffect, useState } from "react";
import "../styles/global.css";

const API = "http://127.0.0.1:5000";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await fetch(`${API}/vouchers`);
    const data = await res.json();
    setVouchers(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>전표</h1>

      {vouchers.map((v) => (
        <div key={v.id}>
          {v.partner} / {v.product} / {v.total} / VAT:{v.vat}
        </div>
      ))}
    </div>
  );
}