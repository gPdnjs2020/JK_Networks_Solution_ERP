import { useEffect, useState } from "react";

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");

  // 초기 데이터
  useEffect(() => {
    setPartners([
      { id: 1, name: "JK 고객사", balance: 11000 },
      { id: 2, name: "포항 컴퓨터", balance: 0 },
    ]);
  }, []);

  // 거래처 추가
  const addPartner = () => {
    if (!name) return;

    const newPartner = {
      id: Date.now(),
      name,
      balance: 0,
    };

    setPartners([...partners, newPartner]);
    setName("");
  };

  // 수금 처리
  const collectMoney = (id) => {
    const amount = prompt("수금 금액 입력");

    if (!amount) return;

    setPartners(
      partners.map((p) =>
        p.id === id
          ? { ...p, balance: p.balance - Number(amount) }
          : p
      )
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🤝 거래처 관리</h1>

      {/* 등록 */}
      <div style={cardStyle}>
        <h3>거래처 등록</h3>

        <input
          placeholder="거래처 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <button onClick={addPartner} style={buttonStyle}>
          등록
        </button>
      </div>

      {/* 리스트 */}
      <div style={cardStyle}>
        <h3>거래처 목록</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>거래처명</th>
              <th style={th}>미수금</th>
              <th style={th}>처리</th>
            </tr>
          </thead>

          <tbody>
            {partners.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.name}</td>

                <td style={td}>
                  {p.balance.toLocaleString()} 원
                </td>

                <td style={td}>
                  <button
                    onClick={() => collectMoney(p.id)}
                    style={smallButton}
                  >
                    수금
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

/* 스타일 */
const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};

const inputStyle = {
  padding: "8px",
  marginRight: "10px",
};

const buttonStyle = {
  padding: "8px 16px",
  background: "#03c75a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const smallButton = {
  padding: "6px 10px",
  background: "#2563eb",
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