/**
 * Vereinheitlichte Authentifizierungsbibliothek
 *
 * Diese Datei stellt alle Authentifizierungsfunktionen für die gesamte Anwendung bereit.
 * Sie ersetzt sowohl auth.js als auch middleware/auth.js, um Inkonsistenzen zu vermeiden.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import UserModel from './models/user';
import { DatabaseUser } from './types';
import { TokenPayload, TokenValidationResult } from './types/auth.types';

// Konstante für das JWT-Secret aus der Umgebungsvariable
const JWT_SECRET: string =
  process.env.JWT_SECRET || 'fallback_secret_nur_fuer_entwicklung';

// Helper function to convert DbUser to DatabaseUser
function dbUserToDatabaseUser(dbUser: any): DatabaseUser {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    password_hash: dbUser.password || '',
    first_name: dbUser.first_name,
    last_name: dbUser.last_name,
    role: dbUser.role,
    tenant_id: dbUser.tenant_id,
    department_id: dbUser.department_id,
    is_active:
      dbUser.is_active === true ||
      (dbUser.is_active as any) === 1 ||
      (dbUser.is_active as any) === '1',
    is_archived: dbUser.is_archived || false,
    profile_picture: dbUser.profile_picture,
    phone_number: dbUser.phone || null,
    position: dbUser.position,
    hire_date: dbUser.hire_date,
    birth_date: dbUser.birthday || null,
    created_at: dbUser.created_at || new Date(),
    updated_at: dbUser.updated_at || new Date(),
  };
}

/**
 * Benutzerauthentifizierung mit Benutzername/E-Mail und Passwort
 */
export interface AuthUserResult {
  user: DatabaseUser | null;
  error?: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'USER_INACTIVE';
}

export async function authenticateUser(
  usernameOrEmail: string,
  password: string
): Promise<AuthUserResult> {
  console.log('[DEBUG] authenticateUser called with:', usernameOrEmail);
  try {
    // Try to find user by username first
    console.log('[DEBUG] Looking up user by username...');
    let user = await UserModel.findByUsername(usernameOrEmail);

    // If not found by username, try by email
    if (!user) {
      console.log('[DEBUG] Not found by username, trying email...');
      user = await UserModel.findByEmail(usernameOrEmail);
    }

    if (!user) {
      console.log('[DEBUG] User not found');
      return { user: null, error: 'USER_NOT_FOUND' };
    }

    console.log(
      '[DEBUG] User found:',
      user.username,
      'tenant_id:',
      user.tenant_id,
      'is_active:',
      user.is_active
    );
    const isValid = await bcrypt.compare(password, user.password);
    console.log('[DEBUG] Password comparison result:', isValid);
    if (isValid) {
      // Check if user is active
      if (
        user.is_active === false ||
        (user.is_active as any) === 0 ||
        (user.is_active as any) === '0'
      ) {
        console.log('[DEBUG] User is inactive, denying access');
        return { user: null, error: 'USER_INACTIVE' };
      }
      return { user: dbUserToDatabaseUser(user) };
    } else {
      return { user: null, error: 'INVALID_PASSWORD' };
    }
  } catch (error) {
    console.error(
      `Error during authentication for user ${usernameOrEmail}:`,
      error
    );
    throw error;
  }
}

/**
 * Token-Generierung für authentifizierte Benutzer
 */
export function generateToken(user: DatabaseUser): string {
  try {
    const payload: TokenPayload = {
      id: parseInt(user.id.toString(), 10), // Ensure ID is a number
      username: user.username,
      role: user.role as TokenPayload['role'],
      tenant_id: user.tenant_id
        ? parseInt(user.tenant_id.toString(), 10)
        : null,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    return token;
  } catch (error) {
    console.error(`Error generating token for user ${user.username}:`, error);
    throw error;
  }
}

/**
 * Middleware zur Token-Authentifizierung
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];

  // Try to get token from Authorization header first
  let token = authHeader && authHeader.split(' ')[1];

  // If no token in header, try cookie (for HTML pages)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Debug logging
  console.log('Auth check - Path:', req.path);
  console.log('Auth check - Headers:', req.headers);
  console.log('Auth check - Cookies:', req.cookies);
  console.log('Auth check - Token found:', !!token);

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded || typeof decoded === 'string') {
      res.status(403).json({
        error: 'Invalid or expired token',
        details: err?.message,
      });
      return;
    }

    const user = decoded as TokenPayload & {
      activeRole?: string;
      isRoleSwitched?: boolean;
    };

    // Normalize user object for consistency and ensure IDs are numbers
    const authenticatedUser: any = {
      id: parseInt(user.id.toString(), 10),
      userId: parseInt(user.id.toString(), 10),
      username: user.username,
      email: '', // Will be filled from database if needed
      firstName: '',
      lastName: '',
      role: user.role,
      activeRole: user.activeRole || user.role, // Support für Dual-Role
      isRoleSwitched: user.isRoleSwitched || false,
      tenantId: user.tenant_id ? parseInt(user.tenant_id.toString(), 10) : null,
      tenant_id: user.tenant_id,
      departmentId: null,
      isActive: true,
      isArchived: false,
      profilePicture: null,
      phoneNumber: null,
      position: null,
      hireDate: null,
      birthDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    req.user = authenticatedUser;
    // Set tenantId directly on req for backwards compatibility
    (req as any).tenantId = authenticatedUser.tenantId;
    next();
  });
}

/**
 * Middleware zur Rollenbasierte Autorisierung
 */
export function authorizeRole(role: 'admin' | 'employee' | 'root') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Root hat Zugriff auf alles
    if (req.user.role === 'root') {
      next();
      return;
    }

    // Admin hat Zugriff auf Admin- und Employee-Ressourcen
    if (
      req.user.role === 'admin' &&
      (role === 'admin' || role === 'employee')
    ) {
      next();
      return;
    }

    // Genauer Rollen-Match
    if (req.user.role === role) {
      next();
      return;
    }

    res.status(403).send('Unauthorized');
  };
}

/**
 * Token-Validierung ohne Middleware-Kontext
 * Nützlich für Tests und andere nicht-Express-Kontexte
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return {
      valid: true,
      user: decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export for backwards compatibility
export { JWT_SECRET };
