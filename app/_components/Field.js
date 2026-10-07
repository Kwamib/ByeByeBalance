'use client';

/** Labeled input in the concept's style. Keeps the typed text; parsing happens elsewhere. */
export default function Field({ id, label, value, onChange, error, type = 'number', ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        inputMode={type === 'number' ? 'decimal' : undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...rest}
      />
      {error && <span id={`${id}-err`} className="error">{error}</span>}
    </div>
  );
}
