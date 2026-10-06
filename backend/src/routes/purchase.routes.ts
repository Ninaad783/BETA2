import { Router } from 'express';
import { createPurchaseInvoice, getPurchaseInvoices } from '../controllers/purchase.controller';

export const purchaseRouter = Router();

purchaseRouter.get('/', getPurchaseInvoices);
purchaseRouter.post('/', createPurchaseInvoice);
