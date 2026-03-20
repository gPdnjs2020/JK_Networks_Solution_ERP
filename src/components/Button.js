export default function Button({ children, onClick, type = "primary" }) {
  return (
    <button
      onClick={onClick}
      className={`btn ${type === "primary" ? "btn-primary" : "btn-blue"}`}
    >
      {children}
    </button>
  );
}