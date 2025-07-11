import { UploadService } from '../../services/upload.service';
import { AppError } from '../../middlewares/error.middleware';

describe('UploadService', () => {
  let uploadService: UploadService;

  beforeEach(() => {
    uploadService = new UploadService();
    global.files = [];
    global.fileIdCounter = 1;
  });

  const generateMockFile = (overrides = {}) => ({
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: '/uploads',
    filename: 'test-123.jpg',
    path: '/uploads/test-123.jpg',
    size: 1024000,
    buffer: Buffer.from('mock file content'),
    ...overrides,
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockFile = generateMockFile({
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 2000000,
      });

      const result = await uploadService.uploadImage(mockFile as any, 'tenant1', 'user1');

      expect(result).toBeDefined();
      expect(result.originalName).toBe('photo.jpg');
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.size).toBe(2000000);
      expect(result.fileType).toBe('image');
      expect(result.tenantId).toBe('tenant1');
      expect(result.uploadedBy).toBe('user1');
      expect(result.url).toContain('/uploads/');
    });

    it('should throw error for invalid image type', async () => {
      const mockFile = generateMockFile({
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
      });

      await expect(uploadService.uploadImage(mockFile as any, 'tenant1', 'user1')).rejects.toThrow(AppError);
      await expect(uploadService.uploadImage(mockFile as any, 'tenant1', 'user1')).rejects.toThrow('Invalid file type');
    });

    it('should throw error for file too large', async () => {
      const mockFile = generateMockFile({
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 15000000, // 15MB
      });

      await expect(uploadService.uploadImage(mockFile as any, 'tenant1', 'user1')).rejects.toThrow(AppError);
      await expect(uploadService.uploadImage(mockFile as any, 'tenant1', 'user1')).rejects.toThrow('File too large');
    });

    it('should validate image dimensions for thumbnails', async () => {
      const mockFile = generateMockFile({
        originalname: 'small.jpg',
        mimetype: 'image/jpeg',
        size: 500000,
      });

      const result = await uploadService.uploadImage(mockFile as any, 'tenant1', 'user1');
      
      expect(result.metadata?.isProcessed).toBe(true);
      expect(result.metadata?.thumbnailGenerated).toBe(true);
    });
  });

  describe('uploadDocument', () => {
    it('should upload PDF document successfully', async () => {
      const mockFile = generateMockFile({
        originalname: 'contract.pdf',
        mimetype: 'application/pdf',
        size: 5000000,
      });

      const result = await uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1');

      expect(result).toBeDefined();
      expect(result.originalName).toBe('contract.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.fileType).toBe('document');
      expect(result.tenantId).toBe('tenant1');
      expect(result.uploadedBy).toBe('user1');
    });

    it('should upload Excel document successfully', async () => {
      const mockFile = generateMockFile({
        originalname: 'data.xlsx',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 3000000,
      });

      const result = await uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1');

      expect(result.originalName).toBe('data.xlsx');
      expect(result.mimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(result.fileType).toBe('document');
    });

    it('should throw error for invalid document type', async () => {
      const mockFile = generateMockFile({
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
      });

      await expect(uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1')).rejects.toThrow(AppError);
      await expect(uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1')).rejects.toThrow('Invalid file type');
    });

    it('should throw error for document too large', async () => {
      const mockFile = generateMockFile({
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: 25000000, // 25MB
      });

      await expect(uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1')).rejects.toThrow(AppError);
      await expect(uploadService.uploadDocument(mockFile as any, 'tenant1', 'user1')).rejects.toThrow('File too large');
    });
  });

  describe('processOCR', () => {
    beforeEach(() => {
      // Add a test PDF file
      global.files.push({
        id: 'file_1',
        tenantId: 'tenant1',
        originalName: 'test.pdf',
        filename: 'test-123.pdf',
        mimeType: 'application/pdf',
        size: 1000000,
        url: '/uploads/test-123.pdf',
        fileType: 'document',
        uploadedBy: 'user1',
        uploadedAt: new Date(),
        metadata: {},
      });
    });

    it('should start OCR processing successfully', async () => {
      const result = await uploadService.processOCR('file_1', 'tenant1');

      expect(result).toBeDefined();
      expect(result.taskId).toBeDefined();
      expect(result.status).toBe('PROCESSING');
      expect(result.estimatedCompletionTime).toBeDefined();
    });

    it('should throw error for non-existent file', async () => {
      await expect(uploadService.processOCR('nonexistent', 'tenant1')).rejects.toThrow(AppError);
      await expect(uploadService.processOCR('nonexistent', 'tenant1')).rejects.toThrow('File not found');
    });

    it('should throw error for file in different tenant', async () => {
      await expect(uploadService.processOCR('file_1', 'tenant2')).rejects.toThrow(AppError);
      await expect(uploadService.processOCR('file_1', 'tenant2')).rejects.toThrow('File not found');
    });

    it('should throw error for non-PDF file', async () => {
      // Add a non-PDF file
      global.files.push({
        id: 'file_2',
        tenantId: 'tenant1',
        originalName: 'image.jpg',
        filename: 'image-123.jpg',
        mimeType: 'image/jpeg',
        size: 1000000,
        url: '/uploads/image-123.jpg',
        fileType: 'image',
        uploadedBy: 'user1',
        uploadedAt: new Date(),
        metadata: {},
      });

      await expect(uploadService.processOCR('file_2', 'tenant1')).rejects.toThrow(AppError);
      await expect(uploadService.processOCR('file_2', 'tenant1')).rejects.toThrow('Only PDF files are supported for OCR');
    });
  });

  describe('getOCRResult', () => {
    beforeEach(() => {
      // Mock OCR task data
      global.ocrTasks = [{
        id: 'task_1',
        fileId: 'file_1',
        tenantId: 'tenant1',
        status: 'COMPLETED',
        result: {
          extractedText: 'Sample extracted text',
          confidence: 0.95,
          properties: {
            title: 'Sample Property',
            price: '50,000,000円',
            area: '80.5㎡',
          },
        },
        startedAt: new Date(),
        completedAt: new Date(),
      }];
    });

    it('should get OCR result successfully', async () => {
      const result = await uploadService.getOCRResult('task_1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.status).toBe('COMPLETED');
      expect(result?.result.extractedText).toBe('Sample extracted text');
      expect(result?.result.confidence).toBe(0.95);
      expect(result?.result.properties).toBeDefined();
    });

    it('should return null for non-existent task', async () => {
      const result = await uploadService.getOCRResult('nonexistent', 'tenant1');

      expect(result).toBeNull();
    });

    it('should return null for task in different tenant', async () => {
      const result = await uploadService.getOCRResult('task_1', 'tenant2');

      expect(result).toBeNull();
    });
  });

  describe('getFile', () => {
    beforeEach(() => {
      global.files.push({
        id: 'file_1',
        tenantId: 'tenant1',
        originalName: 'test.jpg',
        filename: 'test-123.jpg',
        mimeType: 'image/jpeg',
        size: 1000000,
        url: '/uploads/test-123.jpg',
        fileType: 'image',
        uploadedBy: 'user1',
        uploadedAt: new Date(),
        metadata: {},
      });
    });

    it('should get file by id for correct tenant', async () => {
      const result = await uploadService.getFile('file_1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('file_1');
      expect(result?.tenantId).toBe('tenant1');
      expect(result?.originalName).toBe('test.jpg');
    });

    it('should return null for file in different tenant', async () => {
      const result = await uploadService.getFile('file_1', 'tenant2');

      expect(result).toBeNull();
    });

    it('should return null for non-existent file', async () => {
      const result = await uploadService.getFile('nonexistent', 'tenant1');

      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    beforeEach(() => {
      global.files.push({
        id: 'file_1',
        tenantId: 'tenant1',
        originalName: 'test.jpg',
        filename: 'test-123.jpg',
        mimeType: 'image/jpeg',
        size: 1000000,
        url: '/uploads/test-123.jpg',
        fileType: 'image',
        uploadedBy: 'user1',
        uploadedAt: new Date(),
        metadata: {},
      });
    });

    it('should delete file successfully', async () => {
      await uploadService.deleteFile('file_1', 'tenant1');

      const deletedFile = global.files.find(f => f.id === 'file_1');
      expect(deletedFile).toBeUndefined();
    });

    it('should throw error for non-existent file', async () => {
      await expect(uploadService.deleteFile('nonexistent', 'tenant1')).rejects.toThrow(AppError);
      await expect(uploadService.deleteFile('nonexistent', 'tenant1')).rejects.toThrow('File not found');
    });

    it('should throw error for file in different tenant', async () => {
      await expect(uploadService.deleteFile('file_1', 'tenant2')).rejects.toThrow(AppError);
      await expect(uploadService.deleteFile('file_1', 'tenant2')).rejects.toThrow('File not found');
    });
  });

  describe('getFiles', () => {
    beforeEach(() => {
      global.files.push(
        {
          id: 'file_1',
          tenantId: 'tenant1',
          originalName: 'image1.jpg',
          filename: 'image1-123.jpg',
          mimeType: 'image/jpeg',
          size: 1000000,
          url: '/uploads/image1-123.jpg',
          fileType: 'image',
          uploadedBy: 'user1',
          uploadedAt: new Date(),
          metadata: {},
        },
        {
          id: 'file_2',
          tenantId: 'tenant1',
          originalName: 'document.pdf',
          filename: 'document-123.pdf',
          mimeType: 'application/pdf',
          size: 2000000,
          url: '/uploads/document-123.pdf',
          fileType: 'document',
          uploadedBy: 'user1',
          uploadedAt: new Date(),
          metadata: {},
        },
        {
          id: 'file_3',
          tenantId: 'tenant2',
          originalName: 'other.jpg',
          filename: 'other-123.jpg',
          mimeType: 'image/jpeg',
          size: 500000,
          url: '/uploads/other-123.jpg',
          fileType: 'image',
          uploadedBy: 'user2',
          uploadedAt: new Date(),
          metadata: {},
        }
      );
    });

    it('should get files for specific tenant', async () => {
      const queryParams = {};
      const result = await uploadService.getFiles('tenant1', queryParams);

      expect(result.files).toHaveLength(2);
      expect(result.files.every(file => file.tenantId === 'tenant1')).toBe(true);
      expect(result.total).toBe(2);
    });

    it('should filter files by type', async () => {
      const queryParams = { fileType: 'image' };
      const result = await uploadService.getFiles('tenant1', queryParams);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].fileType).toBe('image');
    });

    it('should search files by name', async () => {
      const queryParams = { search: 'image1' };
      const result = await uploadService.getFiles('tenant1', queryParams);

      expect(result.files).toHaveLength(1);
      expect(result.files[0].originalName).toBe('image1.jpg');
    });

    it('should paginate results', async () => {
      const queryParams = { page: 1, limit: 1 };
      const result = await uploadService.getFiles('tenant1', queryParams);

      expect(result.files).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(2);
    });
  });
});