interface PayrollFormProps {
  form: {
    ansattId: string;
    loenn: number | string;
    maaned: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  isValid: boolean;
}

export default function PayrollForm({ form, onChange, onSubmit, loading, isValid }: PayrollFormProps) {
  return (
    <section className="card form-card">
      <div className="card-label">💰 Send lønnsdata</div>
      <div className="grid-3">
        <div className="field">
          <label>Ansatt-ID</label>
          <input
            name="ansattId"
            value={form.ansattId}
            onChange={onChange}
            placeholder="f.eks. A001"
          />
        </div>
        <div className="field">
          <label>Lønn (NOK)</label>
          <input
            name="loenn"
            type="number"
            value={form.loenn}
            onChange={onChange}
            placeholder="f.eks. 55000"
          />
        </div>
        <div className="field">
          <label>Måned</label>
          <input
            name="maaned"
            value={form.maaned}
            onChange={onChange}
            placeholder="f.eks. 2025-01"
          />
        </div>
      </div>
      <button
        className="submit-btn"
        onClick={onSubmit}
        disabled={loading || !isValid}
      >
        {loading
          ? <><span className="spinner" /> Behandler...</>
          : "Send lønnsdata"}
      </button>
    </section>
  );
}