import React, { useState } from 'react';
import { ArrowLeft, CheckCheck, ChevronDown, FileEdit, MoreHorizontal, RefreshCw, Settings, Table2, Trash2, XCircle } from 'lucide-react';
import { Confirm, DetailBlock, DetailGrid, HighlightedText, IconButton, Modal, PanelActions, SearchBox, SelectField, Table, TextArea, TextField } from '../components/ui';
import { companyRatings, companyTypes, emptyCompany, leadSources, owners } from '../data/crmData';
import { formatCurrency } from '../utils/format';

const columns = [
  ['serialNo', 'SR#'],
  ['id', 'Code'],
  ['name', 'Company'],
  ['type', 'Type'],
  ['rating', 'Rating'],
  ['industry', 'Industry'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['owner', 'Owner'],
];
const sortableKeys = ['id', 'name', 'type', 'rating', 'industry', 'phone', 'email', 'owner'];

export default function CompaniesPage({ companies, setCompanies, contacts, opportunities, setMessage }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(emptyCompany);
  const [selected, setSelected] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteCompany, setDeleteCompany] = useState(null);
  const [openActionId, setOpenActionId] = useState('');

  const nextCompanyId = (items = companies) => `CO${String(items.length + 1).padStart(3, '0')}`;
  const openCreate = () => {
    setSelected(null);
    setEditingCompany(null);
    setForm(emptyCompany);
    setModalMode('create');
  };
  const openEdit = (company) => {
    setEditingCompany(company);
    setForm(company);
    setModalMode('edit');
  };
  const saveCompany = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Company Name is required.');
      return;
    }
    if (modalMode === 'edit' && editingCompany) {
      const updatedCompany = { ...editingCompany, ...form };
      setCompanies((current) => current.map((company) => company.id === editingCompany.id ? updatedCompany : company));
      setSelected((current) => current?.id === editingCompany.id ? updatedCompany : current);
      setMessage('Company updated successfully.');
    } else {
      setCompanies((current) => [{ ...form, id: nextCompanyId(current) }, ...current]);
      setMessage('Company created successfully.');
    }
    setModalMode(null);
    setEditingCompany(null);
  };
  const relatedContacts = selected ? contacts.filter((contact) => contact.company === selected.name) : [];
  const relatedOpportunities = selected ? opportunities.filter((opportunity) => opportunity.company === selected.name) : [];
  const filteredCompanies = companies
    .filter((company) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [company.id, company.name, company.type, company.rating, company.industry, company.phone, company.email, company.owner]
        .some((value) => String(value || '').toLowerCase().includes(term));
    })
    .sort((a, b) => {
      const result = String(a[sortBy] || '').localeCompare(String(b[sortBy] || ''));
      return sortDirection === 'asc' ? result : -result;
    });
  const handleSort = (key) => {
    setSortBy(key);
    setSortDirection((current) => (sortBy === key && current === 'asc' ? 'desc' : 'asc'));
  };
  const selectRow = (id, checked) => setSelectedIds((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));
  const selectAll = (checked, rows) => setSelectedIds(checked ? rows.map((row) => row.id) : []);

  if (selected) {
    return (
      <section className="page salesforce-leads companies-page">
        <div className="sf-list-head">
          <div className="sf-title-block">
            <div className="sf-object-icon companies-icon">CO</div>
            <div>
              <span>Company Profile</span>
              <h2 className="enhanced-heading">{selected.id} - {selected.name}</h2>
            </div>
          </div>
          <div className="sf-actions">
            <button className="sf-action back-action" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Back</button>
            <button className="sf-action primary-action" onClick={() => openEdit(selected)}>Edit Company</button>
          </div>
        </div>
        <div className="company-profile full-profile-page">
          <DetailGrid items={[
            ['Company', selected.name],
            ['Type', selected.type],
            ['Rating', selected.rating],
            ['Industry', selected.industry],
            ['Email', selected.email || 'N/A'],
            ['Phone', selected.phone || 'N/A'],
            ['Website', selected.website || 'N/A'],
            ['Employees', selected.employees || 0],
            ['Annual Revenue', selected.annualRevenue ? formatCurrency(Number(selected.annualRevenue)) : 'N/A'],
            ['Owner', selected.owner || 'Unassigned'],
            ['Lead Source', selected.leadSource || 'N/A'],
          ]} />
          <DetailBlock title="Description" text={selected.description || 'No description provided.'} />
          <div className="profile-metrics">
            <div><span>Total Contacts</span><strong>{relatedContacts.length}</strong></div>
            <div><span>Won / Open Deals</span><strong>{relatedOpportunities.filter((item) => item.stage === 'Won').length} Won / {relatedOpportunities.filter((item) => item.stage !== 'Won').length} Open</strong></div>
            <div><span>Total Won Revenue</span><strong>{formatCurrency(relatedOpportunities.filter((item) => item.stage === 'Won').reduce((sum, item) => sum + item.value, 0))}</strong></div>
          </div>
          <RelatedTable title="Related Contacts" columns={['Name', 'Designation', 'Email', 'Phone']} rows={relatedContacts.map((contact) => [contact.contact, contact.designation, contact.email, contact.phone])} />
          <RelatedTable title="Related Opportunities" columns={['Deal Name', 'Stage', 'Value', 'Close Date']} rows={relatedOpportunities.map((opportunity) => [opportunity.name, opportunity.stage, formatCurrency(opportunity.value), opportunity.closeDate])} />
        </div>

        {modalMode && (
          <CompanyFormModal
            mode={modalMode}
            form={form}
            setForm={setForm}
            onClose={() => { setModalMode(null); setEditingCompany(null); }}
            onSubmit={saveCompany}
          />
        )}
      </section>
    );
  }

  return (
    <section className="page salesforce-leads companies-page">
      <div className="sf-list-head">
        <div className="sf-title-wrap">
          <div className="sf-object-icon"><span /></div>
          <div>
            <p>Companies</p>
            <button type="button" className="sf-list-title">
              All Companies <ChevronDown size={18} />
            </button>
          </div>
        </div>
        <div className="sf-action-strip">
          <button className="sf-action" onClick={openCreate}>Create Company</button>
        </div>
      </div>
      <div className="toolbar lead-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search this list..." />
        <IconButton label="List settings" onClick={() => setMessage('Company list settings opened.')}><Settings size={16} /></IconButton>
        <IconButton label="Display options" onClick={() => setMessage('Company display options opened.')}><Table2 size={16} /></IconButton>
        <IconButton label="Refresh list" onClick={() => setMessage('Company list refreshed successfully.')}><RefreshCw size={16} /></IconButton>
      </div>
      {selectedIds.length > 0 && (
        <div className="selected-bulk-banner">
          <div className="selected-bulk-left">
            <span className="selected-bulk-icon"><CheckCheck size={24} /></span>
            <strong>{selectedIds.length} compan{selectedIds.length === 1 ? 'y' : 'ies'} selected</strong>
          </div>
          <div className="selected-bulk-actions">
            <button className="bulk-cancel" onClick={() => setSelectedIds([])}><XCircle size={16} />Cancel Selected</button>
            <button className="bulk-delete" onClick={() => {
              setCompanies((current) => current.filter((company) => !selectedIds.includes(company.id)));
              setMessage(`${selectedIds.length} compan${selectedIds.length === 1 ? 'y' : 'ies'} moved to recycle bin.`);
              setSelectedIds([]);
            }}><Trash2 size={16} />Move to Recycle Bin</button>
          </div>
        </div>
      )}
      <div className="sf-list-panel">
        <Table
          columns={columns}
          rows={filteredCompanies.map((company, index) => ({ ...company, serialNo: index + 1 }))}
          onRowClick={setSelected}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          sortableKeys={sortableKeys}
          selectedIds={selectedIds}
          onSelectRow={selectRow}
          onSelectAll={selectAll}
          renderCell={(company, key, value) => (
            key === 'serialNo'
              ? <span className="table-link sr-link">{value}</span>
              : key === 'id' || key === 'name'
              ? <span className="link-cell"><HighlightedText text={value || '-'} query={search} /></span>
              : (
            key === 'type' || key === 'rating'
              ? <span className={`pill ${String(value).toLowerCase()}`}><HighlightedText text={value} query={search} /></span>
              : <HighlightedText text={value || '-'} query={search} />
              )
          )}
          actions={(company) => (
            <div className="action-menu-wrap">
              <IconButton label="Company actions" onClick={() => setOpenActionId((current) => current === company.id ? '' : company.id)}><MoreHorizontal size={16} /></IconButton>
              {openActionId === company.id && (
                <div className="row-action-menu">
                  <button type="button" onClick={() => { openEdit(company); setOpenActionId(''); }}><FileEdit size={15} />Edit</button>
                  <hr />
                  <button type="button" className="danger-menu-item" onClick={() => { setDeleteCompany(company); setOpenActionId(''); }}><Trash2 size={15} />Delete</button>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {modalMode && (
        <CompanyFormModal
          mode={modalMode}
          form={form}
          setForm={setForm}
          onClose={() => { setModalMode(null); setEditingCompany(null); }}
          onSubmit={saveCompany}
        />
      )}

      {deleteCompany && (
        <Confirm
          danger
          title="Delete Company"
          text={`Delete company "${deleteCompany.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteCompany(null)}
          onConfirm={() => {
            setCompanies((current) => current.filter((company) => company.id !== deleteCompany.id));
            setMessage('Company deleted successfully.');
            setDeleteCompany(null);
          }}
        />
      )}
    </section>
  );
}

function RelatedTable({ title, columns: tableColumns, rows }) {
  return (
    <div className="detail-block">
      <h4>{title}</h4>
      <table className="small-table">
        <thead>
          <tr>{tableColumns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, index) => (
            <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={`${title}-${index}-${cellIndex}`}>{cell || '-'}</td>)}</tr>
          )) : (
            <tr><td colSpan={tableColumns.length}>No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function CompanyFormModal({ mode, form, setForm, onClose, onSubmit }) {
  return (
    <Modal title={mode === 'edit' ? 'Edit Company' : 'Create New Company'} onClose={onClose}>
      <form className="form-grid" onSubmit={onSubmit}>
        <TextField label="Company Name*" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <TextField label="Company Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
        <TextField label="Company Phone" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
        <TextField label="Website URL" value={form.website} onChange={(website) => setForm({ ...form, website })} />
        <SelectField label="Type" value={form.type} options={companyTypes} onChange={(type) => setForm({ ...form, type })} />
        <SelectField label="Rating" value={form.rating} options={companyRatings} onChange={(rating) => setForm({ ...form, rating })} />
        <TextField label="Industry" value={form.industry} onChange={(industry) => setForm({ ...form, industry })} />
        <TextField label="Annual Revenue" value={form.annualRevenue} onChange={(annualRevenue) => setForm({ ...form, annualRevenue })} />
        <TextField label="Employees" value={form.employees} onChange={(employees) => setForm({ ...form, employees })} />
        <SelectField label="Assign Owner" value={form.owner} options={owners.filter((item) => item !== 'All')} onChange={(owner) => setForm({ ...form, owner })} />
        <SelectField label="Lead Source" value={form.leadSource} options={leadSources.filter((item) => item !== 'All')} onChange={(leadSource) => setForm({ ...form, leadSource })} />
        <TextArea wide label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <PanelActions wide>
          <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="button primary">{mode === 'edit' ? 'Save Changes' : 'Create Company'}</button>
        </PanelActions>
      </form>
    </Modal>
  );
}
