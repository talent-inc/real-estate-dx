import { InquiryService } from '../../services/inquiry.service';
import { AppError } from '../../middlewares/error.middleware';

describe('InquiryService', () => {
  let inquiryService: InquiryService;

  beforeEach(() => {
    inquiryService = new InquiryService();
    global.inquiries = [];
    global.inquiryIdCounter = 1;
  });

  const generateMockInquiry = (overrides = {}) => ({
    id: `inquiry_${Math.random().toString(36).substr(2, 9)}`,
    tenantId: 'tenant_test',
    propertyId: 'prop_1',
    name: 'Test User',
    email: 'test@example.com',
    phone: '090-1234-5678',
    subject: 'Property Inquiry',
    message: 'I am interested in this property',
    source: 'WEBSITE' as const,
    status: 'PENDING' as const,
    priority: 'MEDIUM' as const,
    assignedTo: null,
    assignedAt: null,
    respondedAt: null,
    responseMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {},
    ...overrides,
  });

  describe('createPublicInquiry', () => {
    it('should create public inquiry successfully', async () => {
      const inquiryData = {
        propertyId: 'prop_1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '090-1234-5678',
        subject: 'Property Interest',
        message: 'I would like to know more about this property',
      };

      const result = await inquiryService.createPublicInquiry(inquiryData, 'tenant1');

      expect(result).toBeDefined();
      expect(result.name).toBe(inquiryData.name);
      expect(result.email).toBe(inquiryData.email);
      expect(result.subject).toBe(inquiryData.subject);
      expect(result.tenantId).toBe('tenant1');
      expect(result.status).toBe('PENDING');
      expect(result.source).toBe('WEBSITE');
    });

    it('should set default values for optional fields', async () => {
      const inquiryData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
      };

      const result = await inquiryService.createPublicInquiry(inquiryData, 'tenant1');

      expect(result.subject).toBe('お問い合わせ');
      expect(result.priority).toBe('MEDIUM');
      expect(result.propertyId).toBeNull();
    });
  });

  describe('getInquiries', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ 
          id: 'inquiry1', 
          tenantId: 'tenant1', 
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: new Date('2023-01-01')
        }),
        generateMockInquiry({ 
          id: 'inquiry2', 
          tenantId: 'tenant1', 
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          assignedTo: 'agent1',
          createdAt: new Date('2023-01-02')
        }),
        generateMockInquiry({ 
          id: 'inquiry3', 
          tenantId: 'tenant2', 
          status: 'RESPONDED',
          priority: 'LOW',
          createdAt: new Date('2023-01-03')
        })
      );
    });

    it('should get inquiries for specific tenant', async () => {
      const queryParams = {};
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries).toHaveLength(2);
      expect(result.inquiries.every(inquiry => inquiry.tenantId === 'tenant1')).toBe(true);
      expect(result.total).toBe(2);
    });

    it('should filter inquiries by status', async () => {
      const queryParams = { status: 'PENDING' };
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].status).toBe('PENDING');
    });

    it('should filter inquiries by priority', async () => {
      const queryParams = { priority: 'HIGH' };
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].priority).toBe('HIGH');
    });

    it('should filter inquiries by assigned agent', async () => {
      const queryParams = { assignedTo: 'agent1' };
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].assignedTo).toBe('agent1');
    });

    it('should search inquiries by name or email', async () => {
      global.inquiries[0].name = 'John Smith';
      const queryParams = { search: 'John' };
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries).toHaveLength(1);
      expect(result.inquiries[0].name).toBe('John Smith');
    });

    it('should sort inquiries by creation date', async () => {
      const queryParams = { sortBy: 'createdAt', sortOrder: 'desc' as const };
      const result = await inquiryService.getInquiries('tenant1', queryParams);

      expect(result.inquiries[0].createdAt.getTime()).toBeGreaterThan(
        result.inquiries[1].createdAt.getTime()
      );
    });
  });

  describe('getInquiryById', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ id: 'inquiry1', tenantId: 'tenant1' })
      );
    });

    it('should get inquiry by id for correct tenant', async () => {
      const result = await inquiryService.getInquiryById('inquiry1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('inquiry1');
      expect(result?.tenantId).toBe('tenant1');
    });

    it('should return null for inquiry in different tenant', async () => {
      const result = await inquiryService.getInquiryById('inquiry1', 'tenant2');

      expect(result).toBeNull();
    });
  });

  describe('updateInquiry', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ 
          id: 'inquiry1', 
          tenantId: 'tenant1',
          status: 'PENDING',
          priority: 'MEDIUM'
        })
      );
    });

    it('should update inquiry successfully', async () => {
      const updateData = {
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        assignedTo: 'agent1',
      };

      const result = await inquiryService.updateInquiry('inquiry1', updateData, 'tenant1');

      expect(result.status).toBe('IN_PROGRESS');
      expect(result.priority).toBe('HIGH');
      expect(result.assignedTo).toBe('agent1');
      expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
    });

    it('should throw error for non-existent inquiry', async () => {
      const updateData = { status: 'IN_PROGRESS' as const };

      await expect(inquiryService.updateInquiry('nonexistent', updateData, 'tenant1')).rejects.toThrow(AppError);
    });
  });

  describe('assignInquiry', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ 
          id: 'inquiry1', 
          tenantId: 'tenant1',
          assignedTo: null
        })
      );
    });

    it('should assign inquiry to agent successfully', async () => {
      const result = await inquiryService.assignInquiry('inquiry1', 'agent1', 'tenant1');

      expect(result.assignedTo).toBe('agent1');
      expect(result.assignedAt).toBeDefined();
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should reassign inquiry to different agent', async () => {
      // First assignment
      await inquiryService.assignInquiry('inquiry1', 'agent1', 'tenant1');
      
      // Reassignment
      const result = await inquiryService.assignInquiry('inquiry1', 'agent2', 'tenant1');

      expect(result.assignedTo).toBe('agent2');
    });
  });

  describe('respondToInquiry', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ 
          id: 'inquiry1', 
          tenantId: 'tenant1',
          status: 'IN_PROGRESS',
          responseMessage: null
        })
      );
    });

    it('should respond to inquiry successfully', async () => {
      const responseData = {
        responseMessage: 'Thank you for your inquiry. We will contact you soon.',
        status: 'RESPONDED' as const,
      };

      const result = await inquiryService.respondToInquiry('inquiry1', responseData, 'tenant1');

      expect(result.responseMessage).toBe(responseData.responseMessage);
      expect(result.status).toBe('RESPONDED');
      expect(result.respondedAt).toBeDefined();
    });
  });

  describe('deleteInquiry', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ id: 'inquiry1', tenantId: 'tenant1' })
      );
    });

    it('should delete inquiry successfully', async () => {
      await inquiryService.deleteInquiry('inquiry1', 'tenant1');

      const deletedInquiry = global.inquiries.find(i => i.id === 'inquiry1');
      expect(deletedInquiry).toBeUndefined();
    });

    it('should throw error for non-existent inquiry', async () => {
      await expect(inquiryService.deleteInquiry('nonexistent', 'tenant1')).rejects.toThrow(AppError);
    });
  });

  describe('getInquiryStats', () => {
    beforeEach(() => {
      global.inquiries.push(
        generateMockInquiry({ tenantId: 'tenant1', status: 'PENDING', priority: 'HIGH' }),
        generateMockInquiry({ tenantId: 'tenant1', status: 'IN_PROGRESS', priority: 'MEDIUM' }),
        generateMockInquiry({ tenantId: 'tenant1', status: 'RESPONDED', priority: 'LOW' }),
        generateMockInquiry({ tenantId: 'tenant1', status: 'CLOSED', priority: 'MEDIUM' }),
        generateMockInquiry({ tenantId: 'tenant2', status: 'PENDING', priority: 'HIGH' })
      );
    });

    it('should get inquiry statistics for tenant', async () => {
      const result = await inquiryService.getInquiryStats('tenant1');

      expect(result.total).toBe(4);
      expect(result.byStatus.PENDING).toBe(1);
      expect(result.byStatus.IN_PROGRESS).toBe(1);
      expect(result.byStatus.RESPONDED).toBe(1);
      expect(result.byStatus.CLOSED).toBe(1);
      expect(result.byPriority.HIGH).toBe(1);
      expect(result.byPriority.MEDIUM).toBe(2);
      expect(result.byPriority.LOW).toBe(1);
      expect(result.averageResponseTime).toBeDefined();
    });
  });
});