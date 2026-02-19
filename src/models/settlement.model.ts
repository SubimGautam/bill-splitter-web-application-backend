import mongoose, { Schema, Document } from 'mongoose';

export interface ISettlement extends Document {
  from: string;          // member name (payer)
  to: string;            // member name (receiver)
  amount: number;
  group: mongoose.Types.ObjectId;
  date: Date;
}

const settlementSchema = new Schema<ISettlement>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  amount: { type: Number, required: true },
  group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<ISettlement>('Settlement', settlementSchema);