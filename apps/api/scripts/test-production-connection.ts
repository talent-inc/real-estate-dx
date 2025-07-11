import { PrismaClient } from '@prisma/client';
import { storageService } from '../src/lib/storage';
import { Storage } from '@google-cloud/storage';

async function testProductionConnection() {
  console.log('=== Production Environment Connection Test ===\n');
  
  // Test 1: Database Connection
  console.log('1. Testing Cloud SQL Connection...');
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Cloud SQL connection successful');
    
    // Check tables
    const userCount = await prisma.user.count();
    const propertyCount = await prisma.property.count();
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Properties: ${propertyCount}`);
  } catch (error) {
    console.error('❌ Cloud SQL connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  // Test 2: Cloud Storage Connection
  console.log('\n2. Testing Cloud Storage Connection...');
  try {
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    
    const [buckets] = await storage.getBuckets();
    console.log('✅ Cloud Storage connection successful');
    console.log('   Buckets found:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name}`);
    });
    
    // Test file upload
    console.log('\n3. Testing file upload...');
    const testFile: Express.Multer.File = {
      fieldname: 'test',
      originalname: 'test-connection.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 26,
      buffer: Buffer.from('Production connection test'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };
    
    const uploadedFile = await storageService.uploadFile(testFile, {
      folder: 'test',
      isPublic: false,
    });
    
    console.log('✅ File upload successful');
    console.log(`   - File ID: ${uploadedFile.id}`);
    console.log(`   - URL: ${uploadedFile.url}`);
    
    // Clean up
    await storageService.deleteFile(uploadedFile.id, uploadedFile.bucket);
    console.log('✅ File cleanup successful');
    
  } catch (error) {
    console.error('❌ Cloud Storage connection failed:', error);
  }
  
  // Test 3: Environment Variables
  console.log('\n4. Environment Variables Check:');
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - USE_DEV_DATA: ${process.env.USE_DEV_DATA}`);
  console.log(`   - GOOGLE_CLOUD_PROJECT: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  console.log(`   - Database: ${process.env.DATABASE_URL?.includes('localhost') ? 'Cloud SQL via Proxy' : 'Unknown'}`);
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testProductionConnection().catch(console.error);