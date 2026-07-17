import React, { useState } from 'react';
import { userTickets } from '../data/dummyData';
import { DataTable, PageHeader, PrimaryButton, SecondaryButton, StatusBadge, TextArea } from './ui';

export default function AdminSupportDashboard() {
  const [tickets, setTickets] = useState(userTickets);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [reply, setReply] = useState('');
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);

  const updateSelectedTicket = (updates) => {
    if (!selectedTicket) return;
    setTickets(tickets.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, ...updates, updatedAt: '2026-07-17' } : ticket));
  };

  const sendReply = () => {
    if (!selectedTicket || !reply.trim()) return;
    updateSelectedTicket({
      replies: [...selectedTicket.replies, { by: 'Support Team', message: reply, createdAt: '2026-07-17' }],
    });
    setReply('');
  };

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Support Dashboard" subtitle="Admin view for all customer support tickets." />

      <DataTable
        columns={[
          { key: 'id', label: 'Ticket ID' },
          { key: 'customerName', label: 'Customer Name' },
          { key: 'customerEmail', label: 'Customer Email' },
          { key: 'subject', label: 'Subject' },
          { key: 'category', label: 'Category' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', label: 'Created At' },
        ]}
        rows={tickets}
        renderActions={(row) => (
          <SecondaryButton onClick={() => setSelectedTicketId((current) => current === row.id ? null : row.id)}>
            View
          </SecondaryButton>
        )}
      />

      {selectedTicket && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Ticket Details</h3>
              <p className="text-sm text-slate-400">{selectedTicket.subject}</p>
            </div>
            <StatusBadge status={selectedTicket.status} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-300">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer Information</h4>
              <p>Name: {selectedTicket.customerName}</p>
              <p>Email: {selectedTicket.customerEmail}</p>
              <p>Category: {selectedTicket.category}</p>
              <p>Original Message: {selectedTicket.message}</p>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Change Status</label>
              <select
                value={selectedTicket.status}
                onChange={(event) => updateSelectedTicket({ status: event.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Conversation</h4>
            {selectedTicket.replies.map((item, index) => (
              <div key={`${item.createdAt}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.by} - {item.createdAt}</p>
                <p className="mt-2 text-sm text-slate-300">{item.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <TextArea label="Reply Box" value={reply} onChange={setReply} />
            <PrimaryButton onClick={sendReply}>Send Reply</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
