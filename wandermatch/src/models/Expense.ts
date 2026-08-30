import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  trip: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  date: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    trip: { type: Schema.Types.ObjectId, ref: "Trip", required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
