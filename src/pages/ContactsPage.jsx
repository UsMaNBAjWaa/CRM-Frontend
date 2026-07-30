import React, { useState } from 'react';
import { CheckCheck, ChevronDown, FileEdit, MoreHorizontal, RefreshCw, Settings, Table2, Trash2, XCircle } from 'lucide-react';
import { Confirm, HighlightedText, IconButton, Modal, PanelActions, SearchBox, SelectField, Table, TextField } from '../components/ui';
import { contactStatuses, designations, emptyContact, owners } from '../data/crmData';

const columns = [
  ['serialNo', 'SR#'],
  ['contact', 'Contact'],
  ['company', 'Company'],
  ['designation', 'Designation'],
  ['phone', 'Phone Number'],
  ['email', 'Email'],
  ['owner', 'Owner'],
  ['status', 'Status'],
];
const sortableKeys = ['contact', 'company', 'designation', 'phone', 'email', 'owner', 'status'];

export default function ContactsPage({ contacts, setContacts, setMessage }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('contact');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [form, setForm] = useState(emptyContact);
  const [selected, setSelected] = useState(null);
  const [deleteContact, setDeleteContact] = useState(null);
  const [openActionId, setOpenActionId] = useState('');

  const nextContactId = () => `CT-${2000 + contacts.length + 1}`;
  const filteredContacts = contacts
    .filter((contact) => {
      const term = search.trim().toLowerCase();
      if (!term) return true;
      return [contact.contact, contact.company, contact.designation, contact.phone, contact.email, contact.owner, contact.status]
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
  const openAdd = () => {
    setSelected(null);
    setForm(emptyContact);
    setModalMode('add');
  };
  const openEdit = (contact) => {
    setSelected(contact);
    setForm(contact);
    setModalMode('edit');
  };
  const saveContact = (event) => {
    event.preventDefault();
    if (!form.contact.trim() || !form.phone.trim()) {
      setMessage('Contact and Phone Number are required.');
      return;
    }
    if (modalMode === 'edit' && selected) {
      setContacts((current) => current.map((contact) => contact.id === selected.id ? { ...selected, ...form } : contact));
      setMessage('Contact updated successfully.');
    } else {
      setContacts((current) => [{
        ...form,
        id: nextContactId(),
        clientId: `CL-${2000 + current.length + 1}`,
        date: new Date().toISOString().slice(0, 10),
      }, ...current]);
      setMessage('Contact created successfully.');
    }
    setModalMode(null);
  };

  return (
    <section className="page salesforce-leads contacts-page">
      <div className="sf-list-head">
        <div className="sf-title-wrap">
          <div className="sf-object-icon"><span /></div>
          <div>
            <p>Contacts</p>
            <button type="button" className="sf-list-title">
              All Contacts <ChevronDown size={18} />
            </button>
          </div>
        </div>
        <div className="sf-action-strip">
          <button className="sf-action" onClick={openAdd}>Add Contact</button>
        </div>
      </div>
      <div className="toolbar lead-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search this list..." />
        <IconButton label="List settings" onClick={() => setMessage('Contact list settings opened.')}><Settings size={16} /></IconButton>
        <IconButton label="Display options" onClick={() => setMessage('Contact display options opened.')}><Table2 size={16} /></IconButton>
        <IconButton label="Refresh list" onClick={() => setMessage('Contact list refreshed successfully.')}><RefreshCw size={16} /></IconButton>
      </div>
      {selectedIds.length > 0 && (
        <div className="selected-bulk-banner">
          <div className="selected-bulk-left">
            <span className="selected-bulk-icon"><CheckCheck size={24} /></span>
            <strong>{selectedIds.length} contact{selectedIds.length === 1 ? '' : 's'} selected</strong>
          </div>
          <div className="selected-bulk-actions">
            <button className="bulk-cancel" onClick={() => setSelectedIds([])}><XCircle size={16} />Cancel Selected</button>
            <button className="bulk-delete" onClick={() => {
              setContacts((current) => current.filter((contact) => !selectedIds.includes(contact.id)));
              setMessage(`${selectedIds.length} contact${selectedIds.length === 1 ? '' : 's'} moved to recycle bin.`);
              setSelectedIds([]);
            }}><Trash2 size={16} />Move to Recycle Bin</button>
          </div>
        </div>
      )}
      <div className="sf-list-panel">
        <Table
          columns={columns}
          rows={filteredContacts.map((contact, index) => ({ ...contact, serialNo: index + 1 }))}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          sortableKeys={sortableKeys}
          selectedIds={selectedIds}
          onSelectRow={selectRow}
          onSelectAll={selectAll}
          renderCell={(contact, key, value) => (
            key === 'contact' || key === 'company'
              ? <span className="link-cell"><HighlightedText text={value || '-'} query={search} /></span>
              : key === 'status'
              ? <span className={`pill ${String(value).toLowerCase()}`}><HighlightedText text={value} query={search} /></span>
              : key === 'serialNo'
              ? value
              : <HighlightedText text={value || '-'} query={search} />
          )}
          actions={(contact) => (
            <div className="action-menu-wrap">
              <IconButton label="Contact actions" onClick={() => setOpenActionId((current) => current === contact.id ? '' : contact.id)}><MoreHorizontal size={16} /></IconButton>
              {openActionId === contact.id && (
                <div className="row-action-menu">
                  <button type="button" onClick={() => { openEdit(contact); setOpenActionId(''); }}><FileEdit size={15} />Edit</button>
                  <hr />
                  <button type="button" className="danger-menu-item" onClick={() => { setDeleteContact(contact); setOpenActionId(''); }}><Trash2 size={15} />Delete</button>
                </div>
              )}
            </div>
          )}
        />
      </div>
      {modalMode && (
        <Modal title={modalMode === 'edit' ? 'Edit Contact' : 'Add Contact'} onClose={() => setModalMode(null)}>
          <form className="form-grid" onSubmit={saveContact}>
            <TextField label="Serial No" value={modalMode === 'edit' ? selected?.id || '' : nextContactId()} onChange={() => {}} />
            <TextField label="Contact*" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
            <TextField label="Company" value={form.company} onChange={(company) => setForm({ ...form, company })} />
            <SelectField label="Designation" value={form.designation} options={designations.filter((item) => item !== 'All')} onChange={(designation) => setForm({ ...form, designation })} />
            <TextField label="Phone Number*" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
            <TextField label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
            <SelectField label="Owner" value={form.owner} options={owners.filter((item) => item !== 'All')} onChange={(owner) => setForm({ ...form, owner })} />
            <SelectField label="Status" value={form.status} options={contactStatuses.filter((item) => item !== 'All')} onChange={(status) => setForm({ ...form, status })} />
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => setModalMode(null)}>Cancel</button>
              <button type="submit" className="button primary">{modalMode === 'edit' ? 'Save Changes' : 'Save Contact'}</button>
            </PanelActions>
          </form>
        </Modal>
      )}
      {deleteContact && (
        <Confirm
          danger
          title="Delete Contact"
          text={`Delete contact "${deleteContact.contact}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeleteContact(null)}
          onConfirm={() => {
            setContacts((current) => current.filter((contact) => contact.id !== deleteContact.id));
            setMessage('Contact deleted successfully.');
            setDeleteContact(null);
          }}
        />
      )}
    </section>
  );
}
