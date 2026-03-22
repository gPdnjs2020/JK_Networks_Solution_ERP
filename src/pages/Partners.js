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
    try {
      const res = await fetch(`${API}/partners`);
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error("데이터 로딩 실패:", err);
    }
  };

  const add = async () => {
    if (!name) return alert("거래처명을 입력하세요!");
    await fetch(`${API}/partners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  };

  return (
    <div style={container}>
      <h1 style={title}>🤝 거래처 관리</h1>

      {/* 입력 섹션 */}
      <div style={inputGroup}>
        <input 
          style={input}
          placeholder="새 거래처 이름 입력"
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <button style={addBtn} onClick={add}>거래처 추가</button>
      </div>

      {/* 리스트 테이블 */}
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={th}>ID</th>
              <th style={th}>거래처명</th>
              <th style={th}>잔액 (미수금)</th>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? (
              partners.map((p) => (
                <tr key={p.id} style={tr}>
                  <td style={td}>{p.id}</td>
                  <td style={{...td, fontWeight: 'bold'}}>{p.name}</td>
                  <td style={{...td, color: p.balance > 0 ? '#ef4444' : '#10b981'}}>
                    {p.balance.toLocaleString()} 원
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{...td, textAlign: 'center', color: '#999'}}>
                  등록된 거래처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 스타일 정의 ---
const container = {
  padding: "40px",
  backgroundColor: "#f9fafb",
  minHeight: "100vh"
};

const title = {
  fontSize: "24px",
  marginBottom: "30px",
  color: "#111827"
};

const inputGroup = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const input = {
  flex: 1,
  padding: "10px 15px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  fontSize: "16px"
};

const addBtn = {
  padding: "10px 20px",
  backgroundColor: "#4f46e5",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

const tableContainer = {
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  overflow: "hidden"
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left"
};

const thRow = {
  backgroundColor: "#f3f4f6",
  borderBottom: "2px solid #e5e7eb"
};

const th = {
  padding: "15px",
  fontSize: "14px",
  color: "#4b5563",
  fontWeight: "600"
};

const tr = {
  borderBottom: "1px solid #f3f4f6",
  transition: "background 0.2s"
};

const td = {
  padding: "15px",
  fontSize: "15px",
  color: "#374151"
};