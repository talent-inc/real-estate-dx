import { PropertyService } from '../../services/property.service';
import { AppError } from '../../middlewares/error.middleware';

describe('PropertyService', () => {
  let propertyService: PropertyService;

  beforeEach(() => {
    propertyService = new PropertyService();
    global.properties = [];
    global.propertyIdCounter = 1;
  });

  const generateMockProperty = (overrides = {}) => ({
    id: `prop_${Math.random().toString(36).substr(2, 9)}`,
    tenantId: 'tenant_test',
    title: 'Test Property',
    description: 'Test property description',
    propertyType: 'APARTMENT' as const,
    status: 'ACTIVE' as const,
    price: 50000000,
    area: 80.5,
    rooms: 3,
    bathrooms: 1,
    address: {
      prefecture: '東京都',
      city: '渋谷区',
      streetAddress: '1-1-1',
      postalCode: '150-0001',
    },
    coordinates: {
      latitude: 35.6581,
      longitude: 139.7414,
    },
    features: ['エアコン', 'オートロック'],
    images: [],
    videos: [],
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user_1',
    assignedTo: null,
    viewCount: 0,
    favoriteCount: 0,
    ...overrides,
  });

  describe('getProperties', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ 
          id: 'prop1', 
          tenantId: 'tenant1', 
          title: 'Property 1',
          propertyType: 'APARTMENT',
          price: 30000000,
          status: 'ACTIVE'
        }),
        generateMockProperty({ 
          id: 'prop2', 
          tenantId: 'tenant1', 
          title: 'Property 2',
          propertyType: 'HOUSE',
          price: 70000000,
          status: 'ACTIVE'
        }),
        generateMockProperty({ 
          id: 'prop3', 
          tenantId: 'tenant2', 
          title: 'Property 3',
          propertyType: 'APARTMENT',
          price: 40000000,
          status: 'SOLD'
        })
      );
    });

    it('should get properties for specific tenant', async () => {
      const queryParams = {};
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(2);
      expect(result.properties.every(prop => prop.tenantId === 'tenant1')).toBe(true);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter properties by type', async () => {
      const queryParams = { propertyType: 'HOUSE' };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].propertyType).toBe('HOUSE');
    });

    it('should filter properties by status', async () => {
      const queryParams = { status: 'ACTIVE' };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(2);
      expect(result.properties.every(prop => prop.status === 'ACTIVE')).toBe(true);
    });

    it('should filter properties by price range', async () => {
      const queryParams = { 
        priceMin: 35000000,
        priceMax: 65000000
      };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].price).toBe(70000000);
    });

    it('should search properties by title', async () => {
      const queryParams = { search: 'Property 1' };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].title).toBe('Property 1');
    });

    it('should paginate results', async () => {
      const queryParams = { page: 1, limit: 1 };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should sort properties by price', async () => {
      const queryParams = { sortBy: 'price', sortOrder: 'desc' as const };
      const result = await propertyService.getProperties('tenant1', queryParams);

      expect(result.properties[0].price).toBe(70000000);
      expect(result.properties[1].price).toBe(30000000);
    });
  });

  describe('getPropertyById', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ id: 'prop1', tenantId: 'tenant1' })
      );
    });

    it('should get property by id for correct tenant', async () => {
      const result = await propertyService.getPropertyById('prop1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('prop1');
      expect(result?.tenantId).toBe('tenant1');
    });

    it('should return null for property in different tenant', async () => {
      const result = await propertyService.getPropertyById('prop1', 'tenant2');

      expect(result).toBeNull();
    });

    it('should return null for non-existent property', async () => {
      const result = await propertyService.getPropertyById('nonexistent', 'tenant1');

      expect(result).toBeNull();
    });

    it('should increment view count when getting property', async () => {
      const initialViewCount = global.properties[0].viewCount;
      
      await propertyService.getPropertyById('prop1', 'tenant1');
      
      expect(global.properties[0].viewCount).toBe(initialViewCount + 1);
    });
  });

  describe('createProperty', () => {
    it('should create property successfully', async () => {
      const propertyData = {
        title: 'New Property',
        description: 'A beautiful new property',
        propertyType: 'APARTMENT' as const,
        price: 45000000,
        area: 75.0,
        rooms: 2,
        bathrooms: 1,
        address: {
          prefecture: '東京都',
          city: '新宿区',
          streetAddress: '2-2-2',
          postalCode: '160-0001',
        },
        features: ['エアコン'],
      };

      const result = await propertyService.createProperty(propertyData, 'tenant1', 'user1');

      expect(result).toBeDefined();
      expect(result.title).toBe(propertyData.title);
      expect(result.description).toBe(propertyData.description);
      expect(result.propertyType).toBe(propertyData.propertyType);
      expect(result.price).toBe(propertyData.price);
      expect(result.tenantId).toBe('tenant1');
      expect(result.createdBy).toBe('user1');
      expect(result.status).toBe('ACTIVE');
    });

    it('should set default values for optional fields', async () => {
      const propertyData = {
        title: 'Minimal Property',
        propertyType: 'APARTMENT' as const,
        price: 45000000,
        address: {
          prefecture: '東京都',
          city: '新宿区',
          streetAddress: '2-2-2',
          postalCode: '160-0001',
        },
      };

      const result = await propertyService.createProperty(propertyData, 'tenant1', 'user1');

      expect(result.description).toBe('');
      expect(result.features).toEqual([]);
      expect(result.images).toEqual([]);
      expect(result.viewCount).toBe(0);
      expect(result.favoriteCount).toBe(0);
    });
  });

  describe('updateProperty', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ 
          id: 'prop1', 
          tenantId: 'tenant1',
          title: 'Original Property',
          price: 40000000
        })
      );
    });

    it('should update property successfully', async () => {
      const updateData = {
        title: 'Updated Property',
        price: 50000000,
        description: 'Updated description',
      };

      const result = await propertyService.updateProperty('prop1', updateData, 'tenant1');

      expect(result).toBeDefined();
      expect(result.title).toBe(updateData.title);
      expect(result.price).toBe(updateData.price);
      expect(result.description).toBe(updateData.description);
      expect(result.updatedAt.getTime()).toBeGreaterThan(result.createdAt.getTime());
    });

    it('should throw error for non-existent property', async () => {
      const updateData = { title: 'Updated' };

      await expect(propertyService.updateProperty('nonexistent', updateData, 'tenant1')).rejects.toThrow(AppError);
      await expect(propertyService.updateProperty('nonexistent', updateData, 'tenant1')).rejects.toThrow('Property not found');
    });

    it('should throw error for property in different tenant', async () => {
      const updateData = { title: 'Updated' };

      await expect(propertyService.updateProperty('prop1', updateData, 'tenant2')).rejects.toThrow(AppError);
      await expect(propertyService.updateProperty('prop1', updateData, 'tenant2')).rejects.toThrow('Property not found');
    });
  });

  describe('deleteProperty', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ id: 'prop1', tenantId: 'tenant1' })
      );
    });

    it('should delete property successfully', async () => {
      await propertyService.deleteProperty('prop1', 'tenant1');

      const deletedProperty = global.properties.find(p => p.id === 'prop1');
      expect(deletedProperty).toBeUndefined();
    });

    it('should throw error for non-existent property', async () => {
      await expect(propertyService.deleteProperty('nonexistent', 'tenant1')).rejects.toThrow(AppError);
      await expect(propertyService.deleteProperty('nonexistent', 'tenant1')).rejects.toThrow('Property not found');
    });

    it('should throw error for property in different tenant', async () => {
      await expect(propertyService.deleteProperty('prop1', 'tenant2')).rejects.toThrow(AppError);
      await expect(propertyService.deleteProperty('prop1', 'tenant2')).rejects.toThrow('Property not found');
    });
  });

  describe('addPropertyImage', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ 
          id: 'prop1', 
          tenantId: 'tenant1',
          images: []
        })
      );
    });

    it('should add image to property successfully', async () => {
      const imageData = {
        url: 'https://example.com/image.jpg',
        filename: 'image.jpg',
        description: 'Main image',
        isPrimary: true,
      };

      const result = await propertyService.addPropertyImage('prop1', imageData, 'tenant1');

      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toEqual(expect.objectContaining(imageData));
    });

    it('should set primary image correctly', async () => {
      // Add first image as primary
      await propertyService.addPropertyImage('prop1', {
        url: 'https://example.com/image1.jpg',
        filename: 'image1.jpg',
        isPrimary: true,
      }, 'tenant1');

      // Add second image as primary (should make first non-primary)
      const result = await propertyService.addPropertyImage('prop1', {
        url: 'https://example.com/image2.jpg',
        filename: 'image2.jpg',
        isPrimary: true,
      }, 'tenant1');

      expect(result.images).toHaveLength(2);
      expect(result.images.filter(img => img.isPrimary)).toHaveLength(1);
      expect(result.images.find(img => img.filename === 'image2.jpg')?.isPrimary).toBe(true);
      expect(result.images.find(img => img.filename === 'image1.jpg')?.isPrimary).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ 
          id: 'prop1', 
          tenantId: 'tenant1',
          favoriteCount: 0
        })
      );
    });

    it('should add property to favorites', async () => {
      const result = await propertyService.toggleFavorite('prop1', 'user1', 'tenant1');

      expect(result.isFavorited).toBe(true);
      expect(result.favoriteCount).toBe(1);
    });

    it('should remove property from favorites', async () => {
      // First add to favorites
      await propertyService.toggleFavorite('prop1', 'user1', 'tenant1');
      
      // Then remove from favorites
      const result = await propertyService.toggleFavorite('prop1', 'user1', 'tenant1');

      expect(result.isFavorited).toBe(false);
      expect(result.favoriteCount).toBe(0);
    });
  });

  describe('searchProperties', () => {
    beforeEach(() => {
      global.properties.push(
        generateMockProperty({ 
          id: 'prop1', 
          tenantId: 'tenant1',
          title: 'Beautiful apartment in Shibuya',
          description: 'Modern apartment with great view',
          address: { 
            prefecture: '東京都', 
            city: '渋谷区',
            streetAddress: '1-1-1',
            postalCode: '150-0001'
          },
          features: ['エアコン', 'オートロック']
        }),
        generateMockProperty({ 
          id: 'prop2', 
          tenantId: 'tenant1',
          title: 'Cozy house in Shinjuku',
          description: 'Traditional house with garden',
          address: { 
            prefecture: '東京都', 
            city: '新宿区',
            streetAddress: '2-2-2',
            postalCode: '160-0001'
          },
          features: ['駐車場', 'ガーデン']
        })
      );
    });

    it('should search properties by keyword', async () => {
      const searchParams = {
        keyword: 'apartment',
        tenantId: 'tenant1'
      };

      const result = await propertyService.searchProperties(searchParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].title).toContain('apartment');
    });

    it('should search properties by city', async () => {
      const searchParams = {
        keyword: '渋谷区',
        tenantId: 'tenant1'
      };

      const result = await propertyService.searchProperties(searchParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].address.city).toBe('渋谷区');
    });

    it('should search properties by features', async () => {
      const searchParams = {
        keyword: 'エアコン',
        tenantId: 'tenant1'
      };

      const result = await propertyService.searchProperties(searchParams);

      expect(result.properties).toHaveLength(1);
      expect(result.properties[0].features).toContain('エアコン');
    });
  });
});