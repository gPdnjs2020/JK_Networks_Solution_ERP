import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const closeSidebar = () => setIsOpen(false);

  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div style={{ color: 'white', marginBottom: '30px', borderBottom: '1px solid #374151', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <small style={{ color: '#9ca3af' }}>관리자 시스템</small>
          {/* 모바일용 닫기 버튼 */}
          <button className="mobile-close-btn" onClick={closeSidebar}>✕</button>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0' }}>
          {user ? `${user.name}님` : "로그인 필요"}
        </div>
        {user && (
          <button onClick={logout} className="btn" style={logoutBtnStyle}>로그아웃</button>
        )}
      </div>

      <h2 style={{ color: "white", marginBottom: '20px' }}>JK ERP</h2>

      <nav>
        <Link to="/" style={linkStyle} onClick={closeSidebar}>📊 대시보드</Link>
        <Link to="/products" style={linkStyle} onClick={closeSidebar}>📦 상품 관리</Link>
        <Link to="/partners" style={linkStyle} onClick={closeSidebar}>🤝 거래처 관리</Link>
        <Link to="/transactions" style={linkStyle} onClick={closeSidebar}>🔄 입출고 관리</Link>
        <Link to="/vouchers" style={linkStyle} onClick={closeSidebar}>🧾 전표 내역</Link>
      </nav>
    </div>
  );
}

// 스타일 객체들 (기존 sidebar 객체는 삭제하고 클래스로 관리)
const logoutBtnStyle = {
  fontSize: '11px', marginTop: '5px', background: '#374151', color: 'white',
  border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'
};

const linkStyle = {
  display: "block", color: "#ddd", padding: "12px 0", textDecoration: "none", fontSize: "15px"
};