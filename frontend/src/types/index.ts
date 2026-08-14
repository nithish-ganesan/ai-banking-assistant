export type UserProfile = {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type TransactionInput = {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
};
