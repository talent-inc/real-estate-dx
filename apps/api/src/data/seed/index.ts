import { hashPassword } from '../../utils/password';
import { seedUsers } from './users.seed';
import { seedProperties } from './properties.seed';
import { seedOcrJobs } from './ocr-jobs.seed';
import { seedInquiries } from './inquiries.seed';
import { logger } from '../../config/logger';

export interface SeedData {
  users: any[];
  properties: any[];
  ocrJobs: any[];
  inquiries: any[];
}

export class TestDataGenerator {
  private data: SeedData;

  constructor() {
    this.data = {
      users: [],
      properties: [],
      ocrJobs: [],
      inquiries: []
    };
  }

  /**
   * Generate all test data
   */
  async generateAll(): Promise<SeedData> {
    logger.info('Generating test data...');

    // Generate users
    this.data.users = await this.generateUsers();

    // Generate properties
    this.data.properties = await this.generateProperties();

    // Generate OCR jobs
    this.data.ocrJobs = await this.generateOcrJobs();

    // Generate inquiries
    this.data.inquiries = await this.generateInquiries();

    logger.info(`Test data generated: ${this.data.users.length} users, ${this.data.properties.length} properties, ${this.data.ocrJobs.length} OCR jobs, ${this.data.inquiries.length} inquiries`);
    
    return this.data;
  }

