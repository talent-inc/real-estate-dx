import { AppError } from '../middlewares/error.middleware';
import type { CreateInquiryRequest, UpdateInquiryRequest, GetInquiriesQueryParams, RespondToInquiryRequest } from '../validators/inquiry.validators';

// Mock inquiry database for now - will be replaced with Prisma
interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: string;
  propertyId?: string;
  urgency: string;
  status: string;
  assignedToId?: string;
  response?: string;
  notes?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

// Global inquiries storage
declare global {
  var inquiries: Inquiry[];
}

if (!global.inquiries) {
  global.inquiries = [];
}

let inquiryIdCounter = 1;

export class InquiryService {
  async getInquiries(tenantId: string, queryParams: GetInquiriesQueryParams): Promise<{
    inquiries: Inquiry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      urgency,
      assignedToId,
      propertyId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    // Filter inquiries by tenant
    let filteredInquiries = global.inquiries.filter(inquiry => inquiry.tenantId === tenantId);

    // Apply filters
    if (status) {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === status);
    }

    if (type) {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.type === type);
    }

    if (urgency) {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.urgency === urgency);
    }

    if (assignedToId) {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.assignedToId === assignedToId);
    }

    if (propertyId) {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.propertyId === propertyId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredInquiries = filteredInquiries.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchLower) ||
        inquiry.email.toLowerCase().includes(searchLower) ||
        inquiry.subject.toLowerCase().includes(searchLower) ||
        inquiry.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort inquiries
    filteredInquiries.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = urgencyOrder[a.urgency as keyof typeof urgencyOrder];
          bValue = urgencyOrder[b.urgency as keyof typeof urgencyOrder];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    // Calculate pagination
    const total = filteredInquiries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Get paginated results
    const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

    return {
      inquiries: paginatedInquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getInquiryById(inquiryId: string, tenantId: string): Promise<Inquiry | null> {
    const inquiry = global.inquiries.find(i => i.id === inquiryId && i.tenantId === tenantId);
    return inquiry || null;
  }

  async createInquiry(inquiryData: CreateInquiryRequest, tenantId: string): Promise<Inquiry> {
    const newInquiry: Inquiry = {
      id: `inquiry_${inquiryIdCounter++}`,
      ...inquiryData,
      urgency: inquiryData.urgency || 'MEDIUM',
      status: 'NEW',
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.inquiries.push(newInquiry);
    return newInquiry;
  }

  async updateInquiry(inquiryId: string, updateData: UpdateInquiryRequest, tenantId: string): Promise<Inquiry> {
    const inquiryIndex = global.inquiries.findIndex(i => i.id === inquiryId && i.tenantId === tenantId);
    
    if (inquiryIndex === -1) {
      throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
    }

    const currentInquiry = global.inquiries[inquiryIndex];

    // Update inquiry
    const updatedInquiry: Inquiry = {
      ...currentInquiry,
      ...updateData,
      updatedAt: new Date(),
    };

    global.inquiries[inquiryIndex] = updatedInquiry;
    return updatedInquiry;
  }

  async respondToInquiry(inquiryId: string, responseData: RespondToInquiryRequest, tenantId: string, responderId: string): Promise<Inquiry> {
    const inquiryIndex = global.inquiries.findIndex(i => i.id === inquiryId && i.tenantId === tenantId);
    
    if (inquiryIndex === -1) {
      throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
    }

    const currentInquiry = global.inquiries[inquiryIndex];

    // Update inquiry with response
    const updatedInquiry: Inquiry = {
      ...currentInquiry,
      response: responseData.response,
      status: responseData.status || 'RESPONDED',
      assignedToId: responderId,
      respondedAt: new Date(),
      updatedAt: new Date(),
    };

    global.inquiries[inquiryIndex] = updatedInquiry;
    return updatedInquiry;
  }

  async deleteInquiry(inquiryId: string, tenantId: string): Promise<void> {
    const inquiryIndex = global.inquiries.findIndex(i => i.id === inquiryId && i.tenantId === tenantId);
    
    if (inquiryIndex === -1) {
      throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
    }

    // Remove inquiry
    global.inquiries.splice(inquiryIndex, 1);
  }

  async assignInquiry(inquiryId: string, assignedToId: string, tenantId: string): Promise<Inquiry> {
    const inquiryIndex = global.inquiries.findIndex(i => i.id === inquiryId && i.tenantId === tenantId);
    
    if (inquiryIndex === -1) {
      throw new AppError(404, 'Inquiry not found', 'NOT_FOUND');
    }

    const currentInquiry = global.inquiries[inquiryIndex];

    // Update inquiry assignment
    const updatedInquiry: Inquiry = {
      ...currentInquiry,
      assignedToId,
      status: currentInquiry.status === 'NEW' ? 'IN_PROGRESS' : currentInquiry.status,
      updatedAt: new Date(),
    };

    global.inquiries[inquiryIndex] = updatedInquiry;
    return updatedInquiry;
  }

  // Get inquiry statistics for dashboard
  async getInquiryStats(tenantId: string): Promise<{
    total: number;
    new: number;
    inProgress: number;
    responded: number;
    closed: number;
    cancelled: number;
    highUrgency: number;
    averageResponseTime: number; // in hours
  }> {
    const tenantInquiries = global.inquiries.filter(i => i.tenantId === tenantId);

    const stats = {
      total: tenantInquiries.length,
      new: tenantInquiries.filter(i => i.status === 'NEW').length,
      inProgress: tenantInquiries.filter(i => i.status === 'IN_PROGRESS').length,
      responded: tenantInquiries.filter(i => i.status === 'RESPONDED').length,
      closed: tenantInquiries.filter(i => i.status === 'CLOSED').length,
      cancelled: tenantInquiries.filter(i => i.status === 'CANCELLED').length,
      highUrgency: tenantInquiries.filter(i => i.urgency === 'HIGH').length,
      averageResponseTime: 0,
    };

    // Calculate average response time
    const respondedInquiries = tenantInquiries.filter(i => i.respondedAt);
    if (respondedInquiries.length > 0) {
      const totalResponseTime = respondedInquiries.reduce((sum, inquiry) => {
        const responseTime = inquiry.respondedAt!.getTime() - inquiry.createdAt.getTime();
        return sum + responseTime;
      }, 0);
      
      stats.averageResponseTime = totalResponseTime / respondedInquiries.length / (1000 * 60 * 60); // Convert to hours
    }

    return stats;
  }
}