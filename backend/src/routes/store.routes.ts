import { Router } from 'express';
import { getStoreProfile, updateStoreProfile } from '../controllers/store.controller';

export const storeRouter = Router();

storeRouter.get('/', getStoreProfile);
storeRouter.put('/', updateStoreProfile);
