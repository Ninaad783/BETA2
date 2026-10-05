import { Router } from 'express';
import { 
  searchMasterMedicines, 
  searchUnifiedMedicines, 
  inwardFromMaster 
} from '../controllers/medicine.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export const medicineRouter = Router();

// Fast search 1,000+ Master Catalog
medicineRouter.get('/master', searchMasterMedicines);

// Unified search for Billing & Counter POS (In-stock + Master suggestions)
medicineRouter.get('/search', searchUnifiedMedicines);

// Inward a master catalog medicine directly to store inventory (Pharmacist / Admin)
medicineRouter.post('/inward-from-master', authenticateToken, inwardFromMaster);
