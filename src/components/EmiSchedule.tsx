import React, { useState, useEffect } from 'react';
import { Customer, Loan, EmiPayment } from '../types';
import { getCustomers, getLoansByCustomerId, getPaymentsByLoanId, savePayment, saveLoan } from '../utils/storage';
import { Calendar, CheckCircle, Clock, AlertCircle, DollarSign, X, SkipForward } from 'lucide-react';

const EmiSchedule: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [emiSchedule, setEmiSchedule] = useState<EmiPayment[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState<EmiPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gpay'>('cash');
  const [isSkipPayment, setIsSkipPayment] = useState(false);

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      const customerLoans = getLoansByCustomerId(selectedCustomerId);
      setLoans(customerLoans);
      setSelectedLoanId('');
      setEmiSchedule([]);
      setSelectedLoan(null);
    } else {
      setLoans([]);
      setSelectedLoanId('');
      setEmiSchedule([]);
      setSelectedLoan(null);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    if (selectedLoanId) {
      const loan = loans.find(l => l.id === selectedLoanId);
      if (loan) {
        setSelectedLoan(loan);
        const payments = getPaymentsByLoanId(selectedLoanId);
        
        // If no payments exist, generate the schedule
        if (payments.length === 0) {
          const generatedSchedule = generateEmiSchedule(loan);
          setEmiSchedule(generatedSchedule);
        } else {
          setEmiSchedule(payments);
        }
      }
    } else {
      setEmiSchedule([]);
      setSelectedLoan(null);
    }
  }, [selectedLoanId, loans]);

  const generateEmiSchedule = (loan: Loan): EmiPayment[] => {
    const schedule: EmiPayment[] = [];
    const loanDate = new Date(loan.loanDate);
    
    for (let i = 1; i <= loan.tenure; i++) {
      const dueDate = new Date(loanDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        id: `emi_${loan.id}_${i}`,
        loanId: loan.id,
        emiNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        paidDate: null,
        amount: loan.emiAmount,
        isSkipped: false,
        defaultAmountPaid: 0,
        status: 'pending',
      });
    }
    
    return schedule;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            <CheckCircle size={12} />
            Paid
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
            <AlertCircle size={12} />
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleCollectPayment = (emi: EmiPayment) => {
    setSelectedEmi(emi);
    setIsSkipPayment(false);
    setPaymentMethod('cash');
    setShowPaymentModal(true);
  };

  const handleSkipPayment = (emi: EmiPayment) => {
    setSelectedEmi(emi);
    setIsSkipPayment(true);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    if (!selectedEmi || !selectedLoan) return;

    const updatedPayment: EmiPayment = {
      ...selectedEmi,
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: isSkipPayment ? undefined : paymentMethod,
      isSkipped: isSkipPayment,
      defaultAmountPaid: isSkipPayment ? selectedLoan.defaultAmount : 0,
      status: isSkipPayment ? 'skipped' : 'paid',
    };

    // Save the payment
    savePayment(updatedPayment);

    // If skipped, add a new EMI at the end
    if (isSkipPayment) {
      const lastEmi = emiSchedule[emiSchedule.length - 1];
      const newDueDate = new Date(lastEmi.dueDate);
      newDueDate.setMonth(newDueDate.getMonth() + 1);

      const newEmi: EmiPayment = {
        id: `emi_${selectedLoan.id}_${emiSchedule.length + 1}`,
        loanId: selectedLoan.id,
        emiNumber: emiSchedule.length + 1,
        dueDate: newDueDate.toISOString().split('T')[0],
        paidDate: null,
        amount: selectedLoan.emiAmount,
        isSkipped: false,
        defaultAmountPaid: 0,
        status: 'pending',
      };

      savePayment(newEmi);

      // Update loan tenure
      const updatedLoan = {
        ...selectedLoan,
        tenure: selectedLoan.tenure + 1,
      };
      const lastEmiDate = new Date(updatedLoan.loanDate);
      lastEmiDate.setMonth(lastEmiDate.getMonth() + updatedLoan.tenure);
      updatedLoan.lastEmiDate = lastEmiDate.toISOString().split('T')[0];
      saveLoan(updatedLoan);
      setSelectedLoan(updatedLoan);
    }

    // Refresh the schedule
    const payments = getPaymentsByLoanId(selectedLoanId);
    setEmiSchedule(payments);
    setShowPaymentModal(false);
    setSelectedEmi(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-5">
          <h2 className="text-2xl font-bold text-white">EMI Schedule</h2>
          <p className="text-purple-100 text-sm mt-1">Manage and track loan payments</p>
        </div>

        <div className="p-6 border-b border-gray-100">
          {/* Customer Selection */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Selection */}
          {loans.length > 0 && (
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Loan
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              >
                <option value="">Select a loan</option>
                {loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    Loan #{loan.id} - ₹{loan.loanAmount.toLocaleString()} ({loan.tenure} months)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* EMI Schedule Table */}
        {selectedLoan && emiSchedule.length > 0 && (
          <div className="p-6">
            <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">Loan Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Loan Amount</span>
                  <p className="font-bold text-lg text-gray-800 mt-1">₹{selectedLoan.loanAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">EMI Amount</span>
                  <p className="font-bold text-lg text-gray-800 mt-1">₹{selectedLoan.emiAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Tenure</span>
                  <p className="font-bold text-lg text-gray-800 mt-1">{selectedLoan.tenure} months</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Branch</span>
                  <p className="font-bold text-lg text-gray-800 mt-1">{selectedLoan.branch}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      EMI No.
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Paid Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {emiSchedule.map((emi) => (
                    <tr key={emi.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        #{emi.emiNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-purple-400" />
                          {formatDate(emi.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        ₹{emi.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emi.paidDate ? formatDate(emi.paidDate) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(emi.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {emi.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCollectPayment(emi)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                              <DollarSign size={14} />
                              Collect
                            </button>
                            <button
                              onClick={() => handleSkipPayment(emi)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md hover:shadow-lg"
                            >
                              <SkipForward size={14} />
                              Skip
                            </button>
                          </div>
                        )}
                        {emi.status === 'paid' && emi.paymentMethod && (
                          <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                            {emi.paymentMethod === 'cash' ? '💵 Cash' : '📱 GPay'}
                          </span>
                        )}
                        {emi.status === 'skipped' && (
                          <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                            Default: ₹{emi.defaultAmountPaid}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total EMIs</p>
                  <p className="font-bold text-2xl text-gray-800">{emiSchedule.length}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paid</p>
                  <p className="font-bold text-2xl text-green-600">
                    {emiSchedule.filter(e => e.status === 'paid').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending</p>
                  <p className="font-bold text-2xl text-gray-600">
                    {emiSchedule.filter(e => e.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No selection message */}
        {!selectedLoan && (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Calendar size={40} className="text-purple-400" />
            </div>
            <p className="text-gray-500 text-lg">Please select a customer and loan to view the EMI schedule</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedEmi && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-purple-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {isSkipPayment ? 'Skip Payment' : 'Collect Payment'}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600 font-medium">EMI #{selectedEmi.emiNumber}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {isSkipPayment ? `Default Amount: ₹${selectedLoan?.defaultAmount.toLocaleString()}` : `Amount: ₹${selectedEmi.amount.toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-600 mt-1">Due: {formatDate(selectedEmi.dueDate)}</p>
              </div>

              {!isSkipPayment && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'gpay')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">💵 Cash</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all">
                      <input
                        type="radio"
                        value="gpay"
                        checked={paymentMethod === 'gpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'gpay')}
                        className="w-4 h-4 text-purple-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">📱 GPay</span>
                    </label>
                  </div>
                </div>
              )}

              {isSkipPayment && (
                <div className="mb-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 font-medium">
                    <span className="text-yellow-600">⚠️</span> <strong>Note:</strong> Skipping this payment will charge the default amount (₹{selectedLoan?.defaultAmount.toLocaleString()}) and add one additional EMI to the schedule.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {isSkipPayment ? 'Confirm Skip' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmiSchedule;
