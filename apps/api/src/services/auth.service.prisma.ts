import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import type { LoginRequest, RegisterRequest } from '../validators/auth.validators';
import { prisma } from '../lib/prisma';

export class AuthService {
  async login(loginData: LoginRequest): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
      createdAt: Date;
      updatedAt: Date;
    };
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
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
      createdAt: Date;
      updatedAt: Date;
    };
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

  async getCurrentUser(userId: string, tenantId: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
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
  async getAllUsers(tenantId?: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
  }[]> {
    const users = await prisma.user.findMany({
      where: tenantId ? { tenantId } : undefined,
    });
    
    return users.map(({ password: _, ...user }) => user);
  }
}