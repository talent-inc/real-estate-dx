import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
  type: z.enum(['VIEWING', 'PURCHASE', 'RENT', 'VALUATION', 'GENERAL', 'OTHER']),
  propertyId: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
});

export const updateInquirySchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'CANCELLED']).optional(),
  assignedToId: z.string().optional(),
  response: z.string().optional(),
  notes: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export const getInquiriesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESPONDED', 'CLOSED', 'CANCELLED']).optional(),
  type: z.enum(['VIEWING', 'PURCHASE', 'RENT', 'VALUATION', 'GENERAL', 'OTHER']).optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assignedToId: z.string().optional(),
  propertyId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'urgency', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const respondToInquirySchema = z.object({
  response: z.string().min(1, 'Response is required').max(2000, 'Response must be less than 2000 characters'),
  status: z.enum(['RESPONDED', 'CLOSED']).optional().default('RESPONDED'),
});

export type CreateInquiryRequest = z.infer<typeof createInquirySchema>;
export type UpdateInquiryRequest = z.infer<typeof updateInquirySchema>;
export type GetInquiriesQueryParams = z.infer<typeof getInquiriesQuerySchema>;
export type RespondToInquiryRequest = z.infer<typeof respondToInquirySchema>;