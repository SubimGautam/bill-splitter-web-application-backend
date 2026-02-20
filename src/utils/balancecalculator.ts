import Expense from '../models/expense.model';
import Settlement from '../models/settlement.model';

export interface Balance {
  name: string;
  amount: number; // positive = user is owed money, negative = user owes money
}

export async function calculateGroupBalances(groupId: string, members: string[]): Promise<Balance[]> {
  const balanceMap = new Map<string, number>();
  members.forEach(m => balanceMap.set(m, 0));

  const expenses = await Expense.find({ group: groupId });
  
  expenses.forEach(exp => {
    // Add payments (who paid how much)
    exp.payments.forEach((payment: { name: string; amount: number }) => {
      balanceMap.set(payment.name, (balanceMap.get(payment.name) || 0) + payment.amount);
    });
    
    // Subtract splits (who owes how much)
    exp.splits.forEach((split: { name: string; amount: number }) => {
      balanceMap.set(split.name, (balanceMap.get(split.name) || 0) - split.amount);
    });
  });

  // Convert map to array and round to 2 decimals
  const balances: Balance[] = [];
  for (const [name, amount] of balanceMap.entries()) {
    balances.push({ name, amount: Math.round(amount * 100) / 100 });
  }
  return balances;
}