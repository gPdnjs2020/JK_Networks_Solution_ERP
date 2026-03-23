import { useEffect, useState, useRef } from "react";
import axios from "axios";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "../styles/global.css";

const API = "https://jk-erp-backend.onrender.com";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [printingId, setPrintingId] = useState(null); // 현재 출력 중인 ID
  const printRef = useRef();

  const load = async () => {
    try {
      const res = await axios.get(`${API}/vouchers`);
      setVouchers(res.data);
    } catch (e) {
      console.error("전표 로드 실패", e);
    }
  };

  useEffect(() => { load(); }, []);

  // --- 📝 PDF 다운로드 로직 ---
  const downloadPDF = async (v) => {
    setPrintingId(v.id); // 출력용 데이터 세팅
    
    // 리액트가 화면을 그릴 시간을 잠시 줌
    setTimeout(async () => {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 가로 세팅
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save(`전표_${v.v_num || v.id}_${v.partner}.pdf`);
      setPrintingId(null); // 출력 완료 후 초기화
    }, 100);
  };

  const deleteVoucher = async (id) => {
    if (!window.confirm("이 전표를 삭제하시겠습니까? 재고와 잔액이 자동 복구됩니다.")) return;
    try {
      await axios.delete(`${API}/vouchers/${id}`);
      load();
    } catch (e) {
      alert("삭제 실패");
    }
  };

  return (
    <div>
      <h1 className="title">🧾 매출/매입 전표 내역</h1>

      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={thStyle}>거래일자</th>
                <th style={thStyle}>구분</th>
                <th style={thStyle}>전표번호</th>
                <th style={thStyle}>거래처</th>
                <th style={thStyle}>품목</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>합계금액</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} style={trStyle}>
                  <td style={tdStyle}>{v.date}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                      backgroundColor: v.v_type === '판매' || v.type === 'OUT' ? '#fff1f2' : '#eff6ff',
                      color: v.v_type === '판매' || v.type === 'OUT' ? '#e11d48' : '#2563eb'
                    }}>
                      {v.v_type || (v.type === 'OUT' ? '매출' : '매입')}
                    </span>
                  </td>
                  <td style={tdStyle}>{v.v_num || '-'}</td>
                  <td style={tdStyle}><strong>{v.partner}</strong></td>
                  <td style={tdStyle}>{v.product}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>
                    {Number(v.total || 0).toLocaleString()}원
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => downloadPDF(v)} style={pdfBtnStyle}>PDF</button>
                    <button onClick={() => deleteVoucher(v.id)} style={delBtnStyle}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 🖨️ 화면에는 안 보이는 PDF 출력용 양식 (Hidden) --- */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={printRef} style={pdfCanvasStyle}>
          {printingId && (
            <>
              <h2 style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '30px' }}>
                {vouchers.find(v => v.id === printingId).v_type === '구매' ? '매 입 전 표' : '거 래 명 세 서'}
              </h2>
              <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse' }}>
                <tr>
                  <td style={pdfTd}>전표번호</td><td style={pdfTd}>{vouchers.find(v => v.id === printingId).v_num}</td>
                  <td style={pdfTd}>거래일자</td><td style={pdfTd}>{vouchers.find(v => v.id === printingId).date}</td>
                </tr>
                <tr>
                  <td style={pdfTd}>거래처명</td><td colSpan="3" style={pdfTd}>{vouchers.find(v => v.id === printingId).partner} 귀하</td>
                </tr>
              </table>
              <table style={{ width: '100%', border: '2px solid black', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead style={{ background: '#eee' }}>
                  <tr>
                    <th style={pdfTd}>품목명</th><th style={pdfTd}>수량</th><th style={pdfTd}>공급가액</th><th style={pdfTd}>부가세</th><th style={pdfTd}>합계</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={pdfTd}>{vouchers.find(v => v.id === printingId).product}</td>
                    <td style={pdfTd}>{vouchers.find(v => v.id === printingId).qty}</td>
                    <td style={pdfTd}>{vouchers.find(v => v.id === printingId).supply?.toLocaleString()}</td>
                    <td style={pdfTd}>{vouchers.find(v => v.id === printingId).vat?.toLocaleString()}</td>
                    <td style={pdfTd}>{vouchers.find(v => v.id === printingId).total?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '30px', textAlign: 'right' }}>위 금액을 정히 영수(청구)함.</div>
              <div style={{ marginTop: '10px', textAlign: 'right', fontWeight: 'bold' }}>JK ERP 시스템 자동발행</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 추가 스타일 ---
const pdfBtnStyle = {
  padding: '5px 10px', fontSize: '12px', backgroundColor: '#1e293b', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px'
};

const pdfCanvasStyle = {
  width: '190mm', padding: '10mm', background: '#fff', color: '#000', fontFamily: 'serif'
};

const pdfTd = { border: '1px solid black', padding: '10px', textAlign: 'center' };

const thStyle = { padding: '15px', fontSize: '13px', color: '#475569', borderBottom: '2px solid #e2e8f0', textAlign: 'left' };
const tdStyle = { padding: '12px 15px', fontSize: '14px', borderBottom: '1px solid #f1f5f9' };
const trStyle = { transition: 'background 0.2s' };
const delBtnStyle = { padding: '5px 10px', fontSize: '12px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' };