export default function Table({ columns, data }) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
  
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={td}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  const th = {
    borderBottom: "1px solid #ddd",
    padding: "10px",
    textAlign: "left",
  };
  
  const td = {
    padding: "10px",
    borderBottom: "1px solid #eee",
  };