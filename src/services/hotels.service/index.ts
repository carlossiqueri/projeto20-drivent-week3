import { notFoundError } from '../../errors';
import { paymentRequiredError } from '../../errors/payment-required-error';
import enrollmentRepository from '../../repositories/enrollment-repository';
import hotelsRepository from '../../repositories/hotels-repository';
import ticketsRepository from '../../repositories/tickets-repository';

async function getHotels(userId: number) {
  // se o usuário:
  // Não existe (inscrição, ticket ou hotel): 404 (not found)
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const checkHotels = await hotelsRepository.getHotels();
  if (checkHotels.length === 0) throw notFoundError();


  // Ticket não foi pago, é remoto ou não inclui hotel: 402 (payment required)
  const ticketSituation = await ticketsRepository.findTickeWithTypeById(ticket.id);
  if (
    ticket.status !== 'PAID' ||
    ticketSituation.TicketType.includesHotel === false ||
    ticketSituation.TicketType.isRemote === true
  ) {
    throw paymentRequiredError();
  }

  // Outros erros: 400 (bad request)

  return checkHotels;
}

async function getHotelsById(userId: number, hotelId: number) {
  // se o usuário:
  // Não existe (inscrição, ticket ou hotel): 404 (not found)
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();


  const checkHotels = await hotelsRepository.getHotels();
  if (checkHotels.length === 0) throw notFoundError();


  // Ticket não foi pago, é remoto ou não inclui hotel: 402 (payment required)
  const ticketSituation = await ticketsRepository.findTickeWithTypeById(ticket.id);
  if (
    ticket.status !== 'PAID' ||
    ticketSituation.TicketType.includesHotel === false ||
    ticketSituation.TicketType.isRemote === true
  ) {
    throw paymentRequiredError();
  }

  // Outros erros: 400 (bad request)

  const hotelRooms = await hotelsRepository.getHotelsById(hotelId);
  return hotelRooms;
}

const hotelsServices = {
  getHotels,
  getHotelsById,
};

export default hotelsServices;
