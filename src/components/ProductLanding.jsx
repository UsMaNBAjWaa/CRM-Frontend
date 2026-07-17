import React from 'react';
import { products, services } from '../data/dummyData';

function ListingCard({ item, type, onViewDetails }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{type}</p>
          <h3 className="mt-2 text-lg font-bold text-white">{item.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.shortDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(item.slug)}
          className="mt-5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default function ProductLanding({ onViewProductDetails, onViewServiceDetails }) {
  return (
    <div className="space-y-10 py-6 text-slate-100">
      <section className="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">CRM Subscription Portal</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">Products and services for growing customer teams</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Explore CRM products, implementation services, support workflows, feedback tools, and admin approval screens using frontend dummy data only.
          </p>
        </div>
        <img src={products[0].image} alt="CRM portal preview" className="h-72 w-full rounded-xl border border-slate-800 object-cover" />
      </section>

      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">Products</h2>
          <p className="text-xs text-slate-400">Dummy product cards prepared for later API integration.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ListingCard key={product.id} item={product} type="Product" onViewDetails={onViewProductDetails} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">Services</h2>
          <p className="text-xs text-slate-400">Service placeholders with pricing and detail navigation.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ListingCard key={service.id} item={service} type="Service" onViewDetails={onViewServiceDetails} />
          ))}
        </div>
      </section>
    </div>
  );
}
