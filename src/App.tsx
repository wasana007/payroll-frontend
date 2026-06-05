import { useState, useEffect, useRef } from 'react';
import { API_URL, POLL_INTERVAL, POLL_MAX } from './config';
import { formatTid } from './utils/formatTid';
import PayrollForm from './components/PayrollForm';
import StatusCard from './components/StatusCard';
import HistoryTable from './components/HistoryTable';
import './App.css';
import type { Status, PayrollResult, HistoryItem } from './types/payroll';

interface FormState {
  ansattId: string;
  loenn: string;
  maaned: string;
}

export default function App() {
  const [form, setForm] = useState<FormState>({
    ansattId: '',
    loenn: '',
    maaned: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [correlationId, setCorrelationId] = useState<string | null>(null);
  const [result, setResult] = useState<PayrollResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    [],
  );

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const startPolling = (corrId: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/${corrId}`);
        const data: PayrollResult = await res.json();
        setStatus(data.status);

        if (data.status === 'COMPLETED') {
          setResult(data);
          setLoading(false);
          stopPolling();
          setHistory((prev) => [
            {
              employeeId: data.employeeId,
              salary: data.salary,
              tax: data.tax,
              month: data.month,
              status: 'COMPLETED',
              correlationId: corrId,
              tid: formatTid(),
            },
            ...prev,
          ]);
        }
        if (data.status === 'FAILED') {
          setResult(data);
          setLoading(false);
          stopPolling();
          setHistory((prev) => [
            {
              employeeId: data.employeeId,
              salary: data.salary,
              tax: '-',
              month: data.month,
              status: 'FAILED',
              correlationId: corrId,
              tid: formatTid(),
            },
            ...prev,
          ]);
        }
      } catch {}
      if (attempts >= POLL_MAX) {
        setStatus('FAILED');
        setLoading(false);
        stopPolling();
      }
    }, POLL_INTERVAL);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isValid = !!(
    form.ansattId.trim() &&
    parseFloat(form.loenn) > 0 &&
    form.maaned.trim()
  );

  const sendLoenn = async () => {
    if (!isValid) return;
    setLoading(true);
    setStatus(null);
    setResult(null);
    setCorrelationId(null);
    stopPolling();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.ansattId.trim(),
          salary: parseFloat(form.loenn),
          month: form.maaned.trim(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { correlationId: string } = await res.json();
      setCorrelationId(data.correlationId);
      setStatus('PENDING');
      setForm({ ansattId: '', loenn: '', maaned: '' });
      startPolling(data.correlationId);
    } catch (err) {
      setStatus('FAILED');
      setResult({ error: (err as Error).message } as PayrollResult);
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo-mark">L</div>
          <div>
            <h1 className="site-title">Lønnsrapportering</h1>
            <p className="site-sub">
              Java 21 · Spring Boot 3 · Kafka · React · MySQL
            </p>
          </div>
        </div>
        <div className="badge">
          <span className="pulse-dot" />
        </div>
      </header>

      <main className="main">
        <PayrollForm
          form={form}
          onChange={handleChange}
          onSubmit={sendLoenn}
          loading={loading}
          isValid={isValid}
        />
        <StatusCard
          status={status}
          correlationId={correlationId}
          result={result}
        />
        <HistoryTable history={history} />
      </main>

      <footer className="footer">
        <span>v1.0.0</span>
        <span>·</span>
        <span>localhost:8282</span>
        <span>·</span>
        <span>kafka:9092</span>
        <span>·</span>
        <span>MySQL:3307</span>
      </footer>
    </div>
  );
}
