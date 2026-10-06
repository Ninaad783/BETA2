import { Router } from 'express';
import { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer 
} from '../controllers/customer.controller';

export const customerRouter = Router();

// Routes (can be accessed with or without auth, store fallback applied)
customerRouter.get('/', getCustomers);
customerRouter.get('/:id', getCustomerById);
customerRouter.post('/', createCustomer);
customerRouter.put('/:id', updateCustomer);
