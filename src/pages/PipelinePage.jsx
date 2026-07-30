import React, { useMemo, useState } from 'react';
import { ChevronDown, Edit, Filter, MoreHorizontal, Pin, Plus, Trash2 } from 'lucide-react';
import { Confirm, DetailBlock, DetailGrid, HighlightedText, IconButton, Modal, PanelActions, SearchableSelect, SearchBox, SelectField, TextField } from '../components/ui';
import { assignLeadOptions, companies, emptyLead, leadSources, owners, priorities, products, stages } from '../data/crmData';
import { formatCurrency } from '../utils/format';

export default function PipelinePage({ leads, setLeads, opportunities, setOpportunities, setMessage, setDynamicStagePage, activeStagePage, setActiveStagePage, opportunityStageConfig, setOpportunityStageConfig }) {
  const [stageList, setStageList] = useState(() => ['New', ...stages.filter((stage) => stage !== 'New')].map((stage) => ({ id: stage, name: stage, owner: 'System' })));
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ owner: 'All', company: 'All', priority: 'All', product: 'All' });
  const [dragged, setDragged] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [draggedStageId, setDraggedStageId] = useState(null);
  const [pendingMove, setPendingMove] = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageForm, setStageForm] = useState({ name: '', owner: owners[1] });
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);
  const [opportunityForm, setOpportunityForm] = useState({
    company: companies.find((item) => item !== 'All') || '',
    contact: '',
    value: '',
    closeDate: '',
    stage: 'New',
    owner: owners.find((item) => item !== 'All') || '',
    notes: '',
  });
  const [editingStage, setEditingStage] = useState(null);
  const [deleteStage, setDeleteStage] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [convertingLeadId, setConvertingLeadId] = useState(null);
  const [editingOpportunityId, setEditingOpportunityId] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [opportunityErrors, setOpportunityErrors] = useState([]);
  const [duplicateLeadId, setDuplicateLeadId] = useState(null);
  const [stagePrompt, setStagePrompt] = useState(null);
  const [stageFormChoice, setStageFormChoice] = useState(null);
  const [customBuilderStage, setCustomBuilderStage] = useState(null);
  const [standardPreviewStage, setStandardPreviewStage] = useState(null);
  const [fieldDraft, setFieldDraft] = useState({ label: '', type: 'Text', required: 'Yes' });
  const [editingFieldId, setEditingFieldId] = useState('');
  const [customDrop, setCustomDrop] = useState(null);
  const [customValues, setCustomValues] = useState({});
  const [customErrors, setCustomErrors] = useState([]);
  const [openRecordActionId, setOpenRecordActionId] = useState('');
  const opportunityStageId = opportunityStageConfig.id;
  const opportunityStageMode = opportunityStageConfig.mode;
  const customFields = opportunityStageConfig.fields;
  const stageRecords = opportunityStageConfig.records;
  const setOpportunityStageId = (id) => setOpportunityStageConfig((current) => ({ ...current, id }));
  const setOpportunityStageMode = (mode) => setOpportunityStageConfig((current) => ({ ...current, mode }));
  const setCustomFields = (nextFields) => setOpportunityStageConfig((current) => ({
    ...current,
    fields: typeof nextFields === 'function' ? nextFields(current.fields) : nextFields,
  }));
  const setStageRecords = (nextRecords) => setOpportunityStageConfig((current) => ({
    ...current,
    records: typeof nextRecords === 'function' ? nextRecords(current.records) : nextRecords,
  }));

  const opportunityFieldLabels = {
    company: 'Related Company',
    contact: 'Primary Contact',
    value: 'Deal Amount',
    closeDate: 'Expected Close Date',
    stage: 'Stage',
    owner: 'Assigned Salesperson',
  };

  const updateOpportunityField = (field, value) => {
    setOpportunityForm((current) => ({ ...current, [field]: value }));
    if (String(value).trim()) {
      setOpportunityErrors((current) => current.filter((error) => error !== opportunityFieldLabels[field]));
    }
  };

  const filtered = useMemo(() => opportunities
    .filter((item) => [item.id, item.name, item.company, item.contact, item.owner, item.stage, item.priority, item.product, item.closeDate]
      .some((value) => String(value || '').toLowerCase().includes(search.toLowerCase())))
    .filter((item) => filters.owner === 'All' || item.owner === filters.owner)
    .filter((item) => filters.company === 'All' || item.company === filters.company)
    .filter((item) => filters.priority === 'All' || item.priority === filters.priority)
    .filter((item) => filters.product === 'All' || item.product === filters.product), [opportunities, search, filters]);
  const stageLeads = useMemo(() => leads
    .filter((lead) => [lead.clientId, lead.customer, lead.company, lead.phone, lead.email, lead.owner, lead.status, lead.priority]
      .some((value) => String(value || '').toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (!duplicateLeadId) return 0;
      if (a.id === duplicateLeadId) return -1;
      if (b.id === duplicateLeadId) return 1;
      return 0;
    }), [leads, search, duplicateLeadId]);

  const totalValue = filtered.reduce((sum, item) => sum + item.value, 0);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const stageProbability = {
    Prospecting: 10,
    Qualified: 25,
    Demo: 40,
    Proposal: 60,
    Negotiation: 80,
    Won: 100,
  };
  const opportunityId = editingOpportunityId || `OP-${3000 + opportunities.length + 1}`;
  const probability = stageProbability[opportunityForm.stage] ?? 10;
  const opportunityStage = stageList.find((stage) => stage.id === opportunityStageId);
  const syncLeadStatus = (leadId, stageName) => {
    if (!leadId) return;
    setLeads((current) => current.map((lead) => lead.id === leadId
      ? { ...lead, status: stageName, lastActivity: `Pipeline stage: ${stageName}` }
      : lead));
  };
  const resolveLeadOwner = (assignLead) => assignLead === 'Decide Later' ? 'Not Assign' : assignLead;
  const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
  const getNextClientId = (currentLeads) => {
    const allIds = currentLeads.map((record) => Number(String(record.clientId || '').replace('CL-', ''))).filter(Number.isFinite);
    return `CL-${Math.max(1000, ...allIds) + 1}`;
  };
  const openNewLead = () => {
    setLeadForm(emptyLead);
    setDuplicateLeadId(null);
    setLeadModalOpen(true);
  };
  const saveLead = (event) => {
    event.preventDefault();
    if (!leadForm.customer.trim() || !leadForm.phone.trim()) {
      setMessage('Full Name and Phone Number are required.');
      return;
    }
    const duplicateLead = leads.find((lead) => normalizePhone(lead.phone) === normalizePhone(leadForm.phone));
    if (duplicateLead) {
      setLeads((current) => [duplicateLead, ...current.filter((lead) => lead.id !== duplicateLead.id)]);
      setDuplicateLeadId(duplicateLead.id);
      setSearch('');
      setLeadModalOpen(false);
      setMessage('User already exists with this phone number.');
      return;
    }
    setLeads((current) => [{
      ...leadForm,
      id: `LD-${1000 + current.length + 1}`,
      clientId: getNextClientId(current),
      date: new Date().toISOString().slice(0, 10),
      owner: resolveLeadOwner(leadForm.assignLead),
      status: stageList[0]?.name || 'New',
      leadValue: 0,
      lastActivity: 'Lead created',
      nextFollowUp: '',
    }, ...current]);
    setLeadModalOpen(false);
    setMessage('Lead created successfully.');
  };

  const createStage = (event) => {
    event.preventDefault();
    const name = stageForm.name.trim();
    if (!name || !stageForm.owner) {
      setMessage('Stage Name and Owner are required.');
      return;
    }
    if (stageList.some((stage) => stage.id !== editingStage?.id && stage.name.toLowerCase() === name.toLowerCase())) {
      setMessage('Stage already exists.');
      return;
    }
    if (editingStage) {
      setStageList((current) => current.map((stage) => stage.id === editingStage.id ? { ...stage, name, owner: stageForm.owner } : stage));
      setOpportunities((current) => current.map((item) => item.stage === editingStage.name ? { ...item, stage: name } : item));
      setMessage('Stage updated successfully.');
    } else {
      setStageList((current) => [...current, { id: name, name, owner: stageForm.owner }]);
      setMessage('Stage created successfully.');
    }
    setStageForm({ name: '', owner: owners[1] });
    setStageModalOpen(false);
    setEditingStage(null);
  };

  const openCreateStage = () => {
    setEditingStage(null);
    setStageForm({ name: '', owner: owners[1] });
    setStageModalOpen(true);
  };

  const openLeadOpportunity = (lead, stageName) => {
    const targetStage = stageList.find((stage) => stage.name === stageName);
    if (targetStage?.id === opportunityStageId && opportunityStageMode === 'custom') {
      setCustomErrors([]);
      setCustomValues(customFields.reduce((values, field) => ({ ...values, [field.id]: '' }), {}));
      setCustomDrop({ type: 'lead', lead, stageName });
      setDraggedLead(null);
      return;
    }
    setOpportunityErrors([]);
    setConvertingLeadId(lead.id);
    setOpportunityForm({
      company: lead.company || companies.find((item) => item !== 'All') || '',
      contact: lead.customer || '',
      value: lead.leadValue ? String(lead.leadValue) : '',
      closeDate: lead.nextFollowUp || '',
      stage: stageName,
      owner: lead.owner && lead.owner !== 'Not Assign' ? lead.owner : owners.find((item) => item !== 'All') || '',
      notes: lead.notes || '',
    });
    setOpportunityModalOpen(true);
    setDraggedLead(null);
  };

  const moveLeadToStage = (lead, stageName) => {
    const targetStage = stageList.find((stage) => stage.name === stageName);
    if (targetStage?.id === opportunityStageId) {
      openLeadOpportunity(lead, stageName);
      return;
    }
    syncLeadStatus(lead.id, stageName);
    setDraggedLead(null);
    setMessage('Lead stage updated successfully.');
  };

  const openItemOpportunityStage = (item, stageName) => {
    const targetStage = stageList.find((stage) => stage.name === stageName);
    if (targetStage?.id === opportunityStageId && opportunityStageMode === 'custom') {
      setCustomErrors([]);
      setCustomValues(customFields.reduce((values, field) => ({
        ...values,
        [field.id]: field.label.toLowerCase().includes('company') ? item.company : field.label.toLowerCase().includes('contact') ? item.contact : '',
      }), {}));
      setCustomDrop({ type: 'opportunity', item, stageName });
      setDragged(null);
      return;
    }
    if (targetStage?.id === opportunityStageId && opportunityStageMode === 'standard') {
      setOpportunityErrors([]);
      setSelected(null);
      setConvertingLeadId(null);
      setEditingOpportunityId(item.id);
      setOpportunityForm({
        company: item.company,
        contact: item.contact,
        value: String(item.value),
        closeDate: item.closeDate,
        stage: stageName,
        owner: item.owner,
        notes: item.notes || '',
      });
      setOpportunityModalOpen(true);
      setDragged(null);
      return;
    }
    setPendingMove({ id: item.id, name: item.name, from: item.stage, to: stageName });
  };

  const openEditOpportunity = (opportunity) => {
    setOpportunityErrors([]);
    setSelected(null);
    setConvertingLeadId(null);
    setEditingOpportunityId(opportunity.id);
    setOpportunityForm({
      company: opportunity.company,
      contact: opportunity.contact,
      value: String(opportunity.value),
      closeDate: opportunity.closeDate,
      stage: opportunity.stage,
      owner: opportunity.owner,
      notes: opportunity.notes || '',
    });
    setOpportunityModalOpen(true);
  };

  const saveOpportunity = (event) => {
    event.preventDefault();
    const amount = Number(opportunityForm.value);
    const missing = [
      !opportunityForm.company && 'Related Company',
      !opportunityForm.contact.trim() && 'Primary Contact',
      !amount && 'Deal Amount',
      !opportunityForm.closeDate && 'Expected Close Date',
      !opportunityForm.stage && 'Stage',
      !opportunityForm.owner && 'Assigned Salesperson',
    ].filter(Boolean);
    if (missing.length) {
      setOpportunityErrors(missing);
      return;
    }
    setOpportunityErrors([]);
    const nextOpportunity = {
      name: opportunityForm.company,
      company: opportunityForm.company,
      contact: opportunityForm.contact,
      value: amount,
      priority: amount >= 800000 ? 'High' : amount >= 400000 ? 'Medium' : 'Low',
      closeDate: opportunityForm.closeDate,
      owner: opportunityForm.owner,
      stage: opportunityForm.stage,
      product: 'CRM Suite',
      notes: opportunityForm.notes,
      leadId: convertingLeadId || opportunities.find((item) => item.id === editingOpportunityId)?.leadId,
    };
    setOpportunities((current) => editingOpportunityId
      ? current.map((item) => item.id === editingOpportunityId ? { ...item, ...nextOpportunity } : item)
      : [{ id: `OP-${3000 + current.length + 1}`, ...nextOpportunity }, ...current]);
    if (stageList.find((stage) => stage.id === opportunityStageId)?.name === opportunityForm.stage) {
      setStageRecords((current) => [{
        id: `REC-${Date.now()}`,
        stage: opportunityForm.stage,
        sourceName: opportunityForm.company,
        sourceId: editingOpportunityId || convertingLeadId || opportunityId,
        createdAt: new Date().toISOString().slice(0, 10),
        values: {
          company: opportunityForm.company,
          contact: opportunityForm.contact,
          value: amount,
          closeDate: opportunityForm.closeDate,
          owner: opportunityForm.owner,
        },
      }, ...current]);
      setDynamicStagePage(opportunityForm.stage);
    }
    if (convertingLeadId) {
      syncLeadStatus(convertingLeadId, opportunityForm.stage);
    }
    setOpportunityModalOpen(false);
    setConvertingLeadId(null);
    setEditingOpportunityId(null);
    setMessage(editingOpportunityId ? 'Opportunity updated successfully.' : 'Opportunity created successfully.');
  };

  const openEditStage = (stage) => {
    setEditingStage(stage);
    setStageForm({ name: stage.name, owner: stage.owner === 'System' ? owners[1] : stage.owner });
    setStageModalOpen(true);
  };

  const handleStageRowClick = (stage) => {
    if (opportunityStageId && opportunityStageId !== stage.id) {
      setMessage('One opportunity stage already exists. Remove it before selecting another stage.');
      return;
    }
    setStagePrompt(stage);
  };

  const makeStandardOpportunityStage = (stage) => {
    setOpportunityStageId(stage.id);
    setOpportunityStageMode('standard');
    setDynamicStagePage(stage.name);
    setStandardPreviewStage(null);
    setMessage(`${stage.name} is now an opportunity stage.`);
  };

  const openStandardPreview = (stage) => {
    setStageFormChoice(null);
    setStandardPreviewStage(stage);
  };

  const addCustomField = () => {
    const label = fieldDraft.label.trim();
    if (!label) {
      setMessage('Field name is required.');
      return;
    }
    if (editingFieldId) {
      setCustomFields((current) => current.map((field) => field.id === editingFieldId ? { ...field, ...fieldDraft, label } : field));
      setEditingFieldId('');
    } else {
      setCustomFields((current) => [...current, { id: `field-${Date.now()}`, ...fieldDraft, label }]);
    }
    setFieldDraft({ label: '', type: 'Text', required: 'Yes' });
  };

  const saveCustomStageForm = () => {
    if (!customBuilderStage) return;
    if (!customFields.length) {
      setMessage('Create at least one field for custom form.');
      return;
    }
    setOpportunityStageId(customBuilderStage.id);
    setOpportunityStageMode('custom');
    setDynamicStagePage(customBuilderStage.name);
    setCustomBuilderStage(null);
    setEditingFieldId('');
    setFieldDraft({ label: '', type: 'Text', required: 'Yes' });
    setMessage(`${customBuilderStage.name} custom opportunity form saved.`);
  };

  const openCustomBuilder = (stage) => {
    setOpportunityStageMode('custom');
    setStageFormChoice(null);
    setCustomBuilderStage(stage);
    setEditingFieldId('');
    setFieldDraft({ label: '', type: 'Text', required: 'Yes' });
  };

  const editCustomField = (field) => {
    setEditingFieldId(field.id);
    setFieldDraft({ label: field.label, type: field.type, required: field.required });
  };

  const deleteCustomField = (fieldId) => {
    setCustomFields((current) => current.filter((field) => field.id !== fieldId));
    if (editingFieldId === fieldId) {
      setEditingFieldId('');
      setFieldDraft({ label: '', type: 'Text', required: 'Yes' });
    }
  };

  const submitCustomDrop = (event) => {
    event.preventDefault();
    const missing = customFields
      .filter((field) => field.required === 'Yes' && !String(customValues[field.id] || '').trim())
      .map((field) => field.id);
    if (missing.length) {
      setCustomErrors(missing);
      return;
    }
    const source = customDrop?.lead || customDrop?.item;
    setStageRecords((current) => [{
      id: `REC-${Date.now()}`,
      stage: customDrop.stageName,
      sourceName: source?.customer || source?.name || source?.company,
      sourceId: source?.clientId || source?.id,
      createdAt: new Date().toISOString().slice(0, 10),
      values: customValues,
    }, ...current]);
    if (customDrop.type === 'lead') {
      syncLeadStatus(customDrop.lead.id, customDrop.stageName);
    } else {
      setOpportunities((current) => current.map((item) => item.id === customDrop.item.id ? { ...item, stage: customDrop.stageName } : item));
      syncLeadStatus(customDrop.item.leadId, customDrop.stageName);
    }
    setCustomDrop(null);
    setDragged(null);
    setDraggedLead(null);
    setDynamicStagePage(customDrop.stageName);
    setMessage('Opportunity stage form saved successfully.');
  };

  const confirmDeleteStage = () => {
    const hasCards = opportunities.some((item) => item.stage === deleteStage.name);
    if (hasCards) {
      setMessage('Unable to delete stage with opportunities.');
      setDeleteStage(null);
      return;
    }
    setStageList((current) => current.filter((stage) => stage.id !== deleteStage.id));
    setMessage('Stage deleted successfully.');
    setDeleteStage(null);
  };

  const confirmMove = () => {
    const movedOpportunity = opportunities.find((item) => item.id === pendingMove.id);
    setOpportunities((current) => current.map((item) => item.id === pendingMove.id ? { ...item, stage: pendingMove.to } : item));
    syncLeadStatus(movedOpportunity?.leadId, pendingMove.to);
    setMessage('Opportunity stage updated successfully.');
    setPendingMove(null);
    setDragged(null);
  };
  const moveStage = (targetStageId) => {
    if (!draggedStageId || draggedStageId === targetStageId) return;
    setStageList((current) => {
      const fromIndex = current.findIndex((stage) => stage.id === draggedStageId);
      const toIndex = current.findIndex((stage) => stage.id === targetStageId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedStageId(null);
    setMessage('Pipeline stage order updated.');
  };

  if (activeStagePage && opportunityStage) {
    const pageRecords = stageRecords
      .filter((record) => record.stage === activeStagePage)
      .filter((record) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;
        return [record.sourceName, record.sourceId, record.createdAt, ...Object.values(record.values || {})]
          .some((value) => String(value || '').toLowerCase().includes(term));
      });

    return (
      <section className="page salesforce-leads salesforce-pipeline">
        <div className="sf-list-head">
          <div className="sf-title-wrap">
            <div className="sf-object-icon pipeline-icon"><span /></div>
            <div>
              <p>Opportunity Stage</p>
              <button type="button" className="sf-list-title">
                {activeStagePage} <ChevronDown size={18} />
              </button>
            </div>
            <button type="button" className="sf-pin" aria-label="Pin list"><Pin size={15} /></button>
          </div>
        </div>
        <div className="toolbar lead-toolbar">
          <SearchBox value={search} onChange={setSearch} placeholder="Search this list..." />
        </div>
        <div className="sf-list-panel opportunity-stage-page">
          <div className="generated-page-head">
            <div>
              <span>Generated Page</span>
              <h3>{activeStagePage}</h3>
            </div>
            <span className="pill qualified">{opportunityStageMode === 'standard' ? 'Standard Form' : 'Custom Form'}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>SR#</th>
                <th>Source</th>
                <th>Source ID</th>
                <th>Date</th>
                {opportunityStageMode === 'custom'
                  ? customFields.map((field) => <th key={field.id}>{field.label}</th>)
                  : ['Company', 'Contact', 'Value', 'Close Date', 'Owner'].map((field) => <th key={field}>{field}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRecords.map((record, index) => (
                <tr key={record.id}>
                  <td>{index + 1}</td>
                  <td><HighlightedText text={record.sourceName} query={search} /></td>
                  <td><HighlightedText text={record.sourceId} query={search} /></td>
                  <td><HighlightedText text={record.createdAt} query={search} /></td>
                  {opportunityStageMode === 'custom'
                    ? customFields.map((field) => <td key={field.id}><HighlightedText text={record.values[field.id] || '-'} query={search} /></td>)
                    : ['company', 'contact', 'value', 'closeDate', 'owner'].map((field) => <td key={field}><HighlightedText text={field === 'value' && record.values[field] ? formatCurrency(record.values[field]) : record.values[field] || '-'} query={search} /></td>)}
                  <td>
                    <div className="action-menu-wrap">
                      <IconButton label="Record actions" onClick={() => setOpenRecordActionId((current) => current === record.id ? '' : record.id)}><MoreHorizontal size={16} /></IconButton>
                      {openRecordActionId === record.id && (
                        <div className="row-action-menu">
                          <button type="button" onClick={() => { setMessage('Edit record opened.'); setOpenRecordActionId(''); }}><Edit size={15} />Edit</button>
                          <hr />
                          <button type="button" className="danger-menu-item" onClick={() => { setStageRecords((current) => current.filter((item) => item.id !== record.id)); setOpenRecordActionId(''); }}><Trash2 size={15} />Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!pageRecords.length && (
                <tr><td colSpan={opportunityStageMode === 'custom' ? 5 + customFields.length : 10}>No records saved for this stage yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (standardPreviewStage) {
    return (
      <section className="page salesforce-leads salesforce-pipeline">
        <div className="sf-list-head">
          <div className="sf-title-wrap">
            <div className="sf-object-icon pipeline-icon"><span /></div>
            <div>
              <p>{standardPreviewStage.name}</p>
              <button type="button" className="sf-list-title">
                Standard form <ChevronDown size={18} />
              </button>
            </div>
            <button type="button" className="sf-pin" aria-label="Pin list"><Pin size={15} /></button>
          </div>
          <div className="sf-action-strip">
            <button className="sf-action back-action" onClick={() => setStandardPreviewStage(null)}>Back</button>
          </div>
        </div>
        <div className="sf-list-panel custom-builder-page">
          <form className="opportunity-form standard-preview-form">
            <label className="field">
              <span>Opportunity ID</span>
              <input value="Auto generated" readOnly />
            </label>
            <label className="field">
              <span>Related Company*</span>
              <input value="Selected lead company" readOnly />
            </label>
            <label className="field">
              <span>Primary Contact*</span>
              <input value="Selected lead contact" readOnly />
            </label>
            <label className="field">
              <span>Deal Amount*</span>
              <input value="0.00" readOnly />
            </label>
            <label className="field">
              <span>Expected Close Date*</span>
              <input value="yyyy-mm-dd" readOnly />
            </label>
            <label className="field">
              <span>Probability (%)</span>
              <input value="Calculated by stage" readOnly />
            </label>
            <label className="field">
              <span>Stage*</span>
              <input value={standardPreviewStage.name} readOnly />
            </label>
            <label className="field">
              <span>Assigned Salesperson*</span>
              <input value="Selected owner" readOnly />
            </label>
            <label className="field wide">
              <span>Notes / Description</span>
              <textarea rows="4" value="Notes entered when the opportunity is created." readOnly />
            </label>
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => setStandardPreviewStage(null)}>Back</button>
              <button type="button" className="button primary" onClick={() => makeStandardOpportunityStage(standardPreviewStage)}>Save Standard Form</button>
            </PanelActions>
          </form>
        </div>
      </section>
    );
  }

  if (customBuilderStage) {
    return (
      <section className="page salesforce-leads salesforce-pipeline">
        <div className="sf-list-head">
          <div className="sf-title-wrap">
            <div className="sf-object-icon pipeline-icon"><span /></div>
            <div>
              <p>{customBuilderStage.name}</p>
              <button type="button" className="sf-list-title">
                Create your Custom New Form <ChevronDown size={18} />
              </button>
            </div>
            <button type="button" className="sf-pin" aria-label="Pin list"><Pin size={15} /></button>
          </div>
        </div>
        <div className="sf-list-panel custom-builder-page">
          <div className="custom-builder">
            <div className="form-grid custom-field-grid">
              <TextField label="Field Name*" value={fieldDraft.label} onChange={(label) => setFieldDraft({ ...fieldDraft, label })} />
              <SelectField label="Data Type" value={fieldDraft.type} options={['Text', 'Number', 'Date', 'Email', 'Phone']} onChange={(type) => setFieldDraft({ ...fieldDraft, type })} />
              <SelectField label="Required" value={fieldDraft.required} options={['Yes', 'No']} onChange={(required) => setFieldDraft({ ...fieldDraft, required })} />
              <PanelActions>
                <button type="button" className="button secondary" onClick={addCustomField}><Plus size={16} />{editingFieldId ? 'Update Field' : 'Add Field'}</button>
              </PanelActions>
            </div>
            <div className="custom-fields-table">
              {customFields.length > 0 ? customFields.map((field) => (
                <div key={field.id} className="custom-field-row">
                  <div>
                    <strong>{field.label}</strong>
                    <span>{field.type} · Required: {field.required}</span>
                  </div>
                  <div className="row-menu-actions">
                    <IconButton label="Edit Field" onClick={() => editCustomField(field)}><Edit size={15} /></IconButton>
                    <IconButton label="Delete Field" onClick={() => deleteCustomField(field.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              )) : <div className="empty-field-row">No fields created yet.</div>}
            </div>
            <PanelActions>
              <button className="button secondary" onClick={() => setCustomBuilderStage(null)}>Cancel</button>
              <button className="button primary" onClick={saveCustomStageForm}>Save Custom Form</button>
            </PanelActions>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page salesforce-leads salesforce-pipeline">
      <div className="sf-list-head">
        <div className="sf-title-wrap">
          <div className="sf-object-icon pipeline-icon"><span /></div>
          <div>
            <p>Pipeline</p>
            <button type="button" className="sf-list-title">
              Sales Pipeline <ChevronDown size={18} />
            </button>
          </div>
          <button type="button" className="sf-pin" aria-label="Pin list"><Pin size={15} /></button>
        </div>
        <div className="sf-action-strip">
          <button className="sf-action" onClick={openNewLead}>New</button>
          <button className="sf-action" onClick={openCreateStage}>Create Stage</button>
          <button className="sf-action" onClick={() => setShowStages((show) => !show)}>{showStages ? 'Hide Stages' : 'Manage Stages'}</button>
        </div>
      </div>
      <div className="toolbar lead-toolbar pipeline-toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search opportunities or companies" />
        <button type="button" className={`sf-filter-toggle ${filtersOpen ? 'active' : ''}`} aria-label="Pipeline filters" onClick={() => setFiltersOpen(true)}><Filter size={18} /></button>
      </div>
      {showStages && (
        <div className="sf-list-panel stage-management table-wrap">
          <table>
            <thead>
              <tr>
                <th>Stage Name</th>
                <th>Owner</th>
                <th>Opportunities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stageList.map((stage) => (
                <tr key={stage.id} className="clickable-row" onClick={() => handleStageRowClick(stage)}>
                  <td><HighlightedText text={stage.name} query={search} /></td>
                  <td><HighlightedText text={stage.owner} query={search} /></td>
                  <td>
                    {opportunityStageId === stage.id ? <span className="pill qualified">Opportunity Stage</span> : filtered.filter((item) => item.stage === stage.name).length}
                  </td>
                  <td>
                    <div className="actions">
                      <IconButton label="Edit Stage" onClick={(event) => { event.stopPropagation(); openEditStage(stage); }}><Edit size={15} /></IconButton>
                      <IconButton label="Delete Stage" onClick={(event) => { event.stopPropagation(); setDeleteStage(stage); }}><Trash2 size={15} /></IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="stats-strip">
        {stageList.map((stage) => (
          <div
            key={stage.id}
            className="draggable-stat"
            draggable
            onDragStart={() => setDraggedStageId(stage.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveStage(stage.id)}
          >
            <span>{stage.name}</span>
            <strong>{filtered.filter((item) => item.stage === stage.name).length + stageLeads.filter((lead) => lead.status === stage.name).length}</strong>
          </div>
        ))}
        <div><span>Total Pipeline Value</span><strong>{formatCurrency(totalValue)}</strong></div>
      </div>
      <div className="kanban-board">
        {stageList.map((stage) => (
          <PipelineStageColumn
            key={stage.id}
            stage={stage}
            items={filtered.filter((item) => item.stage === stage.name)}
            leads={stageLeads.filter((lead) => lead.status === stage.name)}
            duplicateLeadId={duplicateLeadId}
            dragged={dragged}
            draggedLead={draggedLead}
            setPendingMove={setPendingMove}
            moveLeadToStage={moveLeadToStage}
            openItemOpportunityStage={openItemOpportunityStage}
            setSelected={setSelected}
            setSelectedLead={setSelectedLead}
            setDragged={setDragged}
            setDraggedLead={setDraggedLead}
            formatCurrency={formatCurrency}
            search={search}
          />
        ))}
      </div>
      {stageModalOpen && (
        <Modal title={editingStage ? 'Edit Stage' : 'Create Stage'} onClose={() => setStageModalOpen(false)}>
          <form className="form-grid stage-form-grid" onSubmit={createStage}>
            <TextField label="Stage Name*" value={stageForm.name} onChange={(name) => setStageForm({ ...stageForm, name })} />
            <SelectField label="Owner*" value={stageForm.owner} options={owners.filter((item) => item !== 'All')} onChange={(owner) => setStageForm({ ...stageForm, owner })} />
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => setStageModalOpen(false)}>Cancel</button>
              <button type="submit" className="button primary">{editingStage ? 'Save Changes' : 'Save Stage'}</button>
            </PanelActions>
          </form>
        </Modal>
      )}
      {leadModalOpen && (
        <Modal title="Add Lead" onClose={() => setLeadModalOpen(false)}>
          <form className="form-grid" onSubmit={saveLead}>
            <TextField label="Full Name*" value={leadForm.customer} onChange={(customer) => setLeadForm({ ...leadForm, customer })} />
            <TextField label="Phone Number*" value={leadForm.phone} onChange={(phone) => setLeadForm({ ...leadForm, phone })} />
            <TextField label="Email" value={leadForm.email} onChange={(email) => setLeadForm({ ...leadForm, email })} />
            <TextField label="Company" value={leadForm.company} onChange={(company) => setLeadForm({ ...leadForm, company })} />
            <SelectField label="Lead Source" value={leadForm.source} options={leadSources.filter((item) => item !== 'All')} onChange={(source) => setLeadForm({ ...leadForm, source })} />
            <SelectField label="Priority" value={leadForm.priority} options={priorities.filter((item) => item !== 'All')} onChange={(priority) => setLeadForm({ ...leadForm, priority })} />
            <SelectField label="Owner" value={leadForm.assignLead} options={assignLeadOptions} onChange={(assignLead) => setLeadForm({ ...leadForm, assignLead })} />
            <label className="field wide">
              <span>Notes</span>
              <textarea rows="4" value={leadForm.notes} onChange={(event) => setLeadForm({ ...leadForm, notes: event.target.value })} />
            </label>
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => setLeadModalOpen(false)}>Cancel</button>
              <button type="submit" className="button primary">Save Lead</button>
            </PanelActions>
          </form>
        </Modal>
      )}
      {opportunityModalOpen && (
        <Modal title="Opportunity Details" onClose={() => setOpportunityModalOpen(false)}>
          <form className="opportunity-form" onSubmit={saveOpportunity}>
            <label className="field">
              <span>Opportunity ID</span>
              <input value={opportunityId} readOnly />
            </label>
            <div className="related-row">
              <span>Related Company</span>
              <strong>{opportunityForm.company || 'Select a company'}</strong>
              <button type="button">Open Profile »</button>
            </div>
            <div className="related-row">
              <span>Primary Contact</span>
              <strong>{opportunityForm.contact || opportunityForm.company || 'Company'}</strong>
              <button type="button">Open Profile »</button>
            </div>
            <SearchableSelect className={`field ${opportunityErrors.includes('Related Company') ? 'field-error' : ''}`} label="Related Company*" value={opportunityForm.company} options={companies.filter((item) => item !== 'All')} onChange={(company) => updateOpportunityField('company', company)} placeholder="Search company" />
            <label className={`field ${opportunityErrors.includes('Primary Contact') ? 'field-error' : ''}`}>
              <span>Primary Contact*</span>
              <input value={opportunityForm.contact} onChange={(event) => updateOpportunityField('contact', event.target.value)} />
            </label>
            <label className={`field ${opportunityErrors.includes('Deal Amount') ? 'field-error' : ''}`}>
              <span>Deal Amount*</span>
              <input value={opportunityForm.value} onChange={(event) => updateOpportunityField('value', event.target.value)} />
            </label>
            <label className={`field ${opportunityErrors.includes('Expected Close Date') ? 'field-error' : ''}`}>
              <span>Expected Close Date*</span>
              <input type="date" value={opportunityForm.closeDate} onChange={(event) => updateOpportunityField('closeDate', event.target.value)} />
            </label>
            <label className="field">
              <span>Probability (%)</span>
              <input value={probability} readOnly />
              <small>Calculated dynamically based on column stage.</small>
            </label>
            <SearchableSelect className={`field ${opportunityErrors.includes('Stage') ? 'field-error' : ''}`} label="Stage*" value={opportunityForm.stage} options={stageList.map((stage) => stage.name)} onChange={(stage) => updateOpportunityField('stage', stage)} placeholder="Search stage" />
            <SearchableSelect className={`field ${opportunityErrors.includes('Assigned Salesperson') ? 'field-error' : ''}`} label="Assigned Salesperson*" value={opportunityForm.owner} options={owners.filter((item) => item !== 'All')} onChange={(owner) => updateOpportunityField('owner', owner)} placeholder="Search salesperson" />
            <label className="field wide">
              <span>Notes / Description</span>
              <textarea rows="4" value={opportunityForm.notes} onChange={(event) => setOpportunityForm({ ...opportunityForm, notes: event.target.value })} />
            </label>
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => { setOpportunityModalOpen(false); setEditingOpportunityId(null); setConvertingLeadId(null); setOpportunityErrors([]); }}>Cancel</button>
              <button type="submit" className="button primary">{editingOpportunityId ? 'Save Changes' : 'Save Opportunity'}</button>
            </PanelActions>
          </form>
        </Modal>
      )}
      {filtersOpen && (
        <Modal title="Filters" onClose={() => setFiltersOpen(false)}>
          <div className="sf-filter-popup">
            <div className="sf-filter-popup-grid">
              <SearchableSelect className="sf-filter-card" label="Owner" value={filters.owner} options={owners} onChange={(owner) => updateFilter('owner', owner)} placeholder="Search owner" />
              <SearchableSelect className="sf-filter-card" label="Company" value={filters.company} options={companies} onChange={(company) => updateFilter('company', company)} placeholder="Search company" />
              <SearchableSelect className="sf-filter-card" label="Priority" value={filters.priority} options={priorities} onChange={(priority) => updateFilter('priority', priority)} placeholder="Search priority" />
              <SearchableSelect className="sf-filter-card" label="Product" value={filters.product} options={products} onChange={(product) => updateFilter('product', product)} placeholder="Search product" />
            </div>
            <div className="sf-filter-links">
              <button type="button" onClick={() => setFilters({ owner: 'All', company: 'All', priority: 'All', product: 'All' })}>Remove All</button>
            </div>
            <PanelActions>
              <button className="button secondary" onClick={() => setFiltersOpen(false)}>Cancel</button>
              <button className="button primary" onClick={() => setFiltersOpen(false)}>Apply</button>
            </PanelActions>
          </div>
        </Modal>
      )}
      {stagePrompt && (
        <Modal title={opportunityStageId === stagePrompt.id ? 'Remove Opportunity Stage' : 'Opportunity Stage'} onClose={() => setStagePrompt(null)}>
          <div className="stack">
            {opportunityStageId === stagePrompt.id ? (
              <>
                <p className="modal-text">Do you want to remove opportunity from {stagePrompt.name} stage?</p>
                <PanelActions>
                  <button className="button secondary" onClick={() => setStagePrompt(null)}>Cancel</button>
                  {opportunityStageMode === 'custom' && <button className="button secondary" onClick={() => { setCustomBuilderStage(stagePrompt); setStagePrompt(null); }}>Edit Form</button>}
                  <button className="button danger" onClick={() => { setOpportunityStageConfig({ id: '', mode: 'standard', fields: [], records: [] }); setDynamicStagePage(''); setActiveStagePage(''); setStagePrompt(null); setMessage('Opportunity stage removed.'); }}>Remove Opportunity</button>
                </PanelActions>
              </>
            ) : (
              <>
                <p className="modal-text">Do you want to make this stage as a Opportunity stage?</p>
                <PanelActions>
                  <button className="button secondary" onClick={() => setStagePrompt(null)}>No</button>
                  <button className="button primary" onClick={() => { setStageFormChoice(stagePrompt); setStagePrompt(null); }}>Yes</button>
                </PanelActions>
              </>
            )}
          </div>
        </Modal>
      )}
      {stageFormChoice && (
        <Modal title={`${stageFormChoice.name} Form Type`} onClose={() => setStageFormChoice(null)}>
          <div className="form-choice-grid">
            <button type="button" className="choice-card" onClick={() => openStandardPreview(stageFormChoice)}>
              <strong>Standard Form</strong>
              <span>Use the existing opportunity details form.</span>
            </button>
            <button type="button" className="choice-card" onClick={() => openCustomBuilder(stageFormChoice)}>
              <strong>Create New Form</strong>
              <span>Create custom fields and data types.</span>
            </button>
          </div>
          {opportunityStageMode === 'custom' && (
            <div className="custom-builder">
              <div className="form-grid custom-field-grid">
                <TextField label="Field Name*" value={fieldDraft.label} onChange={(label) => setFieldDraft({ ...fieldDraft, label })} />
                <SelectField label="Data Type" value={fieldDraft.type} options={['Text', 'Number', 'Date', 'Email', 'Phone']} onChange={(type) => setFieldDraft({ ...fieldDraft, type })} />
                <SelectField label="Required" value={fieldDraft.required} options={['Yes', 'No']} onChange={(required) => setFieldDraft({ ...fieldDraft, required })} />
                <PanelActions>
                  <button type="button" className="button secondary" onClick={addCustomField}><Plus size={16} />Add Field</button>
                </PanelActions>
              </div>
              <div className="field-chip-row">
                {customFields.map((field) => <span key={field.id} className="field-chip">{field.label} · {field.type}</span>)}
              </div>
              <PanelActions>
                <button className="button secondary" onClick={() => setStageFormChoice(null)}>Cancel</button>
                <button className="button primary" onClick={saveCustomStageForm}>Save Custom Form</button>
              </PanelActions>
            </div>
          )}
        </Modal>
      )}
      {customBuilderStage && (
        <Modal title="Create your Custom New Form" onClose={() => setCustomBuilderStage(null)}>
          <div className="custom-builder">
            <div className="form-grid custom-field-grid">
              <TextField label="Field Name*" value={fieldDraft.label} onChange={(label) => setFieldDraft({ ...fieldDraft, label })} />
              <SelectField label="Data Type" value={fieldDraft.type} options={['Text', 'Number', 'Date', 'Email', 'Phone']} onChange={(type) => setFieldDraft({ ...fieldDraft, type })} />
              <SelectField label="Required" value={fieldDraft.required} options={['Yes', 'No']} onChange={(required) => setFieldDraft({ ...fieldDraft, required })} />
              <PanelActions>
                <button type="button" className="button secondary" onClick={addCustomField}><Plus size={16} />{editingFieldId ? 'Update Field' : 'Add Field'}</button>
              </PanelActions>
            </div>
            <div className="custom-fields-table">
              {customFields.length > 0 ? customFields.map((field) => (
                <div key={field.id} className="custom-field-row">
                  <div>
                    <strong>{field.label}</strong>
                    <span>{field.type} · Required: {field.required}</span>
                  </div>
                  <div className="row-menu-actions">
                    <IconButton label="Edit Field" onClick={() => editCustomField(field)}><Edit size={15} /></IconButton>
                    <IconButton label="Delete Field" onClick={() => deleteCustomField(field.id)}><Trash2 size={15} /></IconButton>
                  </div>
                </div>
              )) : <div className="empty-field-row">No fields created yet.</div>}
            </div>
            <PanelActions>
              <button className="button secondary" onClick={() => setCustomBuilderStage(null)}>Cancel</button>
              <button className="button primary" onClick={saveCustomStageForm}>Save Custom Form</button>
            </PanelActions>
          </div>
        </Modal>
      )}
      {customDrop && (
        <Modal title={`${customDrop.stageName} Form`} onClose={() => setCustomDrop(null)}>
          <form className="form-grid" onSubmit={submitCustomDrop}>
            {customFields.map((field) => (
              <label key={field.id} className={`field ${customErrors.includes(field.id) ? 'field-error' : ''}`}>
                <span>{field.label}{field.required === 'Yes' ? '*' : ''}</span>
                <input
                  type={field.type === 'Date' ? 'date' : field.type === 'Number' ? 'number' : field.type === 'Email' ? 'email' : field.type === 'Phone' ? 'tel' : 'text'}
                  value={customValues[field.id] || ''}
                  onChange={(event) => {
                    setCustomValues((current) => ({ ...current, [field.id]: event.target.value }));
                    setCustomErrors((current) => current.filter((id) => id !== field.id));
                  }}
                />
              </label>
            ))}
            <PanelActions wide>
              <button type="button" className="button secondary" onClick={() => setCustomDrop(null)}>Cancel</button>
              <button type="submit" className="button primary">Save</button>
            </PanelActions>
          </form>
        </Modal>
      )}
      {deleteStage && <Confirm danger title="Delete Stage" text={`Delete stage "${deleteStage.name}"? Stages with opportunities cannot be deleted.`} confirmLabel="Delete" onCancel={() => setDeleteStage(null)} onConfirm={confirmDeleteStage} />}
      {pendingMove && <Confirm title="Move Opportunity" text={`${pendingMove.name}: ${pendingMove.from} to ${pendingMove.to}`} confirmLabel="Move" onCancel={() => setPendingMove(null)} onConfirm={confirmMove} />}
      {selected && (
        <Modal title="Opportunity Details" onClose={() => setSelected(null)}>
          <div className="stack">
            <DetailGrid items={[
              ['Opportunity', selected.name],
              ['Company', selected.company],
              ['Contact', selected.contact],
              ['Stage', selected.stage],
              ['Estimated Value', formatCurrency(selected.value)],
              ['Priority', selected.priority],
              ['Expected Closing Date', selected.closeDate],
              ['Assigned Salesperson', selected.owner],
            ]} />
            <DetailBlock title="Notes" text={selected.notes || 'No notes added.'} />
            <PanelActions>
              <button className="button secondary" onClick={() => setMessage('Note popup opened for opportunity.')}>Add Note</button>
              <button className="button primary" onClick={() => openEditOpportunity(selected)}>Edit</button>
            </PanelActions>
          </div>
        </Modal>
      )}
      {selectedLead && (
        <Modal title="Lead Details" onClose={() => setSelectedLead(null)}>
          <div className="stack">
            <DetailGrid items={[
              ['Client ID', selectedLead.clientId],
              ['Customer', selectedLead.customer],
              ['Company', selectedLead.company || 'Not added'],
              ['Phone', selectedLead.phone],
              ['Email', selectedLead.email || 'Not added'],
              ['Priority', selectedLead.priority],
              ['Owner', selectedLead.owner],
            ]} />
            <DetailBlock title="Notes" text={selectedLead.notes || 'No notes added.'} />
          </div>
        </Modal>
      )}
    </section>
  );
}

function PipelineStageColumn({ stage, items, leads, duplicateLeadId, dragged, draggedLead, setPendingMove, moveLeadToStage, openItemOpportunityStage, setSelected, setSelectedLead, setDragged, setDraggedLead, formatCurrency, search }) {
  return (
    <section
      className="kanban-column"
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggedLead) {
          if (draggedLead.status === stage.name) {
            setDraggedLead(null);
            return;
          }
          moveLeadToStage(draggedLead, stage.name);
          return;
        }
        if (dragged && dragged.stage !== stage.name) {
          openItemOpportunityStage(dragged, stage.name);
        }
      }}
    >
      <header><h3>{stage.name}</h3><span>{items.length + leads.length}</span></header>
      <div className="kanban-list">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className={`opportunity-card lead-opportunity-card ${lead.id === duplicateLeadId ? 'duplicate-card' : ''}`}
            draggable
            onDragStart={() => { setDraggedLead(lead); setDragged(null); }}
            onClick={() => setSelectedLead(lead)}
          >
            <div className="card-top">
              <strong><HighlightedText text={lead.customer} query={search} /></strong>
              <span className={`pill ${lead.priority.toLowerCase()}`}>{lead.priority}</span>
            </div>
            <p><HighlightedText text={lead.company || 'No company added'} query={search} /></p>
            <dl>
              <div><dt>Client ID</dt><dd><HighlightedText text={lead.clientId} query={search} /></dd></div>
              <div><dt>Phone</dt><dd><HighlightedText text={lead.phone} query={search} /></dd></div>
              <div><dt>Owner</dt><dd><HighlightedText text={lead.owner} query={search} /></dd></div>
            </dl>
          </article>
        ))}
        {items.map((item) => (
          <article
            key={item.id}
            className="opportunity-card"
            draggable
            onDragStart={() => { setDragged(item); setDraggedLead(null); }}
            onClick={() => setSelected(item)}
          >
            <div className="card-top">
              <strong><HighlightedText text={item.name} query={search} /></strong>
              <span className={`pill ${item.priority.toLowerCase()}`}>{item.priority}</span>
            </div>
            <p><HighlightedText text={item.company} query={search} /></p>
            <dl>
              <div><dt>Contact</dt><dd><HighlightedText text={item.contact} query={search} /></dd></div>
              <div><dt>Value</dt><dd>{formatCurrency(item.value)}</dd></div>
              <div><dt>Close Date</dt><dd><HighlightedText text={item.closeDate} query={search} /></dd></div>
              <div><dt>Salesperson</dt><dd><HighlightedText text={item.owner} query={search} /></dd></div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
