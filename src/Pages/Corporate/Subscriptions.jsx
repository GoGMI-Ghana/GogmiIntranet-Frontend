import { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, Plus, Search, AlertCircle, CalendarClock, Wallet, Receipt, Pencil, Trash2,
  X, FileSpreadsheet, ExternalLink, Paperclip, RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiFetch } from '../../config/api';

const NAVY = '#132552';
const RUST = '#8e3400';
const BRAND_GRADIENT = `linear-gradient(135deg, ${NAVY} 0%, ${RUST} 100%)`;

const CATEGORIES = ['Hosting', 'Domain', 'Email & Productivity', 'Software', 'Cloud & Storage', 'Design & Media', 'Security', 'Communications', 'Other'];
const CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one-time', label: 'One-time' }
];
const STATUSES = ['Active', 'Paused', 'Cancelled'];
const CURRENCIES = ['USD', 'GHS', 'EUR', 'GBP'];
const PAYMENT_METHODS = ['Company card', 'Bank transfer', 'Mobile money', 'Cash', 'PayPal'];

const cycleLabel = (value) => CYCLES.find((c) => c.value === value)?.label || value;
const todayISO = () => new Date().toISOString().slice(0, 10);

const money = (amount, currency) => {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency, minimumFractionDigits: 2 }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};

const formatDate = (date) =>
  date ? new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

// Plain-language renewal timing, e.g. "in 5 days" or "3 days overdue"
const renewalText = (s) => {
  if (s.days_until_renewal === null || s.days_until_renewal === undefined) return '';
  const d = s.days_until_renewal;
  if (d === 0) return 'today';
  if (d < 0) return `${-d} day${d === -1 ? '' : 's'} overdue`;
  return `in ${d} day${d === 1 ? '' : 's'}`;
};

const fieldClass = 'px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#132552]/15';
const inputClass = `w-full ${fieldClass}`;
const buttonClass = 'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50';

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-1">{hint}</span>}
    </label>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700',
    Paused: 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-gray-100 text-gray-500'
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.Cancelled}`}>{status}</span>;
}

// One total per currency (amounts in different currencies are never added together)
function CostCard({ label, icon, note, totals, field }) {
  const Icon = icon;
  const shown = totals.filter((b) => b[field] !== 0);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      {shown.length === 0 ? (
        <div className="text-2xl font-semibold text-gray-300">—</div>
      ) : shown.map((b) => (
        <div key={b.currency} className="text-xl font-semibold tabular-nums text-gray-900 leading-snug">{money(b[field], b.currency)}</div>
      ))}
      <div className="text-xs text-gray-400 mt-1">{note}</div>
    </div>
  );
}

function RenewalCell({ subscription }) {
  const s = subscription;
  if (!s.next_renewal_date) return <span className="text-gray-400">—</span>;
  const tone = s.renewal_state === 'overdue' ? 'text-red-600' : s.renewal_state === 'due-soon' ? 'text-amber-700' : 'text-gray-500';
  return (
    <div>
      <div className="text-gray-900">{formatDate(s.next_renewal_date)}</div>
      {s.status === 'Active' && <div className={`text-xs ${tone}`}>{renewalText(s)}</div>}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} my-8`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" aria-label="Close"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '', provider: '', category: 'Hosting', billing_cycle: 'annually', amount: '', currency: 'USD',
  start_date: '', next_renewal_date: '', auto_renew: true, payment_method: '', account_email: '',
  website_url: '', owner: '', status: 'Active', notes: ''
};

function SubscriptionForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (initial ? { ...emptyForm, ...Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ''])) } : emptyForm));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = Object.fromEntries(Object.keys(emptyForm).map((k) => [k, form[k]]));
      const response = await apiFetch(initial ? `/api/subscriptions/${initial.id}` : '/api/subscriptions', {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Could not save');
      onSaved();
    } catch (err) {
      setError(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Service name *"><input className={inputClass} value={form.name} onChange={set('name')} placeholder="e.g. Website hosting" required /></Field>
        <Field label="Provider"><input className={inputClass} value={form.provider} onChange={set('provider')} placeholder="e.g. Hostinger" /></Field>
        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Billing cycle">
          <select className={inputClass} value={form.billing_cycle} onChange={set('billing_cycle')}>
            {CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Amount per cycle *">
          <input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} required />
        </Field>
        <Field label="Currency">
          <input className={inputClass} list="subscription-currencies" value={form.currency} onChange={set('currency')} maxLength={3} required />
        </Field>
        <Field label="Start date"><input className={inputClass} type="date" value={form.start_date} onChange={set('start_date')} /></Field>
        <Field label="Next renewal / due date" hint={form.billing_cycle === 'one-time' ? 'Optional for one-time purchases' : undefined}>
          <input className={inputClass} type="date" value={form.next_renewal_date} onChange={set('next_renewal_date')} />
        </Field>
        <Field label="Payment method">
          <input className={inputClass} list="subscription-payment-methods" value={form.payment_method} onChange={set('payment_method')} placeholder="e.g. Company card ending 1234" />
        </Field>
        <Field label="Responsible person"><input className={inputClass} value={form.owner} onChange={set('owner')} /></Field>
        <Field label="Account login email" hint="Never record passwords here">
          <input className={inputClass} type="email" value={form.account_email} onChange={set('account_email')} />
        </Field>
        <Field label="Website / dashboard link"><input className={inputClass} type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://" /></Field>
        <Field label="Status">
          <select className={inputClass} value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700 sm:mt-6">
          <input type="checkbox" checked={form.auto_renew} onChange={set('auto_renew')} className="rounded border-gray-300" />
          Renews automatically
        </label>
      </div>
      <Field label="Notes"><textarea className={inputClass} rows={3} value={form.notes} onChange={set('notes')} /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className={buttonClass}>Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50" style={{ background: BRAND_GRADIENT }}>
          {saving ? 'Saving...' : initial ? 'Save changes' : 'Add subscription'}
        </button>
      </div>
    </form>
  );
}

function PaymentsPanel({ subscription, onChanged }) {
  const recurring = subscription.billing_cycle !== 'one-time';
  const blank = () => ({
    paid_on: todayISO(), amount: String(subscription.amount ?? ''), currency: subscription.currency,
    reference: '', payment_method: subscription.payment_method || '', notes: '', advance_renewal: recurring
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [receipt, setReceipt] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const load = async () => {
    setLoading(true);
    try {
      const data = await (await apiFetch(`/api/subscriptions/${subscription.id}/payments`)).json();
      if (!data.success) throw new Error(data.message);
      setPayments(data.payments);
    } catch (err) {
      setError(err.message || 'Could not load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription.id]);

  const record = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, String(v)));
      if (receipt) body.append('receipt', receipt);
      const data = await (await apiFetch(`/api/subscriptions/${subscription.id}/payments`, { method: 'POST', body })).json();
      if (!data.success) throw new Error(data.message || 'Could not record payment');
      setForm(blank());
      setReceipt(null);
      setFileKey((k) => k + 1);
      await load();
      onChanged();
    } catch (err) {
      setError(err.message || 'Could not record payment');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (payment) => {
    if (!window.confirm(`Delete the payment of ${money(payment.amount, payment.currency)} on ${formatDate(payment.paid_on)}?`)) return;
    const data = await (await apiFetch(`/api/subscriptions/payments/${payment.id}`, { method: 'DELETE' })).json();
    if (!data.success) return setError(data.message || 'Could not delete payment');
    await load();
    onChanged();
  };

  const downloadReceipt = async (payment) => {
    const response = await apiFetch(`/api/subscriptions/payments/${payment.id}/receipt`);
    if (!response.ok) return setError('Could not download the receipt');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = payment.receipt_original_name || 'receipt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        {money(subscription.amount, subscription.currency)} {cycleLabel(subscription.billing_cycle).toLowerCase()}
        {subscription.next_renewal_date && <> · next renewal {formatDate(subscription.next_renewal_date)}</>}
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      <form onSubmit={record} className="rounded-xl border border-gray-200 p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Record a payment</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Date paid"><input className={inputClass} type="date" value={form.paid_on} onChange={set('paid_on')} required /></Field>
          <Field label="Amount"><input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} required /></Field>
          <Field label="Currency"><input className={inputClass} list="subscription-currencies" value={form.currency} onChange={set('currency')} maxLength={3} required /></Field>
          <Field label="Reference / invoice no."><input className={inputClass} value={form.reference} onChange={set('reference')} /></Field>
          <Field label="Paid with"><input className={inputClass} list="subscription-payment-methods" value={form.payment_method} onChange={set('payment_method')} /></Field>
          <Field label="Receipt (PDF or image, max 10 MB)">
            <input key={fileKey} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setReceipt(e.target.files[0] || null)} className="block w-full text-sm text-gray-600 file:mr-2 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-gray-100 file:text-sm" />
          </Field>
        </div>
        <Field label="Notes"><input className={inputClass} value={form.notes} onChange={set('notes')} /></Field>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {recurring ? (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.advance_renewal} onChange={set('advance_renewal')} className="rounded border-gray-300" />
              Move the next renewal date forward one {subscription.billing_cycle === 'monthly' ? 'month' : subscription.billing_cycle === 'quarterly' ? 'quarter' : 'year'}
            </label>
          ) : <span />}
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-50" style={{ background: BRAND_GRADIENT }}>
            {saving ? 'Saving...' : 'Record payment'}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Payment history</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-400">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Reference</th>
                  <th className="text-left px-4 py-2 font-medium">Paid with</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {formatDate(p.paid_on)}
                      {p.notes && <div className="text-xs text-gray-400">{p.notes}</div>}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">{money(p.amount, p.currency)}</td>
                    <td className="px-4 py-2 text-gray-600">{p.reference || '—'}</td>
                    <td className="px-4 py-2 text-gray-600">{p.payment_method || '—'}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end gap-1">
                        {p.has_receipt && (
                          <button onClick={() => downloadReceipt(p)} className="p-1.5 rounded hover:bg-gray-100" title="Download receipt" aria-label="Download receipt">
                            <Paperclip className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                        <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-red-50" title="Delete payment" aria-label="Delete payment">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Active');
  const [editing, setEditing] = useState(null); // null | 'new' | subscription
  const [paymentsFor, setPaymentsFor] = useState(null);

  const load = async () => {
    setError('');
    try {
      const data = await (await apiFetch('/api/subscriptions')).json();
      if (!data.success) throw new Error(data.message || 'Could not load subscriptions');
      setSubscriptions(data.subscriptions);
      setSummary(data.summary);
      setPaymentsFor((current) => (current ? data.subscriptions.find((s) => s.id === current.id) || null : null));
    } catch (err) {
      setError(err.message || 'Could not load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscriptions.filter((s) =>
      (!status || s.status === status) &&
      (!category || s.category === category) &&
      (!q || [s.name, s.provider, s.owner, s.account_email, s.notes].some((v) => v && v.toLowerCase().includes(q)))
    );
  }, [subscriptions, search, category, status]);

  const remove = async (s) => {
    const warning = s.payments_count ? ` Its ${s.payments_count} recorded payment${s.payments_count === 1 ? '' : 's'} and receipts will be deleted too. To keep the history, set its status to Cancelled instead.` : '';
    if (!window.confirm(`Delete "${s.name}"?${warning}`)) return;
    const data = await (await apiFetch(`/api/subscriptions/${s.id}`, { method: 'DELETE' })).json();
    if (!data.success) return setError(data.message || 'Could not delete');
    load();
  };

  const exportExcel = () => {
    const rows = visible.map((s) => ({
      Service: s.name,
      Provider: s.provider || '',
      Category: s.category,
      'Billing cycle': cycleLabel(s.billing_cycle),
      Amount: s.amount,
      Currency: s.currency,
      'Monthly cost': s.monthly_cost,
      'Annual cost': s.annual_cost,
      'Next renewal': s.next_renewal_date || '',
      'Auto-renew': s.auto_renew ? 'Yes' : 'No',
      'Last payment': s.last_payment ? `${s.last_payment.paid_on} (${s.last_payment.amount} ${s.last_payment.currency})` : '',
      'Payment method': s.payment_method || '',
      'Responsible person': s.owner || '',
      'Account email': s.account_email || '',
      Link: s.website_url || '',
      Status: s.status,
      Notes: s.notes || ''
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Subscriptions');
    if (summary?.by_currency.length) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary.by_currency.map((b) => ({
        Currency: b.currency, 'Monthly cost (active)': b.monthly, 'Annual cost (active)': b.annual, 'Paid this year': b.paid_this_year
      }))), 'Totals');
    }
    XLSX.writeFile(wb, `subscriptions-${todayISO()}.xlsx`);
  };

  const attention = summary ? summary.overdue + summary.due_soon : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <datalist id="subscription-currencies">{CURRENCIES.map((c) => <option key={c} value={c} />)}</datalist>
      <datalist id="subscription-payment-methods">{PAYMENT_METHODS.map((m) => <option key={m} value={m} />)}</datalist>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments &amp; Subscriptions</h1>
            <p className="text-gray-500 mt-1">Services GoGMI pays for (hosting, domains, software and more), their costs and renewal dates</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { setLoading(true); load(); }} className={buttonClass} title="Reload">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={exportExcel} disabled={!visible.length} className={buttonClass}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => setEditing('new')} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white" style={{ background: BRAND_GRADIENT }}>
              <Plus className="w-4 h-4" /> Add subscription
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Active services</span>
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-semibold tabular-nums text-gray-900">{summary.active}</div>
              <div className="text-xs text-gray-400 mt-1">{summary.total} recorded in total</div>
            </div>
            {[
              ['Monthly cost', 'monthly', Wallet, 'Active services, per month'],
              ['Annual cost', 'annual', CalendarClock, 'Active services, per year'],
              ['Paid this year', 'paid_this_year', Receipt, 'From recorded payments']
            ].map(([label, key, icon, note]) => (
              <CostCard key={key} label={label} icon={icon} note={note} totals={summary.by_currency} field={key} />
            ))}
          </div>
        )}

        {summary && attention > 0 && (
          <div className="bg-white rounded-xl border border-amber-200 mb-8 overflow-hidden">
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-sm font-semibold text-amber-900">
              {summary.overdue > 0 && <span className="text-red-700">{summary.overdue} overdue</span>}
              {summary.overdue > 0 && summary.due_soon > 0 && ' · '}
              {summary.due_soon > 0 && <span>{summary.due_soon} due in the next {summary.due_soon_days} days</span>}
            </div>
            <ul className="divide-y divide-gray-100">
              {summary.upcoming.map((u) => {
                const s = subscriptions.find((x) => x.id === u.id);
                return (
                  <li key={u.id} className="px-6 py-3 flex items-center justify-between gap-3 flex-wrap text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                      {u.provider && <span className="text-gray-500"> · {u.provider}</span>}
                      <div className={`text-xs ${u.days_until_renewal < 0 ? 'text-red-600' : 'text-amber-700'}`}>
                        {formatDate(u.next_renewal_date)} ({renewalText(u)}){u.auto_renew ? ' · renews automatically' : ' · manual renewal'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-gray-900">{money(u.amount, u.currency)}</span>
                      {s && <button onClick={() => setPaymentsFor(s)} className={buttonClass}><Receipt className="w-4 h-4" /> Record payment</button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className={`${inputClass} pl-9`} placeholder="Search service, provider, person..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {loading && !subscriptions.length ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading subscriptions...</div>
          ) : visible.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-gray-500">{subscriptions.length ? 'No subscriptions match these filters.' : 'No subscriptions recorded yet.'}</p>
              {!subscriptions.length && (
                <button onClick={() => setEditing('new')} className="mt-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white" style={{ background: BRAND_GRADIENT }}>
                  <Plus className="w-4 h-4" /> Add the first one
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Service</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-right px-4 py-3 font-medium">Cost</th>
                    <th className="text-left px-4 py-3 font-medium">Next renewal</th>
                    <th className="text-left px-4 py-3 font-medium">Last paid</th>
                    <th className="text-left px-4 py-3 font-medium">Responsible</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 flex items-center gap-1.5">
                          {s.name}
                          {s.website_url && (
                            <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700" title="Open website" aria-label={`Open ${s.name} website`}>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{[s.provider, s.account_email].filter(Boolean).join(' · ')}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.category}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="tabular-nums text-gray-900">{money(s.amount, s.currency)}</div>
                        <div className="text-xs text-gray-500">{cycleLabel(s.billing_cycle)}{s.auto_renew && s.billing_cycle !== 'one-time' ? ' · auto' : ''}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><RenewalCell subscription={s} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                        {s.last_payment ? (
                          <>
                            <div>{formatDate(s.last_payment.paid_on)}</div>
                            <div className="text-xs text-gray-400 tabular-nums">{money(s.last_payment.amount, s.last_payment.currency)}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.owner || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setPaymentsFor(s)} className="p-1.5 rounded hover:bg-gray-100" title="Payments" aria-label={`Payments for ${s.name}`}>
                            <Receipt className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => setEditing(s)} className="p-1.5 rounded hover:bg-gray-100" title="Edit" aria-label={`Edit ${s.name}`}>
                            <Pencil className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-red-50" title="Delete" aria-label={`Delete ${s.name}`}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Totals are shown per currency and are not converted. Receipts can only be downloaded by Corporate Affairs and Directorate staff.
        </p>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add subscription' : `Edit ${editing.name}`} onClose={() => setEditing(null)}>
          <SubscriptionForm
            initial={editing === 'new' ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); load(); }}
          />
        </Modal>
      )}

      {paymentsFor && (
        <Modal title={`Payments: ${paymentsFor.name}`} onClose={() => setPaymentsFor(null)} wide>
          <PaymentsPanel subscription={paymentsFor} onChanged={load} />
        </Modal>
      )}
    </div>
  );
}
