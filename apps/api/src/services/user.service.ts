import { hashPassword, comparePassword } from '../utils/password';
import { AppError } from '../middlewares/error.middleware';
import type { CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, GetUsersQueryParams } from '../validators/user.validators';

// Mock user database for now - will be replaced with Prisma
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Import users from auth service (shared storage)
declare global {
  var users: User[];
}

if (!global.users) {
  global.users = [];
}

export class UserService {
  async getUsers(tenantId: string, queryParams: GetUsersQueryParams): Promise<{
    users: Omit<User, 'password'>[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const { page = 1, limit = 20, role, search, isActive } = queryParams;

    // Filter users by tenant
    let filteredUsers = global.users.filter(user => user.tenantId === tenantId);

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (typeof isActive === 'boolean') {
      filteredUsers = filteredUsers.filter(user => user.isActive === isActive);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Calculate pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Get paginated results
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const usersWithoutPasswords = paginatedUsers.map(({ password: _, ...user }) => user);

    return {
      users: usersWithoutPasswords,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getUserById(userId: string, tenantId: string): Promise<Omit<User, 'password'> | null> {
    const user = global.users.find(u => u.id === userId && u.tenantId === tenantId);
    
    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(userData: CreateUserRequest, tenantId: string, creatorRole: string): Promise<Omit<User, 'password'>> {
    const { email, password, name, role = 'USER' } = userData;

    // Check permissions
    if (!this.canCreateUser(creatorRole, role)) {
      throw new AppError(403, 'Insufficient permissions to create user with this role', 'AUTHORIZATION_ERROR');
    }

    // Check if user already exists
    const existingUser = global.users.find(u => u.email === email && u.tenantId === tenantId);
    
    if (existingUser) {
      throw new AppError(409, 'User already exists', 'CONFLICT');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password: hashedPassword,
      name,
      role,
      tenantId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    global.users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async updateUser(userId: string, updateData: UpdateUserRequest, tenantId: string, updaterRole: string): Promise<Omit<User, 'password'>> {
    const userIndex = global.users.findIndex(u => u.id === userId && u.tenantId === tenantId);
    
    if (userIndex === -1) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    const currentUser = global.users[userIndex];
    
    if (!currentUser) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    // Check permissions
    if (updateData.role && !this.canUpdateUserRole(updaterRole, currentUser.role, updateData.role)) {
      throw new AppError(403, 'Insufficient permissions to update user role', 'AUTHORIZATION_ERROR');
    }

    // Check if email already exists (if updating email)
    if (updateData.email && updateData.email !== currentUser.email) {
      const existingUser = global.users.find(u => u.email === updateData.email && u.tenantId === tenantId);
      if (existingUser) {
        throw new AppError(409, 'Email already exists', 'CONFLICT');
      }
    }

    // Update user
    const updatedUser: User = {
      ...currentUser,
      ...updateData,
      updatedAt: new Date(),
    };

    global.users[userIndex] = updatedUser;

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(userId: string, tenantId: string, deleterRole: string): Promise<void> {
    const userIndex = global.users.findIndex(u => u.id === userId && u.tenantId === tenantId);
    
    if (userIndex === -1) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    const userToDelete = global.users[userIndex];
    
    if (!userToDelete) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    // Check permissions
    if (!this.canDeleteUser(deleterRole, userToDelete.role)) {
      throw new AppError(403, 'Insufficient permissions to delete this user', 'AUTHORIZATION_ERROR');
    }

    // Remove user
    global.users.splice(userIndex, 1);
  }

  async changePassword(userId: string, passwordData: ChangePasswordRequest, tenantId: string): Promise<void> {
    const userIndex = global.users.findIndex(u => u.id === userId && u.tenantId === tenantId);
    
    if (userIndex === -1) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    const user = global.users[userIndex];
    
    if (!user) {
      throw new AppError(404, 'User not found', 'NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(passwordData.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new AppError(400, 'Current password is incorrect', 'VALIDATION_ERROR');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(passwordData.newPassword);

    // Update password
    global.users[userIndex] = {
      ...user,
      password: hashedNewPassword,
      updatedAt: new Date(),
    };
  }

  // Permission helper methods
  private canCreateUser(creatorRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      'SUPER_ADMIN': 6,
      'TENANT_ADMIN': 5,
      'MANAGER': 4,
      'AGENT': 3,
      'USER': 2,
      'VIEWER': 1,
    };

    const creatorLevel = roleHierarchy[creatorRole as keyof typeof roleHierarchy] || 0;
    const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

    return creatorLevel >= targetLevel && creatorLevel >= 4; // MANAGER or above
  }

  private canUpdateUserRole(updaterRole: string, currentRole: string, newRole: string): boolean {
    const roleHierarchy = {
      'SUPER_ADMIN': 6,
      'TENANT_ADMIN': 5,
      'MANAGER': 4,
      'AGENT': 3,
      'USER': 2,
      'VIEWER': 1,
    };

    const updaterLevel = roleHierarchy[updaterRole as keyof typeof roleHierarchy] || 0;
    const currentLevel = roleHierarchy[currentRole as keyof typeof roleHierarchy] || 0;
    const newLevel = roleHierarchy[newRole as keyof typeof roleHierarchy] || 0;

    return updaterLevel > currentLevel && updaterLevel >= newLevel;
  }

  private canDeleteUser(deleterRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      'SUPER_ADMIN': 6,
      'TENANT_ADMIN': 5,
      'MANAGER': 4,
      'AGENT': 3,
      'USER': 2,
      'VIEWER': 1,
    };

    const deleterLevel = roleHierarchy[deleterRole as keyof typeof roleHierarchy] || 0;
    const targetLevel = roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

    return deleterLevel > targetLevel && deleterLevel >= 4; // MANAGER or above
  }
}