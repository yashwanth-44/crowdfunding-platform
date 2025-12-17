import React from 'react';
import { useAuthStore } from '../store/auth';
import { TrendingUp, Heart, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-slate-600">Here's your crowdfunding overview</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-700">Total Donated</h3>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">$5,250</p>
          <p className="text-sm text-slate-500 mt-2">Across 12 campaigns</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-700">Active Loans</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">3</p>
          <p className="text-sm text-slate-500 mt-2">Total funded: $15,000</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-700">Credit Score</h3>
            <Clock className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{user?.creditScore}</p>
          <p className="text-sm text-slate-500 mt-2">Excellent standing</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-card">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Create Campaign
          </button>
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
            Browse Loans
          </button>
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
            Explore Campaigns
          </button>
        </div>
      </div>
    </div>
  );
}
