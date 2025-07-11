import { Router } from 'express';
import type { Request, Response } from 'express';

const router = Router();

// Stub implementations - will be replaced with actual implementations
router.get('/', (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Get users endpoint is under development',
    },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Get user by ID endpoint is under development',
    },
  });
});

router.post('/', (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Create user endpoint is under development',
    },
  });
});

router.put('/:id', (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Update user endpoint is under development',
    },
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Delete user endpoint is under development',
    },
  });
});

export default router;