import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { TrendingUp, Heart, Zap } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
          Empower Your Ideas. <span className="text-blue-600">Fund Your Dreams.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Connect with a global community of innovators and investors. Launch campaigns,
          fund projects, and build the future together.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/campaigns')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Explore Campaigns
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Get Started
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center text-slate-900">
          Why Choose CrowdFund?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-card">
            <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900">Crowdfunding</h3>
            <p className="text-slate-600">
              Launch your campaigns and raise funds from thousands of supporters worldwide.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-card">
            <Heart className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900">P2P Lending</h3>
            <p className="text-slate-600">
              Access flexible lending solutions from peer lenders with competitive rates.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-card">
            <Zap className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-3 text-slate-900">Secure & Fast</h3>
            <p className="text-slate-600">
              Bank-level security with instant transactions and 24/7 support.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">$2.5M+</div>
              <p className="text-blue-100">Funds Raised</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">12K+</div>
              <p className="text-blue-100">Active Projects</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p className="text-blue-100">Community Members</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <p className="text-blue-100">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4 text-slate-900">
            Ready to Make an Impact?
          </h2>
          <p className="text-slate-600 mb-8">
            Join thousands of creators and investors building the future today.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Create Your Account'}
          </button>
        </div>
      </section>
    </div>
  );
}
