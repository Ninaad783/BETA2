import { Router } from 'express';
import { 
  createSaleInvoice, 
  getSaleInvoices, 
  getSaleInvoiceById,
  cancelSaleInvoice 
} from '../controllers/sale.controller';

export const saleRouter = Router();

saleRouter.post('/', createSaleInvoice);
saleRouter.get('/', getSaleInvoices);
saleRouter.get('/:id', getSaleInvoiceById);
saleRouter.post('/:id/cancel', cancelSaleInvoice);
