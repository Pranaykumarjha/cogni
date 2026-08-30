import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";
import Trip from "@/models/Trip";

export async function GET(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const expenses = await Expense.find({ trip: params.tripId })
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate balances (equal split among all trip members)
    const trip = await Trip.findById(params.tripId).lean();
    if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    const totalMembers = 1 + (trip.members?.length || 0); // Creator + members
    const balances: Record<string, { name: string; balance: number }> = {};
    
    // Initialize balances
    const allMemberIds = [trip.creator.toString(), ...(trip.members || []).map((m: any) => m.toString())];
    
    // We need user details to show names in balances. For MVP, we'll just extract from expenses or use ID if they haven't paid anything.
    // In a real app, we'd populate the trip members array.
    
    expenses.forEach((expense: any) => {
      const payerId = expense.paidBy._id.toString();
      const payerName = expense.paidBy.name || expense.paidBy.email;
      
      if (!balances[payerId]) balances[payerId] = { name: payerName, balance: 0 };
      
      // Payer's balance goes UP by the amount they paid
      balances[payerId].balance += expense.amount;
      
      // Everyone's balance goes DOWN by their share
      const splitAmount = expense.amount / totalMembers;
      allMemberIds.forEach(memberId => {
        if (!balances[memberId]) balances[memberId] = { name: "User", balance: 0 }; // Fallback name
        balances[memberId].balance -= splitAmount;
      });
    });

    return NextResponse.json({ expenses, balances }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ tripId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { description, amount } = await req.json();

    if (!description || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    const expense = await Expense.create({
      trip: params.tripId,
      description,
      amount: Number(amount),
      paidBy: (session.user as any).id,
    });

    const populatedExpense = await expense.populate("paidBy", "name email");

    return NextResponse.json(populatedExpense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
