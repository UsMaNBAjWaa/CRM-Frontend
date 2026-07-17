import React from 'react';
import { services } from '../data/dummyData';
import { PageHeader, PrimaryButton, SecondaryButton } from './ui';

export default function ServiceDetails({ slug = 'crm-implementation', onBack, onBuy }) {
  const service = services.find((item) => item.slug === slug) || services[0];

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader
        title="Service Details"
        subtitle="Service detail placeholders using frontend dummy data."
        action={<SecondaryButton onClick={onBack}>Back to Services</SecondaryButton>}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <img src={service.image} alt={service.name} className="h-full min-h-80 w-full rounded-xl border border-slate-800 object-cover" />
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-3xl font-bold text-white">{service.name}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{service.description}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Features Included</h4>
              <ul className="mt-2 space-y-2 text-sm text-slate-300">
                {service.featuresIncluded.map((feature) => <li key={feature}>- {feature}</li>)}
              </ul>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p>Price: {service.currency} {service.price}</p>
              <p>Billing Cycle: {service.billingCycle}</p>
              <p>Discount: {service.discount}%</p>
              <p className="text-xl font-bold text-teal-400">Final Price: {service.currency} {service.finalPrice}</p>
            </div>
          </div>

          <div className="mt-6">
            <PrimaryButton onClick={onBuy}>Contact / Buy</PrimaryButton>
          </div>
        </div>
      </section>
    </div>
  );
}
