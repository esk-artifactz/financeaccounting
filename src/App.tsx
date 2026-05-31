import React, { useState } from 'react';
import CustomerDetail from './components/CustomerDetail';
import LoanDetail from './components/LoanDetail';
import EmiSchedule from './components/EmiSchedule';
import Dashboard from './components/Dashboard';
import { Plus, Menu, X, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showEmiSchedule, setShowEmiSchedule] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSuccess = () => {
    setShowCustomerForm(false);
    setShowLoanForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Finance & Accounting</h1>
              <p className="text-indigo-100 text-sm mt-1">Manage customers, loans, and payments</p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>

            {/* Desktop Menu */}
            <nav className="hidden md:flex gap-3">
              <button
                onClick={() => setShowCustomerForm(true)}
                className="flex items-center gap-2 bg-white text-indigo-600 px-5 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Customer Details
              </button>
              <button
                onClick={() => setShowLoanForm(true)}
                className="flex items-center gap-2 bg-white text-green-600 px-5 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Loan Amount
              </button>
              <button
                onClick={() => setShowEmiSchedule(true)}
                className="flex items-center gap-2 bg-white text-purple-600 px-5 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Calendar size={20} />
                EMI Schedule
              </button>
            </nav>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="mt-4 md:hidden flex flex-col gap-3 animate-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setShowCustomerForm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                <Plus size={20} />
                Customer Details
              </button>
              <button
                onClick={() => {
                  setShowLoanForm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                <Plus size={20} />
                Loan Amount
              </button>
              <button
                onClick={() => {
                  setShowEmiSchedule(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-5 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
              >
                <Calendar size={20} />
                EMI Schedule
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        {showCustomerForm && (
          <CustomerDetail
            onSuccess={handleSuccess}
            onCancel={() => setShowCustomerForm(false)}
          />
        )}
        {showLoanForm && (
          <LoanDetail
            onSuccess={handleSuccess}
            onCancel={() => setShowLoanForm(false)}
          />
        )}
        {showEmiSchedule && (
          <div>
            <button
              onClick={() => setShowEmiSchedule(false)}
              className="mb-4 flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold hover:text-indigo-600 border border-gray-200"
            >
              <X size={20} />
              Back to Dashboard
            </button>
            <EmiSchedule />
          </div>
        )}
        {!showCustomerForm && !showLoanForm && !showEmiSchedule && (
          <Dashboard />
        )}
      </div>
    </div>
  );
};

export default App;
