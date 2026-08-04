import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import {
  DetailBlock,
  DetailGrid,
  Drawer,
  Modal,
  PanelActions,
  RelatedOpportunities,
  SearchableFilterBox,
  SelectField,
  TextArea,
  TextField,
} from './ui';
import { assignLeadOptions, contactOwnerOptions, contactStatuses, leadSources, paymentMethods, priorities } from '../data/crmData';
import { formatCurrency } from '../utils/format';

export function LeadDrawer({ mode, lead, form, setForm, onClose, onSubmit, onEdit, onConvert, onLost, embedded }) {
  const readOnly = mode === 'view';
  const content = readOnly && lead ? (
    <div className="stack">
      <DetailGrid items={[['Client ID', lead.clientId], ['Customer', lead.customer], ['Phone', lead.phone], ['Company', lead.company], ['Status', lead.status], ['Priority', lead.priority]]} />
      <DetailBlock title="Notes" text={lead.notes || 'No notes added.'} />
      <DetailBlock title="Activity Timeline" text="Lead Created / Lead Contacted / Demo Scheduled" />
      <DetailBlock title="Related Tasks" text="Follow up call, Product demo" />
      <PanelActions>
        <button className="button success" onClick={onConvert}>Convert</button>
        <button className="button danger" onClick={onLost}>Mark Lost</button>
      </PanelActions>
    </div>
  ) : (
    <form className="form-grid" onSubmit={onSubmit}>
      <TextField label="Full Name*" value={form.customer} onChange={(customer) => setForm({ ...form, customer })} />
      <TextField label="Phone Number*" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <TextField label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
      <TextField label="Company" value={form.company} onChange={(company) => setForm({ ...form, company })} />
      <SelectField label="Lead Source" value={form.source} options={leadSources.filter((item) => item !== 'All')} onChange={(source) => setForm({ ...form, source })} />
      <SelectField label="Priority" value={form.priority} options={priorities.filter((item) => item !== 'All')} onChange={(priority) => setForm({ ...form, priority })} />
      {(mode === 'add' || mode === 'edit') && <SearchableFilterBox label="Owner" value={form.assignLead} options={assignLeadOptions} onChange={(assignLead) => setForm({ ...form, assignLead })} placeholder="Search owner" />}
      <TextArea wide label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
      <PanelActions wide>
        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="button primary">{mode === 'edit' ? 'Save Changes' : 'Save'}</button>
      </PanelActions>
    </form>
  );

  if (embedded) {
    return content;
  }

  return (
    <Drawer title={mode === 'add' ? 'Add Lead' : mode === 'edit' ? 'Edit Lead' : 'Lead Details'} onClose={onClose}>
      {content}
    </Drawer>
  );
}

export function ContactDrawer({ mode, contact, form, setForm, onClose, onSubmit, onEdit, onDelete, onOpportunity, onTask, embedded }) {
  const readOnly = mode === 'view';
  const content = readOnly && contact ? (
    <div className="stack">
      <PanelActions>
        <button className="button primary" onClick={onOpportunity}><Briefcase size={16} />Create Opportunity</button>
      </PanelActions>
      <DetailGrid items={[['Client ID', contact.clientId], ['Contact', contact.contact], ['Company', contact.company], ['Designation', contact.designation], ['Phone', contact.phone], ['Email', contact.email], ['Status', contact.status]]} />
      <RelatedOpportunities />
      <DetailBlock title="Activity Timeline" text="Contact Created / Email Sent / Call Logged" />
      <DetailBlock title="Related Tasks" text="Prepare proposal, Schedule follow-up" />
      <PanelActions>
        <button className="button secondary" onClick={onEdit}>Edit</button>
        <button className="button danger" onClick={onDelete}>Delete</button>
      </PanelActions>
    </div>
  ) : (
    <form className="form-grid" onSubmit={onSubmit}>
      <TextField label="Full Name*" value={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
      <TextField label="Company*" value={form.company} onChange={(company) => setForm({ ...form, company })} />
      <TextField label="Designation" value={form.designation} onChange={(designation) => setForm({ ...form, designation })} />
      <TextField label="Phone Number*" value={form.phone} onChange={(phone) => setForm({ ...form, phone })} />
      <TextField label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
      <TextField label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
      <TextField label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
      <TextField label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
      {(mode === 'add' || mode === 'edit') && <SearchableFilterBox label="Owner" value={form.owner} options={contactOwnerOptions} onChange={(owner) => setForm({ ...form, owner })} placeholder="Search owner" />}
      <SelectField label="Status" value={form.status} options={contactStatuses.filter((item) => item !== 'All')} onChange={(status) => setForm({ ...form, status })} />
      <TextArea wide label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
      <PanelActions wide>
        <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="button primary">{mode === 'edit' ? 'Save Changes' : 'Save'}</button>
      </PanelActions>
    </form>
  );

  if (embedded) {
    return content;
  }

  return (
    <Drawer title={mode === 'add' ? 'Add Contact' : mode === 'edit' ? 'Edit Contact' : 'Contact Details'} onClose={onClose}>
      {content}
    </Drawer>
  );
}

export function OpportunityModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', value: '', stage: '', closeDate: '', notes: '' });

  return (
    <Modal title="Create Opportunity" onClose={onClose}>
      <TextField label="Opportunity Name*" value={form.name} onChange={(name) => setForm({ ...form, name })} />
      <TextField label="Expected Value" value={form.value} onChange={(value) => setForm({ ...form, value })} />
      <TextField label="Stage" value={form.stage} onChange={(stage) => setForm({ ...form, stage })} />
      <TextField label="Expected Close Date" value={form.closeDate} onChange={(closeDate) => setForm({ ...form, closeDate })} />
      <TextArea label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
      <PanelActions>
        <button className="button secondary" onClick={onClose}>Cancel</button>
        <button className="button primary" onClick={onSave}>Save</button>
      </PanelActions>
    </Modal>
  );
}

