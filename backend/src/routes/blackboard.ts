/**
 * Blackboard API Routes
 * Handles all operations related to the blackboard system
 * @swagger
 * tags:
 *   name: Blackboard
 *   description: Company announcements and bulletin board (Schwarzes Brett)
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

// Import blackboard model (now ES modules)
import blackboardModel from '../models/blackboard';

const router: Router = express.Router();

// Configure multer for blackboard attachments
const storage = multer.diskStorage({
  destination: async (req, _file, cb) => {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenant_id || authReq.user.tenantId || 1;
    const uploadDir = `uploads/blackboard/${tenantId}`;

    // Ensure directory exists
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error: any) {
      cb(error, uploadDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur PDF und Bilder (JPEG, PNG, GIF) sind erlaubt!'));
    }
  },
});

// Extended Request interfaces
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    tenant_id?: number;
    tenantId?: number;
    role: string;
    departmentId?: number;
    teamId?: number;
    username?: string;
    email?: string;
  };
  entry?: any; // Set by middleware
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Removed unused interfaces - using AuthenticatedRequest directly

// Helper function to get tenant ID from user object
function getTenantId(user: AuthenticatedRequest['user']): number {
  return user.tenant_id || user.tenantId || 1;
}

// Helper function to check if user can manage the entry
async function canManageEntry(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const entryId = req.params.id;
    const authReq = req as AuthenticatedRequest;
    const tenantId = getTenantId(authReq.user);

    const entry = await blackboardModel.getEntryById(
      parseInt(entryId, 10),
      tenantId,
      authReq.user.id
    );

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    // Check if user is admin or the author of the entry
    const isAdmin =
      authReq.user.role === 'admin' || authReq.user.role === 'root';
    const isAuthor = entry.author_id === authReq.user.id;

    // Admins have permission always
    if (isAdmin) {
      req.entry = entry;
      return next();
    }

    // Authors only if they're not admins
    if (isAuthor) {
      req.entry = entry;
      return next();
    }

    // Neither admin nor author
    res
      .status(403)
      .json({ message: 'You do not have permission to manage this entry' });
  } catch (error: any) {
    console.error('Error in canManageEntry middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to check if user can create entry for specified org level
async function canCreateForOrgLevel(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const { org_level, org_id } = req.body;
    const { role, departmentId, teamId } = authReq.user;

    // Admins can create entries for any org level
    if (role === 'admin' || role === 'root') {
      return next();
    }

    // Check permissions based on org level
    if (org_level === 'company') {
      res
        .status(403)
        .json({ message: 'Only admins can create company-wide entries' });
      return;
    }

    if (org_level === 'department') {
      // Check if user is department head
      if (role !== 'department_head' || departmentId !== Number(org_id)) {
        res.status(403).json({
          message:
            'You can only create department entries for your own department',
        });
        return;
      }
    }

    if (org_level === 'team') {
      // Check if user is team leader
      if (role !== 'team_leader' || teamId !== Number(org_id)) {
        res.status(403).json({
          message: 'You can only create team entries for your own team',
        });
        return;
      }
    }

    next();
  } catch (error: any) {
    console.error('Error in canCreateForOrgLevel middleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * @swagger
 * /blackboard:
 *   get:
 *     summary: Get all blackboard entries
 *     description: Retrieve all blackboard entries visible to the user with pagination and filtering
 *     tags: [Blackboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived]
 *           default: active
 *         description: Filter by entry status
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [all, company, department, team, personal]
 *           default: all
 *         description: Filter by visibility scope
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 18
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at, title, priority]
 *           default: created_at
 *         description: Sort by field
 *       - in: query
 *         name: sortDir
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Blackboard entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlackboardEntry'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @route GET /api/blackboard
 * @desc Get all blackboard entries visible to the user
 */
