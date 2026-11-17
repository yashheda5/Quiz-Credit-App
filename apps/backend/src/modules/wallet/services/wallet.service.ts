
import { AppError } from "../../../common/errors/AppError.js";
import { walletRepository } from "../repositories/wallet.repository.js";
import type { PurchaseInput } from "../schemas/purchase.schema.js";

export const walletService = {
  async getWallet(userId: string) {
    const wallet = await walletRepository.getWallet(userId);

    if (!wallet) {
      throw new AppError(404, "Wallet not found");
    }

    return wallet;
  },

  async getTransactions(userId: string) {
    return walletRepository.getTransactions(userId);
  },
  async purchaseCredits(userId: string, input: PurchaseInput) {
  return walletRepository.purchaseCredits(userId, input);
},
};
