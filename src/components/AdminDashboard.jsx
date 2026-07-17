import React, { useState } from 'react';
import { approvalRequests } from '../data/dummyData';
import { DataTable, PageHeader, SecondaryButton, StatusBadge } from './ui';

export default function AdminDashboard() {
  const [applications, setApplications] = useState(approvalRequests);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const selectedApplication = applications.find((app) => app.id === selectedApplicationId);

  const handleApprove = (id) => {
    setApplications(applications.map((app) => app.id === id ? { ...app, status: 'Approved' } : app));
  };

  const handleReject = (id) => {
    setApplications(applications.map((app) => app.id === id ? { ...app, status: 'Rejected' } : app));
  };

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Registration Approval Dashboard" subtitle="Review company registration requests." />

      <DataTable
        columns={[
          {
            key: 'companyLogo',
            label: 'Company Logo',
            render: (row) => (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-xs font-bold text-teal-400">
                {row.companyLogo}
              </div>
            ),
          },
          { key: 'companyName', label: 'Company Name' },
          { key: 'ownerName', label: 'Owner Name' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
        rows={applications}
        renderActions={(row) => (
          <SecondaryButton onClick={() => setSelectedApplicationId((current) => current === row.id ? null : row.id)}>
            View Details
          </SecondaryButton>
        )}
      />

      {selectedApplication && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Registration Details</h3>
              <p className="text-sm text-slate-400">{selectedApplication.companyName}</p>
            </div>
            <StatusBadge status={selectedApplication.status} />
          </div>
          <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <p>Owner Name: {selectedApplication.ownerName}</p>
            <p>Email: {selectedApplication.email}</p>
            <p>Phone Number: {selectedApplication.phoneNumber}</p>
            <p>Country: {selectedApplication.country}</p>
            <p>CNIC: {selectedApplication.cnic}</p>
            <p>Address: {selectedApplication.address}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => handleApprove(selectedApplication.id)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-500">
              Approve
            </button>
            <button onClick={() => handleReject(selectedApplication.id)} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-rose-500">
              Reject
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
