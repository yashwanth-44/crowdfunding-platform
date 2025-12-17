import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import {
  Home,
  TrendingUp,
  PlusCircle,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const { isAuthenticated, hasRole } = useAuthStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Home', icon: Home, public: true },
    { path: '/campaigns', label: 'Campaigns', icon: TrendingUp, public: true },
    { path: '/loans', label: 'Loans', icon: TrendingUp, public: true },
  ];

  const authenticatedItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: [] },
    { path: '/campaigns/create', label: 'Create Campaign', icon: PlusCircle, roles: ['CAMPAIGN_CREATOR'] },
    { path: '/loans/create', label: 'Request Loan', icon: PlusCircle, roles: ['BORROWER'] },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'Admin Panel', icon: Settings, roles: ['ADMIN'] },
  ];

  const visibleItems = menuItems.filter((item) => item.public);

  if (isAuthenticated) {
    visibleItems.push(
      ...authenticatedItems.filter((item) =>
        item.roles.length === 0 || hasRole(item.roles as any)
      )
    );

    if (hasRole('ADMIN')) {
      visibleItems.push(...adminItems);
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 gap-8">
      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
