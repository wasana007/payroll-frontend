import { useState, useEffect, useRef } from "react";
import { API_URL, LOGSENSE_URL, POLL_INTERVAL, POLL_MAX } from "./config";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    ansattId: "",
    loenn:    "",
    maaned:   "",
  });

  const [loading, setLoading]             = useState(false);
  const [status, setStatus]               = useState(null);
  const [correlationId, setCorrelationId] = useState(null);
  const [result, setResult]               = useState(null);
  const [history, setHistory]             = useState([]);
  const pollRef                           = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const stopPolling = () => clearInterval(pollRef.current);

  const startPolling = (corrId) => {
    let attempts = 0;

    pollRef.current = setInterval(async () => {
      attempts++;

      try {
        const res  = await fetch(`${API_URL}/${corrId}`);
        const data = await res.json();

        setStatus(data.status);

        if (data.status === "COMPLETED") {
          setResult(data);
          setLoading(false);
          stopPolling();
          setHistory((prev) => [{
            employeeId:    data.employeeId,
            salary:        data.salary,
            tax:           data.tax,
            month:         data.month,
            status:        "COMPLETED",
            correlationId: corrId,
            tid:           new Date().toLocaleTimeString(),
          }, ...prev]);
        }

        if (data.status === "FAILED") {
          setResult(data);
          setLoading(false);
          stopPolling();
          setHistory((prev) => [{
            employeeId:    data.employeeId,
            salary:        data.salary,
            tax:           "-",
            month:         data.month,
            status:        "FAILED",
            correlationId: corrId,
            tid:           new Date().toLocaleTimeString(),
          }, ...prev]);
        }
      } catch (e) {}

      if (attempts >= POLL_MAX) {
        setStatus("FAILED");
        setLoading(false);
        stopPolling();
      }
    }, POLL_INTERVAL);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const isValid = () =>
    form.ansattId.trim() &&
    parseFloat(form.loenn) > 0 &&
    form.maaned.trim();

  const toPayrollRequest = (f) => ({
    employeeId: f.ansattId.trim(),
    salary:     parseFloat(f.loenn),
    month:      f.maaned.trim(),
  });

  const sendLoenn = async () => {
    if (!isValid()) return;

    setLoading(true);
    setStatus(null);
    setResult(null);
    setCorrelationId(null);
    stopPolling();

    try {
      const res = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(toPayrollRequest(form)),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setCorrelationId(data.correlationId);
      setStatus("PENDING");
      setForm({ ansattId: "", loenn: "", maaned: "" });
      startPolling(data.correlationId);

    } catch (err) {
      setStatus("FAILED");
      setResult({ error: err.message });
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
            <p className="site-sub">JJava 21 · Spring Boot 3 · Kafka · React · MySQL</p>
          </div>
        </div>
        <div className="badge">
          <span className="pulse-dot" />
          Tilkoblet
        </div>
      </header>

      <main className="main">

        <section className="card form-card">
          <div className="card-label">💰 Send lønnsdata</div>
          <div className="grid-3">
            <div className="field">
              <label>Ansatt-ID</label>
              <input
                name="ansattId"
                value={form.ansattId}
                onChange={handleChange}
                placeholder="f.eks. A001"
              />
            </div>
            <div className="field">
              <label>Lønn (NOK)</label>
              <input
                name="loenn"
                type="number"
                value={form.loenn}
                onChange={handleChange}
                placeholder="f.eks. 55000"
              />
            </div>
            <div className="field">
              <label>Måned</label>
              <input
                name="maaned"
                value={form.maaned}
                onChange={handleChange}
                placeholder="f.eks. 2025-01"
              />
            </div>
          </div>
          <button
            className="submit-btn"
            onClick={sendLoenn}
            disabled={loading || !isValid()}
          >
            {loading
              ? <><span className="spinner" /> Behandler...</>
              : "Send lønnsdata"}
          </button>
        </section>

        {status && (
          <section className={`card status-card ${
            status === "COMPLETED" ? "ok"
            : status === "PENDING"  ? "pending"
            : "err"
          }`}>

            <div className="status-header">
              <span className="status-icon">
                {status === "COMPLETED" ? "✅" : status === "PENDING" ? "⏳" : "❌"}
              </span>
              <span className="status-title">
                {status === "COMPLETED" ? "Lønn behandlet"
                  : status === "PENDING" ? "Behandler via Kafka..."
                  : "Lønnsbehandling feilet"}
              </span>
              <span className={`status-badge ${status}`}>
                {status === "COMPLETED" ? "FULLFØRT"
                  : status === "PENDING" ? "BEHANDLER"
                  : "FEILET"}
              </span>
            </div>

            {status === "PENDING" && (
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

            {status === "COMPLETED" && result && (
              <div className="result-box ok">
                <div className="result-row">
                  <span>Ansatt-ID</span>
                  <span>{result.employeeId}</span>
                </div>
                <div className="result-row">
                  <span>Lønn</span>
                  <span>{Number(result.salary).toLocaleString()} kr</span>
                </div>
                <div className="result-row">
                  <span>Måned</span>
                  <span>{result.month}</span>
                </div>
                <div className="result-row">
                  <span>Fullført</span>
                  <span>{result.completedAt}</span>
                </div>
              </div>
            )}

            {status === "FAILED" && (
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
                    Vis analyse →
                  </a>
                </div>
              </>
            )}
          </section>
        )}

        {history.length > 0 && (
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
                      <td>{typeof h.salary === "number" ? h.salary.toLocaleString() + " kr" : h.salary}</td>
                      <td>{h.tax !== "-" && h.tax ? Number(h.tax).toFixed(2) + " kr" : "—"}</td>
                      <td>{h.month}</td>
                      <td>
                        <span className={`row-status ${h.status}`}>
                          {h.status === "COMPLETED" ? "✓" : "✗"} {h.status === "COMPLETED" ? "Fullført" : "Feilet"}
                        </span>
                      </td>
                      <td className="tid">{h.tid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>

      <footer className="footer">
        <span>v1.0.0</span><span>·</span>
        <span>localhost:8282</span><span>·</span>
        <span>kafka:9092</span><span>·</span>
        <span>MySQL:3307</span>
      </footer>

    </div>
  );
}

export default App;