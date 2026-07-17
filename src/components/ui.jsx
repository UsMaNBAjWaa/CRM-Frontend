import React from 'react';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</h3>
      <div className="mt-3 text-sm text-slate-300">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const tone = status === 'Approved' || status === 'Resolved' || status === 'Reviewed'
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : status === 'Rejected' || status === 'Closed'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

  return (
    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${tone}`}>
      {status}
    </span>
  );
}

export function PrimaryButton({ children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
    >
      {children}
    </button>
  );
}

export function TextInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || label}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
      />
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      <textarea
        rows="4"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || label}
        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
      />
    </div>
  );
}

export function DataTable({ columns, rows, renderActions }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                {column.label}
              </th>
            ))}
            {renderActions && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-slate-300">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {renderActions && <td className="px-4 py-3">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
