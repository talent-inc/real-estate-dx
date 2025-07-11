import { testDataGenerator, SeedData } from '../data/seed';
import { logger } from '../config/logger';
import { AppError } from '../middlewares/error.middleware';

// In-memory storage for test mode
let testData: SeedData | null = null;

export class TestDataService {
  /**
   * Initialize test data
   */
  static async initialize(): Promise<void> {
    if (process.env.USE_DEV_DATA !== 'true') {
      logger.info('Test data service disabled (USE_DEV_DATA !== true)');
      return;
    }

    try {
      logger.info('Initializing test data...');
      testData = await testDataGenerator.generateAll();
      logger.info('Test data initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize test data:', error);
      throw new AppError(500, 'Failed to initialize test data', 'TEST_DATA_INIT_ERROR');
    }
  }

  /**
   * Get all test data
   */
  static getData(): SeedData | null {
    return testData;
  }

  /**
   * Get test users
   */
  static getUsers(): any[] {
    return testData?.users || [];
  }

  /**
   * Get test user by ID
   */
  static getUserById(id: string): any | null {
    return testData?.users.find(user => user.id === id) || null;
  }

  /**
   * Get test user by email
   */
  static getUserByEmail(email: string): any | null {
    return testData?.users.find(user => user.email === email) || null;
  }

  /**
   * Add a test user
   */
  static addUser(user: any): void {
    if (testData) {
      testData.users.push(user);
    }
  }

  /**
   * Update a test user
   */
  static updateUser(id: string, updates: any): boolean {
    if (!testData) return false;
    
    const index = testData.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    testData.users[index] = { ...testData.users[index], ...updates };
    return true;
  }

  /**
   * Get test properties
   */
  static getProperties(): any[] {
    return testData?.properties || [];
  }

  /**
   * Get test property by ID
   */
  static getPropertyById(id: string): any | null {
    return testData?.properties.find(prop => prop.id === id) || null;
  }

  /**
   * Add a test property
   */
  static addProperty(property: any): void {
    if (testData) {
      testData.properties.push(property);
    }
  }

  /**
   * Update a test property
   */
  static updateProperty(id: string, updates: any): boolean {
    if (!testData) return false;
    
    const index = testData.properties.findIndex(prop => prop.id === id);
    if (index === -1) return false;
    
    testData.properties[index] = { ...testData.properties[index], ...updates };
    return true;
  }

  /**
   * Delete a test property
   */
  static deleteProperty(id: string): boolean {
    if (!testData) return false;
    
    const index = testData.properties.findIndex(prop => prop.id === id);
    if (index === -1) return false;
    
    testData.properties.splice(index, 1);
    return true;
  }

  /**
   * Get test OCR jobs
   */
  static getOcrJobs(): any[] {
    return testData?.ocrJobs || [];
  }

  /**
   * Get test OCR job by ID
   */
  static getOcrJobById(id: string): any | null {
    return testData?.ocrJobs.find(job => job.id === id) || null;
  }

  /**
   * Add a test OCR job
   */
  static addOcrJob(ocrJob: any): void {
    if (testData) {
      testData.ocrJobs.push(ocrJob);
    }
  }

  /**
   * Update a test OCR job
   */
  static updateOcrJob(id: string, updates: any): boolean {
    if (!testData) return false;
    
    const index = testData.ocrJobs.findIndex(job => job.id === id);
    if (index === -1) return false;
    
    testData.ocrJobs[index] = { ...testData.ocrJobs[index], ...updates };
    return true;
  }

  /**
   * Get test inquiries
   */
  static getInquiries(): any[] {
    return testData?.inquiries || [];
  }

  /**
   * Get test inquiry by ID
   */
  static getInquiryById(id: string): any | null {
    return testData?.inquiries.find(inq => inq.id === id) || null;
  }

  /**
   * Add a test inquiry
   */
  static addInquiry(inquiry: any): void {
    if (testData) {
      testData.inquiries.push(inquiry);
    }
  }

  /**
   * Update a test inquiry
   */
  static updateInquiry(id: string, updates: any): boolean {
    if (!testData) return false;
    
    const index = testData.inquiries.findIndex(inq => inq.id === id);
    if (index === -1) return false;
    
    testData.inquiries[index] = { ...testData.inquiries[index], ...updates };
    return true;
  }

  /**
   * Reset all test data
   */
  static async reset(): Promise<void> {
    logger.info('Resetting test data...');
    testData = await testDataGenerator.generateAll();
    logger.info('Test data reset successfully');
  }

  /**
   * Clear all test data
   */
  static clear(): void {
    logger.info('Clearing test data...');
    testData = null;
    testDataGenerator.clearAll();
    logger.info('Test data cleared');
  }

  /**
   * Get statistics about test data
   */
  static getStats(): any {
    if (!testData) {
      return {
        initialized: false,
        counts: {
          users: 0,
          properties: 0,
          ocrJobs: 0,
          inquiries: 0
        }
      };
    }

    return {
      initialized: true,
      counts: {
        users: testData.users.length,
        properties: testData.properties.length,
        ocrJobs: testData.ocrJobs.length,
        inquiries: testData.inquiries.length
      },
      breakdown: {
        users: {
          admins: testData.users.filter(u => u.role === 'ADMIN').length,
          agents: testData.users.filter(u => u.role === 'AGENT').length,
          clients: testData.users.filter(u => u.role === 'CLIENT').length
        },
        properties: {
          active: testData.properties.filter(p => p.status === 'ACTIVE').length,
          contract: testData.properties.filter(p => p.status === 'CONTRACT').length,
          completed: testData.properties.filter(p => p.status === 'COMPLETED').length
        },
        ocrJobs: {
          pending: testData.ocrJobs.filter(j => j.status === 'PENDING').length,
          processing: testData.ocrJobs.filter(j => j.status === 'PROCESSING').length,
          completed: testData.ocrJobs.filter(j => j.status === 'COMPLETED').length,
          failed: testData.ocrJobs.filter(j => j.status === 'FAILED').length
        },
        inquiries: {
          new: testData.inquiries.filter(i => i.status === 'NEW').length,
          inProgress: testData.inquiries.filter(i => i.status === 'IN_PROGRESS').length,
          responded: testData.inquiries.filter(i => i.status === 'RESPONDED').length,
          closed: testData.inquiries.filter(i => i.status === 'CLOSED').length
        }
      }
    };
  }
}