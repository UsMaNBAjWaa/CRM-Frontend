import React from 'react';
import { products } from '../data/dummyData';
import { PageHeader, PrimaryButton, SecondaryButton } from './ui';

export default function ProductDetails({ slug = 'sales-crm', onBack, onBuySubscription }) {
  const product = products.find((item) => item.slug === slug) || products[0];

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader
        title="Product Details"
        subtitle="Frontend placeholders only. Backend API can replace this dummy product later."
        action={<SecondaryButton onClick={onBack}>Back to Products</SecondaryButton>}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <img src={product.image} alt={product.name} className="h-full min-h-80 w-full rounded-xl border border-slate-800 object-cover" />
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <h3 className="text-3xl font-bold text-white">{product.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{product.description}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Modules</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.modules.map((module) => (
                <span key={module} className="rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-300">
                  {module}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {product.pricingPlans.map((plan) => (
          <div key={plan.name} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                <p className="text-xs text-slate-400">Billing Cycle: {plan.billingCycle}</p>
                <p className="text-xs text-slate-400">Currency: {plan.currency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Base Price: {plan.price}</p>
                <p className="text-sm text-slate-400">Discount: {plan.discount}%</p>
                <p className="text-2xl font-bold text-teal-400">Final: {plan.finalPrice}</p>
              </div>
            </div>

            <div className="mt-5 grid flex-1 gap-4 sm:grid-cols-2">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500">Features</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {plan.features.map((feature) => <li key={feature}>- {feature}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500">Usage Limits</h5>
                <ul className="mt-2 space-y-2 text-sm text-slate-300">
                  {plan.usageLimits.map((limit) => <li key={limit}>- {limit}</li>)}
                </ul>
              </div>
            </div>
            <PrimaryButton onClick={onBuySubscription}>Buy Subscription</PrimaryButton>
          </div>
        ))}
      </section>
    </div>
  );
}
