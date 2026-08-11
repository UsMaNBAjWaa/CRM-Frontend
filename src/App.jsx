import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Database,
  ExternalLink,
  HelpCircle,
  LayoutGrid,
  Lock,
  MessageSquareText,
  Menu,
  Monitor,
  Moon,
  Power,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import LeadsPage from './pages/LeadsPage';
import ContactsPage from './pages/ContactsPage';
import CompaniesPage from './pages/CompaniesPage';
import PipelinePage from './pages/PipelinePage';
import PaymentsPage from './pages/PaymentsPage';
import { companySeed, contactSeed, leadSeed, opportunitySeed, paymentSeed } from './data/crmData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { key: 'leads', label: 'Leads', Icon: LayoutGrid },
  { key: 'contacts', label: 'Contacts', Icon: Users },
  { key: 'companies', label: 'Companies', Icon: Building2 },
  { key: 'pipeline', label: 'Pipeline', Icon: BarChart3 },
  { key: 'payments', label: 'Payments', Icon: CreditCard },
];

export default function App() {
  const [authStatus, setAuthStatus] = useState('checking');
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('dashboard');
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
  const [leadDetailOpen, setLeadDetailOpen] = useState(false);
  const [contactDetailOpen, setContactDetailOpen] = useState(false);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);
  const [leadDetailRequest, setLeadDetailRequest] = useState('');
  const [usingBackendData, setUsingBackendData] = useState(false);
  const [opportunityStageConfig, setOpportunityStageConfig] = useState({
    id: '', mode: 'standard', fields: [], records: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const response = await authRequest('/api/me/');
        if (!isMounted) return;
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch {
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setAuthStatus('ready');
      }
    }

    checkSession();
    return () => { isMounted = false; };
  }, []);

  const isErrorMessage = message.includes('required') || message.includes('exists');

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(''), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!currentUser) return undefined;
    let isMounted = true;

    async function loadBackendWorkspace() {
      try {
        const [leadsResponse, contactsResponse, companiesResponse, opportunitiesResponse, pipelineResponse] = await Promise.all([
          apiGet('/api/leads/?page_size=100'),
          apiGet('/api/contacts/?page_size=100'),
          apiGet('/api/companies/?page_size=100'),
          apiGet('/api/opportunities/?page_size=100'),
          apiGet('/api/pipeline/'),
        ]);

        if (!isMounted) return;

        const backendLeads = extractApiResults(leadsResponse).map(mapBackendLead);
        const backendContacts = extractApiResults(contactsResponse).map(mapBackendContact);
        const backendCompanies = extractApiResults(companiesResponse).map(mapBackendCompany);
        const backendOpportunities = extractApiResults(opportunitiesResponse).map(mapBackendOpportunity);
        const backendPipelineCards = extractApiResults(pipelineResponse);

        setLeads(backendLeads);
        setContacts(backendContacts);
        setCompanies(backendCompanies);
        setOpportunities(mergePipelineCardsIntoOpportunities(backendOpportunities, backendPipelineCards));
        setUsingBackendData(true);
      } catch (err) {
        if (!isMounted) return;
        setUsingBackendData(false);
        setMessage(err.message || 'Could not load backend CRM data.');
      }
    }

    loadBackendWorkspace();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Close mobile sidebar when navigating
  const navigate = (key) => {
    setPage(key);
    if (key === 'pipelineStage') setActiveStagePage(dynamicStagePage);
    if (key === 'pipeline') setActiveStagePage('');
    setSidebarOpen(false);
    setProfileOpen(false);
    if (key !== 'leads') setLeadDetailOpen(false);
    if (key !== 'contacts') setContactDetailOpen(false);
    if (key !== 'companies') setCompanyDetailOpen(false);
  };

  const globalSearchResults = buildGlobalSearchResults(globalSearch, {
    leads,
    contacts,
    companies,
    opportunities,
    payments,
  });

  const pageLabels = {
    dashboard: 'Dashboard',
    leads: 'Leads',
    contacts: 'Contacts',
    companies: 'Companies',
    pipeline: 'Pipeline',
    pipelineStage: activeStagePage || dynamicStagePage,
    payments: 'Payments',
  };
  const pageTitleOverride = page === 'leads' && leadDetailOpen
    ? 'Lead Detail'
    : page === 'contacts' && contactDetailOpen
      ? 'Contact Detail'
      : page === 'companies' && companyDetailOpen
        ? 'Company Detail'
        : '';
  const currentNavItem = NAV_ITEMS.find((item) => item.key === (page === 'pipelineStage' ? 'pipeline' : page)) || NAV_ITEMS[0];
  const CurrentPageIcon = currentNavItem.Icon;
  const visibleNavItems = currentUser?.user_type === 'ADMIN'
    ? NAV_ITEMS.filter((item) => item.key === 'dashboard')
    : dynamicStagePage
      ? [...NAV_ITEMS, { key: 'pipelineStage', label: dynamicStagePage, Icon: BarChart3 }]
      : NAV_ITEMS;

  const handleLogin = async ({ username, password }) => {
    const response = await authRequest('/api/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Invalid username or password.');
    }

    setCurrentUser(response.data);
    setMessage('');
  };

  const handleLogout = async () => {
    try {
      await authRequest('/api/logout/', { method: 'POST' });
    } catch {
      // The local UI should still return to login if the server session is already gone.
    } finally {
      setCurrentUser(null);
      setPage('dashboard');
      setMessage('');
    }
  };

  if (authStatus === 'checking') {
    return <AuthLoading />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
          {visibleNavItems.map(({ key, label, Icon }) => {
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

        </nav>

        {/* Sidebar footer */}
        <div className="crm-sb-footer">
          <div className="crm-sb-footer-avatar" aria-hidden="true">{getInitials(currentUser.username)}</div>
          <div className="crm-sb-footer-meta">
            <span className="crm-sb-footer-name">{formatUsername(currentUser.username)}</span>
            <span className="crm-sb-footer-role">{currentUser.user_type === 'ADMIN' ? 'Admin' : 'User'}</span>
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
            <span className="crm-navbar-page-icon">
              <CurrentPageIcon size={18} />
            </span>
            <span>{pageTitleOverride || pageLabels[page]}</span>
          </div>

          {/* Logo (mobile only, hidden on desktop) */}
          <div className="crm-navbar-brand-mobile" aria-hidden="true">
            <Boxes size={20} />
            <span>Lead<span>Flow</span></span>
          </div>

          {/* Global search (center) */}
          <div
            className={`crm-navbar-search${globalSearchOpen ? ' crm-navbar-search--active' : ''}`}
            role="search"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setGlobalSearchOpen(false);
            }}
          >
            <Search size={15} aria-hidden="true" />
            <input
              id="global-search"
              type="search"
              placeholder="Search..."
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
                          if (result.type === 'Lead') setLeadDetailRequest(result.id);
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
                aria-label="Open account panel"
                aria-haspopup="dialog"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <div className="crm-avatar" aria-hidden="true">{getInitials(currentUser.username)}</div>
                <div className="crm-profile-meta">
                  <span className="crm-profile-name">{formatUsername(currentUser.username)}</span>
                  <span className="crm-profile-role">{currentUser.user_type === 'ADMIN' ? 'Admin' : 'User'}</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {profileOpen && (
          <AccountDrawer
            user={currentUser}
            onClose={() => setProfileOpen(false)}
            onLogout={handleLogout}
          />
        )}

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
          {page === 'dashboard' && (
            <RoleDashboardPanel
              user={currentUser}
              usingBackendData={usingBackendData}
              onNavigate={navigate}
              counts={{
                leads: leads.length,
                contacts: contacts.length,
                companies: companies.length,
                opportunities: opportunities.length,
              }}
            />
          )}

          {page === 'leads' && (
            /* Leads page – uses dedicated lf-page-content styles */
            <div className="lf-page-content">
              <LeadsPage
                leads={leads}
                contacts={contacts}
                setLeads={setLeads}
                setContacts={setContacts}
                setCompanies={setCompanies}
                setMessage={setMessage}
                onDetailOpenChange={setLeadDetailOpen}
                globalSearch={globalSearch}
                detailRequestId={leadDetailRequest}
                onDetailRequestHandled={() => setLeadDetailRequest('')}
              />
            </div>
          )}

          {page === 'contacts' && (
            <div className="crm-legacy-page">
              <ContactsPage
                contacts={contacts}
                setContacts={setContacts}
                setMessage={setMessage}
                onDetailOpenChange={setContactDetailOpen}
              />
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
                onDetailOpenChange={setCompanyDetailOpen}
              />
            </div>
          )}

          {(page === 'pipeline' || page === 'pipelineStage') && (
            <div className="lf-page-content">
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

async function authRequest(path, options = {}) {
  const csrfToken = getCookie('csrftoken');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...options.headers,
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
}

function apiGet(path) {
  return authRequest(path);
}

function extractApiResults(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function mapBackendLead(lead) {
  return {
    id: lead.lead_code || `LD-${lead.id}`,
    backendId: lead.id,
    clientId: lead.lead_code || `LD-${lead.id}`,
    createdDate: toDateOnly(lead.created_at),
    date: toDateOnly(lead.created_at),
    customer: lead.full_name || 'Unnamed Lead',
    company: lead.company_name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    source: normalizeLabel(lead.source) || 'Website',
    owner: lead.assigned_salesperson_name || displayUserId(lead.assigned_salesperson),
    priority: normalizeLabel(lead.priority) || 'Medium',
    status: normalizeLabel(lead.status) || 'New',
    leadValue: Number(lead.amount || 0),
    estimatedValue: Number(lead.amount || 0),
    lastActivity: lead.updated_at ? `Updated ${toDateOnly(lead.updated_at)}` : 'Loaded from backend',
    upcomingFollowUp: '',
    nextFollowUp: '',
    notes: lead.notes || '',
    pipeline: lead.pipeline,
    pipelineStage: lead.pipeline_stage,
    isConverted: Boolean(lead.is_converted),
  };
}

function mapBackendContact(contact) {
  return {
    id: contact.contact_code || `CT-${contact.id}`,
    backendId: contact.id,
    clientId: contact.contact_code || `CT-${contact.id}`,
    date: toDateOnly(contact.created_at),
    contact: contact.full_name || 'Unnamed Contact',
    company: contact.company_name || '',
    designation: contact.designation || '',
    phone: contact.phone || contact.phone_number || '',
    email: contact.email || '',
    whatsapp: contact.whatsapp || contact.phone || contact.phone_number || '',
    address: contact.address || '',
    city: contact.city || '',
    country: contact.country || '',
    owner: contact.assigned_salesperson_name || displayUserId(contact.assigned_salesperson),
    status: normalizeLabel(contact.status) || 'Active',
    notes: contact.notes || '',
  };
}

function mapBackendCompany(company) {
  return {
    id: company.company_code || `CO-${company.id}`,
    backendId: company.id,
    name: company.name || 'Unnamed Company',
    type: normalizeLabel(company.type) || 'Prospect',
    rating: normalizeLabel(company.rating) || 'None',
    industry: company.industry || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    annualRevenue: Number(company.annual_revenue || 0),
    employees: Number(company.employee_count || 0),
    owner: company.assigned_salesperson_name || displayUserId(company.assigned_salesperson),
    leadSource: normalizeLabel(company.lead_source) || '',
    description: company.description || '',
    createdDate: toDateOnly(company.created_at),
  };
}

function mapBackendOpportunity(opportunity) {
  return {
    id: opportunity.opportunity_code || `OP-${opportunity.id}`,
    backendId: opportunity.id,
    name: opportunity.name || 'Unnamed Opportunity',
    company: opportunity.company_name || '',
    contact: opportunity.primary_contact_name || '',
    value: Number(opportunity.amount || 0),
    priority: 'Medium',
    closeDate: toDateOnly(opportunity.expected_close_date),
    owner: displayUserId(opportunity.assigned_salesperson),
    stage: normalizeLabel(opportunity.stage) || 'Prospecting',
    product: opportunity.product || 'CRM Suite',
    notes: opportunity.description || '',
    pipeline: opportunity.pipeline,
    pipelineStage: opportunity.pipeline_stage,
  };
}

function mergePipelineCardsIntoOpportunities(opportunities, cards) {
  if (!cards.length) return opportunities;

  const existingIds = new Set(opportunities.map((opportunity) => String(opportunity.backendId || opportunity.id)));
  const pipelineOpportunities = cards
    .filter((card) => card.entity_type === 'opportunity' && !existingIds.has(String(card.id)))
    .map((card) => ({
      id: `OP-${card.id}`,
      backendId: card.id,
      name: card.name || 'Pipeline Opportunity',
      company: card.company_name || '',
      contact: card.name || '',
      value: Number(card.amount || 0),
      priority: 'Medium',
      closeDate: toDateOnly(card.expected_close_date),
      owner: card.assigned_salesperson_name || displayUserId(card.assigned_salesperson_id),
      stage: normalizeLabel(card.stage) || 'Prospecting',
      product: 'CRM Suite',
      notes: card.notes || '',
      pipelineStage: card.pipeline_stage_id,
    }));

  return [...opportunities, ...pipelineOpportunities];
}

function toDateOnly(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function normalizeLabel(value) {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function displayUserId(value) {
  if (!value) return 'Unassigned';
  return `User ${value}`;
}

function getCookie(name) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

function AuthLoading() {
  return (
    <div className="auth-page auth-page--center">
      <div className="auth-loading-card">
        <Boxes size={28} aria-hidden="true" />
        <span>Preparing your workspace...</span>
      </div>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onLogin({ username: username.trim(), password });
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--center">
      <form className="login-card" onSubmit={submitLogin}>
        <div className="login-brand" aria-hidden="true">
          <span><Boxes size={24} /></span>
          <strong>Lead<span>Flow</span></strong>
        </div>
        <div className="login-heading">
          <h1>Login</h1>
          <p>Access your CRM portal account</p>
        </div>

        <label className="auth-field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin or salesperson1"
            autoComplete="username"
            required
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="auth-link-button" type="button">Forgot Password?</button>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          <Lock size={17} aria-hidden="true" />
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

function RoleDashboardPanel({ user, usingBackendData, counts, onNavigate }) {
  const isAdmin = user.user_type === 'ADMIN';
  const metrics = [
    ['Leads', counts.leads, 'From /api/leads/', TrendingUp],
    ['Contacts', counts.contacts, 'From /api/contacts/', Users],
    ['Companies', counts.companies, 'From /api/companies/', Building2],
    ['Opportunities', counts.opportunities, 'From /api/opportunities/', BarChart3],
  ];

  const cards = isAdmin
    ? [
      ['Admin Access', `${formatUsername(user.username)} is active in the admin panel with full CRM oversight.`, ShieldCheck],
      ['Backend Database', usingBackendData ? 'Connected to back/crm SQLite data through Django APIs.' : 'Waiting for backend APIs to respond.', Database],
      ['System Configuration', 'Use backend pipeline endpoints for global CRM stages, workflow rules, and panel settings.', Settings],
    ]
    : [
      ['Workspace Access', `${formatUsername(user.username)} is active in the user panel with live role-based access.`, UserRound],
      ['Backend Database', usingBackendData ? 'Connected to back/crm SQLite data through Django APIs.' : 'Using local fallback until backend APIs respond.', Database],
      ['Support Queue', 'Track support requests, customer follow-ups, and service conversations from one workspace.', MessageSquareText],
    ];

  return (
    <div className="portal-page portal-page--embedded user-dashboard">
      <header className="user-dashboard-hero">
        <div className="user-dashboard-hero-copy">
          <span className="user-dashboard-kicker">{isAdmin ? 'CRM ADMIN PANEL' : 'CRM USER PANEL'}</span>
          <h1>Welcome, {formatUsername(user.username)}</h1>
          <p>{isAdmin ? 'Administrative command center connected to your backend database and CRM API routes.' : 'Live workspace summary connected to your backend database and CRM API routes.'}</p>
        </div>
      </header>

      <main className="portal-main">
        <section className="user-dashboard-metrics" aria-label="Workspace record counts">
          {metrics.map(([label, value, helper, Icon]) => (
            <article className="user-dashboard-metric" key={label}>
              <span aria-hidden="true"><Icon size={20} /></span>
              <div>
                <strong>{value}</strong>
                <p>{label}</p>
                <small>{helper}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="user-dashboard-workspace">
          <div className="user-dashboard-section-head">
            <div>
              <h2>{isAdmin ? 'Admin Dashboard' : 'User Dashboard'}</h2>
              <p>{isAdmin ? 'Administrative shortcuts and backend-connected CRM status.' : 'Operational shortcuts and backend-connected CRM status.'}</p>
            </div>
          </div>
          {!isAdmin && (
            <div className="user-dashboard-action-row">
              <button type="button" onClick={() => onNavigate('leads')}>Open Leads <ArrowRight size={16} /></button>
              <button type="button" onClick={() => onNavigate('pipeline')}>Review Pipeline <ArrowRight size={16} /></button>
              <button type="button" onClick={() => onNavigate('contacts')}>View Contacts <ArrowRight size={16} /></button>
            </div>
          )}
        </section>

        <div className="user-dashboard-card-grid">
          {cards.map(([cardTitle, cardBody, Icon]) => (
            <article className="user-dashboard-card" key={cardTitle}>
              <span aria-hidden="true"><Icon size={20} /></span>
              <h3>{cardTitle}</h3>
              <p>{cardBody}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function AccountDrawer({ user, onClose, onLogout }) {
  return (
    <div className="account-drawer-layer" role="presentation">
      <button className="account-drawer-backdrop" type="button" aria-label="Close account panel" onClick={onClose} />
      <aside className="account-drawer" role="dialog" aria-modal="true" aria-label="Account panel">
        <button className="account-drawer-close" type="button" aria-label="Close account panel" onClick={onClose}>
          <X size={22} />
        </button>

        <header className="account-drawer-head">
          <div className="account-drawer-avatar">{getInitials(user.username)}</div>
          <div>
            <h2>{formatUsername(user.username)}</h2>
            <p>User Id: {user.id}</p>
            <button className="account-role-pill" type="button">
              {user.user_type === 'ADMIN' ? 'admin' : 'user'} <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="account-drawer-body">
          <section className="account-plan-card">
            <div className="account-trial">
              <Clock3 size={18} />
              <span>Your trial plan <strong>Expires in 14 day(s)</strong></span>
            </div>
            <div className="account-plan-row">
              <span className="account-plan-icon"><BriefcaseBusiness size={18} /></span>
              <strong>Enterprise Edition</strong>
              <button type="button">UPGRADE</button>
            </div>
          </section>

          <section className="account-setup-card">
            <span className="account-setup-icon"><Settings size={24} /></span>
            <div>
              <h3>Start your quick setup</h3>
              <p>Go to landing page</p>
            </div>
            <button type="button" aria-label="Open quick setup"><ChevronRight size={22} /></button>
          </section>

          <section className="account-mode-card">
            <h3>Mode</h3>
            <div className="account-mode-toggle" role="group" aria-label="Theme mode">
              <button className="active" type="button"><Sun size={18} />Day</button>
              <button type="button"><Moon size={18} />Night</button>
              <button type="button"><Monitor size={18} />Auto</button>
            </div>
          </section>

          <section className="account-help-card">
            <h3>Need Help?</h3>
            <p>Access account tools or sign out from this panel.</p>
          </section>
        </div>

        <footer className="account-drawer-footer">
          <button type="button"><ExternalLink size={18} />My Account</button>
          <button type="button" onClick={onLogout}><Power size={18} />Sign Out</button>
        </footer>
      </aside>
    </div>
  );
}

function formatUsername(username) {
  return String(username || 'User')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(username) {
  return String(username || 'User')
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
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