router.get('/', authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = getTenantId(authReq.user);

    const options = {
      status: String(req.query.status || 'active'),
      filter: String(req.query.filter || 'all'),
      search: String(req.query.search || ''),
      page: parseInt(String(req.query.page || '1'), 10),
      limit: parseInt(String(req.query.limit || '18'), 10),
      sortBy: String(req.query.sortBy || 'created_at'),
      sortDir: String(req.query.sortDir || 'DESC'),
    };

    const result = await blackboardModel.getAllEntries(
      tenantId,
      authReq.user.id,
      options as any
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error in GET /api/blackboard:', error);
    res.status(500).json({ message: 'Error retrieving blackboard entries' });
  }
});

/**
 * @route GET /api/blackboard/dashboard
 * @desc Get blackboard entries for dashboard widget
 */
router.get('/dashboard', authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = getTenantId(authReq.user);
    const limit = parseInt(String(req.query.limit || '3'), 10);

    const entries = await blackboardModel.getDashboardEntries(
      tenantId,
      authReq.user.id,
      limit
    );
    res.json(entries);
  } catch (error: any) {
    console.error('Error in GET /api/blackboard/dashboard:', error);
    res.status(500).json({ message: 'Error retrieving dashboard entries' });
  }
});

/**
 * @route GET /api/blackboard/entries
 * @desc Alias for GET /api/blackboard - for backwards compatibility
 */
router.get('/entries', authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = getTenantId(authReq.user);

    const options = {
      status: String(req.query.status || 'active'),
      filter: String(req.query.filter || 'all'),
      search: String(req.query.search || ''),
      page: parseInt(String(req.query.page || '1'), 10),
      limit: parseInt(String(req.query.limit || '18'), 10),
      sortBy: String(req.query.sortBy || 'created_at'),
      sortDir: String(req.query.sortOrder || req.query.sortDir || 'DESC'),
    };

    const result = await blackboardModel.getAllEntries(
      tenantId,
      authReq.user.id,
      options as any
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error in GET /api/blackboard/entries:', error);
    res.status(500).json({ message: 'Error retrieving blackboard entries' });
  }
});

/**
 * @route GET /api/blackboard/:id
 * @desc Get a specific blackboard entry
 */
router.get('/:id', authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = getTenantId(authReq.user);

    const entry = await blackboardModel.getEntryById(
      parseInt(req.params.id, 10),
      tenantId,
      authReq.user.id
    );

    if (!entry) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Error in GET /api/blackboard/:id:', error);
    res.status(500).json({ message: 'Error retrieving blackboard entry' });
  }
});

/**
 * @swagger
 * /blackboard:
 *   post:
 *     summary: Create blackboard entry
 *     description: Create a new blackboard entry with optional file attachment
 *     tags: [Blackboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - org_level
 *             properties:
 *               title:
 *                 type: string
 *                 description: Entry title
 *                 example: Wichtige Ankündigung
 *               content:
 *                 type: string
 *                 description: Entry content (supports Markdown)
 *                 example: Dies ist eine wichtige Mitteilung für alle Mitarbeiter.
 *               org_level:
 *                 type: string
 *                 enum: [company, department, team]
 *                 description: Organizational level
 *               org_id:
 *                 type: integer
 *                 description: Department/Team ID (not needed for company level)
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *                 description: Entry priority
 *               color:
 *                 type: string
 *                 enum: [blue, green, yellow, red, purple]
 *                 default: blue
 *                 description: Display color
 *               expires_at:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date (optional)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *               requires_confirmation:
 *                 type: boolean
 *                 default: false
 *                 description: Whether users must confirm reading
 *               attachment:
 *                 type: string
 *                 format: binary
 *                 description: Optional file attachment (PDF, JPEG, PNG, GIF - max 10MB)
 *     responses:
 *       201:
 *         description: Entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Blackboard entry created successfully
 *                 entry:
 *                   $ref: '#/components/schemas/BlackboardEntry'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - No permission for this org level
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: You do not have permission to create entries at this level
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Nur PDF und Bilder (JPEG, PNG, GIF) sind erlaubt!
 *       500:
 *         description: Server error
 */
