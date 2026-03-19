import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={content}>
        {children}
      </div>
    </div>
  );
}

const content = {
  flex: 1,
  background: "#f4f6f9",
  minHeight: "100vh",
  padding: "20px",
};