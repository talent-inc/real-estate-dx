import { AuthService } from '../services/auth.service';
import { prisma } from '../lib/prisma';

async function testAuthService() {
  try {
    console.log('Testing AuthService...');
    
    const authService = new AuthService();
    
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: {
        email: 'auth-test@example.com',
      },
    });
    await prisma.tenant.deleteMany({
      where: {
        subdomain: 'auth-test',
      },
    });
    
    // Create a test tenant first (required for user creation)
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Auth Test Tenant',
        subdomain: 'auth-test',
        plan: 'FREE',
      },
    });
    console.log('✅ Created test tenant:', tenant);
    
    // Test user registration
    const registerData = {
      email: 'auth-test@example.com',
      password: 'password123',
      name: 'Auth Test User',
      tenantId: tenant.id,
      role: 'USER',
    };
    
    const registerResult = await authService.register(registerData);
    console.log('✅ User registration successful:', {
      user: registerResult.user,
      hasAccessToken: !!registerResult.accessToken,
      hasRefreshToken: !!registerResult.refreshToken,
    });
    
    // Test user login
    const loginData = {
      email: 'auth-test@example.com',
      password: 'password123',
      tenantId: tenant.id,
    };
    
    const loginResult = await authService.login(loginData);
    console.log('✅ User login successful:', {
      user: loginResult.user,
      hasAccessToken: !!loginResult.accessToken,
      hasRefreshToken: !!loginResult.refreshToken,
    });
    
    // Test getCurrentUser
    const currentUser = await authService.getCurrentUser(registerResult.user.id, tenant.id);
    console.log('✅ Get current user successful:', currentUser);
    
    // Test getAllUsers
    const allUsers = await authService.getAllUsers(tenant.id);
    console.log('✅ Get all users successful:', allUsers.length, 'users found');
    
    // Test invalid login
    try {
      await authService.login({
        email: 'auth-test@example.com',
        password: 'wrongpassword',
        tenantId: tenant.id,
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error: any) {
      console.log('✅ Correctly rejected invalid password:', error.message);
    }
    
    // Cleanup
    await prisma.user.delete({ where: { id: registerResult.user.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    console.log('✅ Cleaned up test data');
    
    console.log('🎉 All AuthService tests passed!');
  } catch (error) {
    console.error('❌ AuthService test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthService();