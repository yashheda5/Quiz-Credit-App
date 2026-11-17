
import { Router } from "express";

import { authenticate } from "../../../middleware/auth.middleware.js";
import { walletController } from "../controllers/wallet.controller.js";

export const walletRouter = Router();

walletRouter.use(authenticate);

walletRouter.get("/", walletController.getWallet);
walletRouter.get("/transactions", walletController.getTransactions);
walletRouter.post("/purchase", walletController.purchaseCredits);