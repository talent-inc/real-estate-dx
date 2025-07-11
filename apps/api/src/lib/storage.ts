import { Storage } from '@google-cloud/storage';
import { AppError } from '../middlewares/error.middleware';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Environment-based storage selection
const USE_CLOUD_STORAGE = process.env.USE_DEV_DATA !== 'true';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Get bucket references (only for cloud storage mode)
const storageBucket = USE_CLOUD_STORAGE && process.env.GOOGLE_CLOUD_STORAGE_BUCKET 
  ? storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET)
  : null;
const documentsBucket = USE_CLOUD_STORAGE && process.env.GOOGLE_CLOUD_DOCUMENTS_BUCKET
  ? storage.bucket(process.env.GOOGLE_CLOUD_DOCUMENTS_BUCKET)
  : null;

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  bucket: string;
}

// In-memory storage for development
const inMemoryFiles: Map<string, UploadedFile> = new Map();

export class StorageService {
  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Express.Multer.File,
    options: {
      bucket?: 'storage' | 'documents';
      folder?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<UploadedFile> {
    if (USE_CLOUD_STORAGE) {
      return this.uploadToCloudStorage(file, options);
    }
    return this.uploadToMemory(file, options);
  }

  /**
   * Upload to Google Cloud Storage
   */
  private async uploadToCloudStorage(
    file: Express.Multer.File,
    options: {
      bucket?: 'storage' | 'documents';
      folder?: string;
      isPublic?: boolean;
    }
  ): Promise<UploadedFile> {
    try {
      const { bucket = 'storage', folder = '', isPublic = false } = options;
      const targetBucket = bucket === 'documents' ? documentsBucket : storageBucket;
      
      if (!targetBucket) {
        throw new AppError(500, 'Storage bucket not configured', 'BUCKET_NOT_CONFIGURED');
      }
      
      // Generate unique filename
      const fileId = uuidv4();
      const ext = path.extname(file.originalname);
      const filename = `${fileId}${ext}`;
      const filepath = folder ? `${folder}/${filename}` : filename;

      // Create a file reference
      const blob = targetBucket.file(filepath);

      // Upload file
      const stream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
          },
        },
      });

      await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      // Make file public if specified
      if (isPublic) {
        await blob.makePublic();
      }

      // Get file URL
      const url = isPublic
        ? `https://storage.googleapis.com/${targetBucket.name}/${filepath}`
        : await this.getSignedUrl(blob);

      return {
        id: fileId,
        filename: filepath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        bucket: targetBucket.name,
      };
    } catch (error) {
      throw new AppError(500, 'Failed to upload file', 'UPLOAD_ERROR');
    }
  }

  /**
   * Upload to in-memory storage (development)
   */
  private async uploadToMemory(
    file: Express.Multer.File,
    options: {
      bucket?: 'storage' | 'documents';
      folder?: string;
    }
  ): Promise<UploadedFile> {
    const { bucket = 'storage', folder = '' } = options;
    
    // Generate unique filename
    const fileId = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    const filepath = folder ? `${folder}/${filename}` : filename;

    const uploadedFile: UploadedFile = {
      id: fileId,
      filename: filepath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: `http://localhost:4000/api/files/${fileId}`,
      bucket: bucket === 'documents' ? 'documents-dev' : 'storage-dev',
    };

    inMemoryFiles.set(fileId, uploadedFile);
    return uploadedFile;
  }

  /**
   * Get a signed URL for private files
   */
  async getSignedUrl(file: any, expiresIn: number = 3600): Promise<string> {
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    return url;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(fileId: string, bucket?: string): Promise<void> {
    if (USE_CLOUD_STORAGE) {
      return this.deleteFromCloudStorage(fileId, bucket);
    }
    return this.deleteFromMemory(fileId);
  }

  /**
   * Delete from Google Cloud Storage
   */
  private async deleteFromCloudStorage(fileId: string, bucketName?: string): Promise<void> {
    try {
      const targetBucket = bucketName 
        ? storage.bucket(bucketName)
        : storageBucket;

      if (!targetBucket) {
        throw new AppError(500, 'Storage bucket not configured', 'BUCKET_NOT_CONFIGURED');
      }

      // List files with the fileId prefix
      const [files] = await targetBucket.getFiles({
        prefix: fileId,
      });

      if (files.length === 0) {
        throw new AppError(404, 'File not found', 'FILE_NOT_FOUND');
      }

      // Delete all matching files
      await Promise.all(files.map(file => file.delete()));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Failed to delete file', 'DELETE_ERROR');
    }
  }

  /**
   * Delete from in-memory storage
   */
  private async deleteFromMemory(fileId: string): Promise<void> {
    if (!inMemoryFiles.has(fileId)) {
      throw new AppError(404, 'File not found', 'FILE_NOT_FOUND');
    }
    inMemoryFiles.delete(fileId);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<UploadedFile | null> {
    if (USE_CLOUD_STORAGE) {
      return this.getCloudFileMetadata(fileId);
    }
    return this.getMemoryFileMetadata(fileId);
  }

  /**
   * Get metadata from Cloud Storage
   */
  private async getCloudFileMetadata(fileId: string): Promise<UploadedFile | null> {
    try {
      // Search in both buckets
      const buckets = [storageBucket, documentsBucket].filter((b): b is any => b !== null);
      
      for (const bucket of buckets) {
        const [files] = await bucket.getFiles({
          prefix: fileId,
        });

        if (files.length > 0) {
          const file = files[0];
          const [metadata] = await file.getMetadata();
          
          return {
            id: fileId,
            filename: file.name,
            originalName: metadata.metadata?.originalName || file.name,
            mimeType: metadata.contentType,
            size: parseInt(metadata.size),
            url: await this.getSignedUrl(file),
            bucket: bucket.name,
          };
        }
      }

      return null;
    } catch (error) {
      throw new AppError(500, 'Failed to get file metadata', 'METADATA_ERROR');
    }
  }

  /**
   * Get metadata from memory
   */
  private async getMemoryFileMetadata(fileId: string): Promise<UploadedFile | null> {
    return inMemoryFiles.get(fileId) || null;
  }

  /**
   * Get in-memory file content (for development)
   */
  getInMemoryFile(fileId: string): UploadedFile | undefined {
    return inMemoryFiles.get(fileId);
  }

  /**
   * List all in-memory files (for development/testing)
   */
  listInMemoryFiles(): UploadedFile[] {
    return Array.from(inMemoryFiles.values());
  }
}

// Export singleton instance
export const storageService = new StorageService();