/**
 * @route POST /api/blackboard
 * @desc Create a new blackboard entry (with optional direct attachment)
 */
router.post(
  '/',
  authenticateToken,
  upload.single('attachment'), // Handle single file upload
  canCreateForOrgLevel,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = getTenantId(authReq.user);

      // Convert org_id to number if it's a string, or set to null for company level
      let org_id = req.body.org_id;
      if (req.body.org_level === 'company') {
        org_id = null;
      } else if (typeof org_id === 'string') {
        org_id = parseInt(org_id, 10);
      }

      // Handle priority_level vs priority field name
      const priority = req.body.priority || req.body.priority_level || 'normal';

      const entryData = {
        tenant_id: tenantId,
        title: req.body.title,
        content: req.body.content,
        org_level: req.body.org_level,
        org_id,
        author_id: authReq.user.id,
        expires_at: req.body.expires_at || null,
        priority,
        color: req.body.color || 'blue',
        tags: req.body.tags || [],
        requires_confirmation: req.body.requires_confirmation || false,
      };

      // Create the entry
      const entry = await blackboardModel.createEntry(entryData);

      if (!entry) {
        res.status(500).json({
          message: 'Failed to create blackboard entry',
        });
        return;
      }

      // If there's an uploaded file, add it as an attachment
      if (authReq.file) {
        try {
          const attachmentId = await blackboardModel.addAttachment(entry.id, {
            filename: authReq.file.filename,
            originalName: authReq.file.originalname,
            fileSize: authReq.file.size,
            mimeType: authReq.file.mimetype,
            filePath: authReq.file.path,
            uploadedBy: authReq.user.id,
          });

          // Update entry with minimal attachment info for response
          // The full attachment data will be loaded when fetching the entry
          (entry as any).attachments = [
            {
              id: attachmentId,
              filename: authReq.file.filename,
              original_name: authReq.file.originalname,
              file_size: authReq.file.size,
              mime_type: authReq.file.mimetype,
            },
          ];

          logger.info(
            `User ${authReq.user.id} created entry ${entry?.id} with direct attachment ${attachmentId}`
          );
        } catch (attachError: any) {
          // If attachment fails, still return the created entry
          logger.error(
            `Failed to add attachment to entry ${entry?.id}:`,
            attachError
          );
        }
      }

      res.status(201).json(entry);
    } catch (error: any) {
      console.error('Error in POST /api/blackboard:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: 'Error creating blackboard entry',
        error: error.message,
      });
    }
  }
);

/**
 * @route PUT /api/blackboard/:id
 * @desc Update a blackboard entry
 */
router.put(
  '/:id',
  authenticateToken,
  canManageEntry as any,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const entryData = {
        author_id: authReq.user.id,
        title: req.body.title,
        content: req.body.content,
        org_level: req.body.org_level,
        org_id: req.body.org_id,
        priority: req.body.priority,
        color: req.body.color,
        tags: req.body.tags,
        expires_at: req.body.expires_at,
        requires_confirmation: req.body.requires_confirmation,
        status: req.body.status,
      };

      const tenantId = getTenantId(authReq.user);
      const updatedEntry = await blackboardModel.updateEntry(
        parseInt(req.params.id, 10),
        entryData,
        tenantId
      );

      res.json(updatedEntry);
    } catch (error: any) {
      console.error('Error in PUT /api/blackboard/:id:', error);
      res.status(500).json({ message: 'Error updating blackboard entry' });
    }
  }
);

/**
 * @route DELETE /api/blackboard/:id
 * @desc Delete a blackboard entry
 */
