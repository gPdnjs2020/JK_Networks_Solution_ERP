import { useState } from "react";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false); // 사이드바 열림 상태

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* 모바일 상단 바 (768px 이하에서만 노출됨 - CSS에서 제어) */}
      <div className="mobile-top-bar">
        <button className="hamburger-btn" onClick={() => setIsOpen(true)}>
          ☰
        </button>
        <span style={{ fontWeight: "bold" }}>JK ERP</span>
      </div>

      {/* 사이드바에 상태와 제어 함수 전달 */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* 모바일에서 사이드바 열렸을 때 배경 어둡게 처리 */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}

      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}