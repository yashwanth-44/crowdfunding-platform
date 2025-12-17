import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Menu, LogOut, User, Home, Zap } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <Link to="/" className="text-xl font-bold text-slate-900">
              CrowdFund
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/campaigns" className="text-slate-600 hover:text-slate-900 transition">
              Campaigns
            </Link>
            <Link to="/loans" className="text-slate-600 hover:text-slate-900 transition">
              Loans
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-slate-600 hover:text-slate-900 transition">
                  Dashboard
                </Link>
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                >
                  <User className="w-4 h-4" />
                  {user?.firstName}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200">
            <Link to="/campaigns" className="block py-2 text-slate-600">
              Campaigns
            </Link>
            <Link to="/loans" className="block py-2 text-slate-600">
              Loans
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-slate-600">
                  Dashboard
                </Link>
                <Link to="/profile" className="block py-2 text-slate-600">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-slate-600">
                  Login
                </Link>
                <Link to="/signup" className="block py-2 text-slate-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
