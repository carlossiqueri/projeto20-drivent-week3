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
