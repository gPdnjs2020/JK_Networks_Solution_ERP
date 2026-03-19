import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Partners from "./pages/Partners";
import Transactions from "./pages/Transactions";
import Vouchers from "./pages/Vouchers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/vouchers" element={<Vouchers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;