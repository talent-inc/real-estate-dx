import { hashPassword, comparePassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';
import type { LoginRequest, RegisterRequest } from '../validators/auth.validators';

// Mock user database for now - will be replaced with Prisma
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

export class AuthService {
  async login(loginData: LoginRequest): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, tenantId } = loginData;

    // Find user by email and tenantId
    const user = users.find(u => u.email === email && u.tenantId === tenantId);
    
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
    const { email, password, name, tenantId, role = 'USER' } = registerData;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email && u.tenantId === tenantId);
    
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

    users.push(newUser);

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
    const user = users.find(u => u.id === userId && u.tenantId === tenantId);
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Method to get all users (for testing purposes)
  getAllUsers(): Omit<User, 'password'>[] {
    return users.map(({ password: _, ...user }) => user);
  }
}