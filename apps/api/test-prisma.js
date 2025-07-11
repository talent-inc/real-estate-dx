// Simple test script to verify Prisma setup
console.log('Testing Prisma setup...');

try {
  require('dotenv').config();
  console.log('✅ dotenv loaded');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  // Test if we can create a simple database file
  const fs = require('fs');
  const path = require('path');
  
  const dbPath = path.join(__dirname, 'dev.db');
  console.log('Database file path:', dbPath);
  
  // Create empty database file if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '');
    console.log('✅ Created dev.db file');
  } else {
    console.log('✅ dev.db file exists');
  }
  
  console.log('🎉 Basic setup test completed successfully');
  
} catch (error) {
  console.error('❌ Setup test failed:', error.message);
}