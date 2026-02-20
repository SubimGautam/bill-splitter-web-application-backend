import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment {
  name: string;      // who paid
  amount: number;    // how much they paid
}

export interface IExpense extends Document {
  description: string;
  totalAmount: number;
  payments: IPayment[];           // who paid how much
  splits: { name: string; amount: number }[];  // who owes how much
  group: mongoose.Types.ObjectId;
  date: Date;
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  payments: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  splits: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);