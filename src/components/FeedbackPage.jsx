import React, { useState } from 'react';
import { products, services } from '../data/dummyData';
import { PageHeader, PrimaryButton, TextArea, TextInput } from './ui';

const feedbackFieldLabels = {
  productService: 'Product / Service',
  rating: 'Rating',
  subject: 'Subject',
  message: 'Feedback Message',
};

export default function FeedbackPage() {
  const options = [...products.map((item) => item.name), ...services.map((item) => item.name)];
  const [form, setForm] = useState({
    productService: options[0],
    rating: '5',
    subject: '',
    message: '',
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const missingField = Object.entries(form).find(([, value]) => String(value || '').trim().length === 0);
    if (missingField) {
      alert(`Please fill ${feedbackFieldLabels[missingField[0]]}.`);
      return;
    }
    alert('Feedback submitted with dummy frontend data.');
  };

  return (
    <div className="space-y-6 py-6 text-slate-100">
      <PageHeader title="Feedback" subtitle="Submit feedback for purchased products or services." />

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Select Product / Service</label>
            <select
              value={form.productService}
              onChange={(event) => updateField('productService', event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
            >
              {options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Rating (1-5 Stars)</label>
            <select
              value={form.rating}
              onChange={(event) => updateField('rating', event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
            >
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating}>{rating}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <TextInput label="Subject" value={form.subject} onChange={(value) => updateField('subject', value)} />
          </div>
          <div className="md:col-span-2">
            <TextArea label="Feedback Message" value={form.message} onChange={(value) => updateField('message', value)} />
          </div>
        </div>
        <div className="mt-5">
          <PrimaryButton type="submit">Submit</PrimaryButton>
        </div>
      </form>
    </div>
  );
}
