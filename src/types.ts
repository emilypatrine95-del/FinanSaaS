export type TransactionType = 'income' | 'expense';
export type PersonType = 'client' | 'supplier' | 'other';
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  photoURL?: string;
  company?: string;
  currency: string;
  timezone: string;
  language: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  uid: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  paymentMethod: string;
  personId?: string;
  notes?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface Person {
  id: string;
  uid: string;
  name: string;
  phone?: string;
  email?: string;
  type: PersonType;
  notes?: string;
}

export interface Goal {
  id: string;
  uid: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
}

export interface AIAnalysis {
  summary: string;
  savingsTips: string[];
  patterns: string;
  forecast: string;
}
