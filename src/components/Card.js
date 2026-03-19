export default function Card({ children }) {
    return (
      <div style={style}>
        {children}
      </div>
    );
  }
  
  const style = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  };