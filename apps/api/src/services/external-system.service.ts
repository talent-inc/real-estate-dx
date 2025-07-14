import { AppError } from '../middlewares/error.middleware';
import type { CreateExternalSystemAuthRequest, UpdateExternalSystemAuthRequest, TestConnectionRequest, SyncRequest } from '../validators/external-system.validators';

// Mock external system auth database for now - will be replaced with Prisma
interface ExternalSystemAuth {
  id: string;
  tenantId: string;
  systemType: string;
  systemName: string;
  encryptedCredentials: string; // In real implementation, this would be properly encrypted
  isActive: boolean;
  lastTestAt?: Date;
  lastSyncAt?: Date;
  lastError?: string;
  settings?: Record<string, any>;
  syncEnabled: boolean;
  syncSchedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SyncLog {
  id: string;
  externalAuthId: string;
  syncType: string;
  syncDirection: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: Date;
  completedAt?: Date;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Global storage
declare global {
  var externalSystemAuths: ExternalSystemAuth[];
  var syncLogs: SyncLog[];
}

if (!global.externalSystemAuths) {
  global.externalSystemAuths = [];
}

if (!global.syncLogs) {
  global.syncLogs = [];
}

let externalAuthIdCounter = 1;
let syncLogIdCounter = 1;

export class ExternalSystemService {
  // Simple encryption mock (in real implementation, use proper encryption)
  private encryptCredentials(credentials: any): string {
    return Buffer.from(JSON.stringify(credentials)).toString('base64');
  }

  private decryptCredentials(encryptedCredentials: string): any {
    try {
      return JSON.parse(Buffer.from(encryptedCredentials, 'base64').toString());
    } catch {
      throw new AppError(500, 'Failed to decrypt credentials', 'INTERNAL_SERVER_ERROR');
    }
  }

  async getExternalSystems(tenantId: string): Promise<Omit<ExternalSystemAuth, 'encryptedCredentials'>[]> {
    const systems = global.externalSystemAuths
      .filter(auth => auth.tenantId === tenantId)
      .map(({ encryptedCredentials, ...auth }) => auth);

    return systems;
  }

  async getExternalSystemById(systemId: string, tenantId: string): Promise<Omit<ExternalSystemAuth, 'encryptedCredentials'> | null> {
    const system = global.externalSystemAuths.find(auth => auth.id === systemId && auth.tenantId === tenantId);
    
    if (!system) {
      return null;
    }

    const { encryptedCredentials, ...systemWithoutCredentials } = system;
    return systemWithoutCredentials;
  }

  async createExternalSystemAuth(authData: CreateExternalSystemAuthRequest, tenantId: string): Promise<Omit<ExternalSystemAuth, 'encryptedCredentials'>> {
    // Check if system already exists
    const existingSystem = global.externalSystemAuths.find(
      auth => auth.tenantId === tenantId && auth.systemType === authData.systemType
    );

    if (existingSystem) {
      throw new AppError(409, 'External system authentication already exists for this system type', 'CONFLICT');
    }

    // Encrypt credentials
    const encryptedCredentials = this.encryptCredentials(authData.credentials);

    // Create new auth
    const newAuth: ExternalSystemAuth = {
      id: `ext_auth_${externalAuthIdCounter++}`,
      tenantId,
      systemType: authData.systemType,
      systemName: authData.systemName,
      encryptedCredentials,
      isActive: true,
      settings: authData.settings,
      syncEnabled: authData.syncEnabled ?? true,
      syncSchedule: authData.syncSchedule,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.externalSystemAuths.push(newAuth);

    const { encryptedCredentials: _, ...authWithoutCredentials } = newAuth;
    return authWithoutCredentials;
  }

  async updateExternalSystemAuth(systemId: string, updateData: UpdateExternalSystemAuthRequest, tenantId: string): Promise<Omit<ExternalSystemAuth, 'encryptedCredentials'>> {
    const authIndex = global.externalSystemAuths.findIndex(auth => auth.id === systemId && auth.tenantId === tenantId);
    
    if (authIndex === -1) {
      throw new AppError(404, 'External system authentication not found', 'NOT_FOUND');
    }

    const currentAuth = global.externalSystemAuths[authIndex];
    
    if (!currentAuth) {
      throw new AppError(404, 'External system authentication not found', 'NOT_FOUND');
    }

    // Update credentials if provided
    let encryptedCredentials = currentAuth.encryptedCredentials;
    if (updateData.credentials) {
      const currentCredentials = this.decryptCredentials(currentAuth.encryptedCredentials);
      const updatedCredentials = { ...currentCredentials, ...updateData.credentials };
      encryptedCredentials = this.encryptCredentials(updatedCredentials);
    }

    // Update auth
    const updatedAuth: ExternalSystemAuth = {
      ...currentAuth,
      systemName: updateData.systemName ?? currentAuth.systemName,
      encryptedCredentials,
      settings: updateData.settings ?? currentAuth.settings,
      syncEnabled: updateData.syncEnabled ?? currentAuth.syncEnabled,
      syncSchedule: updateData.syncSchedule ?? currentAuth.syncSchedule,
      isActive: updateData.isActive ?? currentAuth.isActive,
      updatedAt: new Date(),
    };

    global.externalSystemAuths[authIndex] = updatedAuth;

    const { encryptedCredentials: _, ...authWithoutCredentials } = updatedAuth;
    return authWithoutCredentials;
  }

  async deleteExternalSystemAuth(systemId: string, tenantId: string): Promise<void> {
    const authIndex = global.externalSystemAuths.findIndex(auth => auth.id === systemId && auth.tenantId === tenantId);
    
    if (authIndex === -1) {
      throw new AppError(404, 'External system authentication not found', 'NOT_FOUND');
    }

    // Remove auth
    global.externalSystemAuths.splice(authIndex, 1);
  }

  async testConnection(testData: TestConnectionRequest, tenantId: string): Promise<{
    connectionStatus: 'SUCCESS' | 'FAILED';
    responseTime: number;
    systemInfo?: {
      version?: string;
      status?: string;
    };
    capabilities?: string[];
    testedAt: Date;
    error?: string;
  }> {
    // Mock connection test
    const startTime = Date.now();
    
    // Simulate different response times based on system type
    const simulatedDelay = Math.random() * 2000 + 500; // 500-2500ms
    
    // Simulate connection success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    // Wait for simulated delay
    await new Promise(resolve => setTimeout(resolve, 100)); // Shortened for demo
    
    const responseTime = Date.now() - startTime;
    const testedAt = new Date();

    if (!isSuccess) {
      return {
        connectionStatus: 'FAILED',
        responseTime,
        testedAt,
        error: 'Connection timeout or invalid credentials',
      };
    }

    // Mock successful response
    const mockSystemInfo = {
      version: '2.1.0',
      status: 'ONLINE',
    };

    const mockCapabilities = this.getMockCapabilities(testData.systemType);

    return {
      connectionStatus: 'SUCCESS',
      responseTime,
      systemInfo: mockSystemInfo,
      capabilities: mockCapabilities,
      testedAt,
    };
  }

  async startSync(systemId: string, syncRequest: SyncRequest, tenantId: string): Promise<{
    syncId: string;
    status: string;
    estimatedDuration: number;
    startedAt: Date;
  }> {
    const auth = global.externalSystemAuths.find(auth => auth.id === systemId && auth.tenantId === tenantId);
    
    if (!auth) {
      throw new AppError(404, 'External system authentication not found', 'NOT_FOUND');
    }

    if (!auth.isActive) {
      throw new AppError(400, 'External system is not active', 'VALIDATION_ERROR');
    }

    // Create sync log
    const syncLog: SyncLog = {
      id: `sync_${syncLogIdCounter++}`,
      externalAuthId: systemId,
      syncType: syncRequest.syncType,
      syncDirection: syncRequest.syncDirection,
      status: 'RUNNING',
      startedAt: new Date(),
      totalRecords: 0,
      successRecords: 0,
      failedRecords: 0,
      metadata: {
        filters: syncRequest.filters,
      },
    };

    global.syncLogs.push(syncLog);

    // Simulate sync completion after a delay
    setTimeout(() => {
      this.completeMockSync(syncLog.id);
    }, 5000); // Complete after 5 seconds for demo

    return {
      syncId: syncLog.id,
      status: 'STARTED',
      estimatedDuration: 300, // 5 minutes
      startedAt: syncLog.startedAt,
    };
  }

  async getSyncStatus(syncId: string, tenantId: string): Promise<SyncLog | null> {
    const syncLog = global.syncLogs.find(log => log.id === syncId);
    
    if (!syncLog) {
      return null;
    }

    // Verify the sync belongs to the tenant
    const auth = global.externalSystemAuths.find(auth => auth.id === syncLog.externalAuthId && auth.tenantId === tenantId);
    
    if (!auth) {
      return null;
    }

    return syncLog;
  }

  async getSyncHistory(tenantId: string, systemType?: string): Promise<SyncLog[]> {
    const tenantAuths = global.externalSystemAuths.filter(auth => auth.tenantId === tenantId);
    
    let relevantAuthIds = tenantAuths.map(auth => auth.id);
    
    if (systemType) {
      relevantAuthIds = tenantAuths
        .filter(auth => auth.systemType === systemType)
        .map(auth => auth.id);
    }

    const syncLogs = global.syncLogs
      .filter(log => relevantAuthIds.includes(log.externalAuthId))
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

    return syncLogs;
  }

  private getMockCapabilities(systemType: string): string[] {
    const capabilitiesMap: Record<string, string[]> = {
      'REINS': ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE'],
      'ATHOME': ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE', 'PROPERTY_DELETE', 'IMAGE_UPLOAD'],
      'HATOSAPO': ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE'],
      'SUUMO': ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE', 'IMAGE_UPLOAD'],
      'LIFULL': ['PROPERTY_SEARCH', 'PROPERTY_CREATE', 'PROPERTY_UPDATE', 'IMAGE_UPLOAD'],
    };

    return capabilitiesMap[systemType] || ['PROPERTY_SEARCH'];
  }

  private completeMockSync(syncId: string): void {
    const syncLogIndex = global.syncLogs.findIndex(log => log.id === syncId);
    
    if (syncLogIndex !== -1) {
      const syncLog = global.syncLogs[syncLogIndex];
      
      if (!syncLog) {
        return;
      }
      
      // Mock completion data
      const totalRecords = Math.floor(Math.random() * 100) + 10;
      const failedRecords = Math.floor(Math.random() * 5);
      const successRecords = totalRecords - failedRecords;

      global.syncLogs[syncLogIndex] = {
        ...syncLog,
        status: 'COMPLETED',
        completedAt: new Date(),
        totalRecords,
        successRecords,
        failedRecords,
      };
    }
  }
}