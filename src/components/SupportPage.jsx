import React, { useState } from 'react';
import { userTickets } from '../data/dummyData';
import { DataTable, PageHeader, PrimaryButton, StatusBadge, TextArea, TextInput } from './ui';

const initialTicket = {
  subject: '',
  category: 'Product Support',
  message: '',
};

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState(initialTicket);
  const [tickets, setTickets] = useState(userTickets);
  const [reply, setReply] = useState('');

  const updateField = (field, value) => {
    setTicketForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextTicket = {
      id: `TCK-${1000 + tickets.length + 1}`,
      customerName: 'Ayesha Malik',
      customerEmail: 'ayesha@vortex-tech.com',
      subject: ticketForm.subject || 'New support request',
      category: ticketForm.category,
      message: ticketForm.message || 'No message provided.',
      status: 'Open',
      createdAt: '2026-07-17',
      updatedAt: '2026-07-17',
      replies: [],
    };
    setTickets([nextTicket, ...tickets]);
    setTicketForm(initialTicket);
  };

  const addCustomerReply = () => {
    if (!reply.trim()) return;
    setTickets(tickets.map((ticket, index) => index === 0
      ? {
          ...ticket,
          updatedAt: '2026-07-17',
          replies: [...ticket.replies, { by: 'Customer', message: reply, createdAt: '2026-07-17' }],
        }
      : ticket));
    setReply('');
  };

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Support" subtitle="Create tickets, view ticket status, and read conversation history." />

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Subject" value={ticketForm.subject} onChange={(value) => updateField('subject', value)} />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Category</label>
            <select
              value={ticketForm.category}
              onChange={(event) => updateField('category', event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
            >
              <option>Product Support</option>
              <option>Billing</option>
              <option>Technical Issue</option>
              <option>Account</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <TextArea label="Message" value={ticketForm.message} onChange={(value) => updateField('message', value)} />
          </div>
        </div>
        <div className="mt-5">
          <PrimaryButton type="submit">Submit Ticket</PrimaryButton>
        </div>
      </form>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">My Tickets</h3>
        <DataTable
          columns={[
            { key: 'id', label: 'Ticket ID' },
            { key: 'subject', label: 'Subject' },
            { key: 'category', label: 'Category' },
            { key: 'status', label: 'Ticket Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'createdAt', label: 'Created At' },
          ]}
          rows={tickets}
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-bold text-white">Conversation / Reply History</h3>
        <div className="mt-4 space-y-3">
          {tickets[0]?.replies.map((item, index) => (
            <div key={`${item.createdAt}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.by} - {item.createdAt}</p>
              <p className="mt-2 text-sm text-slate-300">{item.message}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <TextInput label="Customer Reply" value={reply} onChange={setReply} placeholder="Write a reply if the issue is not resolved" />
          <div className="flex items-end">
            <PrimaryButton onClick={addCustomerReply}>Reply</PrimaryButton>
          </div>
        </div>
      </section>
    </div>
  );
}
