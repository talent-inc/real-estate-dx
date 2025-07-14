declare global {
  // Test data storage
  var users: any[];
  var properties: any[];
  var files: any[];
  var inquiries: any[];
  var externalSystemAuths: any[];
  var syncLogs: any[];
  var analyticsReports: any[];
  var dashboardWidgets: any[];
  
  // ID counters
  var userIdCounter: number;
  var propertyIdCounter: number;
  var fileIdCounter: number;
  var inquiryIdCounter: number;
  var externalAuthIdCounter: number;
  var syncLogIdCounter: number;
  var reportIdCounter: number;
  var widgetIdCounter: number;
  
  // Test utilities
  var generateMockUser: (overrides?: any) => any;
  var generateMockProperty: (overrides?: any) => any;
}

export {};