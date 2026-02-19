// backend/src/models/expense.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  paidBy: string;
  group: mongoose.Types.ObjectId;
  splits: Array<{ name: string; amount: number }>;
  date: Date;
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  splits: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);