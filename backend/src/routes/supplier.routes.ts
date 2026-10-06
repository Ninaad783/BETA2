import { Router } from 'express';
import { getSuppliers, createSupplier } from '../controllers/supplier.controller';

export const supplierRouter = Router();

supplierRouter.get('/', getSuppliers);
supplierRouter.post('/', createSupplier);
