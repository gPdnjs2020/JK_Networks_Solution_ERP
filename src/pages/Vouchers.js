import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";

const API = "https://jk-erp-backend.onrender.com";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  // 데이터 로드 함수
  const load = async () => {
    try {
      const res = await axios.get(`${API}/vouchers`);
      setVouchers(res.data);
    } catch (e) {
      console.error("전표 로드 실패", e);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  // --- 추가된 전표 삭제 함수 ---
  const deleteVoucher = async (id) => {
    if (!window.confirm("이 전표를 삭제하시겠습니까? (재고나 잔액은 자동으로 복구되지 않으니 주의하세요)")) return;
    
    try {
      await axios.delete(`${API}/vouchers/${id}`);
      load(); // 삭제 후 목록 갱신
    } catch (e) {
      alert("전표 삭제에 실패했습니다.");
    }
  };

  return (
    <div>
      <h1 className="title">🧾 매출/매입 전표 내역</h1>
      
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={thStyle}>거래일자</th>
              <th style={thStyle}>거래처</th>
              <th style={thStyle}>품목</th>
              <th style={thStyle}>수량</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>공급가액</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>부가세</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>합계금액</th>
              <th style={thStyle}>관리</th> {/* 삭제 버튼을 위한 컬럼 */}
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  거래 내역이 없습니다.
                </td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id} style={trStyle}>
                  <td style={tdStyle}>{v.date}</td>
                  <td style={tdStyle}><strong>{v.partner}</strong></td>
                  <td style={tdStyle}>{v.product}</td>
                  <td style={tdStyle}>{Number(v.qty || 0).toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {Number(v.supply || 0).toLocaleString()}원
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {Number(v.vat || 0).toLocaleString()}원
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                    {Number(v.total || 0).toLocaleString()}원
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button 
                      onClick={() => deleteVoucher(v.id)} 
                      style={delBtnStyle}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 인라인 스타일 ---
const thStyle = {
  padding: '12px 15px',
  fontSize: '14px',
  color: '#475569',
  borderBottom: '1px solid #e2e8f0',
  textAlign: 'left'
};

const tdStyle = {
  padding: '12px 15px',
  fontSize: '15px',
  borderBottom: '1px solid #f1f5f9'
};

const trStyle = {
  transition: 'background 0.2s'
};

const delBtnStyle = {
  padding: '4px 8px',
  fontSize: '12px',
  backgroundColor: '#fff1f1',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '4px',
  cursor: 'pointer'
};