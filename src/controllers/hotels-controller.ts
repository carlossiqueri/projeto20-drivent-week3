import httpStatus from 'http-status';
import { AuthenticatedRequest } from '../middlewares';
import hotelsServices from '../services/hotels.service';
import { Response } from 'express';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const hotels = await hotelsServices.getHotels(userId);

  res.status(httpStatus.OK).send(hotels);
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { hotelId } = req.params;

  const hotelRoomById = await hotelsServices.getHotelsById(userId, Number(hotelId));
  res.status(httpStatus.OK).send(hotelRoomById);
}
