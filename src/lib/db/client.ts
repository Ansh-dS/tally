// Creating singleton prisma client.
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

// Creates singleton value
function generateClientHandler() {
    const client = new PrismaClient({
        // This helps us see if the URL is actually missing during the crash
        adapter
    });
    return client;
}

// Stores singleton value
const globalForPrisma = global as unknown as {
    client: ReturnType<typeof generateClientHandler>;
};

// Main generate function
function generateClient() {
    const client = globalForPrisma.client || generateClientHandler();

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.client = client;
    }

    return client;
}

// Export the singleton instance
export const prismaClient = generateClient();