router.delete(
  '/:id',
  authenticateToken,
  canManageEntry as any,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = getTenantId(authReq.user);
      const success = await blackboardModel.deleteEntry(
        parseInt(req.params.id, 10),
        tenantId
      );

      if (!success) {
        res.status(404).json({ message: 'Entry not found' });
        return;
      }

      res.json({ message: 'Entry deleted successfully' });
    } catch (error: any) {
      console.error('Error in DELETE /api/blackboard/:id:', error);
      res.status(500).json({ message: 'Error deleting blackboard entry' });
    }
  }
);

/**
 * @route POST /api/blackboard/:id/confirm
 * @desc Mark a blackboard entry as read
 */
router.post(
  '/:id/confirm',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const success = await blackboardModel.confirmEntry(
        parseInt(req.params.id, 10),
        authReq.user.id
      );

      if (!success) {
        res.status(400).json({
          message: 'Entry does not exist or does not require confirmation',
        });
        return;
      }

      res.json({ message: 'Entry confirmed successfully' });
    } catch (error: any) {
      console.error('Error in POST /api/blackboard/:id/confirm:', error);
      res.status(500).json({ message: 'Error confirming blackboard entry' });
    }
  }
);

/**
 * @route GET /api/blackboard/:id/confirmations
 * @desc Get confirmation status for an entry
 */
router.get(
  '/:id/confirmations',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Only admins can view confirmation status
      if (authReq.user.role !== 'admin' && authReq.user.role !== 'root') {
        res
          .status(403)
          .json({ message: 'Only admins can view confirmation status' });
        return;
      }
      const tenantId = getTenantId(authReq.user);
      const confirmations = await blackboardModel.getConfirmationStatus(
        parseInt(req.params.id, 10),
        tenantId
      );

      res.json(confirmations);
    } catch (error: any) {
      console.error('Error in GET /api/blackboard/:id/confirmations:', error);
      res.status(500).json({ message: 'Error retrieving confirmation status' });
    }
  }
);

/**
 * @route POST /api/blackboard/:id/attachments
 * @desc Upload attachments to a blackboard entry
 */
router.post(
  '/:id/attachments',
  authenticateToken,
  canManageEntry as any,
  upload.array('attachments', 5), // Max 5 files at once
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const entryId = parseInt(req.params.id, 10);
      const files = authReq.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ message: 'Keine Dateien hochgeladen' });
        return;
      }

      const attachments = [];

      for (const file of files) {
        const attachmentId = await blackboardModel.addAttachment(entryId, {
          filename: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          filePath: file.path,
          uploadedBy: authReq.user.id,
        });

        attachments.push({
          id: attachmentId,
          filename: file.filename,
          original_name: file.originalname,
          size: file.size,
          mime_type: file.mimetype,
        });
      }

      logger.info(
        `User ${authReq.user.id} uploaded ${attachments.length} attachments to entry ${entryId}`
      );

      res.status(201).json({
        message: 'Anhänge erfolgreich hochgeladen',
        attachments,
      });
    } catch (error: any) {
      console.error('Error in POST /api/blackboard/:id/attachments:', error);
      res.status(500).json({
        message: 'Fehler beim Hochladen der Anhänge',
        error: error.message,
      });
    }
  }
);

/**
 * @route GET /api/blackboard/:id/attachments
 * @desc Get all attachments for a blackboard entry
 */
router.get(
  '/:id/attachments',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const entryId = parseInt(req.params.id, 10);
      const attachments = await blackboardModel.getEntryAttachments(entryId);
      res.json(attachments);
    } catch (error: any) {
      console.error('Error in GET /api/blackboard/:id/attachments:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Anhänge' });
    }
  }
);

/**
 * @route GET /api/blackboard/attachments/:attachmentId
 * @desc Download a specific attachment
 */
