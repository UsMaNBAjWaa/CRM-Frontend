import React from 'react';
import { products, services } from '../data/dummyData';

function ListingCard({ item, type, onViewDetails }) {
  return (
    <article className="listing-card product-card rounded-xl border border-slate-800">
      <img src={item.image} alt={item.name} className="product-card-img" />
      <div className="product-card-body">
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{type}</p>
          <h3 className="product-card-title mt-2 font-bold text-white">{item.name}</h3>
          <p className="product-card-desc mt-2 leading-6 text-slate-400">{item.shortDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(item.slug)}
          className="btn-primary mt-5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
        >
          {type === 'Product' ? 'Configure & Pricing' : 'View Service'}
        </button>
      </div>
    </article>
  );
}

export default function ProductLanding({ onViewProductDetails, onViewServiceDetails }) {
  return (
    <div className="landing-page space-y-10 py-6 text-slate-100">
      <section className="landing-hero">
        <h1 className="landing-title">
          <span>Scale Your Operations with </span>
          <span>CRMPORTAL</span>
        </h1>
        <p className="landing-subtitle">
          Choose a tailored software system below to discover pricing tiers,
          modules, and setup workflows.
        </p>
      </section>

      <section className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">Products</h2>
          <p className="text-xs text-slate-400">Dummy product cards prepared for later API integration.</p>
        </div>
        <div className="products-grid">
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
        <div className="products-grid">
          {services.map((service) => (
            <ListingCard key={service.id} item={service} type="Service" onViewDetails={onViewServiceDetails} />
          ))}
        </div>
      </section>
    </div>
  );
}
