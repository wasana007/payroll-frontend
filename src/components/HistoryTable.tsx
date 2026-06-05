import type { HistoryItem } from '../types/payroll';

type Props = {
  history: HistoryItem[];
};

export default function HistoryTable({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <section className="card">
      <div className="card-label">🗂 Historikk</div>

      <div className="table-wrap">
        <table className="hist-table">
          <thead>
            <tr>
              <th>Ansatt-ID</th>
              <th>Lønn</th>
              <th>Skatt</th>
              <th>Måned</th>
              <th>Status</th>
              <th>Tid</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.employeeId}</td>

                <td>
                  {typeof h.salary === 'number'
                    ? h.salary.toLocaleString() + ' kr'
                    : h.salary}
                </td>

                <td>
                  {h.tax !== '-' && h.tax
                    ? Number(h.tax).toLocaleString('no-NO') + ' kr'
                    : '—'}
                </td>

                <td>{h.month}</td>

                <td>
                  <span className={`row-status ${h.status}`}>
                    {h.status === 'COMPLETED' ? '✓' : '✗'}{' '}
                    {h.status === 'COMPLETED' ? 'Fullført' : 'Feilet'}
                  </span>
                </td>

                <td className="tid">{h.tid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
