import React, { useMemo, useState } from 'react';
import { ChevronDown, Download, Filter, Pin, Printer } from 'lucide-react';
import { Actions, DetailBlock, DetailGrid, Empty, IconButton, Modal, PanelActions, SearchableSelect, SearchBox, Table } from '../components/ui';
import { PaymentDrawer } from '../components/drawers';
import { companies, emptyPayment, owners, paymentMethods, paymentStatuses } from '../data/crmData';
import { formatCurrency, paymentToForm } from '../utils/format';

export default function PaymentsPage({ payments, setPayments, setMessage }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All', method: 'All', company: 'All', salesperson: 'All', from: '', to: '' });
  const [drawer, setDrawer] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyPayment);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rows = useMemo(() => payments
    .filter((payment) => `${payment.invoice} ${payment.company} ${payment.opportunity}`.toLowerCase().includes(search.toLowerCase()))
    .filter((payment) => filters.status === 'All' || payment.status === filters.status)
    .filter((payment) => filters.method === 'All' || payment.method === filters.method)
    .filter((payment) => filters.company === 'All' || payment.company === filters.company)
    .filter((payment) => filters.salesperson === 'All' || payment.salesperson === filters.salesperson)
    .filter((payment) => !filters.from || payment.date >= filters.from)
    .filter((payment) => !filters.to || payment.date <= filters.to), [payments, search, filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const openRecord = () => { setDrawer('record'); setSelected(null); setForm({ ...emptyPayment, invoice: `INV-2026-${String(payments.length + 1).padStart(3, '0')}` }); setMessage(''); };
  const openView = (payment) => { setDrawer('view'); setSelected(payment); setForm(paymentToForm(payment)); setMessage(''); };
  const openEdit = (payment) => { setDrawer('edit'); setSelected(payment); setForm(paymentToForm(payment)); setMessage(''); };

  const save = (event) => {
    event.preventDefault();
    if (!form.company.trim() || !form.opportunity.trim() || !String(form.amount).trim() || !String(form.paid).trim() || !form.method.trim() || !form.date.trim()) {
      setMessage('Company, Opportunity, Total Amount, Amount Received, Payment Method, and Payment Date are required.');
      return;
    }
    const amount = Number(form.amount);
    const paid = Number(form.paid);
    if (paid > amount) {
      setMessage('Payment processing failed.');
      return;
    }
    const status = paid === 0 ? 'Unpaid' : paid < amount ? 'Partially Paid' : 'Paid';
    const payment = { ...form, amount, paid, balance: amount - paid, status, customer: 'Customer', salesperson: 'Ali Raza', id: selected?.id || `PAY-${4000 + payments.length + 1}` };
    if (drawer === 'edit' && selected) {
      setPayments((current) => current.map((item) => item.id === selected.id ? payment : item));
      setMessage('Payment updated successfully.');
    } else {
      setPayments((current) => [payment, ...current]);
      setMessage('Payment recorded successfully.');
    }
    setDrawer(null);
  };

  return (
    <section className="page salesforce-leads salesforce-payments">
      <div className="sf-list-head">
        <div className="sf-title-wrap">
          <div className="sf-object-icon payment-icon"><span /></div>
          <div>
            <p>Payments</p>
            <button type="button" className="sf-list-title">
              All Payments <ChevronDown size={18} />
            </button>
          </div>
          <button type="button" className="sf-pin" aria-label="Pin list"><Pin size={15} /></button>
        </div>
        <div className="sf-action-strip">
          <button className="sf-action" onClick={openRecord}>Record Payment</button>
        </div>
      </div>
      <div className="toolbar lead-toolbar payment-list-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search invoice, company, or opportunity" />
        <button type="button" className={`sf-filter-toggle ${filtersOpen ? 'active' : ''}`} aria-label="Payment filters" onClick={() => setFiltersOpen(true)}><Filter size={18} /></button>
      </div>
      <div className="sf-list-panel">
        <Table
          columns={[['serialNo', 'SR#'], ['invoice', 'Invoice No'], ['date', 'Date'], ['company', 'Company'], ['opportunity', 'Opportunity'], ['amount', 'Amount'], ['paid', 'Paid'], ['balance', 'Balance'], ['status', 'Status']]}
          rows={rows.map((payment, index) => ({ ...payment, serialNo: index + 1, amount: formatCurrency(payment.amount), paid: formatCurrency(payment.paid), balance: formatCurrency(payment.balance) }))}
          onRowClick={(payment) => openView(payments.find((item) => item.id === payment.id) || payment)}
          renderCell={(payment, key, value) => {
            if (key === 'status') {
              return <span className={`pill ${String(value).toLowerCase()}`}><HighlightedText text={value} query={search} /></span>;
            }
            if (key === 'serialNo') return value;
            return <HighlightedText text={value || '-'} query={search} />;
          }}
          actions={(payment) => {
            const original = payments.find((item) => item.id === payment.id) || payment;
            return (
              <Actions>
                <IconButton label="Download Invoice" onClick={() => setMessage('Invoice download requested.')}><Download size={15} /></IconButton>
                <IconButton label="Print Receipt" onClick={() => setMessage('Receipt print requested.')}><Printer size={15} /></IconButton>
              </Actions>
            );
          }}
          empty={<Empty title="No Payment Records Found" action="Payments will appear after opportunity is won" onAction={() => setMessage('No Payment Records Found - Payments will appear after opportunity is won.')} />}
        />
      </div>
      {filtersOpen && (
        <Modal title="Filters" onClose={() => setFiltersOpen(false)}>
          <div className="sf-filter-popup">
            <div className="sf-filter-popup-grid">
              <SearchableSelect className="sf-filter-card" label="Status" value={filters.status} options={paymentStatuses} onChange={(status) => updateFilter('status', status)} placeholder="Search status" />
              <SearchableSelect className="sf-filter-card" label="Method" value={filters.method} options={paymentMethods} onChange={(method) => updateFilter('method', method)} placeholder="Search method" />
              <SearchableSelect className="sf-filter-card" label="Company" value={filters.company} options={companies} onChange={(company) => updateFilter('company', company)} placeholder="Search company" />
              <SearchableSelect className="sf-filter-card" label="Salesperson" value={filters.salesperson} options={owners} onChange={(salesperson) => updateFilter('salesperson', salesperson)} placeholder="Search salesperson" />
              <div className="sf-filter-card date-range-card wide">
                <span>Date Range</span>
                <input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} />
                <input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} />
              </div>
            </div>
            <div className="sf-filter-links">
              <button type="button" onClick={() => setFilters({ status: 'All', method: 'All', company: 'All', salesperson: 'All', from: '', to: '' })}>Remove All</button>
            </div>
            <PanelActions>
              <button className="button secondary" onClick={() => setFiltersOpen(false)}>Cancel</button>
              <button className="button primary" onClick={() => setFiltersOpen(false)}>Apply</button>
            </PanelActions>
          </div>
        </Modal>
      )}
      {drawer === 'view' && selected && (
        <Modal title="Payment Details" onClose={() => setDrawer(null)}>
          <div className="stack">
            <DetailGrid items={[
              ['Invoice', selected.invoice],
              ['Company', selected.company],
              ['Opportunity', selected.opportunity],
              ['Customer', selected.customer],
              ['Salesperson', selected.salesperson],
              ['Total Amount', formatCurrency(selected.amount)],
              ['Paid', formatCurrency(selected.paid)],
              ['Remaining Balance', formatCurrency(selected.balance)],
              ['Method', selected.method],
              ['Reference', selected.reference || 'Not recorded'],
              ['Date', selected.date],
              ['Status', selected.status],
            ]} />
            <DetailBlock title="Payment History" text={`${selected.date}: ${formatCurrency(selected.paid)} recorded through ${selected.method}.`} />
            <PanelActions>
              <button className="button primary detail-edit-button" onClick={() => openEdit(selected)}>Edit</button>
            </PanelActions>
          </div>
        </Modal>
      )}
      {drawer === 'record' && (
        <Modal title="Record Payment" onClose={() => setDrawer(null)}>
          <PaymentEditForm form={form} setForm={setForm} onSubmit={save} onCancel={() => setDrawer(null)} submitLabel="Save Payment" />
        </Modal>
      )}
      {drawer === 'edit' && (
        <Modal title="Edit Payment" onClose={() => setDrawer(null)}>
          <PaymentEditForm form={form} setForm={setForm} onSubmit={save} onCancel={() => setDrawer(null)} submitLabel="Save Changes" />
        </Modal>
      )}
    </section>
  );
}

