import { AppError } from '../middlewares/error.middleware';
import path from 'path';

// Mock file storage for now - will be replaced with Google Cloud Storage
interface UploadedFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  tenantId: string;
  uploadedById: string;
  createdAt: Date;
}

// Global file storage
declare global {
  var uploadedFiles: UploadedFile[];
}

if (!global.uploadedFiles) {
  global.uploadedFiles = [];
}

export class UploadService {
  private readonly allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  async uploadFile(
    file: {
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
      buffer?: Buffer;
    },
    tenantId: string,
    uploadedById: string,
    fileType: 'image' | 'document' = 'image'
  ): Promise<UploadedFile> {
    // Validate file type
    const allowedTypes = fileType === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(400, `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`, 'VALIDATION_ERROR');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new AppError(400, `File size too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`, 'VALIDATION_ERROR');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}${fileExtension}`;

    // Mock file URL (in real implementation, this would be GCS URL)
    const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
    const fileUrl = `${baseUrl}/uploads/${tenantId}/${uniqueFilename}`;

    // Create uploaded file record
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename: uniqueFilename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: fileUrl,
      tenantId,
      uploadedById,
      createdAt: new Date(),
    };

    // Generate thumbnail for images
    if (fileType === 'image') {
      uploadedFile.thumbnailUrl = `${baseUrl}/uploads/${tenantId}/thumbs/${uniqueFilename}`;
    }

    // Store file record
    global.uploadedFiles.push(uploadedFile);

    return uploadedFile;
  }

  async getFile(fileId: string, tenantId: string): Promise<UploadedFile | null> {
    const file = global.uploadedFiles.find(f => f.id === fileId && f.tenantId === tenantId);
    return file || null;
  }

  async getUserFiles(tenantId: string, uploadedById?: string): Promise<UploadedFile[]> {
    let files = global.uploadedFiles.filter(f => f.tenantId === tenantId);
    
    if (uploadedById) {
      files = files.filter(f => f.uploadedById === uploadedById);
    }

    return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteFile(fileId: string, tenantId: string): Promise<void> {
    const fileIndex = global.uploadedFiles.findIndex(f => f.id === fileId && f.tenantId === tenantId);
    
    if (fileIndex === -1) {
      throw new AppError(404, 'File not found', 'NOT_FOUND');
    }

    // In real implementation, would delete from GCS here
    
    // Remove file record
    global.uploadedFiles.splice(fileIndex, 1);
  }

  // Validate file before upload
  validateFile(file: any, fileType: 'image' | 'document' = 'image'): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    const allowedTypes = fileType === 'image' ? this.allowedImageTypes : this.allowedDocumentTypes;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      };
    }

    if (file.size > this.maxFileSize) {
      return { 
        isValid: false, 
        error: `File size too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB` 
      };
    }

    return { isValid: true };
  }

  // Get upload statistics
  async getUploadStats(tenantId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    imageCount: number;
    documentCount: number;
    recentUploads: number; // last 24 hours
  }> {
    const tenantFiles = global.uploadedFiles.filter(f => f.tenantId === tenantId);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return {
      totalFiles: tenantFiles.length,
      totalSize: tenantFiles.reduce((sum, f) => sum + f.size, 0),
      imageCount: tenantFiles.filter(f => this.allowedImageTypes.includes(f.mimetype)).length,
      documentCount: tenantFiles.filter(f => this.allowedDocumentTypes.includes(f.mimetype)).length,
      recentUploads: tenantFiles.filter(f => f.createdAt > oneDayAgo).length,
    };
  }
}