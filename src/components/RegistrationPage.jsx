import React, { useState } from 'react';
import { products, services } from '../data/dummyData';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  companyLogo: null,
  phoneNumber: '',
  country: '',
  address: '',
  cnic: '',
};

const fieldLabels = {
  fullName: 'Full Name',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  companyName: 'Company Name',
  companyLogo: 'Company Logo',
  phoneNumber: 'Phone Number',
  country: 'Country',
  address: 'Address',
  cnic: 'CNIC',
};

const feedbackFieldLabels = {
  productService: 'Product / Service',
  rating: 'Rating',
  subject: 'Subject',
  message: 'Feedback Message',
};

const onlyDigits = (value) => value.replace(/\D/g, '');

export default function RegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const feedbackOptions = [...products.map((item) => item.name), ...services.map((item) => item.name)];
  const [feedback, setFeedback] = useState({
    productService: feedbackOptions[0],
    rating: '5',
    subject: '',
    message: '',
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateFeedbackField = (field, value) => {
    setFeedback((current) => ({ ...current, [field]: value }));
  };

  const getMissingField = () => Object.entries(form).find(([, value]) => {
    if (value instanceof File) {
      return false;
    }
    return String(value || '').trim().length === 0;
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const missingField = getMissingField();
    if (missingField) {
      alert(`Please fill ${fieldLabels[missingField[0]]}.`);
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Password and Confirm Password must match.');
      return;
    }
    if (form.password.length < 8) {
      alert('Password must be at least 8 characters.');
      return;
    }
    if (onlyDigits(form.phoneNumber).length !== 11) {
      alert('Phone Number must be exactly 11 digits.');
      return;
    }
    if (onlyDigits(form.cnic).length !== 13) {
      alert('CNIC must be exactly 13 digits.');
      return;
    }
    console.log('Registration form payload:', form);
    setShowFeedbackPopup(true);
  };

  const handleFeedbackSubmit = (event) => {
    event.preventDefault();
    const missingField = Object.entries(feedback).find(([, value]) => String(value || '').trim().length === 0);
    if (missingField) {
      alert(`Please fill ${feedbackFieldLabels[missingField[0]]}.`);
      return;
    }
    console.log('Optional registration feedback payload:', feedback);
    alert('Thank you for your feedback.');
    setShowFeedbackPopup(false);
  };

  return (
    <div className="mx-auto max-w-4xl py-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-white">Registration</h2>
        <p className="text-xs text-slate-400">Create a company account request</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Full Name" value={form.fullName} onChange={(value) => updateField('fullName', value)} />
          <FormField label="Email" type="email" value={form.email} onChange={(value) => updateField('email', value)} />
          <FormField label="Password" type="password" value={form.password} onChange={(value) => updateField('password', value)} placeholder="Minimum 8 characters" />
          <FormField label="Confirm Password" type="password" value={form.confirmPassword} onChange={(value) => updateField('confirmPassword', value)} />
          <FormField label="Company Name" value={form.companyName} onChange={(value) => updateField('companyName', value)} />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Company Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField('companyLogo', event.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-teal-500 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-950"
            />
          </div>
          <FormField label="Phone Number" type="tel" value={form.phoneNumber} onChange={(value) => updateField('phoneNumber', onlyDigits(value).slice(0, 11))} placeholder="11 digits" />
          <FormField label="Country" value={form.country} onChange={(value) => updateField('country', value)} />
          <FormField label="CNIC" value={form.cnic} onChange={(value) => updateField('cnic', onlyDigits(value).slice(0, 13))} placeholder="13 digits" />
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Address
            </label>
            <textarea
              rows="4"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
              placeholder="Enter company address"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-teal-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
        >
          Register
        </button>
      </form>

      {showFeedbackPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Optional Feedback</h3>
                <p className="text-xs text-slate-400">Registration completed. You can share feedback now or skip it.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackPopup(false)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800"
              >
                Skip
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product / Service
                  </label>
                  <select
                    value={feedback.productService}
                    onChange={(event) => updateFeedbackField('productService', event.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                  >
                    {feedbackOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rating
                  </label>
                  <select
                    value={feedback.rating}
                    onChange={(event) => updateFeedbackField('rating', event.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => <option key={rating}>{rating}</option>)}
                  </select>
                </div>
              </div>

              <FormField label="Subject" value={feedback.subject} onChange={(value) => updateFeedbackField('subject', value)} />

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Feedback Message
                </label>
                <textarea
                  rows="4"
                  value={feedback.message}
                  onChange={(event) => updateFeedbackField('message', event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
                  placeholder="Share your feedback"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackPopup(false)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-800"
                >
                  No Thanks
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-400"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-teal-500"
        placeholder={placeholder || label}
      />
    </div>
  );
}
