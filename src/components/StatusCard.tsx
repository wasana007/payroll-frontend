import { LOGSENSE_URL } from '../config';
import { formatTid } from '../utils/formatTid';

type Status = 'COMPLETED' | 'PENDING' | 'FAILED';

interface PayrollResult {
  employeeId: string;
  salary: number | string;
  tax: number | string;
  month: string;
  completedAt: string;
  error?: string;
}

interface StatusCardProps {
  status: Status | null;
  correlationId?: string | null;
  result?: PayrollResult | null;
}

export default function StatusCard({
  status,
  correlationId,
  result,
}: StatusCardProps) {
  if (!status) return null;

  return (
    <section
      className={`card status-card ${
        status === 'COMPLETED' ? 'ok' : status === 'PENDING' ? 'pending' : 'err'
      }`}
    >
      <div className="status-header">
        <span className="status-icon">
          {status === 'COMPLETED' ? '✅' : status === 'PENDING' ? '⏳' : '❌'}
        </span>
        <span className="status-title">
          {status === 'COMPLETED'
            ? 'Lønn behandlet'
            : status === 'PENDING'
              ? 'Behandler via Kafka...'
              : 'Lønnsbehandling feilet'}
        </span>
        <span className={`status-badge ${status}`}>
          {status === 'COMPLETED'
            ? 'FULLFØRT'
            : status === 'PENDING'
              ? 'BEHANDLER'
              : 'FEILET'}
        </span>
      </div>

      {status === 'PENDING' && (
        <div className="progress-bar-wrap">
          <div className="progress-bar" />
        </div>
      )}

      {correlationId && (
        <div className="corr-row">
          <span className="corr-label">korrelasjons-ID</span>
          <span className="corr-id">{correlationId}</span>
        </div>
      )}

      {status === 'COMPLETED' && result && (
        <div className="result-box ok">
          <div className="result-row">
            <span>Ansatt-ID</span>
            <span>{result.employeeId}</span>
          </div>
          <div className="result-row">
            <span>Lønn</span>
            <span>{Number(result.salary).toLocaleString('no-NO')} kr</span>
          </div>
          <div className="result-row">
            <span>Skatt</span>
            <span>{Number(result.tax).toLocaleString('no-NO')} kr</span>
          </div>
          <div className="result-row">
            <span>Måned</span>
            <span>{result.month}</span>
          </div>
          <div className="result-row">
            <span>Tid</span>
            <span className="tid">{formatTid(result.completedAt)}</span>
          </div>
        </div>
      )}

      {status === 'FAILED' && (
        <>
          {result?.error && <p className="error-msg">{result.error}</p>}
          <div className="logsense-box">
            <div className="logsense-info">
              <span className="logsense-icon">🔍</span>
              <div>
                <p className="logsense-title">Feil sendt til LogSenseAI</p>
                <p className="logsense-sub">Rotårsak analyseres automatisk</p>
              </div>
            </div>
            <a
              href={LOGSENSE_URL}
              target="_blank"
              rel="noreferrer"
              className="logsense-btn"
            >
              Vis analyse {'>'}
            </a>
          </div>
        </>
      )}
    </section>
  );
}
