import faker from '@faker-js/faker';
import { prisma } from '../../src/config/database';

export async function createHotelFactory() {
  return prisma.hotel.create({
    data: {
      name: faker.commerce.productName(),
      image: faker.image.city(),
    },
  });
}

export async function createHotelRoomFactory(hotelId: number) {
  return prisma.room.create({
    data:{
      name: Math.floor(Math.random() * 500).toString(),
      capacity: Math.floor(Math.random() * 5),
      hotelId
    }
  })
}