import { Router } from 'express';
import { authenticateToken } from '../middlewares';
import { getHotels, getHotelsById } from '../controllers/hotels-controller';

const hotelsRouter = Router();

hotelsRouter.get('/', authenticateToken, getHotels);
hotelsRouter.get('/:hotelId', authenticateToken, getHotelsById);

export { hotelsRouter };
