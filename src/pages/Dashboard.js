import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const API = "http://127.0.0.1:5000";

export default function Dashboard() {
  const [sales, setSales] = useState(0);
  const [supply, setSupply] = useState(0);
  const [vat, setVat] = useState(0);
  const [stockValue, setStockValue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 전표 가져오기
    const vRes = await fetch(`${API}/vouchers`);
    const vouchers = await vRes.json();

    let total = 0;
    let s = 0;
    let v = 0;

    vouchers.forEach((x) => {
      total += x.total;
      s += x.supply;
      v += x.vat;
    });

    setSales(total);
    setSupply(s);
    setVat(v);

    // 상품 가져오기
    const pRes = await fetch(`${API}/products`);
    const products = await pRes.json();

    let stockSum = 0;
    products.forEach((p) => {
      stockSum += p.price * p.stock;
    });

    setStockValue(stockSum);
  };

  const chartData = {
    labels: ["총매출"],
    datasets: [
      { label: "총액", data: [sales] },
      { label: "공급가", data: [supply] },
      { label: "VAT", data: [vat] },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 ERP 대시보드</h1>

      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Card title="총 매출" value={sales} />
        <Card title="공급가" value={supply} />
        <Card title="부가세" value={vat} />
        <Card title="재고 자산" value={stockValue} />
      </div>

      <div style={cardStyle}>
        <h3>매출 요약</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <h3>{title}</h3>
      <p>{value.toLocaleString()} 원</p>
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