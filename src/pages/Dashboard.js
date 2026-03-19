import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { calcVAT } from "../utils/calcVAT";

export default function Dashboard() {
  const [sales, setSales] = useState(0);       // 총매출
  const [supply, setSupply] = useState(0);     // 공급가
  const [vat, setVat] = useState(0);           // 부가세
  const [stockValue, setStockValue] = useState(0);

  useEffect(() => {
    const totalSales = 320000;

    // 👉 VAT 계산
    const result = calcVAT(totalSales);

    setSales(result.total);
    setSupply(result.supply);
    setVat(result.vat);

    setStockValue(1500000);
  }, []);

  const chartData = {
    labels: ["1월", "2월", "3월"],
    datasets: [
      {
        label: "총 매출",
        data: [100000, 200000, 320000],
      },
      {
        label: "공급가",
        data: [90000, 180000, 290000],
      },
      {
        label: "부가세",
        data: [10000, 20000, 30000],
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 ERP 대시보드</h1>

      {/* KPI 카드 */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={cardStyle}>
          <h3>총 매출</h3>
          <p>{sales.toLocaleString()} 원</p>
        </div>

        <div style={cardStyle}>
          <h3>공급가</h3>
          <p>{supply.toLocaleString()} 원</p>
        </div>

        <div style={cardStyle}>
          <h3>부가세</h3>
          <p>{vat.toLocaleString()} 원</p>
        </div>

        <div style={cardStyle}>
          <h3>재고 자산</h3>
          <p>{stockValue.toLocaleString()} 원</p>
        </div>
      </div>

      {/* 그래프 */}
      <div style={cardStyle}>
        <h3>월별 매출 분석</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  flex: 1,
};