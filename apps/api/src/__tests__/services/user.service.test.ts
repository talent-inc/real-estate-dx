import { UserService } from '../../services/user.service';
import { AppError } from '../../middlewares/error.middleware';
import { generateTestUser, generateTestAdmin } from '../helpers/auth.helper';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    global.users = [];
    global.userIdCounter = 1;
  });

  describe('getUsers', () => {
    beforeEach(() => {
      // Add test users
      global.users.push(
        generateTestUser({ id: 'user1', tenantId: 'tenant1', email: 'user1@test.com', role: 'USER' }),
        generateTestUser({ id: 'user2', tenantId: 'tenant1', email: 'user2@test.com', role: 'AGENT' }),
        generateTestUser({ id: 'user3', tenantId: 'tenant2', email: 'user3@test.com', role: 'USER' })
      );
    });

    it('should get users for specific tenant', async () => {
      const queryParams = {};
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users).toHaveLength(2);
      expect(result.users.every(user => user.tenantId === 'tenant1')).toBe(true);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter users by role', async () => {
      const queryParams = { role: 'AGENT' };
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe('AGENT');
      expect(result.total).toBe(1);
    });

    it('should search users by email', async () => {
      const queryParams = { search: 'user1' };
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('user1@test.com');
    });

    it('should paginate results', async () => {
      const queryParams = { page: 1, limit: 1 };
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should sort users by field', async () => {
      const queryParams = { sortBy: 'email', sortOrder: 'desc' as const };
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users[0].email).toBe('user2@test.com');
      expect(result.users[1].email).toBe('user1@test.com');
    });

    it('should filter by active status', async () => {
      // Mark one user as inactive
      global.users[0].isActive = false;
      
      const queryParams = { isActive: true };
      const result = await userService.getUsers('tenant1', queryParams);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].isActive).toBe(true);
    });

    it('should exclude passwords from results', async () => {
      const queryParams = {};
      const result = await userService.getUsers('tenant1', queryParams);

      result.users.forEach(user => {
        expect('password' in user).toBe(false);
      });
    });
  });

  describe('getUserById', () => {
    beforeEach(() => {
      global.users.push(
        generateTestUser({ id: 'user1', tenantId: 'tenant1' })
      );
    });

    it('should get user by id for correct tenant', async () => {
      const result = await userService.getUserById('user1', 'tenant1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('user1');
      expect(result?.tenantId).toBe('tenant1');
      expect('password' in (result || {})).toBe(false);
    });

    it('should return null for user in different tenant', async () => {
      const result = await userService.getUserById('user1', 'tenant2');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await userService.getUserById('nonexistent', 'tenant1');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER' as const,
        password: 'password123',
      };

      const result = await userService.createUser(userData, 'tenant1');

      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
      expect(result.lastName).toBe(userData.lastName);
      expect(result.role).toBe(userData.role);
      expect(result.tenantId).toBe('tenant1');
      expect('password' in result).toBe(false);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
        password: 'password123',
      };

      // Create first user
      await userService.createUser(userData, 'tenant1');

      // Try to create with same email
      await expect(userService.createUser(userData, 'tenant1')).rejects.toThrow(AppError);
      await expect(userService.createUser(userData, 'tenant1')).rejects.toThrow('Email already exists');
    });

    it('should allow same email in different tenants', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
        password: 'password123',
      };

      const user1 = await userService.createUser(userData, 'tenant1');
      const user2 = await userService.createUser(userData, 'tenant2');

      expect(user1.email).toBe(user2.email);
      expect(user1.tenantId).toBe('tenant1');
      expect(user2.tenantId).toBe('tenant2');
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
        password: 'password123',
      };

      await userService.createUser(userData, 'tenant1');

      const storedUser = global.users.find(u => u.email === userData.email);
      expect(storedUser?.password).toBeDefined();
      expect(storedUser?.password).not.toBe(userData.password);
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      global.users.push(
        generateTestUser({ id: 'user1', tenantId: 'tenant1', email: 'original@test.com' })
      );
    });

    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '123-456-7890',
      };

      const result = await userService.updateUser('user1', updateData, 'tenant1');

      expect(result).toBeDefined();
      expect(result.firstName).toBe(updateData.firstName);
      expect(result.lastName).toBe(updateData.lastName);
      expect(result.phone).toBe(updateData.phone);
      expect('password' in result).toBe(false);
    });

    it('should throw error for non-existent user', async () => {
      const updateData = { firstName: 'Updated' };

      await expect(userService.updateUser('nonexistent', updateData, 'tenant1')).rejects.toThrow(AppError);
      await expect(userService.updateUser('nonexistent', updateData, 'tenant1')).rejects.toThrow('User not found');
    });

    it('should throw error for user in different tenant', async () => {
      const updateData = { firstName: 'Updated' };

      await expect(userService.updateUser('user1', updateData, 'tenant2')).rejects.toThrow(AppError);
      await expect(userService.updateUser('user1', updateData, 'tenant2')).rejects.toThrow('User not found');
    });

    it('should update password if provided', async () => {
      const updateData = { password: 'newpassword123' };

      await userService.updateUser('user1', updateData, 'tenant1');

      const storedUser = global.users.find(u => u.id === 'user1');
      expect(storedUser?.password).toBeDefined();
      expect(storedUser?.password).not.toBe(updateData.password);
    });

    it('should throw error for duplicate email', async () => {
      // Add another user
      global.users.push(
        generateTestUser({ id: 'user2', tenantId: 'tenant1', email: 'another@test.com' })
      );

      const updateData = { email: 'another@test.com' };

      await expect(userService.updateUser('user1', updateData, 'tenant1')).rejects.toThrow(AppError);
      await expect(userService.updateUser('user1', updateData, 'tenant1')).rejects.toThrow('Email already exists');
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      global.users.push(
        generateTestUser({ id: 'user1', tenantId: 'tenant1' })
      );
    });

    it('should delete user successfully', async () => {
      await userService.deleteUser('user1', 'tenant1');

      const deletedUser = global.users.find(u => u.id === 'user1');
      expect(deletedUser).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(userService.deleteUser('nonexistent', 'tenant1')).rejects.toThrow(AppError);
      await expect(userService.deleteUser('nonexistent', 'tenant1')).rejects.toThrow('User not found');
    });

    it('should throw error for user in different tenant', async () => {
      await expect(userService.deleteUser('user1', 'tenant2')).rejects.toThrow(AppError);
      await expect(userService.deleteUser('user1', 'tenant2')).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    beforeEach(() => {
      global.users.push(
        generateTestUser({ id: 'user1', tenantId: 'tenant1' })
      );
    });

    it('should update user profile successfully', async () => {
      const profileData = {
        firstName: 'Updated',
        lastName: 'Profile',
        phone: '123-456-7890',
        settings: { theme: 'dark', language: 'ja' },
      };

      const result = await userService.updateUserProfile('user1', profileData, 'tenant1');

      expect(result.firstName).toBe(profileData.firstName);
      expect(result.lastName).toBe(profileData.lastName);
      expect(result.phone).toBe(profileData.phone);
      expect(result.settings).toEqual(profileData.settings);
    });

    it('should not allow role update through profile', async () => {
      const profileData = {
        firstName: 'Updated',
        role: 'TENANT_ADMIN', // This should be ignored
      };

      const result = await userService.updateUserProfile('user1', profileData as any, 'tenant1');

      expect(result.firstName).toBe(profileData.firstName);
      expect(result.role).not.toBe('TENANT_ADMIN'); // Should remain original role
    });
  });
});