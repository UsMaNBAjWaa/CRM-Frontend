import React from 'react';
import { currentUser } from '../data/dummyData';
import { PageHeader, PrimaryButton, StatCard } from './ui';

export default function ProfilePage() {
  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Profile" subtitle="User and company profile placeholders." action={<PrimaryButton>Edit Profile</PrimaryButton>} />

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center gap-5">
          <img src={currentUser.photo} alt={currentUser.companyName} className="h-24 w-24 rounded-xl border border-slate-800 object-cover" />
          <div>
            <h3 className="text-2xl font-bold text-white">{currentUser.fullName}</h3>
            <p className="text-sm text-slate-400">{currentUser.email}</p>
            <p className="text-sm font-semibold text-teal-400">{currentUser.companyName}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Full Name">{currentUser.fullName}</StatCard>
        <StatCard title="Email">{currentUser.email}</StatCard>
        <StatCard title="Company Name">{currentUser.companyName}</StatCard>
        <StatCard title="Phone Number">{currentUser.phoneNumber}</StatCard>
        <StatCard title="Country">{currentUser.country}</StatCard>
        <StatCard title="CNIC">{currentUser.cnic}</StatCard>
        <div className="md:col-span-2 xl:col-span-3">
          <StatCard title="Address">{currentUser.address}</StatCard>
        </div>
      </section>
    </div>
  );
}
