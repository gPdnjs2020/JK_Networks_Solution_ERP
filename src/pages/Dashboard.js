import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";

const API = "https://jk-erp-backend.onrender.com";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,      // 총 매출 (공급가)
    totalPurchase: 0,   // 총 매입 (공급가)
    totalProfit: 0,     // 당기 손익
    totalBalance: 0,    // 거래처 미수금 합계
    inventoryValue: 0,  // 재고 자산 가치
    lowStockItems: []   // 재고 부족 상품 리스트
  });

  const [monthlyChart, setMonthlyChart] = useState({ 
    labels: ["데이터 없음"], 
    datasets: [{ label: "매출", data: [0], backgroundColor: "#3b82f6" }] 
  });

  const loadData = async () => {
    try {
      const [vRes, pRes, paRes] = await Promise.all([
        axios.get(`${API}/vouchers`),
        axios.get(`${API}/products`),
        axios.get(`${API}/partners`)
      ]);

      const vouchers = vRes.data || [];
      const products = pRes.data || [];
      const partners = paRes.data || [];

      // 1. 손익 및 매출/매입 계산
      let sales = 0;
      let purchase = 0;
      vouchers.forEach(v => {
        const type = v.v_type || v.type;
        if (type === '판매' || type === 'OUT') {
          sales += Number(v.supply || 0);
        } else if (type === '구매' || type === 'IN') {
          purchase += Number(v.supply || 0);
        }
      });

      // 2. 미수금 및 재고자산 계산
      const balanceSum = partners.reduce((acc, p) => acc + Number(p.balance || 0), 0);
      const stockSum = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0);
      
      setStats({
        totalSales: sales,
        totalPurchase: purchase,
        totalProfit: sales - purchase,
        totalBalance: balanceSum,
        inventoryValue: stockSum,
        lowStockItems: products.filter(p => Number(p.stock) < 5)
      });

      // 3. 월별 추이 데이터 가공 (데이터가 있을 때만 실행)
      if (vouchers.length > 0) {
        const months = [...new Set(vouchers.map(v => (v.date || "").substring(0, 7)))].filter(m => m).sort();
        const salesData = months.map(m => 
          vouchers.filter(v => (v.date || "").startsWith(m) && (v.v_type === '판매' || v.type === 'OUT'))
          .reduce((sum, v) => sum + Number(v.supply || 0), 0)
        );
        const profitData = months.map((m, i) => {
          const p = vouchers.filter(v => (v.date || "").startsWith(m) && (v.v_type === '구매' || v.type === 'IN'))
                    .reduce((sum, v) => sum + Number(v.supply || 0), 0);
          return salesData[i] - p;
        });

        setMonthlyChart({
          labels: months,
          datasets: [
            { label: "월 매출", data: salesData, backgroundColor: "#3b82f6", type: 'bar' },
            { label: "월 순익", data: profitData, borderColor: "#10b981", tension: 0.3, type: 'line', fill: false },
          ],
        });
      }

    } catch (e) { 
      console.error("데이터 로드 실패", e); 
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div style={{ paddingBottom: '50px' }}>
      <h1 className="title">📊 실시간 경영 현황 (JK-ERP)</h1>
      
      {/* 재고 부족 알림 섹션 */}
      {stats.lowStockItems.length > 0 && (
        <div className="card" style={{ borderLeft: '5px solid #ef4444', backgroundColor: '#fef2f2', marginBottom: '20px', padding: '15px' }}>
          <span style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ 재고 부족 주의: </span>
          {stats.lowStockItems.map(p => `${p.name}(${p.stock}개)`).join(", ")}
        </div>
      )}

      {/* 상단 핵심 지표 카드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <StatCard title="누적 매출액(공급가)" value={stats.totalSales} color="#2563eb" />
        <StatCard title="누적 매입액" value={stats.totalPurchase} color="#64748b" />
        <StatCard title="당기 추정 순익" value={stats.totalProfit} color={stats.totalProfit >= 0 ? "#10b981" : "#ef4444"} />
        <StatCard title="재고 자산 가치" value={stats.inventoryValue} color="#8b5cf6" />
        <StatCard title="미수금(받을 돈)" value={stats.totalBalance} color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        {/* 월별 손익 그래프 */}
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>월별 매출 및 순익 추이</h3>
          <div style={{ height: '300px' }}>
            <Bar 
              data={monthlyChart} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom' } } 
              }} 
            />
          </div>
        </div>

        {/* 간단 보고서 요약 */}
        <div className="card">
          <h3 style={{ marginBottom: '15px' }}>📋 경영 보고 요약</h3>
          <ul style={{ lineHeight: '2.5', fontSize: '15px', paddingLeft: '20px', color: '#334155' }}>
            <li>현재 창고에 <strong>{(stats.inventoryValue || 0).toLocaleString()}원</strong> 상당의 재고가 보관 중입니다.</li>
            <li>거래처로부터 회수해야 할 미수금은 총 <strong>{(stats.totalBalance || 0).toLocaleString()}원</strong>입니다.</li>
            <li>누적 매출이익률은 <strong>{stats.totalSales ? ((stats.totalProfit / stats.totalSales) * 100).toFixed(1) : 0}%</strong>입니다.</li>
            <li>재고 보충이 필요한 품목이 <strong>{stats.lowStockItems.length || 0}건</strong> 확인되었습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 개별 카드 컴포넌트
function StatCard({ title, value, color = "#1e293b" }) {
  // 숫자가 없을 경우 0으로 처리하여 toLocaleString 에러 방지
  const safeValue = value || 0;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{safeValue.toLocaleString()}원</div>
      <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, fontSize: '60px' }}>💰</div>
    </div>
  );
}