import { useEffect, useState } from "react";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    setVouchers([
      {
        id: 1,
        partner: "JK 고객사",
        product: "토너 A",
        qty: 1,
        supply: 10000,
        vat: 1000,
        total: 11000,
        date: "2026-03-20",
      },
    ]);
  }, []);

  const printVoucher = (id) => {
    alert(`전표 ${id} 출력`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🧾 전표 관리</h1>

      <div style={cardStyle}>
        <h3>전표 목록</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>번호</th>
              <th style={th}>거래처</th>
              <th style={th}>상품</th>
              <th style={th}>수량</th>
              <th style={th}>공급가</th>
              <th style={th}>VAT</th>
              <th style={th}>총액</th>
              <th style={th}>일자</th>
              <th style={th}>출력</th>
            </tr>
          </thead>

          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td style={td}>{v.id}</td>
                <td style={td}>{v.partner}</td>
                <td style={td}>{v.product}</td>
                <td style={td}>{v.qty}</td>
                <td style={td}>{v.supply.toLocaleString()} 원</td>
                <td style={td}>{v.vat.toLocaleString()} 원</td>
                <td style={td}>{v.total.toLocaleString()} 원</td>
                <td style={td}>{v.date}</td>
                <td style={td}>
                  <button onClick={() => printVoucher(v.id)} style={button}>
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const th = {
  borderBottom: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const button = {
  padding: "6px 10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};