import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // 1. Navigate 추가
import MainLayout from "./layouts/MainLayout";
import useAuth from "./hooks/useAuth";

// 2. 중요: AuthPage는 API 폴더가 아니라 화면을 그린 pages 폴더에서 가져와야 합니다.
// (만약 LoginPage.js로 만드셨다면 경로를 그에 맞게 수정하세요)
import LoginPage from "./pages/LoginPage"; 

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Partners from "./pages/Partners";
import Transactions from "./pages/Transactions";
import Vouchers from "./pages/Vouchers";

function App() {
  // 3. useAuth()에서 isLoggedIn을 꺼내와야 아래에서 쓸 수 있습니다.
  const { isLoggedIn } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* 로그인 페이지: 로그인 된 상태면 홈으로, 아니면 AuthPage로 */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/" /> : <LoginPage />} 
        />

        {/* 로그인해야만 볼 수 있는 ERP 영역 */}
        <Route path="/*" element={
          isLoggedIn ? (
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/vouchers" element={<Vouchers />} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;