import { prisma } from '../lib/prisma';

async function testPrismaConnection() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test creating a tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Tenant',
        subdomain: 'test-tenant',
        plan: 'FREE',
      },
    });
    console.log('✅ Created test tenant:', tenant);
    
    // Test creating a user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'USER',
        tenantId: tenant.id,
      },
    });
    console.log('✅ Created test user:', { ...user, password: '[REDACTED]' });
    
    // Test creating a property
    const property = await prisma.property.create({
      data: {
        title: 'Test Property',
        description: 'A beautiful test property',
        type: 'APARTMENT',
        status: 'ACTIVE',
        price: 1000000,
        area: 80.5,
        address: 'Tokyo, Japan',
        tenantId: tenant.id,
        userId: user.id,
      },
    });
    console.log('✅ Created test property:', property);
    
    // Test querying with relations
    const tenantWithUsers = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      include: {
        users: true,
        properties: true,
      },
    });
    console.log('✅ Queried tenant with relations:', {
      ...tenantWithUsers,
      users: tenantWithUsers?.users.map(u => ({ ...u, password: '[REDACTED]' })),
    });
    
    // Cleanup test data
    await prisma.property.delete({ where: { id: property.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    console.log('✅ Cleaned up test data');
    
    console.log('🎉 All Prisma tests passed!');
  } catch (error) {
    console.error('❌ Prisma test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection();