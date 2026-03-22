import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth"; // LoginPage 대신 useAuth를 불러옵니다.

export default function Sidebar() {
  // useAuth 훅을 사용하여 현재 로그인된 유저 정보와 로그아웃 함수를 가져옵니다.
  const { user, logout } = useAuth();

  return (
    <div style={sidebar}>
      <div style={{ color: 'white', marginBottom: '30px', borderBottom: '1px solid #374151', paddingBottom: '20px' }}>
        <small style={{ color: '#9ca3af' }}>관리자 시스템</small>
        <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
          {user ? `${user.name}님` : "로그인 필요"}
        </div>
        {user && (
          <button 
            onClick={logout} 
            className="btn" 
            style={{ 
              fontSize: '11px', 
              marginTop: '5px', 
              background: '#374151', 
              color: 'white', 
              border: 'none', 
              padding: '4px 8px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        )}
      </div>

      <h2 style={{ color: "white", marginBottom: '20px' }}>JK ERP</h2>

      <nav>
        <Link to="/" style={link}>📊 대시보드</Link>
        <Link to="/products" style={link}>📦 상품 관리</Link>
        <Link to="/partners" style={link}>🤝 거래처 관리</Link>
        <Link to="/transactions" style={link}>🔄 입출고 관리</Link>
        <Link to="/vouchers" style={link}>🧾 전표 내역</Link>
      </nav>
    </div>
  );
}

const sidebar = {
  width: "220px",
  background: "#1f2937",
  height: "100vh",
  padding: "20px",
  position: "sticky",
  top: 0
};

const link = {
  display: "block",
  color: "#ddd",
  padding: "12px 0",
  textDecoration: "none",
  fontSize: "15px"
};