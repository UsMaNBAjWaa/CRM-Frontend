import React, { useState } from 'react';
import ForgotPassword from './components/ForgotPassword';
import ChangePassword from './components/ChangePassword';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProductLanding from './components/ProductLanding';
import ProductDetails from './components/ProductDetails';
import ServiceDetails from './components/ServiceDetails';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import SupportPage from './components/SupportPage';
import FeedbackPage from './components/FeedbackPage';
import ProfilePage from './components/ProfilePage';
import AdminSupportDashboard from './components/AdminSupportDashboard';
import AdminFeedbackDashboard from './components/AdminFeedbackDashboard';

const navItems = [
  ['landing', 'Landing'],
  ['product-details', 'Product Details'],
  ['service-details', 'Service Details'],
  ['register', 'Register'],
  ['login', 'Login'],
  ['forgot', 'Forgot'],
  ['user-dashboard', 'User DB'],
  ['support', 'Support'],
  ['feedback', 'Feedback'],
  ['profile', 'Profile'],
  ['change-password', 'Change Password'],
  ['admin-dashboard', 'Approvals'],
  ['admin-support', 'Admin Support'],
  ['admin-feedback', 'Admin Feedback'],
];

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [selectedProductSlug, setSelectedProductSlug] = useState('sales-crm');
  const [selectedServiceSlug, setSelectedServiceSlug] = useState('crm-implementation');

  const openProductDetails = (slug) => {
    setSelectedProductSlug(slug);
    setScreen('product-details');
  };

  const openServiceDetails = (slug) => {
    setSelectedServiceSlug(slug);
    setScreen('service-details');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <nav className="border-b border-slate-800 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setScreen('landing')}
            className="text-xl font-bold tracking-wider text-teal-400 transition hover:text-teal-300"
          >
            CRM<span className="text-white">PORTAL</span>
          </button>
          <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setScreen(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${screen === key ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-6">
        {screen === 'landing' && (
          <ProductLanding
            onViewProductDetails={openProductDetails}
            onViewServiceDetails={openServiceDetails}
          />
        )}
        {screen === 'product-details' && (
          <ProductDetails
            slug={selectedProductSlug}
            onBack={() => setScreen('landing')}
            onBuySubscription={() => setScreen('register')}
          />
        )}
        {screen === 'service-details' && (
          <ServiceDetails
            slug={selectedServiceSlug}
            onBack={() => setScreen('landing')}
            onBuy={() => setScreen('register')}
          />
        )}
        {screen === 'register' && <RegistrationPage />}
        {screen === 'login' && <LoginPage onForgotPassword={() => setScreen('forgot')} />}
        {screen === 'forgot' && <ForgotPassword onBackToLogin={() => setScreen('login')} />}
        {screen === 'change-password' && <ChangePassword onComplete={() => setScreen('user-dashboard')} />}
        {screen === 'user-dashboard' && (
          <UserDashboard
            onTriggerPasswordChange={() => setScreen('change-password')}
            onOpenFeedback={() => setScreen('feedback')}
            onOpenProfile={() => setScreen('profile')}
          />
        )}
        {screen === 'support' && <SupportPage />}
        {screen === 'feedback' && <FeedbackPage />}
        {screen === 'profile' && <ProfilePage />}
        {screen === 'admin-dashboard' && <AdminDashboard />}
        {screen === 'admin-support' && <AdminSupportDashboard />}
        {screen === 'admin-feedback' && <AdminFeedbackDashboard />}
      </main>

    </div>
  );
}
