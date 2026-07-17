import React, { useState } from 'react';
import { currentUser, products, services } from '../data/dummyData';
import { StatCard } from './ui';

export default function UserDashboard({ onTriggerPasswordChange, onOpenFeedback, onOpenProfile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const purchasedProducts = products.filter((product) => currentUser.purchasedProductIds.includes(product.id));
  const purchasedServices = services.filter((service) => currentUser.purchasedServiceIds.includes(service.id));

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <div className="flex flex-wrap justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome, {currentUser.fullName}</h2>
          <p className="text-xs text-slate-400">Profile summary for {currentUser.companyName}</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
          >
            Account
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg">
              <button
                type="button"
                onClick={onOpenProfile}
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={onTriggerPasswordChange}
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Profile Summary">
          <p>{currentUser.email}</p>
          <p>{currentUser.phoneNumber}</p>
          <p>{currentUser.country}</p>
        </StatCard>
        <StatCard title="Support">
          <p>Create tickets, view status, and continue customer conversations.</p>
        </StatCard>
        <StatCard title="Feedback">
          <p>Give feedback after purchasing a product or service.</p>
        </StatCard>
      </div>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">My Products</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {purchasedProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h4 className="font-bold text-white">{product.name}</h4>
              <p className="mt-2 text-sm text-slate-400">{product.shortDescription}</p>
              <button onClick={onOpenFeedback} className="mt-4 text-sm font-bold text-teal-400">Give Feedback</button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">My Services</h3>
        <div className="grid gap-5 md:grid-cols-3">
          {purchasedServices.map((service) => (
            <div key={service.id} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h4 className="font-bold text-white">{service.name}</h4>
              <p className="mt-2 text-sm text-slate-400">{service.shortDescription}</p>
              <button onClick={onOpenFeedback} className="mt-4 text-sm font-bold text-teal-400">Give Feedback</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
