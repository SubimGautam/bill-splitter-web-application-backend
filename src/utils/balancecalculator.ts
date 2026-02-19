import Expense from '../models/expense.model';
import Settlement from '../models/settlement.model';

export interface Balance {
  name: string;
  amount: number; // positive = user is owed money, negative = user owes money
}

export async function calculateGroupBalances(groupId: string, members: string[]): Promise<Balance[]> {
  // Initialize balances map
  const balanceMap = new Map<string, number>();
  members.forEach(m => balanceMap.set(m, 0));

  // Fetch all expenses for the group
  const expenses = await Expense.find({ group: groupId });
  expenses.forEach(exp => {
    // Add the full amount to the payer
    balanceMap.set(exp.paidBy, (balanceMap.get(exp.paidBy) || 0) + exp.amount);
    // Subtract each participant's share
    exp.splits.forEach((split: { name: string; amount: number }) => {
      balanceMap.set(split.name, (balanceMap.get(split.name) || 0) - split.amount);
    });
  });

  // Fetch all settlements for the group
  const settlements = await Settlement.find({ group: groupId });
  settlements.forEach(settlement => {
    // from pays to: from loses money, to gains money
    balanceMap.set(settlement.from, (balanceMap.get(settlement.from) || 0) - settlement.amount);
    balanceMap.set(settlement.to, (balanceMap.get(settlement.to) || 0) + settlement.amount);
  });

  // Convert map to array and round to 2 decimals
  const balances: Balance[] = [];
  for (const [name, amount] of balanceMap.entries()) {
    balances.push({ name, amount: Math.round(amount * 100) / 100 });
  }
  return balances;
}