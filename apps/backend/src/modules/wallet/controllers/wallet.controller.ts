
import type { Request, Response } from "express";

import { walletService } from "../services/wallet.service.js";
import { purchaseSchema } from "../schemas/purchase.schema.js";

export const walletController = {
  async getWallet(_req: Request, res: Response) {
    const userId = res.locals.user.id;

    const wallet = await walletService.getWallet(userId);

    res.status(200).json({
      success: true,
      data: wallet,
    });
  },

  async getTransactions(_req: Request, res: Response) {
    const userId = res.locals.user.id;

    const transactions = await walletService.getTransactions(userId);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  },
  async purchaseCredits(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const input = purchaseSchema.parse(req.body);

  const payment = await walletService.purchaseCredits(userId, input);

  res.status(200).json({
    success: true,
    message: "Mock credit purchase completed",
    data: payment,
  });
},
};
