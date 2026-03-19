import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={sidebar}>
      <h2 style={{ color: "white" }}>JK ERP</h2>

      <nav>
        <Link to="/" style={link}>📊 대시보드</Link>
        <Link to="/products" style={link}>📦 상품</Link>
        <Link to="/partners" style={link}>🤝 거래처</Link>
        <Link to="/transactions" style={link}>🔄 입출고</Link>
        <Link to="/vouchers" style={link}>🧾 전표</Link>
      </nav>
    </div>
  );
}

const sidebar = {
  width: "220px",
  background: "#1f2937",
  height: "100vh",
  padding: "20px",
};

const link = {
  display: "block",
  color: "#ddd",
  padding: "10px 0",
  textDecoration: "none",
};