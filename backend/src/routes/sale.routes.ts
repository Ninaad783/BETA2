import { Router } from 'express';
import { 
  createSaleInvoice, 
  getSaleInvoices, 
  getSaleInvoiceById 
} from '../controllers/sale.controller';

export const saleRouter = Router();

saleRouter.post('/', createSaleInvoice);
saleRouter.get('/', getSaleInvoices);
saleRouter.get('/:id', getSaleInvoiceById);
