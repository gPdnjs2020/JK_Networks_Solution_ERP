export default function Table({ columns, data }) {
  return (
    <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: '#f1f5f9' }}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: '16px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '16px', fontSize: '14px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}