export function TaskDrawer({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', assignedTo: '', dueDate: '', priority: '', description: '' });

  return (
    <Drawer title="Add Task" onClose={onClose}>
      <div className="form-grid">
        <TextField label="Task Name*" value={form.name} onChange={(name) => setForm({ ...form, name })} />
        <TextField label="Assigned To*" value={form.assignedTo} onChange={(assignedTo) => setForm({ ...form, assignedTo })} />
        <TextField label="Due Date" value={form.dueDate} onChange={(dueDate) => setForm({ ...form, dueDate })} />
        <TextField label="Priority" value={form.priority} onChange={(priority) => setForm({ ...form, priority })} />
        <TextArea wide label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        <PanelActions wide>
          <button className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" onClick={onSave}>Save</button>
        </PanelActions>
      </div>
    </Drawer>
  );
}

export function OpportunityDetailDrawer({ opportunity, onClose, onTask, onNote }) {
  return (
    <Drawer title="Opportunity Details" onClose={onClose}>
      <div className="stack">
        <DetailGrid items={[
          ['Opportunity', opportunity.name],
          ['Company', opportunity.company],
          ['Contact', opportunity.contact],
          ['Stage', opportunity.stage],
          ['Estimated Value', formatCurrency(opportunity.value)],
          ['Priority', opportunity.priority],
          ['Expected Closing Date', opportunity.closeDate],
          ['Assigned Salesperson', opportunity.owner],
        ]} />
        <DetailBlock title="Notes" text={opportunity.notes || 'No notes added.'} />
        <DetailBlock title="Activity Timeline" text="Opportunity Created / Stage Updated / Follow-up Scheduled" />
        <DetailBlock title="Related Tasks" text="Review next step, Schedule stakeholder call" />
        <PanelActions>
          <button className="button secondary" onClick={onNote}>Add Note</button>
          <button className="button primary" onClick={onTask}>Add Task</button>
        </PanelActions>
      </div>
    </Drawer>
  );
}

export function PaymentDrawer({ mode, payment, form, setForm, onClose, onSubmit, onEdit, onRecordAnother, setMessage }) {
  const readOnly = mode === 'view';

  return (
    <Drawer title={mode === 'record' ? 'Record Payment' : mode === 'edit' ? 'Edit Payment' : 'Payment Details'} onClose={onClose}>
      {readOnly && payment ? (
        <div className="stack">
          <DetailGrid items={[
            ['Invoice', payment.invoice],
            ['Company', payment.company],
            ['Opportunity', payment.opportunity],
            ['Customer', payment.customer],
            ['Salesperson', payment.salesperson],
            ['Total Amount', formatCurrency(payment.amount)],
            ['Paid', formatCurrency(payment.paid)],
            ['Remaining Balance', formatCurrency(payment.balance)],
            ['Method', payment.method],
            ['Reference', payment.reference || 'Not recorded'],
            ['Date', payment.date],
            ['Status', payment.status],
          ]} />
          <DetailBlock title="Payment History" text={`${payment.date}: ${formatCurrency(payment.paid)} recorded through ${payment.method}.`} />
          <PanelActions>
            <button className="button secondary" onClick={onEdit}>Edit</button>
            <button className="button primary" onClick={onRecordAnother}>Record Another Payment</button>
            <button className="button secondary" onClick={() => setMessage('Invoice download requested.')}>Download Invoice</button>
            <button className="button secondary" onClick={() => setMessage('Receipt print requested.')}>Print Receipt</button>
          </PanelActions>
        </div>
      ) : (
        <form className="form-grid" onSubmit={onSubmit}>
          <TextField label="Company*" value={form.company} onChange={(company) => setForm({ ...form, company })} />
          <TextField label="Opportunity*" value={form.opportunity} onChange={(opportunity) => setForm({ ...form, opportunity })} />
          <TextField label="Invoice Number" value={form.invoice} onChange={(invoice) => setForm({ ...form, invoice })} />
          <TextField label="Total Amount*" value={form.amount} onChange={(amount) => setForm({ ...form, amount })} />
          <TextField label="Amount Received*" value={form.paid} onChange={(paid) => setForm({ ...form, paid })} />
          <SelectField label="Payment Method*" value={form.method} options={paymentMethods.filter((item) => item !== 'All')} onChange={(method) => setForm({ ...form, method })} />
          <TextField label="Transaction Reference" value={form.reference} onChange={(reference) => setForm({ ...form, reference })} />
          <TextField label="Payment Date*" value={form.date} onChange={(date) => setForm({ ...form, date })} />
          <TextArea wide label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          <PanelActions wide>
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary">Save</button>
          </PanelActions>
        </form>
      )}
    </Drawer>
  );
}
