// Common financial utilities and calculations

import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AccountPayable } from '@/hooks/useAccountsPayable';
import type { AccountReceivable } from '@/hooks/useAccountsReceivable';

// Date utilities
export const getPeriodDates = (period: string) => {
  const now = new Date();
  
  switch (period) {
    case 'next-7-days':
      return { start: now, end: addDays(now, 7), label: 'Próximos 7 dias' };
    case 'next-15-days':
      return { start: now, end: addDays(now, 15), label: 'Próximos 15 dias' };
    case 'next-30-days':
      return { start: now, end: addDays(now, 30), label: 'Próximos 30 dias' };
    case 'current-week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }), label: 'Esta semana' };
    case 'current-month':
      return { start: startOfMonth(now), end: endOfMonth(now), label: format(now, 'MMMM yyyy', { locale: ptBR }) };
    default:
      return { start: now, end: addDays(now, 30), label: 'Próximos 30 dias' };
  }
};

// Status calculation utilities
export const updateAccountStatus = <T extends { status: string; due_date: string }>(account: T): T => {
  if (account.status === 'pending' && new Date(account.due_date) < new Date()) {
    return { ...account, status: 'overdue' } as T;
  }
  return account;
};

export const updateAccountsStatus = <T extends { status: string; due_date: string }>(accounts: T[]): T[] => {
  return accounts.map(updateAccountStatus);
};

// Financial calculations
export const calculateFinancialMetrics = (
  receivables: AccountReceivable[],
  payables: AccountPayable[],
  periodStart: Date,
  periodEnd: Date
) => {
  // Filter accounts by period
  const periodReceivables = receivables.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= periodStart && dueDate <= periodEnd;
  });

  const periodPayables = payables.filter(account => {
    const dueDate = new Date(account.due_date);
    return dueDate >= periodStart && dueDate <= periodEnd;
  });

  // Calculate totals
  const totalRevenue = periodReceivables.reduce((sum, account) => sum + account.amount, 0);
  const totalExpenses = periodPayables.reduce((sum, account) => sum + account.amount, 0);
  const cashFlow = totalRevenue - totalExpenses;
  
  // Calculate paid amounts
  const paidReceivables = periodReceivables.filter(account => account.status === 'paid');
  const paidPayables = periodPayables.filter(account => account.status === 'paid');
  
  const paidRevenue = paidReceivables.reduce((sum, account) => sum + account.amount, 0);
  const paidExpenses = paidPayables.reduce((sum, account) => sum + account.amount, 0);

  // Calculate progress
  const receivablesProgress = periodReceivables.length > 0 ? (paidReceivables.length / periodReceivables.length) * 100 : 0;
  const payablesProgress = periodPayables.length > 0 ? (paidPayables.length / periodPayables.length) * 100 : 0;

  // Calculate overdue accounts
  const overdueReceivables = receivables.filter(account => 
    new Date(account.due_date) < new Date() && account.status === 'pending'
  );
  const overduePayables = payables.filter(account => 
    new Date(account.due_date) < new Date() && account.status === 'pending'
  );

  return {
    period: {
      receivables: periodReceivables,
      payables: periodPayables,
      totalRevenue,
      totalExpenses,
      cashFlow
    },
    paid: {
      receivables: paidReceivables,
      payables: paidPayables,
      revenue: paidRevenue,
      expenses: paidExpenses
    },
    progress: {
      receivables: receivablesProgress,
      payables: payablesProgress
    },
    overdue: {
      receivables: overdueReceivables,
      payables: overduePayables,
      totalReceivableAmount: overdueReceivables.reduce((sum, account) => sum + account.amount, 0),
      totalPayableAmount: overduePayables.reduce((sum, account) => sum + account.amount, 0)
    }
  };
};

// Growth calculation
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Format currency
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2 
  });
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${Math.abs(value).toFixed(1)}%`;
};

// Date formatting
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateWithWeekday = (date: string | Date): string => {
  return format(new Date(date), 'dd/MM/yyyy - EEEE', { locale: ptBR });
};

// Validation
export const validateAccountData = (data: { description: string; amount: number; due_date: string }) => {
  return {
    isValid: !!(data.description.trim() && data.amount > 0 && data.due_date),
    errors: {
      description: !data.description.trim() ? 'Descrição é obrigatória' : '',
      amount: data.amount <= 0 ? 'Valor deve ser maior que zero' : '',
      due_date: !data.due_date ? 'Data de vencimento é obrigatória' : ''
    }
  };
};