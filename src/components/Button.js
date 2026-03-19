export default function Button({ children, onClick, type = "primary" }) {
    const styles = {
      primary: {
        background: "#03c75a",
        color: "white",
      },
      secondary: {
        background: "#2563eb",
        color: "white",
      },
    };
  
    return (
      <button
        onClick={onClick}
        style={{
          ...base,
          ...styles[type],
        }}
      >
        {children}
      </button>
    );
  }
  
  const base = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };