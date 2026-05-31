import React, { useState, useEffect } from 'react';
import { Loan, Customer } from '../types';
import { saveLoan, getCustomers, getCustomerByPhone } from '../utils/storage';
import { X, Search } from 'lucide-react';

interface LoanDetailProps {
  loan?: Loan;
  onSuccess: () => void;
  onCancel: () => void;
}

const LoanDetail: React.FC<LoanDetailProps> = ({ loan, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Loan>>(
    loan || {
      customerId: '',
      loanAmount: 0,
      emiAmount: 0,
      loanDate: new Date().toISOString().split('T')[0],
      tenure: 12,
      defaultAmount: 0,
      branch: 'Coimbatore',
    }
  );
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [customerError, setCustomerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomers(getCustomers());
    if (loan?.customerId) {
      const customer = getCustomers().find(c => c.id === loan.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [loan]);

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({ ...formData, customerId: customer.id });
      setCustomerError('');
    }
  };

  const handlePhoneSearch = () => {
    const customer = getCustomerByPhone(phoneSearch);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({ ...formData, customerId: customer.id });
      setCustomerError('');
    } else {
      setCustomerError('No customer found with this phone number');
      setSelectedCustomer(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
      setCustomerError('Please select a customer');
    }
    if (!formData.loanAmount || formData.loanAmount <= 0) {
      newErrors.loanAmount = 'Loan amount is required and must be greater than 0';
    }
    if (!formData.emiAmount || formData.emiAmount <= 0) {
      newErrors.emiAmount = 'EMI amount is required and must be greater than 0';
    }
    if (!formData.tenure || formData.tenure <= 0) {
      newErrors.tenure = 'Tenure is required and must be greater than 0';
    }
    if (formData.defaultAmount === undefined || formData.defaultAmount < 0) {
      newErrors.defaultAmount = 'Default amount must be 0 or greater';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Calculate last EMI date
    const loanDate = new Date(formData.loanDate!);
    const lastEmiDate = new Date(loanDate);
    lastEmiDate.setMonth(lastEmiDate.getMonth() + formData.tenure!);

    const loanData: Loan = {
      id: loan?.id || `loan_${Date.now()}`,
      customerId: formData.customerId!,
      loanAmount: formData.loanAmount!,
      emiAmount: formData.emiAmount!,
      loanDate: formData.loanDate!,
      tenure: formData.tenure!,
      lastEmiDate: lastEmiDate.toISOString().split('T')[0],
      defaultAmount: formData.defaultAmount!,
      branch: formData.branch!,
      createdAt: loan?.createdAt || new Date().toISOString(),
    };

    saveLoan(loanData);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-green-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {loan ? 'Edit Loan' : 'Add New Loan'}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:text-green-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Customer *
            </label>
            <select
              value={formData.customerId || ''}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {errors.customerId}
              </p>
            )}
          </div>

          {/* Phone Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or Search by Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                placeholder="Enter phone number"
              />
              <button
                type="button"
                onClick={handlePhoneSearch}
                className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-md"
              >
                <Search size={20} />
              </button>
            </div>
            {customerError && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {customerError}
              </p>
            )}
            {selectedCustomer && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                <span className="text-green-500">✓</span> Selected: {selectedCustomer.name} - {selectedCustomer.phone}
              </p>
            )}
          </div>

          {/* Loan Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Number *
            </label>
            <input
              type="text"
              value={loan?.id || `LOAN_${Date.now()}`}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 font-medium"
            />
            <p className="text-gray-500 text-xs mt-1">Auto-generated</p>
          </div>

          {/* Loan Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Amount *
            </label>
            <input
              type="number"
              value={formData.loanAmount || ''}
              onChange={(e) => setFormData({ ...formData, loanAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              placeholder="Enter loan amount"
              min="0"
              step="0.01"
            />
            {errors.loanAmount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {errors.loanAmount}
              </p>
            )}
          </div>

          {/* EMI Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              EMI Amount *
            </label>
            <input
              type="number"
              value={formData.emiAmount || ''}
              onChange={(e) => setFormData({ ...formData, emiAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              placeholder="Enter EMI amount"
              min="0"
              step="0.01"
            />
            {errors.emiAmount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {errors.emiAmount}
              </p>
            )}
          </div>

          {/* Tenure */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tenure (Months) *
            </label>
            <input
              type="number"
              value={formData.tenure || ''}
              onChange={(e) => setFormData({ ...formData, tenure: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              placeholder="Enter tenure in months"
              min="1"
            />
            {errors.tenure && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {errors.tenure}
              </p>
            )}
          </div>

          {/* Loan Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Loan Date *
            </label>
            <input
              type="date"
              value={formData.loanDate || ''}
              onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch || 'Coimbatore'}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            >
              <option value="Coimbatore">Coimbatore</option>
            </select>
          </div>

          {/* Default Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Default Amount (for skipped EMI) *
            </label>
            <input
              type="number"
              value={formData.defaultAmount || ''}
              onChange={(e) => setFormData({ ...formData, defaultAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              placeholder="Enter default amount"
              min="0"
              step="0.01"
            />
            <p className="text-gray-500 text-xs mt-1">Amount to pay if customer skips an EMI</p>
            {errors.defaultAmount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span className="text-red-400">•</span> {errors.defaultAmount}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all hover:border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              {loan ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanDetail;
