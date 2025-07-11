import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  area: z.number().positive('Area must be positive').optional(),
  address: z.string().min(1, 'Address is required'),
  prefecture: z.string().min(1, 'Prefecture is required'),
  city: z.string().min(1, 'City is required'),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER']),
  buildingType: z.enum(['WOODEN', 'STEEL', 'REINFORCED_CONCRETE', 'STEEL_REINFORCED_CONCRETE', 'LIGHT_STEEL', 'OTHER']).optional(),
  rooms: z.number().int().min(0).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  buildDate: z.string().datetime().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'SUSPENDED']).optional().default('DRAFT'),
});

export const updatePropertySchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  area: z.number().positive('Area must be positive').optional(),
  address: z.string().min(1, 'Address cannot be empty').optional(),
  prefecture: z.string().min(1, 'Prefecture cannot be empty').optional(),
  city: z.string().min(1, 'City cannot be empty').optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER']).optional(),
  buildingType: z.enum(['WOODEN', 'STEEL', 'REINFORCED_CONCRETE', 'STEEL_REINFORCED_CONCRETE', 'LIGHT_STEEL', 'OTHER']).optional(),
  rooms: z.number().int().min(0).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  buildDate: z.string().datetime().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'SUSPENDED']).optional(),
});

export const getPropertiesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'SUSPENDED']).optional(),
  priceMin: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  priceMax: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  areaMin: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  areaMax: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'price', 'area', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreatePropertyRequest = z.infer<typeof createPropertySchema>;
export type UpdatePropertyRequest = z.infer<typeof updatePropertySchema>;
export type GetPropertiesQueryParams = z.infer<typeof getPropertiesQuerySchema>;