import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import type { LoginRequest, RegisterRequest } from '../validators/auth.validators';
import { prisma } from '../lib/prisma';
import { TestDataService } from './test-data.service';

// Mock user database for development/testing
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for development
const users: User[] = [];
let userIdCounter = 1;

// Environment-based service selection
const USE_PRISMA = process.env.USE_DEV_DATA !== 'true';

export class AuthService {
  async login(loginData: LoginRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    if (USE_PRISMA) {
      return this.loginWithPrisma(loginData);
    }
    return this.loginInMemory(loginData);
  }

  private async loginInMemory(loginData: LoginRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, tenantId } = loginData;

    // Find user from test data
    const testUsers = TestDataService.getUsers();
    const user = testUsers.find((u: any) => u.email === email && u.tenantId === tenantId);
    
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'AUTHENTICATION_ERROR');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'AUTHENTICATION_ERROR');
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  private async loginWithPrisma(loginData: LoginRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, tenantId } = loginData;

    // Find user by email and tenantId
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    });
    
    if (!user) {
      throw new AppError(401, 'Invalid credentials', 'AUTHENTICATION_ERROR');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials', 'AUTHENTICATION_ERROR');
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async register(registerData: RegisterRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    if (USE_PRISMA) {
      return this.registerWithPrisma(registerData);
    }
    return this.registerInMemory(registerData);
  }

  private async registerInMemory(registerData: RegisterRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, name, tenantId, role = 'USER' } = registerData;

    // Check if user already exists in test data
    const testUsers = TestDataService.getUsers();
    const existingUser = testUsers.find((u: any) => u.email === email && u.tenantId === tenantId);
    
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'CONFLICT');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser: User = {
      id: `user_${userIdCounter++}`,
      email,
      password: hashedPassword,
      name,
      role,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add user to test data
    TestDataService.addUser(newUser);

    // Generate tokens
    const tokens = generateTokens({
      userId: newUser.id,
      tenantId: newUser.tenantId,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  private async registerWithPrisma(registerData: RegisterRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, name, tenantId, role = 'USER' } = registerData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        tenantId,
      },
    });
    
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'CONFLICT');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        tenantId,
      },
    });

    // Generate tokens
    const tokens = generateTokens({
      userId: newUser.id,
      tenantId: newUser.tenantId,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async getCurrentUser(userId: string, tenantId: string): Promise<Omit<User, 'password'> | null> {
    if (USE_PRISMA) {
      return this.getCurrentUserWithPrisma(userId, tenantId);
    }
    return this.getCurrentUserInMemory(userId, tenantId);
  }

  private async getCurrentUserInMemory(userId: string, tenantId: string): Promise<Omit<User, 'password'> | null> {
    const testUsers = TestDataService.getUsers();
    const user = testUsers.find((u: any) => u.id === userId && u.tenantId === tenantId);
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async getCurrentUserWithPrisma(userId: string, tenantId: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Method to get all users (for testing purposes)
  async getAllUsers(tenantId?: string): Promise<Omit<User, 'password'>[]> {
    if (USE_PRISMA) {
      return this.getAllUsersWithPrisma(tenantId);
    }
    return this.getAllUsersInMemory(tenantId);
  }

  private async getAllUsersInMemory(tenantId?: string): Promise<Omit<User, 'password'>[]> {
    const testUsers = TestDataService.getUsers();
    const filteredUsers = tenantId ? testUsers.filter((u: any) => u.tenantId === tenantId) : testUsers;
    return filteredUsers.map(({ password: _, ...user }: any) => user);
  }

  private async getAllUsersWithPrisma(tenantId?: string): Promise<Omit<User, 'password'>[]> {
    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
    });
    
    return users.map(({ password: _, ...user }) => user);
  }
}