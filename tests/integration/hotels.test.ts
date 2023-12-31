import app, { init } from '@/app';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { cleanDb, generateValidToken } from '../helpers';
import faker from '@faker-js/faker';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createTicketTypeIncludesHotel,
  createTicketTypeNotIncludesHotel,
  createTicketTypeRemote,
  createUser,
} from '../factories';
import { TicketStatus } from '@prisma/client';
import { createHotelFactory, createHotelRoomFactory } from '../factories/hotels-factory';
import { createDeflate } from 'zlib';

const server = supertest(app);

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

describe('GET /hotels', () => {
  it('Should return status 401 if no token is given', async () => {
    const result = await server.get('/hotels');

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should return status 401 if invalid token is given', async () => {
    const token = faker.lorem.sentence(10);

    const result = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('A valid token is given', () => {
    it('Should return status 402 if ticket has not been paid', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketType();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);

      const result = await server.get('/hotels').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('Should return status 402 if ticket is remote', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeRemote();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);

      await createPayment(testTicket.id, testTicketType.price);

      const result = await server.get('/hotels').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('Should return status 402 if there is no hotel included', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeNotIncludesHotel();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);

      await createPayment(testTicket.id, testTicketType.price);

      const result = await server.get('/hotels').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('Should return status 200 and list every available hotels', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeIncludesHotel();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.PAID);

      await createPayment(testTicket.id, testTicketType.price);

      const { id, name, image, createdAt, updatedAt } = await createHotelFactory();
      const result = await server.get('/hotels').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.OK);

      expect(result.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id,
            name,
            image,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  it('Should return status 401 if no token is given', async () => {
    const result = await server.get('/hotels/1999');

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('Should return status 401 if invalid token is given', async () => {
    const token = faker.lorem.sentence(10);

    const result = await server.get('/hotels/1999').set('Authorization', `Bearer ${token}`);

    expect(result.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('A valid token is given', () => {
    it('Should return status 404 if no enrollment is found', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);

      const result = await server.get('/hotels/1999').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return status 404 if no ticket is found', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);

      const result = await server.get('/hotels/1999').set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });

    it('Should return status 404 if no hotel is found', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testHotel = await createHotelFactory();

      const result = await server.get(`/hotels/${testHotel.id}`).set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.NOT_FOUND);
    });
    it('Should return status 402 if ticket has not been paid', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketType();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);
      const testHotel = await createHotelFactory();

      const result = await server.get(`/hotels/${testHotel.id}`).set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it('Should return status 402 if ticket is remote', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeRemote();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);
      const testHotel = await createHotelFactory();

      await createPayment(testTicket.id, testTicketType.price);

      const result = await server.get(`/hotels/${testHotel.id}`).set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('Should return status 402 if there is no hotel included', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeNotIncludesHotel();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.RESERVED);
      const testHotel = await createHotelFactory();

      await createPayment(testTicket.id, testTicketType.price);

      const result = await server.get(`/hotels/${testHotel.id}`).set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('Should return status 200 and list every available hotels', async () => {
      const testUser = await createUser();
      const testToken = await generateValidToken(testUser);
      const testEnrollment = await createEnrollmentWithAddress(testUser);
      const testTicketType = await createTicketTypeIncludesHotel();
      const testTicket = await createTicket(testEnrollment.id, testTicketType.id, TicketStatus.PAID);
      const testHotel = await createHotelFactory();
      const testRoom = await createHotelRoomFactory(testHotel.id);

      await createPayment(testTicket.id, testTicketType.price);

      const result = await server.get(`/hotels/${testHotel.id}`).set('Authorization', `Bearer ${testToken}`);

      expect(result.status).toBe(httpStatus.OK);

      expect(result.body).toEqual(
        expect.objectContaining({
            id: testHotel.id,
            name: testHotel.name,
            image: testHotel.image,
            createdAt: testHotel.createdAt.toISOString(),
            updatedAt: testHotel.updatedAt.toISOString(),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                ...testRoom,
                createdAt: testRoom.createdAt.toISOString(),
                updatedAt: testRoom.updatedAt.toISOString(),
              }),
            ]),
          }),
      );
    });
  });
});
