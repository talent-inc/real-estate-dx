import { z } from 'zod';

export const createExternalSystemAuthSchema = z.object({
  systemType: z.enum(['REINS', 'ATHOME', 'HATOSAPO', 'HOMES', 'SUUMO', 'LIFULL', 'RAKUTEN', 'YAHOO', 'CUSTOM']),
  systemName: z.string().min(1, 'System name is required'),
  credentials: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    apiKey: z.string().optional(),
  }),
  settings: z.record(z.any()).optional(),
  syncEnabled: z.boolean().optional().default(true),
  syncSchedule: z.string().optional(),
});

export const updateExternalSystemAuthSchema = z.object({
  systemName: z.string().min(1, 'System name cannot be empty').optional(),
  credentials: z.object({
    username: z.string().min(1, 'Username is required').optional(),
    password: z.string().min(1, 'Password is required').optional(),
    apiKey: z.string().optional(),
  }).optional(),
  settings: z.record(z.any()).optional(),
  syncEnabled: z.boolean().optional(),
  syncSchedule: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const testConnectionSchema = z.object({
  systemType: z.enum(['REINS', 'ATHOME', 'HATOSAPO', 'HOMES', 'SUUMO', 'LIFULL', 'RAKUTEN', 'YAHOO', 'CUSTOM']),
  credentials: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    apiKey: z.string().optional(),
  }),
});

export const syncRequestSchema = z.object({
  syncType: z.enum(['FULL', 'INCREMENTAL', 'MANUAL']).default('MANUAL'),
  syncDirection: z.enum(['IMPORT', 'EXPORT', 'BIDIRECTIONAL']).default('IMPORT'),
  filters: z.object({
    updatedAfter: z.string().datetime().optional(),
    propertyTypes: z.array(z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER'])).optional(),
    maxRecords: z.number().int().positive().max(1000).optional(),
  }).optional(),
});

export type CreateExternalSystemAuthRequest = z.infer<typeof createExternalSystemAuthSchema>;
export type UpdateExternalSystemAuthRequest = z.infer<typeof updateExternalSystemAuthSchema>;
export type TestConnectionRequest = z.infer<typeof testConnectionSchema>;
export type SyncRequest = z.infer<typeof syncRequestSchema>;