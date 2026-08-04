import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import ContactsPage from './ContactsPage';
import { owners } from '../data/crmData';

const companyColumns = [
  ['id', 'Company ID', 'link-cell'],
  ['name', 'Company Name'],
  ['type', 'Type'],
  ['annualRevenue', 'Annual Revenue'],
  ['industry', 'Industry'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['owner', 'Owner'],
];

const companyRows = [
  { id: 'CO001', name: 'Northstar Foods', contact: 'Northstar Foods', company: 'Northstar Foods', designation: 'Food & Beverage', type: 'Prospect', employees: '50', annualRevenue: '$1,250,000', industry: 'Food & Beverage', phone: '+92 300 4455667', email: 'info@northstar.example', owner: 'Ali Raza', status: 'Active' },
  { id: 'CO002', name: 'Metro Health', contact: 'Metro Health', company: 'Metro Health', designation: 'Healthcare', type: 'Customer', employees: '35', annualRevenue: '$850,000', industry: 'Healthcare', phone: '+92 321 7788990', email: 'hello@metrohealth.example', owner: 'Sara Ahmed', status: 'Active' },
  { id: 'CO003', name: 'Cedar Labs', contact: 'Cedar Labs', company: 'Cedar Labs', designation: 'Technology', type: 'Prospect', employees: '22', annualRevenue: '$500,000', industry: 'Technology', phone: '+92 333 1122334', email: 'team@cedarlabs.example', owner: 'Ali Raza', status: 'Inactive' },
];

const blankCompanyForm = {
  name: '',
  type: 'Prospect',
  employees: '',
  annualRevenue: '',
  industry: '',
  phone: '',
  email: '',
  owner: 'Ali Raza',
};

const companyTypeOptions = ['Prospect', 'Customer', 'Partner', 'Competitor', 'Other'];
const companyDateRangeOptions = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom Range'];

const companyFormFields = [
  { key: 'name', label: 'Company Name' },
  { key: 'type', label: 'Type', kind: 'select', options: companyTypeOptions },
  { key: 'employees', label: 'Employees', type: 'number' },
  { key: 'annualRevenue', label: 'Annual Revenue' },
  { key: 'industry', label: 'Industry' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'owner', label: 'Owner', kind: 'select', options: owners.filter((item) => item !== 'All') },
];

const companyDetailFields = [
  { key: 'id', label: 'Company ID' },
  { key: 'name', label: 'Company Name' },
  { key: 'type', label: 'Type' },
  { key: 'employees', label: 'Employees' },
  { key: 'annualRevenue', label: 'Annual Revenue' },
  { key: 'industry', label: 'Industry' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'owner', label: 'Owner' },
];

const companyFilters = [
  { key: 'type', label: 'Type', options: ['All', ...companyTypeOptions] },
  { key: 'owner', label: 'Owner', options: owners },
  { key: 'dateRange', label: 'Date range', type: 'dateRange', options: companyDateRangeOptions, defaultValue: 'All' },
];

export default function CompaniesPage({ setMessage, onDetailOpenChange }) {
  const [companiesAsContacts, setCompaniesAsContacts] = useState(companyRows);

  return (
    <ContactsPage
      contacts={companiesAsContacts}
      setContacts={setCompaniesAsContacts}
      setMessage={setMessage}
      onDetailOpenChange={onDetailOpenChange}
      pageClassName="companies-copy-page"
      tableColumns={companyColumns}
      showSerialColumn
      addButtonLabel="New Company"
      blankFormValue={blankCompanyForm}
      formFields={companyFormFields}
      formSectionTitle="Company Information"
      addFormTitle="Add Company"
      addFormDescription="Create a new company record."
      editFormTitle="Edit Company"
      editFormDescription="Update this company record."
      saveButtonLabel="Save Company"
      updateButtonLabel="Save Changes"
      idPrefix="CO"
      allowManualId={false}
      formPageClassName="company-form-page"
      detailTitle="Company Detail"
      detailAriaLabel="Company details"
      detailFields={companyDetailFields}
      detailExtraContent={<CompanyLinkedRecords />}
      showActivitySections={false}
      filterConfig={companyFilters}
      customDetailRenderer={(props) => <CompanyDetailPage {...props} />}
      filterTopContent={<CompanySummaryStrip />}
    />
  );
}

function CompanyDetailPage({ record, onBack, onEdit }) {
  return (
    <div className="lf-page leads-page company-record-page">
      <section className="payment-record-detail company-record-detail" aria-label="Company details">
        <header className="payment-record-header">
          <button type="button" className="payment-record-back" aria-label="Back" title="Back" onClick={onBack}><ArrowLeft size={22} /></button>
          <div>
            <h2>{record.name || record.company || 'Company Detail'}</h2>
            <p>{record.id || '-'} / {record.industry || '-'}</p>
          </div>
          <button className="payment-record-edit" type="button" onClick={onEdit}>Edit</button>
        </header>

        <section className="payment-record-summary" aria-label="Company summary">
          <div>
            <span>Company ID</span>
            <strong>{record.id || '-'}</strong>
          </div>
          <div>
            <span>Type</span>
            <strong>{record.type || '-'}</strong>
          </div>
          <div>
            <span>Employees</span>
            <strong>{record.employees || '-'}</strong>
          </div>
          <div>
            <span>Annual Revenue</span>
            <strong>{record.annualRevenue || '-'}</strong>
          </div>
        </section>

        <div className="payment-record-sections lead-primary-sections">
          <section className="payment-record-section">
            <h3>Company Information</h3>
            <dl>
              <div><dt>Company ID</dt><dd>{record.id || '-'}</dd></div>
              <div><dt>Company Name</dt><dd>{record.name || record.company || '-'}</dd></div>
              <div><dt>Type</dt><dd>{record.type || '-'}</dd></div>
              <div><dt>Employees</dt><dd>{record.employees || '-'}</dd></div>
              <div><dt>Annual Revenue</dt><dd>{record.annualRevenue || '-'}</dd></div>
              <div><dt>Industry</dt><dd>{record.industry || '-'}</dd></div>
              <div><dt>Phone</dt><dd>{record.phone || '-'}</dd></div>
              <div><dt>Email</dt><dd>{record.email || '-'}</dd></div>
              <div><dt>Owner</dt><dd>{record.owner || '-'}</dd></div>
              <div><dt>Status</dt><dd>{record.status || '-'}</dd></div>
              <div><dt>Created Date</dt><dd>{record.date || '-'}</dd></div>
              <div><dt>Primary Contact</dt><dd>{record.contact || '-'}</dd></div>
            </dl>
          </section>
        </div>

        <CompanyLinkedRecords />
      </section>
    </div>
  );
}

function CompanySummaryStrip() {
  return (
    <section className="company-summary-strip" aria-label="Company summary">
      <article>
        <span>Total Companies</span>
        <strong>20</strong>
      </article>
      <article>
        <span>Prospects</span>
        <strong className="company-summary-blue">19</strong>
      </article>
      <article>
        <span>Customers</span>
        <strong className="company-summary-green">1</strong>
      </article>
      <article>
        <span>Partners</span>
        <strong className="company-summary-cyan">0</strong>
      </article>
    </section>
  );
}

function CompanyLinkedRecords() {
  return (
    <section className="company-linked-records" aria-label="Company linked records">
      <header className="company-linked-head">
        <h3>Relationship Overview</h3>
        <p>Linked contacts, deal activity, and won revenue for this company.</p>
      </header>

      <div className="company-detail-metrics">
        <article>
          <span>Total Contacts</span>
          <strong>0</strong>
        </article>
        <article>
          <span>Won / Open Deals</span>
          <strong className="company-summary-green">0 Won / 0 Open</strong>
        </article>
        <article className="wide">
          <span>Total Won Revenue</span>
          <strong className="company-summary-green">$0.00</strong>
        </article>
      </div>

      <CompanyLinkedTable
        title="Related Contacts"
        columns={['Name', 'Designation', 'Email', 'Phone']}
        emptyText="No contacts linked."
      />

      <CompanyLinkedTable
        title="Related Opportunities"
        columns={['Deal Name', 'Stage', 'Value', 'Close Date']}
        emptyText="No opportunities linked."
      />
    </section>
  );
}

function CompanyLinkedTable({ title, columns, emptyText }) {
  return (
    <section className="company-linked-table">
      <h3>{title}</h3>
      <div className="contact-related-table-wrap">
        <table className="contact-related-table">
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="company-linked-empty">{emptyText}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
