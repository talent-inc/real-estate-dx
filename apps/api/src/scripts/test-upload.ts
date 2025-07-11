import { storageService } from '../lib/storage';

async function testUploadService() {
  console.log('Testing Upload Service...');
  console.log('Mode:', process.env.USE_DEV_DATA === 'true' ? 'In-Memory' : 'Cloud Storage');
  
  try {
    // Simulate file upload
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 100, // 100KB
      buffer: Buffer.from('fake image content'),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    // Test upload
    console.log('\n1. Testing file upload...');
    const uploadedFile = await storageService.uploadFile(mockFile, {
      folder: 'test',
      isPublic: true,
    });
    console.log('✅ File uploaded:', uploadedFile);

    // Test get metadata
    console.log('\n2. Testing get metadata...');
    const metadata = await storageService.getFileMetadata(uploadedFile.id);
    console.log('✅ File metadata:', metadata);

    // Test list files (in-memory only)
    if (process.env.USE_DEV_DATA === 'true') {
      console.log('\n3. Testing list in-memory files...');
      const files = storageService.listInMemoryFiles();
      console.log('✅ In-memory files:', files.length);
    }

    // Test delete
    console.log('\n4. Testing file deletion...');
    await storageService.deleteFile(uploadedFile.id);
    console.log('✅ File deleted successfully');

    // Verify deletion
    const deletedMetadata = await storageService.getFileMetadata(uploadedFile.id);
    console.log('✅ File not found after deletion:', deletedMetadata === null);

    console.log('\n🎉 All upload tests passed!');
  } catch (error) {
    console.error('❌ Upload test failed:', error);
  }
}

// Run test
testUploadService();