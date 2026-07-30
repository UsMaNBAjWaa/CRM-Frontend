import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LayoutGrid,
  Menu,
  Search,
  Users,
  X,
} from 'lucide-react';
import LeadsPage from './pages/LeadsPage';
import ContactsPage from './pages/ContactsPage';
import CompaniesPage from './pages/CompaniesPage';
import PipelinePage from './pages/PipelinePage';
import PaymentsPage from './pages/PaymentsPage';
import { companySeed, contactSeed, leadSeed, opportunitySeed, paymentSeed } from './data/crmData';
import './leads-redesign.css';

const NAV_ITEMS = [
  { key: 'leads', label: 'Sales', Icon: LayoutGrid },
  { key: 'contacts', label: 'Contacts', Icon: Users },
  { key: 'companies', label: 'Companies', Icon: Building2 },
  { key: 'pipeline', label: 'Pipeline', Icon: BarChart3 },
  { key: 'payments', label: 'Payments', Icon: CreditCard },
];

export default function App() {
  const [page, setPage] = useState('leads');
  const [leads, setLeads] = useState(leadSeed);
  const [contacts, setContacts] = useState(contactSeed);
  const [companies, setCompanies] = useState(companySeed);
  const [opportunities, setOpportunities] = useState(opportunitySeed);
  const [payments, setPayments] = useState(paymentSeed);
  const [message, setMessage] = useState('');
  const [dynamicStagePage, setDynamicStagePage] = useState('');
  const [activeStagePage, setActiveStagePage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer
  const [profileOpen, setProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [opportunityStageConfig, setOpportunityStageConfig] = useState({
    id: '', mode: 'standard', fields: [], records: [],
  });

  const isErrorMessage = message.includes('required') || message.includes('exists');

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  // Close mobile sidebar when navigating
  const navigate = (key) => { setPage(key); setSidebarOpen(false); setProfileOpen(false); };

  const globalSearchResults = buildGlobalSearchResults(globalSearch, {
    leads,
    contacts,
    companies,
    opportunities,
    payments,
  });

  const pageLabels = {
    leads: 'Sales',
    contacts: 'Contacts',
    companies: 'Companies',
    pipeline: 'Pipeline',
    pipelineStage: activeStagePage || dynamicStagePage,
    payments: 'Payments',
  };

  return (
    <div className="crm-shell">
      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="crm-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* ── Sidebar ── */}
      <aside className={`crm-sidebar${sidebarOpen ? ' crm-sidebar--open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="crm-sb-logo">
          <div className="crm-sb-logo-icon" aria-hidden="true">
            <Boxes size={22} />
          </div>
          <span className="crm-sb-logo-name">Lead<span>Flow</span></span>
        </div>

        {/* Nav section label */}
        <p className="crm-sb-section-label">MAIN MENU</p>

        {/* Nav items */}
        <nav className="crm-sb-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = page === key || (key === 'pipeline' && page === 'pipelineStage');
            return (
              <button
                key={key}
                className={`crm-sb-item${isActive ? ' crm-sb-item--active' : ''}`}
                onClick={() => navigate(key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="crm-sb-item-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="crm-sb-item-label">{label}</span>
                {isActive && <span className="crm-sb-item-dot" aria-hidden="true" />}
              </button>
            );
          })}

          {/* Dynamic pipeline stage */}
          {dynamicStagePage && (
            <button
              className={`crm-sb-item crm-sb-item--sub${page === 'pipelineStage' ? ' crm-sb-item--active' : ''}`}
              onClick={() => { setActiveStagePage(dynamicStagePage); setPage('pipelineStage'); setSidebarOpen(false); }}
              aria-current={page === 'pipelineStage' ? 'page' : undefined}
            >
              <span className="crm-sb-item-icon" aria-hidden="true">
                <BarChart3 size={16} />
              </span>
              <span className="crm-sb-item-label">{dynamicStagePage}</span>
            </button>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="crm-sb-footer">
          <div className="crm-sb-footer-avatar" aria-hidden="true">AR</div>
          <div className="crm-sb-footer-meta">
            <span className="crm-sb-footer-name">Ali Raza</span>
            <span className="crm-sb-footer-role">Sales Manager</span>
          </div>
        </div>
      </aside>

      {/* ── Right column: Navbar + Content ── */}
      <div className="crm-main">
        {globalSearchOpen && <div className="crm-search-backdrop" aria-hidden="true" />}

        {/* ── Top Navbar ── */}
        <header className="crm-navbar" role="banner">
            {/* Mobile menu toggle */}
            <button
              className="crm-navbar-menu-btn"
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              <Menu size={20} />
            </button>

            <div className="crm-navbar-brand" aria-hidden="true">
              <Boxes size={20} />
              <span>Lead<span>Flow</span></span>
            </div>

            {/* Logo (mobile only, hidden on desktop) */}
            <div className="crm-navbar-brand-mobile" aria-hidden="true">
              <Boxes size={20} />
              <span>Lead<span>Flow</span></span>
            </div>

            {/* Global search (center) */}
            <div
              className="crm-navbar-search"
              role="search"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setGlobalSearchOpen(false);
              }}
            >
              <Search size={15} aria-hidden="true" />
              <input
                id="global-search"
                type="search"
                placeholder="Press # for specific search or / for Ask Zia."
                aria-label="Global CRM search"
                value={globalSearch}
                onFocus={() => setGlobalSearchOpen(true)}
                onChange={(event) => {
                  setGlobalSearch(event.target.value);
                  setGlobalSearchOpen(true);
                }}
              />
              {globalSearchOpen && (
                <div className="crm-search-popover">
                  <div className="crm-search-popover-head">
                    <strong>Search Results</strong>
                    {globalSearch && <span>{globalSearchResults.length} found</span>}
                  </div>
                  {globalSearch.trim() ? (
                    <div className="crm-search-results">
                      {globalSearchResults.length > 0 ? globalSearchResults.map((result) => (
                        <button
                          type="button"
                          key={`${result.type}-${result.id}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setPage(result.page);
                            setGlobalSearchOpen(false);
                          }}
                        >
                          <span>{result.type}</span>
                          <strong>{highlightMatch(result.title, globalSearch)}</strong>
                          <small>{highlightMatch(result.meta, globalSearch)}</small>
                        </button>
                      )) : <p>No matching records found.</p>}
                    </div>
                  ) : (
                    <p className="crm-search-empty">Type a name, ID, company, phone, email, status, or amount.</p>
                  )}
                </div>
              )}
            </div>

            {/* Right controls */}
            <div className="crm-navbar-right">
              <button className="crm-navbar-icon-btn" type="button" aria-label="Notifications" title="Notifications">
                <Bell size={18} />
                <span className="crm-notif-dot" aria-label="3 unread notifications" />
              </button>
              <button className="crm-navbar-icon-btn" type="button" aria-label="Help and support" title="Help">
                <HelpCircle size={18} />
              </button>
              <div className="crm-profile-wrap">
              <button
                className="crm-navbar-profile"
                type="button"
                aria-label="User profile menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <div className="crm-avatar" aria-hidden="true">AR</div>
                <div className="crm-profile-meta">
                  <span className="crm-profile-name">Ali Raza</span>
                  <span className="crm-profile-role">Sales Manager</span>
                </div>
                <ChevronDown size={14} className="crm-profile-chevron" aria-hidden="true" />
              </button>
              {profileOpen && (
                <div className="crm-profile-menu" role="menu">
                  <button role="menuitem" type="button" onClick={() => setMessage('Profile opened')}>My Profile</button>
                  <button role="menuitem" type="button" onClick={() => setMessage('Account settings opened')}>Account Settings</button>
                  <button role="menuitem" type="button" onClick={() => setMessage('Preferences opened')}>Preferences</button>
                  <hr />
                  <button role="menuitem" type="button" onClick={() => setMessage('Signed out')}>Sign Out</button>
                </div>
              )}
              </div>
            </div>
          </header>

        {/* ── Alert banner ── */}
        {message && (
          <div
            role="alert"
            aria-live="polite"
            className={`crm-alert${isErrorMessage ? ' crm-alert--error' : ' crm-alert--success'}`}
          >
            <span>{message}</span>
            <button type="button" aria-label="Close alert" onClick={() => setMessage('')}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Page content ── */}
        <main className="crm-content" id="main-content">
          {page === 'leads' && (
            /* Leads page – uses dedicated lf-page-content styles */
            <div className="lf-page-content">
              <LeadsPage leads={leads} contacts={contacts} setLeads={setLeads} setMessage={setMessage} />
            </div>
          )}

          {page === 'contacts' && (
            <div className="crm-legacy-page">
              <ContactsPage contacts={contacts} setContacts={setContacts} setMessage={setMessage} />
            </div>
          )}

          {page === 'companies' && (
            <div className="crm-legacy-page">
              <CompaniesPage
                companies={companies}
                setCompanies={setCompanies}
                contacts={contacts}
                opportunities={opportunities}
                setMessage={setMessage}
              />
            </div>
          )}

          {(page === 'pipeline' || page === 'pipelineStage') && (
            <div className="crm-legacy-page">
              <PipelinePage
                leads={leads}
                setLeads={setLeads}
                opportunities={opportunities}
                setOpportunities={setOpportunities}
                setMessage={setMessage}
                dynamicStagePage={dynamicStagePage}
                setDynamicStagePage={setDynamicStagePage}
                activeStagePage={page === 'pipelineStage' ? activeStagePage : ''}
                setActiveStagePage={setActiveStagePage}
                opportunityStageConfig={opportunityStageConfig}
                setOpportunityStageConfig={setOpportunityStageConfig}
              />
            </div>
          )}

          {page === 'payments' && (
            <div className="crm-legacy-page">
              <PaymentsPage payments={payments} setPayments={setPayments} setMessage={setMessage} />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

function buildGlobalSearchResults(query, data) {
  const term = normalizeSearch(query);
  if (!term) return [];

  const makeResult = ({ id, type, page, title, fields }) => {
    const normalizedFields = fields.map(([label, value]) => [label, String(value ?? '')]).filter(([, value]) => value.trim());
    const matches = normalizedFields.filter(([, value]) => normalizeSearch(value).includes(term));
    if (matches.length === 0) return null;
    const titleText = String(title ?? '');
    const titleLower = normalizeSearch(titleText);
    const bestMatch = matches[0];
    const exact = normalizedFields.some(([, value]) => normalizeSearch(value) === term);
    const starts = normalizedFields.some(([, value]) => normalizeSearch(value).startsWith(term));
    const titleHit = titleLower.includes(term);
    const score = (exact ? 100 : 0) + (starts ? 50 : 0) + (titleHit ? 25 : 0) - normalizeSearch(matches[0][1]).indexOf(term);
    const meta = `${bestMatch[0]}: ${bestMatch[1]}`;
    return { id, type, page, title: titleText, meta, score };
  };

  const results = [];

  data.leads.forEach((lead) => {
    const result = makeResult({
      id: lead.id,
      type: 'Lead',
      page: 'leads',
      title: `${lead.clientId} · ${lead.customer}`,
      fields: [
        ['Client ID', lead.clientId],
        ['Contact', lead.customer],
        ['Company', lead.company],
        ['Designation', lead.jobTitle],
        ['Phone', lead.phone],
        ['Email', lead.email],
        ['Owner', lead.owner],
        ['Status', lead.status],
        ['Priority', lead.priority],
        ['Source', lead.source],
        ['Last Activity', lead.lastActivity],
        ['Date', lead.createdDate || lead.date],
        ['Value', lead.estimatedValue || lead.leadValue],
      ],
    });
    if (result) results.push(result);
  });

  data.contacts.forEach((contact) => {
    const result = makeResult({
      id: contact.id,
      type: 'Contact',
      page: 'contacts',
      title: contact.contact || contact.customer || contact.id,
      fields: [
        ['Contact ID', contact.id],
        ['Contact', contact.contact || contact.customer],
        ['Company', contact.company],
        ['Designation', contact.designation],
        ['Phone', contact.phone],
        ['Email', contact.email],
        ['Owner', contact.owner],
        ['Status', contact.status],
      ],
    });
    if (result) results.push(result);
  });

  data.companies.forEach((company) => {
    const result = makeResult({
      id: company.id,
      type: 'Company',
      page: 'companies',
      title: `${company.id || ''} · ${company.name || company.company || ''}`,
      fields: [
        ['Company ID', company.id],
        ['Company', company.name || company.company],
        ['Email', company.email],
        ['Phone', company.phone],
        ['Owner', company.owner],
        ['Type', company.type],
        ['Rating', company.rating],
        ['Industry', company.industry],
      ],
    });
    if (result) results.push(result);
  });

  data.opportunities.forEach((opportunity) => {
    const result = makeResult({
      id: opportunity.id,
      type: 'Opportunity',
      page: 'pipeline',
      title: opportunity.name || opportunity.id,
      fields: [
        ['Opportunity ID', opportunity.id],
        ['Opportunity', opportunity.name],
        ['Company', opportunity.company],
        ['Stage', opportunity.stage],
        ['Owner', opportunity.owner],
        ['Value', opportunity.value],
      ],
    });
    if (result) results.push(result);
  });

  data.payments.forEach((payment) => {
    const result = makeResult({
      id: payment.id,
      type: 'Payment',
      page: 'payments',
      title: payment.invoiceNo || payment.id,
      fields: [
        ['Payment ID', payment.id],
        ['Invoice', payment.invoiceNo],
        ['Customer', payment.customer],
        ['Company', payment.company],
        ['Status', payment.status],
        ['Amount', payment.amount],
        ['Date', payment.date],
      ],
    });
    if (result) results.push(result);
  });

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 8);
}

function normalizeSearch(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, '');
}

function highlightMatch(text, query) {
  const value = String(text ?? '');
  const term = normalizeSearch(query);
  if (!term) return value;
  const map = [];
  const normalized = [];
  [...value].forEach((char, index) => {
    if (/\s/.test(char)) return;
    normalized.push(char.toLowerCase());
    map.push(index);
  });
  const index = normalized.join('').indexOf(term);
  if (index === -1) return value;
  const start = map[index];
  const end = map[index + term.length - 1] + 1;
  return (
    <>
      {value.slice(0, start)}
      <mark>{value.slice(start, end)}</mark>
      {value.slice(end)}
    </>
  );
}
