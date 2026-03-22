import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import Card from "../components/Card"; // 기존 Card 컴포넌트 활용
import "chart.js/auto";

export default function Dashboard() {
  const [stats, setStats] = useState({ sales: 0, supply: 0, vat: 0, stockValue: 0 });

  const loadData = async () => {
    try {
      const [vRes, pRes] = await Promise.all([
        axios.get("https://jk-networks-solution-erp.onrender.com/vouchers"),
        axios.get("https://jk-networks-solution-erp.onrender.com/products")
      ]);

      const totals = vRes.data.reduce((acc, curr) => ({
        sales: acc.sales + curr.total,
        supply: acc.supply + curr.supply,
        vat: acc.vat + curr.vat
      }), { sales: 0, supply: 0, vat: 0 });

      const stockSum = pRes.data.reduce((acc, p) => acc + (p.price * p.stock), 0);
      setStats({ ...totals, stockValue: stockSum });
    } catch (e) { console.error("데이터 로드 실패", e); }
  };

  useEffect(() => { loadData(); }, []);

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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="총 매출액" value={stats.sales} color="#2563eb" />
        <StatCard title="재고 자산" value={stats.stockValue} color="#10b981" />
        <StatCard title="공급가 합계" value={stats.supply} />
        <StatCard title="미납 부가세" value={stats.vat} />
      </div>
      <div className="card">
        <h3>매출 구성비</h3>
        <div style={{ height: '300px' }}><Bar data={chartData} options={{ maintainAspectRatio: false }} /></div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "#1e293b" }) {
  return (
    <div className="card">
      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value.toLocaleString()}원</div>
    </div>
  );
}