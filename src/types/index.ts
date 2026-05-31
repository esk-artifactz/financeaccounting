export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  photo: string; // base64 encoded image
  guarantorName: string;
  pan: string;
  aadharNumber: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  customerId: string;
  loanAmount: number;
  emiAmount: number;
  loanDate: string;
  tenure: number; // in months
  lastEmiDate: string;
  defaultAmount: number; // configurable per account for skipped EMI
  branch: string;
  createdAt: string;
}

export interface EmiPayment {
  id: string;
  loanId: string;
  emiNumber: number;
  dueDate: string;
  paidDate: string | null;
  amount: number;
  isSkipped: boolean;
  defaultAmountPaid: number;
  status: 'pending' | 'paid' | 'skipped';
  paymentMethod?: 'cash' | 'gpay';
}

export interface AmortizationSchedule {
  loanId: string;
  payments: EmiPayment[];
}
