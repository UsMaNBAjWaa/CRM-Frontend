export const owners = ['All', 'Ali Raza', 'Sara Ahmed'];
export const leadOwnerFilters = ['All', 'Not Assign', 'Ali Raza', 'Sara Ahmed'];
export const assignLeadOptions = ['Decide Later', 'Ali Raza', 'Sara Ahmed'];
export const contactOwnerFilters = ['All', 'Not Assign', 'Ali Raza', 'Sara Ahmed'];
export const contactOwnerOptions = ['Decide Later', 'Ali Raza', 'Sara Ahmed'];
export const priorities = ['All', 'High', 'Medium', 'Low'];
export const leadStatuses = ['All', 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
export const leadSources = ['All', 'Website', 'Facebook', 'Referral', 'Google'];
export const companies = ['All', 'Northstar Foods', 'Metro Health', 'Cedar Labs'];
export const contactStatuses = ['All', 'Active', 'Inactive'];
export const designations = ['All', 'Operations Director', 'Procurement Lead', 'Sales Manager'];
export const lostReasons = ['No Budget', 'Competitor', 'Not Interested', 'Wrong Fit'];
export const stages = ['New', 'Contacted', 'Confirm', 'Proposal', 'Negotiation', 'Won', 'Lost'];
export const products = ['All', 'CRM Suite', 'Sales Automation', 'Support Desk'];
export const paymentStatuses = ['All', 'Unpaid', 'Partially Paid', 'Paid'];
export const paymentMethods = ['All', 'Bank Transfer', 'Card', 'Cash', 'Cheque'];
export const companyTypes = ['Prospect', 'Customer', 'Partner', 'Competitor', 'Other'];
export const companyRatings = ['None', 'Hot', 'Warm', 'Cold'];

export const leadSeed = [
  { id: 'LD-1001', clientId: 'CL-1001', date: '2026-07-20', customer: 'Ayesha Khan', company: 'Northstar Foods', phone: '+92 300 1234567', email: 'ayesha@northstar.example', source: 'Website', owner: 'Ali Raza', priority: 'High', status: 'Proposal', leadValue: 850000, lastActivity: 'Proposal sent', nextFollowUp: '2026-07-27', notes: 'Requested pricing for a multi-branch CRM rollout.' },
  { id: 'LD-1002', clientId: 'CL-1002', date: '2026-07-21', customer: 'Hamza Malik', company: 'Metro Health', phone: '+92 321 5559012', email: 'hamza@metrohealth.example', source: 'Referral', owner: 'Sara Ahmed', priority: 'Medium', status: 'New', leadValue: 540000, lastActivity: 'New inquiry', nextFollowUp: '2026-07-25', notes: 'Initial inquiry received from partner referral.' },
  { id: 'LD-1003', clientId: 'CL-1003', date: '2026-07-22', customer: 'Mina Joseph', company: 'Cedar Labs', phone: '+92 333 9876543', email: 'mina@cedarlabs.example', source: 'Facebook', owner: 'Ali Raza', priority: 'Low', status: 'Contacted', leadValue: 320000, lastActivity: 'Demo scheduled', nextFollowUp: '2026-07-29', notes: 'Demo follow-up pending.' },
];

export const contactSeed = [
  { id: 'CT-2001', clientId: 'CL-2001', date: '2026-07-20', contact: 'Zainab Sheikh', company: 'Northstar Foods', designation: 'Operations Director', phone: '+92 300 4455667', email: 'zainab@northstar.example', whatsapp: '+92 300 4455667', address: 'Main Boulevard', city: 'Lahore', country: 'Pakistan', owner: 'Ali Raza', status: 'Active', notes: 'Primary contact for branch rollout.' },
  { id: 'CT-2002', clientId: 'CL-2002', date: '2026-07-21', contact: 'Bilal Tariq', company: 'Metro Health', designation: 'Procurement Lead', phone: '+92 321 7788990', email: 'bilal@metrohealth.example', whatsapp: '+92 321 7788990', address: 'Clifton', city: 'Karachi', country: 'Pakistan', owner: 'Sara Ahmed', status: 'Active', notes: 'Needs implementation timeline.' },
  { id: 'CT-2003', clientId: 'CL-2003', date: '2026-07-22', contact: 'Hira Nadeem', company: 'Cedar Labs', designation: 'Sales Manager', phone: '+92 333 1122334', email: 'hira@cedarlabs.example', whatsapp: '+92 333 1122334', address: 'Blue Area', city: 'Islamabad', country: 'Pakistan', owner: 'Ali Raza', status: 'Inactive', notes: 'No active requirement this quarter.' },
];

export const opportunitySeed = [
  { id: 'OP-3001', name: 'CRM Expansion', company: 'Northstar Foods', contact: 'Zainab Sheikh', value: 850000, priority: 'High', closeDate: '2026-08-18', owner: 'Ali Raza', stage: 'Proposal', product: 'CRM Suite', notes: 'Proposal review scheduled with operations team.' },
  { id: 'OP-3002', name: 'Sales Team Rollout', company: 'Metro Health', contact: 'Bilal Tariq', value: 540000, priority: 'Medium', closeDate: '2026-08-28', owner: 'Sara Ahmed', stage: 'Confirm', product: 'Sales Automation', notes: 'Confirmation call done, awaiting sign-off.' },
  { id: 'OP-3003', name: 'Support Desk Setup', company: 'Cedar Labs', contact: 'Hira Nadeem', value: 320000, priority: 'Low', closeDate: '2026-09-10', owner: 'Ali Raza', stage: 'Contacted', product: 'Support Desk', notes: 'Discovery call completed.' },
  { id: 'OP-3004', name: 'Enterprise CRM License', company: 'Northstar Foods', contact: 'Ayesha Khan', value: 1250000, priority: 'High', closeDate: '2026-07-30', owner: 'Sara Ahmed', stage: 'Negotiation', product: 'CRM Suite', notes: 'Commercial terms under review.' },
  { id: 'OP-3005', name: 'Won Renewal', company: 'Metro Health', contact: 'Bilal Tariq', value: 410000, priority: 'Medium', closeDate: '2026-07-12', owner: 'Ali Raza', stage: 'Won', product: 'CRM Suite', notes: 'Closed and handed to finance.' },
];

export const paymentSeed = [
  { id: 'PAY-4001', invoice: 'INV-2026-001', company: 'Metro Health', opportunity: 'Won Renewal', customer: 'Bilal Tariq', salesperson: 'Ali Raza', amount: 410000, paid: 410000, balance: 0, status: 'Paid', date: '2026-07-13', method: 'Bank Transfer', reference: 'BT-7781', notes: 'Full renewal payment received.' },
  { id: 'PAY-4002', invoice: 'INV-2026-002', company: 'Northstar Foods', opportunity: 'CRM Expansion', customer: 'Zainab Sheikh', salesperson: 'Ali Raza', amount: 850000, paid: 300000, balance: 550000, status: 'Partially Paid', date: '2026-07-18', method: 'Card', reference: 'CARD-2249', notes: 'First installment recorded.' },
  { id: 'PAY-4003', invoice: 'INV-2026-003', company: 'Cedar Labs', opportunity: 'Support Desk Setup', customer: 'Hira Nadeem', salesperson: 'Sara Ahmed', amount: 320000, paid: 0, balance: 320000, status: 'Unpaid', date: '2026-07-21', method: 'Bank Transfer', reference: '', notes: 'Invoice generated after won opportunity.' },
];

export const companySeed = [
  { id: 'CO001', name: 'Northstar Foods', type: 'Customer', rating: 'Hot', industry: 'Food & Beverage', phone: '+92 300 4455667', email: 'info@northstar.example', website: 'https://northstar.example', annualRevenue: 1250000, employees: 50, owner: 'Ali Raza', leadSource: 'Website', description: 'Multi-branch food service organization.' },
  { id: 'CO002', name: 'Metro Health', type: 'Prospect', rating: 'Warm', industry: 'Healthcare', phone: '+92 321 7788990', email: 'hello@metrohealth.example', website: 'https://metrohealth.example', annualRevenue: 850000, employees: 35, owner: 'Sara Ahmed', leadSource: 'Referral', description: 'Regional healthcare group evaluating sales automation.' },
  { id: 'CO003', name: 'Cedar Labs', type: 'Prospect', rating: 'None', industry: 'Technology', phone: '+92 333 1122334', email: 'team@cedarlabs.example', website: 'https://cedarlabs.example', annualRevenue: 500000, employees: 22, owner: 'Ali Raza', leadSource: 'Facebook', description: 'Technology services company with support desk requirement.' },
];

export const emptyLead = { customer: '', phone: '', email: '', company: '', source: 'Website', priority: 'Medium', assignLead: 'Decide Later', notes: '' };
export const emptyContact = { contact: '', company: '', designation: '', phone: '', email: '', whatsapp: '', address: '', city: '', country: '', owner: 'Ali Raza', status: 'Active', notes: '' };
export const emptyPayment = { company: '', opportunity: '', invoice: '', amount: '', paid: '', method: 'Bank Transfer', reference: '', date: '', notes: '' };
export const emptyCompany = { name: '', email: '', phone: '', website: '', type: 'Prospect', rating: 'None', industry: 'Other', annualRevenue: '', employees: '', owner: 'Ali Raza', leadSource: 'Website', description: '' };
