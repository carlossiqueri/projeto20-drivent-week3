import { prisma } from '../../config';

async function getHotels() {
  return await prisma.hotel.findMany();
}

async function getHotelsById(id: number) {
  // Retorno de Rooms com Hotel (include Rooms em Hotel);
  // Rooms => Boolean logo rooms: true;
  return await prisma.hotel.findFirst({
    include: { Rooms: true },
    where: { id },
  });
}

const hotelsRepository = {
  getHotels,
  getHotelsById,
};

export default hotelsRepository;
