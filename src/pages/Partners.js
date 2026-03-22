import { useEffect, useState } from "react";
import "../styles/global.css";

const API = "https://jk-erp-backend.onrender.com";

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");
  
  // 수정을 위한 상태 추가
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", balance: 0 });

  useEffect(() => { load(); }, []);

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

  // --- 수정 모드 진입 ---
  const startEdit = (p) => {
    setEditId(p.id);
    setEditForm({ name: p.name, balance: p.balance });
  };

  // --- 수정 저장 ---
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API}/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditId(null);
        load();
      }
    } catch (err) {
      alert("수정 실패");
    }
  };

  const removePartner = async (id) => {
    if (!window.confirm("이 거래처를 삭제하시겠습니까? (미수금 정보도 함께 사라집니다)")) return;
    try {
      const res = await fetch(`${API}/partners/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } catch (err) {
      console.error("삭제 오류:", err);
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>🤝 거래처 관리</h1>

      <div style={inputGroup}>
        <input
          style={input}
          placeholder="새 거래처 이름 입력"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button style={addBtn} onClick={add}>거래처 추가</button>
      </div>

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={th}>ID</th>
              <th style={th}>거래처명</th>
              <th style={th}>잔액 (미수금)</th>
              <th style={th}>관리</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} style={tr}>
                <td style={td}>{p.id}</td>
                <td style={td}>
                  {editId === p.id ? (
                    <input 
                      style={editInput}
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    <strong>{p.name}</strong>
                  )}
                </td>
                <td style={{ ...td, color: p.balance > 0 ? '#ef4444' : '#10b981' }}>
                  {editId === p.id ? (
                    <input 
                      type="number"
                      style={editInput}
                      value={editForm.balance} 
                      onChange={e => setEditForm({...editForm, balance: Number(e.target.value)})}
                    />
                  ) : (
                    `${p.balance.toLocaleString()} 원`
                  )}
                </td>
                <td style={td}>
                  {editId === p.id ? (
                    <>
                      <button style={saveBtn} onClick={() => saveEdit(p.id)}>저장</button>
                      <button style={cancelBtn} onClick={() => setEditId(null)}>취소</button>
                    </>
                  ) : (
                    <>
                      <button style={editBtnStyle} onClick={() => startEdit(p)}>수정</button>
                      <button style={delBtn} onClick={() => removePartner(p.id)}>삭제</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 스타일 정의 (기존 스타일 유지 및 추가) ---
const container = { padding: "40px", backgroundColor: "#f9fafb", minHeight: "100vh" };
const title = { fontSize: "24px", marginBottom: "30px", color: "#111827" };
const inputGroup = { display: "flex", gap: "10px", marginBottom: "30px", backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const input = { flex: 1, padding: "10px 15px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "16px" };
const addBtn = { padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" };
const tableContainer = { backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" };
const table = { width: "100%", borderCollapse: "collapse", textAlign: "left" };
const thRow = { backgroundColor: "#f3f4f6", borderBottom: "2px solid #e5e7eb" };
const th = { padding: "15px", fontSize: "14px", color: "#4b5563", fontWeight: "600" };
const tr = { borderBottom: "1px solid #f3f4f6" };
const td = { padding: "15px", fontSize: "15px", color: "#374151" };

const editInput = { padding: "5px", width: "120px", border: "1px solid #4f46e5", borderRadius: "4px" };
const editBtnStyle = { padding: "5px 12px", marginRight: "5px", backgroundColor: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer" };
const saveBtn = { padding: "5px 12px", marginRight: "5px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const cancelBtn = { padding: "5px 12px", backgroundColor: "#9ca3af", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const delBtn = { padding: "5px 12px", backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer" };