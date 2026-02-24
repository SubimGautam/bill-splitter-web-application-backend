import Expense from '../models/expense.model';
import Settlement from '../models/settlement.model';

export interface Balance {
  name: string;
  amount: number; // positive = user is owed money, negative = user owes money
}


const SETTLEMENT_SIGN_STANDARD = true;

export async function calculateGroupBalances(groupId: string, members: string[]): Promise<Balance[]> {
  const balanceMap = new Map<string, number>();
  members.forEach(m => balanceMap.set(m, 0));

  // Process expenses
  const expenses = await Expense.find({ group: groupId });
  console.log('Processing expenses:', expenses.length);
  expenses.forEach(exp => {
    // Add payments (who paid how much)
    exp.payments.forEach((payment: { name: string; amount: number }) => {
      const current = balanceMap.get(payment.name) || 0;
      balanceMap.set(payment.name, current + payment.amount);
    });
    // Subtract splits (who owes how much)
    exp.splits.forEach((split: { name: string; amount: number }) => {
      const current = balanceMap.get(split.name) || 0;
      balanceMap.set(split.name, current - split.amount);
    });
  });

  // Process settlements
  const settlements = await Settlement.find({ group: groupId });
  console.log('Processing settlements:', settlements.length);
  settlements.forEach(settlement => {
    const fromName = settlement.from;
    const toName = settlement.to;
    const amount = settlement.amount;

    console.log(`Settlement: ${fromName} -> ${toName} amount ${amount}`);

    if (SETTLEMENT_SIGN_STANDARD) {
      // Standard: payer (from) gets +amount, receiver (to) gets -amount
      balanceMap.set(fromName, (balanceMap.get(fromName) || 0) + amount);
      balanceMap.set(toName, (balanceMap.get(toName) || 0) - amount);
      console.log(`  After standard: ${fromName}: ${balanceMap.get(fromName)}, ${toName}: ${balanceMap.get(toName)}`);
    } else {
      // Alternate: payer (from) gets -amount, receiver (to) gets +amount
      balanceMap.set(fromName, (balanceMap.get(fromName) || 0) - amount);
      balanceMap.set(toName, (balanceMap.get(toName) || 0) + amount);
      console.log(`  After alternate: ${fromName}: ${balanceMap.get(fromName)}, ${toName}: ${balanceMap.get(toName)}`);
    }
  });

  // Convert map to array and round to 2 decimals
  const balances: Balance[] = [];
  for (const [name, amount] of balanceMap.entries()) {
    balances.push({ name, amount: Math.round(amount * 100) / 100 });
  }
  console.log('Final balances:', balances);
  return balances;
}