import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
const authController = new AuthController();

// Apply rate limiting to authentication endpoints
router.use(authRateLimiter);

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: ユーザー認証とアカウント管理
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: ユーザーログイン
 *     description: メールアドレスとパスワードでログインし、JWTトークンを取得
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: ログイン成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: レート制限超過
 */
router.post('/login', authController.login.bind(authController));

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: ユーザー登録
 *     description: 新規ユーザーアカウントの作成
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - tenantId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *               firstName:
 *                 type: string
 *                 example: 太郎
 *               lastName:
 *                 type: string
 *                 example: 田中
 *               role:
 *                 type: string
 *                 enum: [TENANT_ADMIN, MANAGER, AGENT, USER]
 *                 default: USER
 *                 example: USER
 *               tenantId:
 *                 type: string
 *                 example: tenant_abc
 *               phone:
 *                 type: string
 *                 example: 090-1234-5678
 *     responses:
 *       201:
 *         description: ユーザー登録成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       409:
 *         description: メールアドレスが既に使用されています
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register', authController.register.bind(authController));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: トークンリフレッシュ
 *     description: リフレッシュトークンを使用してアクセストークンを更新
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: トークンリフレッシュ成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: ログアウト
 *     description: 現在のセッションからログアウト
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ログアウト成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: 現在のユーザー情報取得
 *     description: 認証されたユーザーの情報を取得
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ユーザー情報取得成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

// Development/testing routes (only available in development)
if (process.env.NODE_ENV === 'development') {
  /**
   * @swagger
   * /auth/users:
   *   get:
   *     summary: 全ユーザー取得（開発用）
   *     description: 開発環境でのみ利用可能。全ユーザーの一覧を取得
   *     tags: [Authentication]
   *     responses:
   *       200:
   *         description: ユーザー一覧取得成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   */
  router.get('/users', authController.getAllUsers.bind(authController));
}

export default router;