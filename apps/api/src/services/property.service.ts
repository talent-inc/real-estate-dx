import { AppError } from '../middlewares/error.middleware';
import type { CreatePropertyRequest, UpdatePropertyRequest, GetPropertiesQueryParams } from '../validators/property.validators';

// Mock property database for now - will be replaced with Prisma
interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  area?: number;
  address: string;
  prefecture: string;
  city: string;
  propertyType: string;
  buildingType?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  buildDate?: string;
  lat?: number;
  lng?: number;
  status: string;
  tenantId: string;
  createdById: string;
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    caption?: string;
    isMain: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Global properties storage
declare global {
  var properties: Property[];
}

if (!global.properties) {
  global.properties = [];
}

let propertyIdCounter = 1;

export class PropertyService {
  async getProperties(tenantId: string, queryParams: GetPropertiesQueryParams): Promise<{
    properties: Property[];
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
      propertyType, 
      status, 
      priceMin, 
      priceMax, 
      areaMin, 
      areaMax,
      prefecture,
      city,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = queryParams;

    // Filter properties by tenant
    let filteredProperties = global.properties.filter(property => property.tenantId === tenantId);

    // Apply filters
    if (propertyType) {
      filteredProperties = filteredProperties.filter(property => property.propertyType === propertyType);
    }

    if (status) {
      filteredProperties = filteredProperties.filter(property => property.status === status);
    }

    if (priceMin !== undefined) {
      filteredProperties = filteredProperties.filter(property => property.price >= priceMin);
    }

    if (priceMax !== undefined) {
      filteredProperties = filteredProperties.filter(property => property.price <= priceMax);
    }

    if (areaMin !== undefined) {
      filteredProperties = filteredProperties.filter(property => property.area && property.area >= areaMin);
    }

    if (areaMax !== undefined) {
      filteredProperties = filteredProperties.filter(property => property.area && property.area <= areaMax);
    }

    if (prefecture) {
      filteredProperties = filteredProperties.filter(property => 
        property.prefecture.toLowerCase().includes(prefecture.toLowerCase())
      );
    }

    if (city) {
      filteredProperties = filteredProperties.filter(property => 
        property.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProperties = filteredProperties.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.description?.toLowerCase().includes(searchLower) ||
        property.address.toLowerCase().includes(searchLower)
      );
    }

    // Sort properties
    filteredProperties.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'area':
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
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
    const total = filteredProperties.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Get paginated results
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getPropertyById(propertyId: string, tenantId: string): Promise<Property | null> {
    const property = global.properties.find(p => p.id === propertyId && p.tenantId === tenantId);
    return property || null;
  }

  async createProperty(propertyData: CreatePropertyRequest, tenantId: string, createdById: string): Promise<Property> {
    const newProperty: Property = {
      id: `property_${propertyIdCounter++}`,
      ...propertyData,
      status: propertyData.status || 'DRAFT',
      tenantId,
      createdById,
      images: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.properties.push(newProperty);
    return newProperty;
  }

  async updateProperty(propertyId: string, updateData: UpdatePropertyRequest, tenantId: string): Promise<Property> {
    const propertyIndex = global.properties.findIndex(p => p.id === propertyId && p.tenantId === tenantId);
    
    if (propertyIndex === -1) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    const currentProperty = global.properties[propertyIndex];

    // Update property
    const updatedProperty: Property = {
      ...currentProperty,
      ...updateData,
      updatedAt: new Date(),
    };

    global.properties[propertyIndex] = updatedProperty;
    return updatedProperty;
  }

  async deleteProperty(propertyId: string, tenantId: string): Promise<void> {
    const propertyIndex = global.properties.findIndex(p => p.id === propertyId && p.tenantId === tenantId);
    
    if (propertyIndex === -1) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    // Remove property
    global.properties.splice(propertyIndex, 1);
  }

  async addPropertyImage(propertyId: string, imageData: {
    url: string;
    thumbnailUrl?: string;
    caption?: string;
    isMain?: boolean;
  }, tenantId: string): Promise<Property> {
    const propertyIndex = global.properties.findIndex(p => p.id === propertyId && p.tenantId === tenantId);
    
    if (propertyIndex === -1) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    const property = global.properties[propertyIndex];

    // If this is set as main image, remove main flag from others
    if (imageData.isMain) {
      property.images.forEach(img => img.isMain = false);
    }

    // Add new image
    const newImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: imageData.url,
      thumbnailUrl: imageData.thumbnailUrl,
      caption: imageData.caption,
      isMain: imageData.isMain || false,
    };

    property.images.push(newImage);
    property.updatedAt = new Date();

    global.properties[propertyIndex] = property;
    return property;
  }

  async removePropertyImage(propertyId: string, imageId: string, tenantId: string): Promise<Property> {
    const propertyIndex = global.properties.findIndex(p => p.id === propertyId && p.tenantId === tenantId);
    
    if (propertyIndex === -1) {
      throw new AppError(404, 'Property not found', 'NOT_FOUND');
    }

    const property = global.properties[propertyIndex];
    const imageIndex = property.images.findIndex(img => img.id === imageId);

    if (imageIndex === -1) {
      throw new AppError(404, 'Image not found', 'NOT_FOUND');
    }

    // Remove image
    property.images.splice(imageIndex, 1);
    property.updatedAt = new Date();

    global.properties[propertyIndex] = property;
    return property;
  }

  // Get property statistics for dashboard
  async getPropertyStats(tenantId: string): Promise<{
    total: number;
    active: number;
    draft: number;
    sold: number;
    suspended: number;
    totalValue: number;
    averagePrice: number;
  }> {
    const tenantProperties = global.properties.filter(p => p.tenantId === tenantId);

    const stats = {
      total: tenantProperties.length,
      active: tenantProperties.filter(p => p.status === 'ACTIVE').length,
      draft: tenantProperties.filter(p => p.status === 'DRAFT').length,
      sold: tenantProperties.filter(p => p.status === 'SOLD').length,
      suspended: tenantProperties.filter(p => p.status === 'SUSPENDED').length,
      totalValue: tenantProperties.reduce((sum, p) => sum + p.price, 0),
      averagePrice: 0,
    };

    stats.averagePrice = stats.total > 0 ? stats.totalValue / stats.total : 0;

    return stats;
  }
}