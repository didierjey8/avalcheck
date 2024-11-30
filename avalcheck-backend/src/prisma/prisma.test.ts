import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Prisma Test Suite', () => {
    it('should connect to the database', async () => {
        const users = await prisma.users.findMany();
        expect(Array.isArray(users)).toBe(true);
    });
});

export default prisma;
