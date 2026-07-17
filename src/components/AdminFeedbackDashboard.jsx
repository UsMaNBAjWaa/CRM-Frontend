import React, { useState } from 'react';
import { feedbackItems } from '../data/dummyData';
import { DataTable, PageHeader, PrimaryButton, SecondaryButton, StatusBadge } from './ui';

export default function AdminFeedbackDashboard() {
  const [feedback, setFeedback] = useState(feedbackItems);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const selectedFeedback = feedback.find((item) => item.id === selectedFeedbackId);

  const markReviewed = () => {
    if (!selectedFeedback) return;
    setFeedback(feedback.map((item) => item.id === selectedFeedback.id ? { ...item, status: 'Reviewed' } : item));
  };

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Customer Feedback Dashboard" subtitle="Admin view for all product and service feedback." />

      <DataTable
        columns={[
          { key: 'id', label: 'Feedback ID' },
          { key: 'customerName', label: 'Customer Name' },
          { key: 'productService', label: 'Product / Service' },
          { key: 'rating', label: 'Rating', render: (row) => `${row.rating} / 5` },
          { key: 'subject', label: 'Subject' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', label: 'Created At' },
        ]}
        rows={feedback}
        renderActions={(row) => (
          <SecondaryButton onClick={() => setSelectedFeedbackId((current) => current === row.id ? null : row.id)}>
            View
          </SecondaryButton>
        )}
      />

      {selectedFeedback && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Details Page</h3>
              <p className="text-sm text-slate-400">{selectedFeedback.subject}</p>
            </div>
            <StatusBadge status={selectedFeedback.status} />
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-300">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer Information</h4>
              <p>Name: {selectedFeedback.customerName}</p>
              <p>Email: {selectedFeedback.customerEmail}</p>
              <p>Product / Service: {selectedFeedback.productService}</p>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Feedback</h4>
              <p>Rating: {selectedFeedback.rating} / 5</p>
              <p>Subject: {selectedFeedback.subject}</p>
              <p>{selectedFeedback.message}</p>
            </div>
          </div>

          <div className="mt-5">
            <PrimaryButton onClick={markReviewed}>Mark as Reviewed</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