router.get(
  '/attachments/:attachmentId',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = getTenantId(authReq.user);
      const attachmentId = parseInt(req.params.attachmentId, 10);

      const attachment = await blackboardModel.getAttachmentById(
        attachmentId,
        tenantId
      );

      if (!attachment) {
        res.status(404).json({ message: 'Anhang nicht gefunden' });
        return;
      }

      // Check if file exists
      try {
        await fs.access(attachment.file_path);
      } catch {
        res.status(404).json({ message: 'Datei nicht gefunden' });
        return;
      }

      // Set appropriate headers
      // Use 'inline' for preview, 'attachment' only if download is requested
      const disposition =
        req.query.download === 'true' ? 'attachment' : 'inline';
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${attachment.original_name}"`
      );
      res.setHeader('Content-Type', attachment.mime_type);

      // Override X-Frame-Options to allow embedding
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');

      // Send file
      res.sendFile(path.resolve(attachment.file_path));
    } catch (error: any) {
      console.error('Error in GET /api/blackboard/attachments/:id:', error);
      res.status(500).json({ message: 'Fehler beim Herunterladen der Datei' });
    }
  }
);

/**
 * @route GET /api/blackboard/attachments/:attachmentId/preview
 * @desc Get a preview of an attachment (optimized for inline display)
 */
router.get(
  '/attachments/:attachmentId/preview',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = getTenantId(authReq.user);
      const attachmentId = parseInt(req.params.attachmentId, 10);

      const attachment = await blackboardModel.getAttachmentById(
        attachmentId,
        tenantId
      );

      if (!attachment) {
        res.status(404).json({ message: 'Anhang nicht gefunden' });
        return;
      }

      // Check if file exists
      try {
        await fs.access(attachment.file_path);
      } catch {
        res.status(404).json({ message: 'Datei nicht gefunden' });
        return;
      }

      // Set appropriate headers for preview
      res.setHeader('Content-Type', attachment.mime_type);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${attachment.original_name}"`
      );

      // Add cache headers for better performance
      res.setHeader('Cache-Control', 'public, max-age=3600');

      // Override X-Frame-Options to allow embedding
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');

      // Send file
      res.sendFile(path.resolve(attachment.file_path));
    } catch (error: any) {
      console.error(
        'Error in GET /api/blackboard/attachments/:id/preview:',
        error
      );
      res.status(500).json({ message: 'Fehler beim Laden der Vorschau' });
    }
  }
);

/**
 * @route DELETE /api/blackboard/attachments/:attachmentId
 * @desc Delete an attachment
 */
router.delete(
  '/attachments/:attachmentId',
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = getTenantId(authReq.user);
      const attachmentId = parseInt(req.params.attachmentId, 10);

      // Get attachment details before deletion
      const attachment = await blackboardModel.getAttachmentById(
        attachmentId,
        tenantId
      );

      if (!attachment) {
        res.status(404).json({ message: 'Anhang nicht gefunden' });
        return;
      }

      // Check if user can delete (must be uploader or admin)
      if (
        authReq.user.role !== 'admin' &&
        authReq.user.role !== 'root' &&
        attachment.uploaded_by !== authReq.user.id
      ) {
        res.status(403).json({
          message: 'Keine Berechtigung zum Löschen dieses Anhangs',
        });
        return;
      }

      // Delete from database
      const deleted = await blackboardModel.deleteAttachment(
        attachmentId,
        tenantId
      );

      if (deleted) {
        // Try to delete physical file
        try {
          await fs.unlink(attachment.file_path);
        } catch (error) {
          logger.warn(`Could not delete file ${attachment.file_path}:`, error);
        }

        logger.info(
          `User ${authReq.user.id} deleted attachment ${attachmentId}`
        );

        res.json({ message: 'Anhang erfolgreich gelöscht' });
      } else {
        res.status(500).json({ message: 'Fehler beim Löschen des Anhangs' });
      }
    } catch (error: any) {
      console.error('Error in DELETE /api/blackboard/attachments/:id:', error);
      res.status(500).json({ message: 'Fehler beim Löschen des Anhangs' });
    }
  }
);

export default router;

// CommonJS compatibility
