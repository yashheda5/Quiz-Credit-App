
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Coins, PlusCircle, History } from "lucide-react";

import {
  getWallet,
  getTransactions,
  purchaseCredits,
} from "../wallet.api";

const transactionLabels: Record<string, string> = {
  SIGNUP_BONUS: "Welcome Bonus",
  QUIZ_STAKE: "Quiz Entry",
  QUIZ_REWARD: "Quiz Reward",
  CREDIT_PURCHASE: "Credit Purchase",
};

export default function WalletPage() {
  const queryClient = useQueryClient();

  const [credits, setCredits] = useState(100);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const walletQuery = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });

  const transactionsQuery = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: getTransactions,
  });

  const purchaseMutation = useMutation({
    mutationFn: purchaseCredits,
    onSuccess: () => {
      setMessage("Credits added successfully!");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err) => {
      setMessage("");

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Purchase failed");
      } else {
        setError("Something went wrong");
      }
    },
  });

  function handlePurchase() {
    if (!Number.isInteger(credits) || credits <= 0) {
      setError("Enter a valid credit amount");
      return;
    }

    setError("");
    setMessage("");
    purchaseMutation.mutate(credits);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <p className="mt-2 text-slate-500">
          Manage your quiz credits and view transactions.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-slate-900 p-7 text-white">
          <div className="flex items-center gap-2 text-slate-300">
            <Coins size={20} />
            Available Credits
          </div>

          <p className="mt-5 text-5xl font-bold">
            {walletQuery.isLoading
              ? "..."
              : walletQuery.data?.balance ?? "—"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-7">
          <div className="flex items-center gap-2">
            <PlusCircle size={20} />
            <h2 className="text-lg font-semibold">Add Credits</h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Mock purchase — no real payment required.
          </p>

          <div className="mt-5 flex gap-3">
            <input
              type="number"
              min={1}
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full rounded-lg border p-3"
            />

            <button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              className="rounded-lg bg-slate-900 px-5 text-white disabled:opacity-50"
            >
              {purchaseMutation.isPending ? "Adding..." : "Purchase"}
            </button>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center gap-2 border-b p-6">
          <History size={20} />
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>

        {transactionsQuery.isLoading ? (
          <p className="p-6">Loading transactions...</p>
        ) : transactionsQuery.isError ? (
          <p className="p-6 text-red-600">Failed to load transactions.</p>
        ) : transactionsQuery.data?.length === 0 ? (
          <p className="p-6 text-slate-500">No transactions yet.</p>
        ) : (
          <div className="divide-y">
            {transactionsQuery.data?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-medium">
                    {transactionLabels[transaction.type] ??
                      transaction.type}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.amount >= 0
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.amount >= 0 ? "+" : ""}
                    {transaction.amount} credits
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Balance: {transaction.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
