import { prismaClient } from './client';

async function checkConnection() {
  try {
    console.log('🔍 Validating database connection...');
    // Attempt to run a raw query to check connectivity
    await prismaClient.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1); // Exit with error code to stop the test command
  } finally {
    await prismaClient.$disconnect();
  }
}

checkConnection();
