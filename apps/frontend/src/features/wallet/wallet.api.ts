
import { api } from "../../lib/api";

export type Wallet = {
  id: string;
  balance: number;
};

export type CreditTransaction = {
  id: string;
  type:
    | "SIGNUP_BONUS"
    | "QUIZ_STAKE"
    | "QUIZ_REWARD"
    | "CREDIT_PURCHASE";
  amount: number;
  balanceAfter: number;
  createdAt: string;
};

export async function getWallet(): Promise<Wallet> {
  const response = await api.get("/wallet");
  return response.data.data;
}

export async function getTransactions(): Promise<CreditTransaction[]> {
  const response = await api.get("/wallet/transactions");
  return response.data.data;
}

export async function purchaseCredits(credits: number) {
  const response = await api.post("/wallet/purchase", {
    purchaseId: crypto.randomUUID(),
    credits,
  });

  return response.data.data;
}
