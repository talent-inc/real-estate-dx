import { AuthService } from '../../services/auth.service';
import { AppError } from '../../middlewares/error.middleware';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    global.users = [];
    global.userIdCounter = 1;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        tenantId: 'tenant_test',
      };

      const result = await authService.register(registerData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.firstName).toBe(registerData.firstName);
      expect(result.user.lastName).toBe(registerData.lastName);
      expect(result.user.role).toBe(registerData.role);
      expect(result.user.tenantId).toBe(registerData.tenantId);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect('password' in result.user).toBe(false);
    });

    it('should throw error if email already exists', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        tenantId: 'tenant_test',
      };

      // Register first user
      await authService.register(registerData);

      // Try to register with same email
      await expect(authService.register(registerData)).rejects.toThrow(AppError);
      await expect(authService.register(registerData)).rejects.toThrow('Email already exists');
    });

    it('should hash password before storing', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        tenantId: 'tenant_test',
      };

      await authService.register(registerData);

      const storedUser = global.users.find(u => u.email === registerData.email);
      expect(storedUser).toBeDefined();
      expect(storedUser!.password).not.toBe(registerData.password);
      expect(await bcrypt.compare(registerData.password, storedUser!.password)).toBe(true);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        tenantId: 'tenant_test',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(loginData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect('password' in result.user).toBe(false);
    });

    it('should throw error with invalid email', async () => {
      const loginData = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      // Mark user as inactive
      const user = global.users.find(u => u.email === 'test@example.com');
      if (user) {
        user.isActive = false;
      }

      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(AppError);
      await expect(authService.login(loginData)).rejects.toThrow('Account is inactive');
    });

    it('should update lastLoginAt on successful login', async () => {
      const beforeLogin = new Date();
      
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      const user = global.users.find(u => u.email === 'test@example.com');
      expect(user?.lastLoginAt).toBeDefined();
      expect(user?.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
    });
  });

  describe('refreshToken', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        tenantId: 'tenant_test',
      });
      refreshToken = result.refreshToken;
    });

    it('should refresh token successfully with valid refresh token', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it('should throw error with invalid refresh token', async () => {
      const invalidToken = 'invalid.refresh.token';

      await expect(authService.refreshToken(invalidToken)).rejects.toThrow(AppError);
      await expect(authService.refreshToken(invalidToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('validateToken', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        tenantId: 'tenant_test',
      });
      accessToken = result.accessToken;
      userId = result.user.id;
    });

    it('should validate token successfully', async () => {
      const result = await authService.validateToken(accessToken);

      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.email).toBe('test@example.com');
      expect(result.role).toBe('USER');
      expect(result.tenantId).toBe('tenant_test');
    });

    it('should throw error with invalid token', async () => {
      const invalidToken = 'invalid.access.token';

      await expect(authService.validateToken(invalidToken)).rejects.toThrow(AppError);
      await expect(authService.validateToken(invalidToken)).rejects.toThrow('Invalid token');
    });

    it('should throw error if user not found', async () => {
      // Remove user from storage
      global.users = [];

      await expect(authService.validateToken(accessToken)).rejects.toThrow(AppError);
      await expect(authService.validateToken(accessToken)).rejects.toThrow('User not found');
    });

    it('should throw error if user is inactive', async () => {
      // Mark user as inactive
      const user = global.users.find(u => u.id === userId);
      if (user) {
        user.isActive = false;
      }

      await expect(authService.validateToken(accessToken)).rejects.toThrow(AppError);
      await expect(authService.validateToken(accessToken)).rejects.toThrow('User is inactive');
    });
  });
});