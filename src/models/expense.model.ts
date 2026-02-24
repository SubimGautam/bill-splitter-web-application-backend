// backend/src/models/expense.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  totalAmount: number;
  date: Date;
  group: mongoose.Types.ObjectId;
  payments: Array<{ name: string; amount: number }>;
  splits: Array<{ name: string; amount: number }>;
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  payments: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  splits: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);