import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate DX System API',
      version,
      description: '不動産売買システム API仕様書',
      contact: {
        name: 'Development Team',
        email: 'dev@real-estate-dx.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Development server',
      },
      {
        url: 'https://staging-api.real-estate-dx.com/api',
        description: 'Staging server',
      },
      {
        url: 'https://api.real-estate-dx.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT認証トークン',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                details: {
                  type: 'object',
                },
                requestId: {
                  type: 'string',
                  format: 'uuid',
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user_123',
            },
            tenantId: {
              type: 'string',
              example: 'tenant_abc',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: '太郎',
            },
            lastName: {
              type: 'string',
              example: '田中',
            },
            role: {
              type: 'string',
              enum: ['TENANT_ADMIN', 'MANAGER', 'AGENT', 'USER'],
              example: 'USER',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            emailVerified: {
              type: 'boolean',
              example: false,
            },
            phone: {
              type: 'string',
              example: '090-1234-5678',
            },
            profileImage: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/profile.jpg',
            },
            settings: {
              type: 'object',
              additionalProperties: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        Property: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'prop_123',
            },
            tenantId: {
              type: 'string',
              example: 'tenant_abc',
            },
            title: {
              type: 'string',
              example: '新築マンション 3LDK',
            },
            description: {
              type: 'string',
              example: '駅近の新築マンションです。',
            },
            propertyType: {
              type: 'string',
              enum: ['APARTMENT', 'HOUSE', 'LAND', 'OFFICE', 'SHOP', 'WAREHOUSE', 'OTHER'],
              example: 'APARTMENT',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'PENDING', 'SOLD', 'WITHDRAWN'],
              example: 'ACTIVE',
            },
            price: {
              type: 'number',
              example: 50000000,
            },
            area: {
              type: 'number',
              example: 80.5,
            },
            rooms: {
              type: 'integer',
              example: 3,
            },
            bathrooms: {
              type: 'integer',
              example: 1,
            },
            address: {
              type: 'object',
              properties: {
                prefecture: {
                  type: 'string',
                  example: '東京都',
                },
                city: {
                  type: 'string',
                  example: '渋谷区',
                },
                streetAddress: {
                  type: 'string',
                  example: '1-1-1',
                },
                postalCode: {
                  type: 'string',
                  example: '150-0001',
                },
              },
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  example: 35.6581,
                },
                longitude: {
                  type: 'number',
                  example: 139.7414,
                },
              },
            },
            features: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['エアコン', 'オートロック', '駐車場'],
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                  },
                  filename: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                  isPrimary: {
                    type: 'boolean',
                  },
                },
              },
            },
            viewCount: {
              type: 'integer',
              example: 123,
            },
            favoriteCount: {
              type: 'integer',
              example: 5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            createdBy: {
              type: 'string',
              example: 'user_123',
            },
            assignedTo: {
              type: 'string',
              nullable: true,
              example: 'agent_456',
            },
          },
        },
        Inquiry: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'inquiry_123',
            },
            tenantId: {
              type: 'string',
              example: 'tenant_abc',
            },
            propertyId: {
              type: 'string',
              nullable: true,
              example: 'prop_123',
            },
            name: {
              type: 'string',
              example: '田中太郎',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'tanaka@example.com',
            },
            phone: {
              type: 'string',
              example: '090-1234-5678',
            },
            subject: {
              type: 'string',
              example: '物件に関するお問い合わせ',
            },
            message: {
              type: 'string',
              example: 'この物件について詳しく教えてください。',
            },
            source: {
              type: 'string',
              enum: ['WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'EXTERNAL_SYSTEM', 'OTHER'],
              example: 'WEBSITE',
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'IN_PROGRESS', 'RESPONDED', 'CLOSED'],
              example: 'PENDING',
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
              example: 'MEDIUM',
            },
            assignedTo: {
              type: 'string',
              nullable: true,
              example: 'agent_456',
            },
            responseMessage: {
              type: 'string',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        File: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'file_123',
            },
            tenantId: {
              type: 'string',
              example: 'tenant_abc',
            },
            originalName: {
              type: 'string',
              example: 'document.pdf',
            },
            filename: {
              type: 'string',
              example: 'document-20231201-123456.pdf',
            },
            mimeType: {
              type: 'string',
              example: 'application/pdf',
            },
            size: {
              type: 'integer',
              example: 1024000,
            },
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://storage.example.com/files/document-20231201-123456.pdf',
            },
            fileType: {
              type: 'string',
              enum: ['image', 'document', 'video'],
              example: 'document',
            },
            uploadedBy: {
              type: 'string',
              example: 'user_123',
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        ExternalSystem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'ext_auth_123',
            },
            tenantId: {
              type: 'string',
              example: 'tenant_abc',
            },
            systemType: {
              type: 'string',
              enum: ['REINS', 'ATHOME', 'HATOSAPO', 'HOMES', 'SUUMO', 'LIFULL', 'RAKUTEN', 'YAHOO', 'CUSTOM'],
              example: 'REINS',
            },
            systemName: {
              type: 'string',
              example: 'REINS Connection',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            syncEnabled: {
              type: 'boolean',
              example: true,
            },
            syncSchedule: {
              type: 'string',
              example: '0 */6 * * *',
            },
            lastTestAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            lastSyncAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            lastError: {
              type: 'string',
              nullable: true,
            },
            settings: {
              type: 'object',
              additionalProperties: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        AnalyticsOverview: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalProperties: {
                  type: 'integer',
                  example: 245,
                },
                totalInquiries: {
                  type: 'integer',
                  example: 89,
                },
                totalUsers: {
                  type: 'integer',
                  example: 34,
                },
                conversionRate: {
                  type: 'number',
                  example: 0.15,
                },
              },
            },
            trends: {
              type: 'object',
              properties: {
                properties: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnalyticsMetric',
                  },
                },
                inquiries: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnalyticsMetric',
                  },
                },
                users: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnalyticsMetric',
                  },
                },
                conversions: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/AnalyticsMetric',
                  },
                },
              },
            },
            topMetrics: {
              type: 'object',
              properties: {
                topPropertyTypes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                      },
                      count: {
                        type: 'integer',
                      },
                    },
                  },
                },
                topRegions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      region: {
                        type: 'string',
                      },
                      count: {
                        type: 'integer',
                      },
                    },
                  },
                },
                topAgents: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      agentName: {
                        type: 'string',
                      },
                      inquiries: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        AnalyticsMetric: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
            value: {
              type: 'number',
            },
            label: {
              type: 'string',
            },
            metadata: {
              type: 'object',
              additionalProperties: true,
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 20,
            },
            total: {
              type: 'integer',
              example: 100,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: '認証が必要です',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'AUTHENTICATION_ERROR',
                  message: 'No token provided',
                  requestId: '12345678-1234-1234-1234-123456789012',
                  timestamp: '2023-12-01T12:00:00.000Z',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: '権限がありません',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'AUTHORIZATION_ERROR',
                  message: 'Insufficient permissions',
                  requestId: '12345678-1234-1234-1234-123456789012',
                  timestamp: '2023-12-01T12:00:00.000Z',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'バリデーションエラー',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Validation failed',
                  details: {
                    email: 'Invalid email format',
                  },
                  requestId: '12345678-1234-1234-1234-123456789012',
                  timestamp: '2023-12-01T12:00:00.000Z',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'リソースが見つかりません',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                  requestId: '12345678-1234-1234-1234-123456789012',
                  timestamp: '2023-12-01T12:00:00.000Z',
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'サーバー内部エラー',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: {
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'An unexpected error occurred',
                  requestId: '12345678-1234-1234-1234-123456789012',
                  timestamp: '2023-12-01T12:00:00.000Z',
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);