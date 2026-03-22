import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";

const API = "https://jk-erp-backend.onrender.com";

export default function Dashboard() {
  const [stats, setStats] = useState({ sales: 0, supply: 0, vat: 0, stockValue: 0 });

  const loadData = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        axios.get(`${API}/vouchers`),
        axios.get(`${API}/products`)
      ]);

      // 데이터가 숫자인지 확실하게 변환하여 합산합니다.
      const totals = vRes.data.reduce((acc, curr) => ({
        sales: acc.sales + Number(curr.total || 0),
        supply: acc.supply + Number(curr.supply || 0),
        vat: acc.vat + Number(curr.vat || 0)
      }), { sales: 0, supply: 0, vat: 0 });

      const stockSum = pRes.data.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0);
      
      setStats({ ...totals, stockValue: stockSum });
    } catch (e) { 
      console.error("데이터 로드 실패", e); 
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []); // 페이지가 로드될 때마다 실행

  const chartData = {
    labels: ["매출 분석"],
    datasets: [
      { label: "공급가액", data: [stats.supply], backgroundColor: "#3b82f6" },
      { label: "부가세", data: [stats.vat], backgroundColor: "#94a3b8" },
    ],
  };

  return (
    <div>
      <h1 className="title">📊 실시간 경영 현황</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="총 매출액" value={stats.sales} color="#2563eb" />
        <StatCard title="재고 자산" value={stats.stockValue} color="#10b981" />
        <StatCard title="공급가 합계" value={stats.supply} />
        <StatCard title="미납 부가세" value={stats.vat} />
      </div>
      <div className="card">
        <h3>매출 구성비</h3>
        <div style={{ height: '300px' }}>
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "#1e293b" }) {
  return (
    <div className="card">
      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{(value || 0).toLocaleString()}원</div>
    </div>
  );
}