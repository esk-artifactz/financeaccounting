import React, { useState, useEffect } from 'react';
import { Customer, Loan } from '../types';
import { getDashboardStats, getCustomerById } from '../utils/storage';
import { Users, DollarSign, TrendingUp, Building2, Calendar, Phone, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = () => {
      const dashboardStats = getDashboardStats();
      setStats(dashboardStats);
    };
    loadStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Loans</p>
              <p className="text-3xl font-bold mt-1">{stats.totalLoans}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Loans</p>
              <p className="text-3xl font-bold mt-1">{stats.activeLoans}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Collected</p>
              <p className="text-2xl font-bold mt-1">₹{stats.totalCollected.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign size={28} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} />
              Recent Customers
            </h3>
          </div>
          <div className="p-6">
            {stats.recentCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No customers added yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentCustomers.map((customer: Customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {customer.photo ? (
                        <img
                          src={customer.photo}
                          alt={customer.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <Users size={20} className="text-blue-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{customer.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} />
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign size={20} />
              Recent Loans
            </h3>
          </div>
          <div className="p-6">
            {stats.recentLoans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No loans added yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentLoans.map((loan: Loan) => {
                  const customer = getCustomerById(loan.customerId);
                  return (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">₹{loan.loanAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Users size={12} />
                          {customer?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Building2 size={10} />
                          {loan.branch} • {loan.tenure} months
                        </p>
                      </div>
                      <ArrowRight size={16} className="text-gray-400" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch-wise Collection */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 size={20} />
            Branch-wise Collection
          </h3>
        </div>
        <div className="p-6">
          {Object.keys(stats.branchCollection).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No collection data available</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.branchCollection).map(([branch, data]: [string, any]) => (
                <div
                  key={branch}
                  className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={18} className="text-purple-600" />
                    <p className="font-bold text-gray-800">{branch}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collected</span>
                      <span className="font-semibold text-green-600">₹{data.totalCollected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="font-semibold text-orange-600">₹{data.totalPending.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-purple-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total</span>
                        <span className="font-bold text-gray-800">
                          ₹{(data.totalCollected + data.totalPending).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Total Pending Summary */}
      {stats.totalPending > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Total Pending Collection</p>
                <p className="text-2xl font-bold text-orange-700">₹{stats.totalPending.toLocaleString()}</p>
              </div>
            </div>
            <Calendar size={32} className="text-orange-400" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
