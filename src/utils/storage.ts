import { Customer, Loan, EmiPayment } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'finance_customers',
  LOANS: 'finance_loans',
  PAYMENTS: 'finance_payments',
};

// Customer Operations
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : [];
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getCustomerById = (id: string): Customer | undefined => {
  return getCustomers().find(c => c.id === id);
};

export const getCustomerByPhone = (phone: string): Customer | undefined => {
  return getCustomers().find(c => c.phone === phone);
};

// Loan Operations
export const getLoans = (): Loan[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LOANS);
  return data ? JSON.parse(data) : [];
};

export const saveLoan = (loan: Loan): void => {
  const loans = getLoans();
  const index = loans.findIndex(l => l.id === loan.id);
  if (index >= 0) {
    loans[index] = loan;
  } else {
    loans.push(loan);
  }
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
};

export const deleteLoan = (id: string): void => {
  const loans = getLoans().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
};

export const getLoansByCustomerId = (customerId: string): Loan[] => {
  return getLoans().filter(l => l.customerId === customerId);
};

export const getLoanById = (id: string): Loan | undefined => {
  return getLoans().find(l => l.id === id);
};

// Payment Operations
export const getPayments = (): EmiPayment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return data ? JSON.parse(data) : [];
};

export const savePayment = (payment: EmiPayment): void => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === payment.id);
  if (index >= 0) {
    payments[index] = payment;
  } else {
    payments.push(payment);
  }
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const getPaymentsByLoanId = (loanId: string): EmiPayment[] => {
  return getPayments().filter(p => p.loanId === loanId);
};

export const deletePaymentsByLoanId = (loanId: string): void => {
  const payments = getPayments().filter(p => p.loanId !== loanId);
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

// Export to JSON
export const exportToJSON = (): string => {
  const data = {
    customers: getCustomers(),
    loans: getLoans(),
    payments: getPayments(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

// Import from JSON
export const importFromJSON = (jsonString: string): void => {
  try {
    const data = JSON.parse(jsonString);
    if (data.customers) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
    }
    if (data.loans) {
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(data.loans));
    }
    if (data.payments) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Invalid JSON format');
  }
};

// Dashboard Data Aggregation
export const getDashboardStats = () => {
  const customers = getCustomers();
  const loans = getLoans();
  const payments = getPayments();

  // Active loans (loans with pending payments)
  const activeLoans = loans.filter(loan => {
    const loanPayments = payments.filter(p => p.loanId === loan.id);
    const hasPendingPayments = loanPayments.some(p => p.status === 'pending');
    return hasPendingPayments;
  });

  // Branch-wise collection
  const branchCollection: Record<string, { totalCollected: number; totalPending: number }> = {};
  
  loans.forEach(loan => {
    if (!branchCollection[loan.branch]) {
      branchCollection[loan.branch] = { totalCollected: 0, totalPending: 0 };
    }
    
    const loanPayments = payments.filter(p => p.loanId === loan.id);
    loanPayments.forEach(payment => {
      if (payment.status === 'paid') {
        branchCollection[loan.branch].totalCollected += payment.amount;
      } else if (payment.status === 'skipped') {
        branchCollection[loan.branch].totalCollected += payment.defaultAmountPaid;
      } else if (payment.status === 'pending') {
        branchCollection[loan.branch].totalPending += payment.amount;
      }
    });
  });

  // Total collection
  const totalCollected = payments.reduce((sum, p) => {
    if (p.status === 'paid') return sum + p.amount;
    if (p.status === 'skipped') return sum + p.defaultAmountPaid;
    return sum;
  }, 0);

  const totalPending = payments.reduce((sum, p) => {
    if (p.status === 'pending') return sum + p.amount;
    return sum;
  }, 0);

  return {
    totalCustomers: customers.length,
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    totalCollected,
    totalPending,
    branchCollection,
    recentCustomers: customers.slice(-5).reverse(),
    recentLoans: loans.slice(-5).reverse(),
  };
};
