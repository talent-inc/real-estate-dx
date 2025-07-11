import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';

// Global test setup
beforeAll(() => {
  // Clear all global storage for each test run
  if (global.users) {
    global.users = [];
  }
  if (global.properties) {
    global.properties = [];
  }
  if (global.files) {
    global.files = [];
  }
  if (global.inquiries) {
    global.inquiries = [];
  }
  if (global.externalSystemAuths) {
    global.externalSystemAuths = [];
  }
  if (global.syncLogs) {
    global.syncLogs = [];
  }
  if (global.analyticsReports) {
    global.analyticsReports = [];
  }
  if (global.dashboardWidgets) {
    global.dashboardWidgets = [];
  }
});

// Reset global storage between tests
beforeEach(() => {
  // Reset all counters
  global.userIdCounter = 1;
  global.propertyIdCounter = 1;
  global.fileIdCounter = 1;
  global.inquiryIdCounter = 1;
  global.externalAuthIdCounter = 1;
  global.syncLogIdCounter = 1;
  global.reportIdCounter = 1;
  global.widgetIdCounter = 1;
  
  // Clear all arrays
  if (global.users) global.users.length = 0;
  if (global.properties) global.properties.length = 0;
  if (global.files) global.files.length = 0;
  if (global.inquiries) global.inquiries.length = 0;
  if (global.externalSystemAuths) global.externalSystemAuths.length = 0;
  if (global.syncLogs) global.syncLogs.length = 0;
  if (global.analyticsReports) global.analyticsReports.length = 0;
  if (global.dashboardWidgets) global.dashboardWidgets.length = 0;
});

// Global test utilities
global.generateMockUser = (overrides = {}) => ({
  id: `user_${Math.random().toString(36).substr(2, 9)}`,
  tenantId: 'tenant_test',
  email: `test${Math.random().toString(36).substr(2, 5)}@example.com`,
  role: 'USER',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

global.generateMockProperty = (overrides = {}) => ({
  id: `prop_${Math.random().toString(36).substr(2, 9)}`,
  tenantId: 'tenant_test',
  title: 'Test Property',
  propertyType: 'APARTMENT',
  status: 'ACTIVE',
  price: 50000000,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Silence console during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}