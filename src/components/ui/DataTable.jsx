export default function DataTable({
  columns,
  data,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id ?? index}
                className="
                  border-t
                  border-slate-100
                  hover:bg-slate-50
                "
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="
                      px-4
                      py-3
                      text-sm
                      text-slate-700
                    "
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}