function PaymentEditForm({ form, setForm, onSubmit, onCancel, submitLabel }) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Company*</span>
        <input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
      </label>
      <label className="field">
        <span>Opportunity*</span>
        <input value={form.opportunity} onChange={(event) => setForm({ ...form, opportunity: event.target.value })} />
      </label>
      <label className="field">
        <span>Invoice Number</span>
        <input value={form.invoice} onChange={(event) => setForm({ ...form, invoice: event.target.value })} />
      </label>
      <label className="field">
        <span>Total Amount*</span>
        <input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
      </label>
      <label className="field">
        <span>Amount Received*</span>
        <input value={form.paid} onChange={(event) => setForm({ ...form, paid: event.target.value })} />
      </label>
      <SearchableSelect label="Payment Method*" value={form.method} options={paymentMethods.filter((item) => item !== 'All')} onChange={(method) => setForm({ ...form, method })} placeholder="Search method" />
      <label className="field">
        <span>Transaction Reference</span>
        <input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} />
      </label>
      <label className="field">
        <span>Payment Date*</span>
        <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        <small>Format: yyyy-mm-dd</small>
      </label>
      <label className="field wide">
        <span>Notes</span>
        <textarea rows="4" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
      </label>
      <PanelActions wide>
        <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="button primary">{submitLabel}</button>
      </PanelActions>
    </form>
  );
}

function HighlightedText({ text, query }) {
  const value = String(text ?? '');
  const term = query.trim();

  if (!term) return value;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = value.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, index) => part.toLowerCase() === term.toLowerCase()
        ? <mark key={`${part}-${index}`} className="search-highlight">{part}</mark>
        : part)}
    </>
  );
}
