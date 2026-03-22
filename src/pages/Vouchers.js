import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/global.css";

const API = "http://127.0.0.1:5000";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);

  const load = async () => {
    try {
      const res = await axios.get(`${API}/vouchers`);
      setVouchers(res.data);
    } catch (e) {
      console.error("전표 로드 실패", e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="title">🧾 매출/매입 전표 내역</h1>
      
      <div className="card" style={{ padding: '0' }}>
        <table>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th>거래일자</th>
              <th>거래처</th>
              <th>품목</th>
              <th>수량</th>
              <th style={{ textAlign: 'right' }}>공급가액</th>
              <th style={{ textAlign: 'right' }}>부가세</th>
              <th style={{ textAlign: 'right' }}>합계금액</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>거래 내역이 없습니다.</td></tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td><strong>{v.partner}</strong></td>
                  <td>{v.product}</td>
                  <td>{v.qty.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{v.supply.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{v.vat.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                    {v.total.toLocaleString()}원
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