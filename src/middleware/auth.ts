// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔐 Auth middleware called');
    
    const authHeader = req.header('Authorization');
    console.log('📋 Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for user:', (decoded as any).userId);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', (error as Error).message);
    
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    res.status(401).json({ 
      success: false, 
      message: 'Please authenticate' 
    });
  }
};

export default auth;