  /**
   * Generate test users
   */
  private async generateUsers(): Promise<any[]> {
    const users = [];
    
    // Add seed users
    for (const seedUser of seedUsers) {
      users.push({
        ...seedUser,
        password: await hashPassword(seedUser.password)
      });
    }

    // Generate additional test users
    for (let i = 1; i <= 10; i++) {
      users.push({
        id: `test-user-${i}`,
        email: `testuser${i}@example.com`,
        password: await hashPassword('TestPass123!'),
        name: `テストユーザー ${i}`,
        role: i % 3 === 0 ? 'ADMIN' : i % 2 === 0 ? 'AGENT' : 'CLIENT',
        department: i % 2 === 0 ? '営業部' : 'IT部',
        phone: `090-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        isActive: i !== 5, // User 5 is inactive
        tenantId: 'test-tenant-1',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return users;
  }

  /**
   * Generate test properties
   */
  private async generateProperties(): Promise<any[]> {
    const properties = [];
    
    // Add seed properties
    properties.push(...seedProperties);

    // Generate additional test properties
    const prefectures = ['東京都', '神奈川県', '千葉県', '埼玉県'];
    const cities = ['港区', '渋谷区', '新宿区', '品川区', '横浜市', 'さいたま市', '千葉市'];
    const propertyTypes = ['HOUSE', 'APARTMENT', 'LAND', 'BUILDING', 'OTHER'];
    const transactionTypes = ['SALE', 'PURCHASE'];
    const statuses = ['DRAFT', 'ACTIVE', 'CONTRACT', 'COMPLETED', 'CANCELLED'];

    for (let i = 1; i <= 50; i++) {
      const prefecture = prefectures[Math.floor(Math.random() * prefectures.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      properties.push({
        id: `test-property-${i}`,
        title: `テスト物件 ${i} - ${city}`,
        description: `これはテスト物件${i}の説明文です。${prefecture}${city}に位置する優良物件です。`,
        propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        transactionType: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price: Math.floor(Math.random() * 50000000) + 10000000, // 1000万〜6000万
        landArea: Math.floor(Math.random() * 200) + 50, // 50〜250㎡
        buildingArea: Math.floor(Math.random() * 150) + 30, // 30〜180㎡
        address: {
          postalCode: `${Math.floor(Math.random() * 900) + 100}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          prefecture,
          city,
          street: `${Math.floor(Math.random() * 5) + 1}丁目${Math.floor(Math.random() * 20) + 1}-${Math.floor(Math.random() * 10) + 1}`,
          building: Math.random() > 0.5 ? `テストビル${Math.floor(Math.random() * 10) + 1}F` : null
        },
        location: {
          lat: 35.6762 + (Math.random() - 0.5) * 0.1,
          lng: 139.6503 + (Math.random() - 0.5) * 0.1
        },
        features: ['駅近', '日当たり良好', '閑静な住宅街', 'リフォーム済み'].slice(0, Math.floor(Math.random() * 4) + 1),
        images: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
          id: `test-image-${i}-${j}`,
          url: `https://placeholder.co/600x400?text=Property${i}-${j}`,
          caption: `物件画像 ${j + 1}`,
          order: j
        })),
        agentId: `test-user-${Math.floor(Math.random() * 10) + 1}`,
        tenantId: 'test-tenant-1',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return properties;
  }

  /**
   * Generate test OCR jobs
   */
  private async generateOcrJobs(): Promise<any[]> {
    const ocrJobs = [];
    
    // Add seed OCR jobs
    ocrJobs.push(...seedOcrJobs);

    // Generate additional test OCR jobs
    const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
    const documentTypes = ['登記簿謄本', '公図', '測量図', '建物図面', 'その他'];

    for (let i = 1; i <= 30; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isCompleted = status === 'COMPLETED';
      const isFailed = status === 'FAILED';

      ocrJobs.push({
        id: `test-ocr-${i}`,
        filename: `test-document-${i}.pdf`,
        documentType: documentTypes[Math.floor(Math.random() * documentTypes.length)],
        status,
        fileUrl: `https://storage.example.com/ocr/test-document-${i}.pdf`,
        progress: isCompleted ? 100 : isFailed ? 0 : Math.floor(Math.random() * 90),
        result: isCompleted ? {
          extractedText: `テスト文書${i}から抽出されたテキスト内容`,
          confidence: Math.random() * 0.3 + 0.7, // 0.7〜1.0
          metadata: {
            pages: Math.floor(Math.random() * 10) + 1,
            language: 'ja'
          }
        } : null,
        error: isFailed ? `処理エラー: テスト文書${i}の処理に失敗しました` : null,
        userId: `test-user-${Math.floor(Math.random() * 10) + 1}`,
        propertyId: Math.random() > 0.3 ? `test-property-${Math.floor(Math.random() * 50) + 1}` : null,
        tenantId: 'test-tenant-1',
        startedAt: status !== 'PENDING' ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
        completedAt: isCompleted || isFailed ? new Date().toISOString() : null,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return ocrJobs;
  }

  /**
   * Generate test inquiries
   */
  private async generateInquiries(): Promise<any[]> {
    const inquiries = [];
    
    // Add seed inquiries
    inquiries.push(...seedInquiries);

    // Generate additional test inquiries
    const types = ['VIEWING', 'PURCHASE', 'GENERAL', 'DOCUMENT', 'PRICE'];
    const statuses = ['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED'];

    for (let i = 1; i <= 40; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const hasResponse = status === 'RESPONDED' || status === 'CLOSED';

      inquiries.push({
        id: `test-inquiry-${i}`,
        propertyId: `test-property-${Math.floor(Math.random() * 50) + 1}`,
        userId: Math.random() > 0.3 ? `test-user-${Math.floor(Math.random() * 10) + 1}` : null,
        type: types[Math.floor(Math.random() * types.length)],
        status,
        name: `問い合わせ者 ${i}`,
        email: `inquiry${i}@example.com`,
        phone: `090-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        message: `これはテスト問い合わせ${i}の内容です。物件について詳細を教えてください。`,
        response: hasResponse ? `ご問い合わせありがとうございます。テスト問い合わせ${i}への返信内容です。` : null,
        respondedBy: hasResponse ? `test-user-${Math.floor(Math.random() * 3) + 1}` : null,
        respondedAt: hasResponse ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        metadata: {
          source: Math.random() > 0.5 ? 'website' : 'mobile',
          referrer: Math.random() > 0.7 ? 'google' : null
        },
        tenantId: 'test-tenant-1',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return inquiries;
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.data = {
      users: [],
      properties: [],
      ocrJobs: [],
      inquiries: []
    };
  }

  /**
   * Get current data
   */
  getData(): SeedData {
    return this.data;
  }
}

// Export singleton instance
export const testDataGenerator = new TestDataGenerator();