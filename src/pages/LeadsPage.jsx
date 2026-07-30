import React, { useEffect, useMemo, useState } from 'react';
import {
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  Columns3,
  Download,
  Edit3,
  Eye,
  FileText,
  Mail,
  MoreHorizontal,
  Phone,
  PlusCircle,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import {
  defaultLeadColumns,
  leadColumns,
  leadDateOptions,
  leadOwnerOptions,
  leadPriorityOptions,
  leadSourceOptions,
  leadStatusOptions,
  mockLeads,
} from '../data/leads';

const tabs = ['All Leads', 'New', 'Qualified', 'Contacted', 'Proposal Sent'];
const priorityRank = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
const statusRank = { New: 1, Contacted: 2, Qualified: 3, 'Proposal Sent': 4, Negotiation: 5, Converted: 6, Lost: 7 };

const blankLeadForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  source: 'Website',
  owner: 'Ali Raza',
  priority: 'Medium',
  status: 'New',
  estimatedValue: '',
  expectedCloseDate: '',
  notes: '',
};

export default function LeadsPage({ setLeads, setMessage }) {
  const [leads, setLocalLeads] = useState(mockLeads);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'All Statuses', owner: 'All Owners', priority: 'All Priorities', source: 'All Sources', dateRange: 'Any Time' });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [activeTab, setActiveTab] = useState('All Leads');
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState(defaultLeadColumns);
  const [draftColumns, setDraftColumns] = useState(defaultLeadColumns);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [actionLeadId, setActionLeadId] = useState(null);
  const [detailsLead, setDetailsLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingLead, setDeletingLead] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(blankLeadForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    updateLeads(leads);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setColumnsOpen(false);
      setExportOpen(false);
      setActionLeadId(null);
      setDetailsLead(null);
      setDeletingLead(null);
      closeForm();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const showToast = (text) => setMessage?.(text);

  const updateLeads = (nextLeads) => {
    setLocalLeads(nextLeads);
    setLeads?.(nextLeads.map((lead) => ({
      id: lead.id,
      clientId: lead.clientId,
      date: lead.createdDate,
      customer: lead.customer,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      owner: lead.owner,
      priority: lead.priority,
      status: lead.status,
      leadValue: lead.estimatedValue,
      lastActivity: lead.lastActivity,
      nextFollowUp: lead.upcomingFollowUp,
    })));
  };

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads
      .filter((lead) => {
        if (!term) return true;
        return [lead.clientId, lead.customer, lead.company, lead.phone, lead.email, lead.owner].some((value) => String(value).toLowerCase().includes(term));
      })
      .filter((lead) => filters.status === 'All Statuses' || lead.status === filters.status)
      .filter((lead) => filters.owner === 'All Owners' || lead.owner === filters.owner)
      .filter((lead) => filters.priority === 'All Priorities' || lead.priority === filters.priority)
      .filter((lead) => filters.source === 'All Sources' || lead.source === filters.source)
      .filter((lead) => {
        if (filters.dateRange !== 'Custom Range') return true;
        if (dateRange.from && lead.createdDate < dateRange.from) return false;
        if (dateRange.to && lead.createdDate > dateRange.to) return false;
        return true;
      })
      .filter((lead) => activeTab === 'All Leads' || lead.status === activeTab)
      .sort((a, b) => compareLeads(a, b, sortBy, sortDirection));
  }, [activeTab, dateRange, filters, leads, search, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * rowsPerPage;
  const pageRows = filteredLeads.slice(pageStart, pageStart + rowsPerPage);
  const activeFilterCount = Object.values(filters).filter((value) => !String(value).startsWith('All') && value !== 'Any Time').length + (search ? 1 : 0);
  const allVisibleSelected = pageRows.length > 0 && pageRows.every((lead) => selectedIds.includes(lead.id));
  const displayColumns = leadColumns.filter((column) => visibleColumns.includes(column.key) || column.locked);
  const hasEmailHidden = !visibleColumns.includes('email');

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortBy((current) => {
      if (current === key) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        return current;
      }
      setSortDirection('asc');
      return key;
    });
  };

  const resetFilters = () => {
    setSearch('');
    setFilters({ status: 'All Statuses', owner: 'All Owners', priority: 'All Priorities', source: 'All Sources', dateRange: 'Any Time' });
    setDateRange({ from: '', to: '' });
    setActiveTab('All Leads');
    setCurrentPage(1);
  };

  const toggleVisible = (checked) => {
    const ids = pageRows.map((lead) => lead.id);
    setSelectedIds((current) => checked ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id)));
  };

  const toggleColumn = (key) => {
    setDraftColumns((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  };

  const openAdd = () => {
    setEditingLead(null);
    setForm(blankLeadForm);
    setErrors({});
    setAddOpen(true);
  };

  const openEdit = (lead) => {
    const [firstName, ...rest] = lead.customer.split(' ');
    setEditingLead(lead);
    setForm({
      firstName,
      lastName: rest.join(' '),
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      jobTitle: lead.jobTitle,
      source: lead.source,
      owner: lead.owner,
      priority: lead.priority,
      status: lead.status,
      estimatedValue: String(lead.estimatedValue),
      expectedCloseDate: lead.expectedCloseDate,
      notes: lead.notes,
    });
    setErrors({});
    setAddOpen(true);
  };

  const closeForm = () => {
    setAddOpen(false);
    setEditingLead(null);
    setSaving(false);
  };

  const submitLead = (mode = 'final') => {
    const nextErrors = validateLeadForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const customer = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const payload = {
        id: editingLead?.id || `lead-${Date.now()}`,
        clientId: editingLead?.clientId || `LD-${10249 + leads.length}`,
        createdDate: editingLead?.createdDate || new Date().toISOString().slice(0, 10),
        customer,
        company: form.company,
        phone: form.phone,
        email: form.email,
        source: form.source,
        owner: form.owner,
        priority: form.priority,
        status: mode === 'draft' ? 'New' : form.status,
        lastActivity: editingLead ? 'Updated just now' : 'Created just now',
        jobTitle: form.jobTitle,
        estimatedValue: Number(form.estimatedValue || 0),
        expectedCloseDate: form.expectedCloseDate,
        notes: form.notes,
        upcomingFollowUp: editingLead?.upcomingFollowUp || 'Schedule first follow-up',
      };
      const nextLeads = editingLead ? leads.map((lead) => lead.id === editingLead.id ? payload : lead) : [payload, ...leads];
      updateLeads(nextLeads);
      showToast(editingLead ? 'Lead updated successfully' : mode === 'draft' ? 'Lead saved as draft' : 'Lead created successfully');
      closeForm();
    }, 500);
  };

  const deleteLead = () => {
    if (!deletingLead) return;
    updateLeads(leads.filter((lead) => lead.id !== deletingLead.id));
    setSelectedIds((current) => current.filter((id) => id !== deletingLead.id));
    setDeletingLead(null);
    showToast('Lead deleted successfully');
  };

  const runExport = (scope, format) => {
    setExportOpen(false);
    showToast(`Export started: ${scope} as ${format}`);
  };

  if (loading) {
    return <LoadingLeadsPage />;
  }

  if (errorState) {
    return (
      <section className="lf-state-page">
        <div className="lf-state-card">
          <h2>Unable to load leads</h2>
          <p>Something went wrong while loading lead data.</p>
          <button className="lf-btn lf-btn-primary" onClick={() => setErrorState(false)}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <div className="lf-page">
      <PageHeader
        onAdd={openAdd}
        onColumns={() => { setDraftColumns(visibleColumns); setColumnsOpen(true); }}
        onExport={() => setExportOpen((open) => !open)}
        exportOpen={exportOpen}
        runExport={runExport}
        selectedCount={selectedIds.length}
        search={search}
        setSearch={(value) => { setSearch(value); setCurrentPage(1); }}
      />

      <section className="lf-filter-bar" aria-label="Lead search and filters">
        <FilterSelect label="Status" value={filters.status} options={leadStatusOptions} onChange={(value) => updateFilter('status', value)} />
        <FilterSelect label="Owner" value={filters.owner} options={leadOwnerOptions} onChange={(value) => updateFilter('owner', value)} />
        <DateRangeFilter value={filters.dateRange} range={dateRange} onPresetChange={(value) => updateFilter('dateRange', value)} onRangeChange={(nextRange) => { setDateRange(nextRange); updateFilter('dateRange', 'Custom Range'); }} />
        <button className="lf-clear-filters" type="button" onClick={resetFilters} disabled={activeFilterCount === 0}><X size={15} />Clear Filter</button>
      </section>

      {selectedIds.length > 0 && (
        <section className="lf-bulk-bar" aria-live="polite">
          <strong>{selectedIds.length} selected</strong>
          <button onClick={() => showToast('Lead assigned successfully')}><UserPlus size={15} />Assign Owner</button>
          <button onClick={() => showToast('Status changed successfully')}><Check size={15} />Change Status</button>
          <button onClick={() => runExport('selected records', 'CSV')}><Download size={15} />Export</button>
          <button className="danger" onClick={() => showToast('Unable to complete the action')}><Trash2 size={15} />Delete</button>
          <button onClick={() => setSelectedIds([])}><X size={15} />Clear Selection</button>
        </section>
      )}

      <section className="lf-table-card">
        <div className="lf-table-scroll">
          <table className="lf-leads-table">
            <thead>
              <tr>
                <th className="lf-check-col"><input type="checkbox" aria-label="Select all visible leads" checked={allVisibleSelected} onChange={(event) => toggleVisible(event.target.checked)} /></th>
                <th className="lf-sr-col">SR#</th>
                {displayColumns.map((column) => (
                  <th key={column.key}>
                    {column.sortable ? (
                      <button className="lf-sort-btn" onClick={() => handleSort(column.key)}>
                        {column.label}<span>{sortBy === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}</span>
                      </button>
                    ) : column.label}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((lead, rowIndex) => (
                <tr key={lead.id} className={selectedIds.includes(lead.id) ? 'selected' : ''} onClick={() => setDetailsLead(lead)}>
                  <td className="lf-check-col"><input type="checkbox" aria-label={`Select ${lead.customer}`} checked={selectedIds.includes(lead.id)} onClick={(event) => event.stopPropagation()} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, lead.id] : current.filter((id) => id !== lead.id))} /></td>
                  <td className="lf-sr-col">{pageStart + rowIndex + 1}</td>
                  {displayColumns.map((column) => (
                    <td key={column.key}>{renderLeadCell(lead, column.key, { onDetails: setDetailsLead, emailHidden: hasEmailHidden })}</td>
                  ))}
                  <td className="lf-actions-cell">
                    <button aria-label={`Actions for ${lead.customer}`} onClick={(event) => { event.stopPropagation(); setActionLeadId((current) => current === lead.id ? null : lead.id); }}><MoreHorizontal size={18} /></button>
                    {actionLeadId === lead.id && (
                      <div className="lf-row-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => { setDetailsLead(lead); setActionLeadId(null); }}><Eye size={15} />View Details</button>
                        <button onClick={() => { openEdit(lead); setActionLeadId(null); }}><Edit3 size={15} />Edit Lead</button>
                        <button onClick={() => showToast('Note added successfully')}><FileText size={15} />Add Note</button>
                        <button onClick={() => showToast('Follow-up scheduled')}><CalendarDays size={15} />Schedule Follow-up</button>
                        <button onClick={() => showToast('Lead assigned successfully')}><UserPlus size={15} />Assign Owner</button>
                        <button onClick={() => { updateLeads(leads.map((item) => item.id === lead.id ? { ...item, status: 'Converted', lastActivity: 'Converted just now' } : item)); setActionLeadId(null); showToast('Lead converted successfully'); }}><Check size={15} />Convert Lead</button>
                        <hr />
                        <button className="danger" onClick={() => { setDeletingLead(lead); setActionLeadId(null); }}><Trash2 size={15} />Delete Lead</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLeads.length === 0 && (
            <div className="lf-empty-state">
              <h3>No leads found</h3>
              <p>Try adjusting your search or filters, or create your first lead.</p>
              <button onClick={resetFilters}>Clear Filters</button>
              <button className="primary" onClick={openAdd}>Add New Lead</button>
            </div>
          )}
        </div>

      </section>

      {columnsOpen && (
        <ColumnSelector draftColumns={draftColumns} setDraftColumns={setDraftColumns} toggleColumn={toggleColumn} onClose={() => setColumnsOpen(false)} onApply={() => { setVisibleColumns([...new Set([...draftColumns, 'customer'])]); setColumnsOpen(false); }} />
      )}
      {addOpen && <AddLeadModal form={form} setForm={setForm} errors={errors} saving={saving} editing={Boolean(editingLead)} onClose={closeForm} onDraft={() => submitLead('draft')} onSubmit={() => submitLead('final')} />}
      {detailsLead && <LeadDetailsDrawer lead={detailsLead} onClose={() => setDetailsLead(null)} onEdit={() => { openEdit(detailsLead); setDetailsLead(null); }} onToast={showToast} />}
      {deletingLead && <ConfirmDelete lead={deletingLead} onCancel={() => setDeletingLead(null)} onConfirm={deleteLead} />}
    </div>
  );
}

function PageHeader({ onAdd, onColumns, onExport, exportOpen, runExport, selectedCount }) {
  return (
    <header className="lf-page-heading">
      <div>
        <nav className="lf-breadcrumb" aria-label="Breadcrumb"><a href="#crm">CRM</a><span>&gt;</span><a href="#sales">Sales</a><span>&gt;</span><strong>Leads</strong></nav>
        <h1>Leads</h1>
        <p>Manage, track, and follow up with your potential customers.</p>
      </div>
      <div className="lf-page-actions">
        <div className="lf-menu-anchor">
          <button className="lf-btn lf-btn-secondary" onClick={onExport}><Download size={16} />Export</button>
          {exportOpen && <ExportMenu runExport={runExport} selectedCount={selectedCount} />}
        </div>
        <button className="lf-btn lf-btn-secondary" onClick={onColumns}><Columns3 size={16} />Columns</button>
        <button className="lf-btn lf-btn-primary" onClick={onAdd}><PlusCircle size={17} />Add New Lead</button>
      </div>
    </header>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return <SearchableSelect className="lf-select-field" label={label} value={value} options={options} onChange={onChange} />;
}

function SearchableSelect({ label, value, options, onChange, className = 'lf-field' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visibleOptions = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));

  const choose = (option) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className={`${className} searchable`} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <span>{label}</span>
      <button type="button" className="lf-combo-button" onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{value}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="lf-combo-menu">
          <label className="lf-combo-search">
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} autoFocus />
          </label>
          <div role="listbox">
            {visibleOptions.length > 0 ? visibleOptions.map((option) => (
              <button type="button" key={option} className={option === value ? 'selected' : ''} onClick={() => choose(option)}>{option}</button>
            )) : <p>No results</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function DateRangeFilter({ value, range, onPresetChange, onRangeChange }) {
  const [open, setOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const label = value === 'Custom Range' && (range.from || range.to) ? `${range.from || 'From'} to ${range.to || 'To'}` : value;
  return (
    <div className="lf-select-field searchable date-range-filter" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setRangeOpen(false); } }}>
      <span>Date range</span>
      <button type="button" className="lf-combo-button" onClick={() => setOpen((current) => !current)} aria-haspopup="dialog" aria-expanded={open}>
        <span>{label}</span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="lf-combo-menu lf-date-menu">
          <div className="lf-date-presets">
            {leadDateOptions.map((option) => (
              <button type="button" key={option} className={option === value ? 'selected' : ''} onClick={() => { onPresetChange(option); if (option === 'Custom Range') { setOpen(false); setRangeOpen(true); } else { setRangeOpen(false); setOpen(false); } }}>{option}</button>
            ))}
          </div>
        </div>
      )}
      {rangeOpen && (
        <div className="lf-date-range-popover">
          <div className="lf-date-range-fields">
            <label><span>From</span><input type="date" value={range.from} onChange={(event) => onRangeChange({ ...range, from: event.target.value })} /></label>
            <label><span>To</span><input type="date" value={range.to} onChange={(event) => onRangeChange({ ...range, to: event.target.value })} /></label>
          </div>
          <div className="lf-date-actions">
            <button type="button" onClick={() => { onRangeChange({ from: '', to: '' }); onPresetChange('Any Time'); setOpen(false); setRangeOpen(false); }}>Clear</button>
            <button type="button" className="selected" onClick={() => { setOpen(false); setRangeOpen(false); }}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderLeadCell(lead, key, { onDetails, emailHidden }) {
  if (key === 'customer') {
    return (
      <button className="lf-person-cell" onClick={(event) => { event.stopPropagation(); onDetails(lead); }}>
        <Avatar name={lead.customer} />
        <span><strong>{lead.customer}</strong>{emailHidden && <small>{lead.email}</small>}</span>
      </button>
    );
  }
  if (key === 'owner') return <span className="lf-owner-cell"><Avatar name={lead.owner} small />{lead.owner}</span>;
  if (key === 'priority') return <PriorityBadge value={lead.priority} />;
  if (key === 'status') return <StatusBadge value={lead.status} />;
  if (key === 'createdDate') return formatDate(lead.createdDate);
  if (key === 'source') return <span className="lf-source"><BellRing size={14} />{lead.source}</span>;
  return lead[key] || '-';
}

function StatusBadge({ value }) {
  return <span className={`lf-badge status-${slug(value)}`}>{value}</span>;
}

function PriorityBadge({ value }) {
  return <span className={`lf-badge priority-${slug(value)}`}>{value}</span>;
}

function Avatar({ name, small }) {
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2);
  return <span className={`lf-avatar${small ? ' small' : ''}`}>{initials}</span>;
}

function ExportMenu({ runExport, selectedCount }) {
  const scopes = ['visible records', selectedCount ? 'selected records' : 'all filtered records', 'all filtered records'];
  return (
    <div className="lf-export-menu" role="menu">
      {scopes.map((scope, index) => (
        <div key={`${scope}-${index}`}>
          <strong>Export {scope}</strong>
          {['CSV', 'Excel', 'PDF'].map((format) => <button key={format} onClick={() => runExport(scope, format)}>{format}</button>)}
        </div>
      ))}
    </div>
  );
}

function ColumnSelector({ draftColumns, toggleColumn, setDraftColumns, onClose, onApply }) {
  return (
    <ModalShell title="Customize Columns" onClose={onClose}>
      <div className="lf-column-list">
        {leadColumns.map((column) => (
          <label key={column.key} className={column.locked ? 'disabled' : ''}>
            <input type="checkbox" checked={draftColumns.includes(column.key) || column.locked} disabled={column.locked} onChange={() => toggleColumn(column.key)} />
            {column.label}{column.locked && <small>Required</small>}
          </label>
        ))}
      </div>
      <div className="lf-modal-actions">
        <button onClick={() => setDraftColumns(defaultLeadColumns)}>Reset to Default</button>
        <button className="primary" onClick={onApply}>Apply Columns</button>
      </div>
    </ModalShell>
  );
}

function AddLeadModal({ form, setForm, errors, saving, editing, onClose, onDraft, onSubmit }) {
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <ModalShell title={editing ? 'Edit Lead' : 'Add New Lead'} subtitle="Create a new potential customer record." onClose={onClose} wide>
      <form className="lf-lead-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
        <TextInput label="First Name" value={form.firstName} error={errors.firstName} onChange={(value) => setField('firstName', value)} required />
        <TextInput label="Last Name" value={form.lastName} error={errors.lastName} onChange={(value) => setField('lastName', value)} required />
        <TextInput label="Email" value={form.email} error={errors.email} onChange={(value) => setField('email', value)} />
        <TextInput label="Phone" value={form.phone} error={errors.phone} onChange={(value) => setField('phone', value)} />
        <TextInput label="Company" value={form.company} onChange={(value) => setField('company', value)} />
        <TextInput label="Job Title" value={form.jobTitle} onChange={(value) => setField('jobTitle', value)} />
        <FormSelect label="Lead Source" value={form.source} options={leadSourceOptions.filter((item) => item !== 'All Sources')} onChange={(value) => setField('source', value)} />
        <FormSelect label="Owner" value={form.owner} options={leadOwnerOptions.filter((item) => item !== 'All Owners')} onChange={(value) => setField('owner', value)} />
        <FormSelect label="Priority" value={form.priority} options={leadPriorityOptions.filter((item) => item !== 'All Priorities')} onChange={(value) => setField('priority', value)} />
        <FormSelect label="Status" value={form.status} options={leadStatusOptions.filter((item) => item !== 'All Statuses')} onChange={(value) => setField('status', value)} />
        <TextInput label="Estimated Value" type="number" value={form.estimatedValue} onChange={(value) => setField('estimatedValue', value)} />
        <TextInput label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={(value) => setField('expectedCloseDate', value)} />
        <label className="lf-field full"><span>Notes</span><textarea value={form.notes} onChange={(event) => setField('notes', event.target.value)} /></label>
      </form>
      <div className="lf-modal-actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={onDraft} disabled={saving}>Save as Draft</button>
        <button className="primary" onClick={onSubmit} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Lead' : 'Add Lead'}</button>
      </div>
    </ModalShell>
  );
}

function TextInput({ label, value, onChange, error, type = 'text', required }) {
  return (
    <label className="lf-field">
      <span>{label}{required && <b>*</b>}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />
      {error && <small>{error}</small>}
    </label>
  );
}

function FormSelect({ label, value, options, onChange }) {
  return <SearchableSelect label={label} value={value} options={options} onChange={onChange} />;
}

function LeadDetailsDrawer({ lead, onClose, onEdit, onToast }) {
  return (
    <aside className="lf-drawer" aria-label="Lead details">
      <div className="lf-drawer-head">
        <div className="lf-drawer-person"><Avatar name={lead.customer} /><div><h2>{lead.customer}</h2><p>{lead.company} · {lead.jobTitle}</p></div></div>
        <button aria-label="Close details" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="lf-drawer-actions">
        <button onClick={onEdit}><Edit3 size={15} />Edit</button>
        <button onClick={() => onToast('Note added successfully')}><FileText size={15} />Add Note</button>
        <button onClick={() => onToast('Follow-up scheduled')}><CalendarDays size={15} />Follow-up</button>
        <button onClick={() => onToast('Email action opened')}><Mail size={15} />Send Email</button>
        <button onClick={() => onToast('Call action opened')}><Phone size={15} />Call</button>
        <button className="primary" onClick={() => onToast('Lead converted successfully')}><Check size={15} />Convert Lead</button>
      </div>
      <div className="lf-detail-grid">
        <Detail label="Email" value={lead.email} />
        <Detail label="Phone" value={lead.phone} />
        <Detail label="Status" value={<StatusBadge value={lead.status} />} />
        <Detail label="Priority" value={<PriorityBadge value={lead.priority} />} />
        <Detail label="Lead Source" value={lead.source} />
        <Detail label="Assigned Owner" value={lead.owner} />
        <Detail label="Estimated Value" value={`$${lead.estimatedValue.toLocaleString()}`} />
        <Detail label="Created Date" value={formatDate(lead.createdDate)} />
      </div>
      <section className="lf-detail-section"><h3>Notes</h3><p>{lead.notes}</p></section>
      <section className="lf-detail-section"><h3>Activity Timeline</h3><p>{lead.lastActivity}</p><p>Discovery email sent and next step logged.</p></section>
      <section className="lf-detail-section"><h3>Upcoming Follow-up</h3><p>{lead.upcomingFollowUp}</p></section>
      <section className="lf-detail-section"><h3>Related Tasks</h3><p>Prepare account map, confirm buying committee, and update close plan.</p></section>
    </aside>
  );
}

function Detail({ label, value }) {
  return <div className="lf-detail-item"><span>{label}</span><strong>{value}</strong></div>;
}

function ConfirmDelete({ lead, onCancel, onConfirm }) {
  return (
    <ModalShell title="Delete this lead?" subtitle={`Delete ${lead.customer}? This action cannot be undone.`} onClose={onCancel}>
      <div className="lf-modal-actions">
        <button onClick={onCancel}>Cancel</button>
        <button className="danger" onClick={onConfirm}>Delete Lead</button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, subtitle, onClose, children, wide }) {
  return (
    <div className="lf-modal-backdrop" role="presentation">
      <section className={`lf-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="lf-modal-title">
        <div className="lf-modal-head">
          <div><h2 id="lf-modal-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
          <button aria-label="Close modal" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

function LoadingLeadsPage() {
  return (
    <div className="lf-page">
      <div className="lf-skeleton hero" />
      <div className="lf-stats-grid">{[1, 2, 3, 4].map((item) => <div key={item} className="lf-skeleton card" />)}</div>
      <div className="lf-skeleton workspace" />
      <div className="lf-skeleton table" />
    </div>
  );
}

function validateLeadForm(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim() && !form.phone.trim()) errors.email = 'Email or phone is required.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (form.phone && !/^[+()\d\s-]{7,}$/.test(form.phone)) errors.phone = 'Enter a valid phone number.';
  return errors;
}

function compareLeads(a, b, key, direction) {
  const left = key === 'priority' ? priorityRank[a[key]] : key === 'status' ? statusRank[a[key]] : a[key];
  const right = key === 'priority' ? priorityRank[b[key]] : key === 'status' ? statusRank[b[key]] : b[key];
  const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left || '').localeCompare(String(right || ''));
  return direction === 'asc' ? result : -result;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

function slug(value) {
  return String(value).toLowerCase().replace(/\s+/g, '-');
}
