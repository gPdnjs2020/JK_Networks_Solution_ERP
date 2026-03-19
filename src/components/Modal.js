export default function Modal({ open, onClose, children }) {
    if (!open) return null;
  
    return (
      <div style={overlay}>
        <div style={modal}>
          <button onClick={onClose} style={close}>
            X
          </button>
          {children}
        </div>
      </div>
    );
  }
  
  const overlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  
  const modal = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "400px",
  };
  
  const close = {
    float: "right",
    border: "none",
    background: "none",
    cursor: "pointer",
  };