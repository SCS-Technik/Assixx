/**
 * Shift Planning Routes
 * API endpoints for shift planning system
 */

import express, { Router, Request } from "express";
import { authenticateToken } from "../auth";

// Import models (now ES modules)
import Shift, { ShiftPlanFilters, ShiftExchangeFilters } from "../models/shift";
import db from "../database";

const router: Router = express.Router();

// Extended Request interfaces
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    tenant_id: number;
  };
}

/* Unused interfaces - kept for future reference
interface ShiftTemplatesRequest extends AuthenticatedRequest {}

interface ShiftCreateTemplateRequest extends AuthenticatedRequest {
  body: {
    name: string;
    start_time: string;
    end_time: string;
    break_duration?: number;
    required_staff?: number;
    description?: string;
    color?: string;
    is_active?: boolean;
  };
}

interface ShiftPlansRequest extends AuthenticatedRequest {
  query: {
    department_id?: string;
    team_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: string;
    limit?: string;
  };
}

interface ShiftCreatePlanRequest extends AuthenticatedRequest {
  body: {
    name: string;
    start_date: string;
    end_date: string;
    department_id?: number;
    team_id?: number;
    description?: string;
    status?: string;
  };
}

interface ShiftPlanByIdRequest extends AuthenticatedRequest {
  params: {
    planId: string;
  };
}

interface ShiftCreateRequest extends AuthenticatedRequest {
  body: {
    shift_plan_id?: number;
    template_id?: number;
    date: string;
    start_time: string;
    end_time: string;
    break_duration?: number;
    required_staff?: number;
    department_id?: number;
    team_id?: number;
    description?: string;
    notes?: string;
  };
}

interface ShiftAssignRequest extends AuthenticatedRequest {
  params: {
    shiftId: string;
  };
  body: {
    user_id: number;
    role?: string;
    notes?: string;
    status?: string;
  };
}

interface ShiftAvailabilityGetRequest extends AuthenticatedRequest {
  query: {
    start_date: string;
    end_date: string;
    user_id?: string;
  };
}

interface ShiftAvailabilitySetRequest extends AuthenticatedRequest {
  body: {
    user_id?: number;
    date: string;
    availability_type: string;
    start_time?: string;
    end_time?: string;
    notes?: string;
  };
}
*/

/* More unused interfaces - kept for future reference
interface ShiftExchangeRequestsRequest extends AuthenticatedRequest {
  query: {
    status?: string;
    limit?: string;
  };
}

interface ShiftCreateExchangeRequest extends AuthenticatedRequest {
  body: {
    original_shift_id: number;
    requested_date?: string;
    requested_time?: string;
    reason?: string;
    notes?: string;
  };
}

interface ShiftMyShiftsRequest extends AuthenticatedRequest {
  query: {
    start_date: string;
    end_date: string;
  };
}

interface ShiftDashboardRequest extends AuthenticatedRequest {}

interface ShiftWeeklyRequest extends AuthenticatedRequest {
  query: {
    start_date: string;
    end_date: string;
  };
}
*/

/* Unused interfaces - kept for future reference
interface ShiftWeeklyNotesGetRequest extends AuthenticatedRequest {
  query: {
    week: string;
    year: string;
  };
}

interface ShiftWeeklyNotesSetRequest extends AuthenticatedRequest {
  body: {
    week: string;
    year: string;
    notes?: string;
    context?: string;
  };
}
*/

// Middleware to check shift planning feature - temporarily disabled
// router.use(checkFeature('shift_planning'));

/**
 * Get all shift templates
 * GET /api/shifts/templates
 */
router.get("/templates", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    // Use default tenant ID 1 for now (can be improved later)
    const tenantId = authReq.user.tenant_id || 1;
    const templates = await Shift.getShiftTemplates(tenantId);
    res.json({ templates });
  } catch (error: any) {
    console.error("Error fetching shift templates:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Schichtvorlagen",
    });
  }
});

/**
 * Create a new shift template
 * POST /api/shifts/templates
 */
router.post(
  "/templates",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has permission to create templates (admin, manager, team_lead)
      const userRole = authReq.user.role;
      if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: "Keine Berechtigung zum Erstellen von Schichtvorlagen",
        });
        return;
      }

      const templateData = {
        ...req.body,
        tenant_id: authReq.user.tenant_id || 1,
        created_by: authReq.user.id,
      };

      const template = await Shift.createShiftTemplate(templateData);
      res.status(201).json({
        success: true,
        message: "Schichtvorlage erfolgreich erstellt",
        template,
      });
    } catch (error: any) {
      console.error("Error creating shift template:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Fehler beim Erstellen der Schichtvorlage",
      });
    }
  },
);

/**
 * Get all shift plans
 * GET /api/shifts/plans
 */
router.get("/plans", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const options: ShiftPlanFilters = {
      department_id: req.query.department_id
        ? parseInt(String(req.query.department_id), 10)
        : undefined,
      team_id: req.query.team_id
        ? parseInt(String(req.query.team_id), 10)
        : undefined,
      start_date: req.query.start_date
        ? String(req.query.start_date)
        : undefined,
      end_date: req.query.end_date ? String(req.query.end_date) : undefined,
      status: req.query.status
        ? (String(req.query.status) as "draft" | "published" | "archived")
        : undefined,
      page: parseInt(String(req.query.page || "1"), 10),
      limit: parseInt(String(req.query.limit || "20"), 10),
    };

    // Use the actual model function
    const tenantId = authReq.user.tenant_id || 1;
    const userId = authReq.user.id;
    const result = await Shift.getShiftPlans(tenantId, userId, options);
    res.json(result);
  } catch (error: any) {
    console.error("Error fetching shift plans:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Schichtpläne",
    });
  }
});

/**
 * Create a new shift plan
 * POST /api/shifts/plans
 */
router.post("/plans", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    // Check if user has permission to create plans (admin, manager, team_lead)
    const userRole = authReq.user.role;
    if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Keine Berechtigung zum Erstellen von Schichtplänen",
      });
      return;
    }

    // Validate required fields
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: "Name, Startdatum und Enddatum sind erforderlich",
      });
      return;
    }

    const planData = {
      ...req.body,
      tenant_id: authReq.user.tenant_id || 1,
      created_by: authReq.user.id,
    };

    // Use the actual model function
    const plan = await Shift.createShiftPlan(planData);
    res.status(201).json({
      success: true,
      message: "Schichtplan erfolgreich erstellt",
      plan,
    });
  } catch (error: any) {
    console.error("Error creating shift plan:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Fehler beim Erstellen des Schichtplans",
    });
  }
});

/**
 * Get shifts for a specific plan
 * GET /api/shifts/plans/:planId/shifts
 */
router.get(
  "/plans/:planId/shifts",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const planId = parseInt(req.params.planId);
      const shifts = await Shift.getShiftsByPlan(
        planId,
        authReq.user.tenant_id || 1,
        authReq.user.id,
      );
      res.json({ shifts });
    } catch (error: any) {
      console.error("Error fetching shifts for plan:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Fehler beim Laden der Schichten",
      });
    }
  },
);

/**
 * Get shifts for date range
 * GET /api/shifts?start=...&end=...
 */
router.get("/", authenticateToken, async (req, res): Promise<void> => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      res.status(400).json({
        success: false,
        message: "Start- und Enddatum sind erforderlich",
      });
      return;
    }

    // Parse dates from query strings
    const startDate = new Date(String(start));
    const endDate = new Date(String(end));

    // Format dates for SQL query
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    // Temporarily return empty shifts array
    // TODO: Implement proper shift fetching when shifts table is created
    console.log(`Shifts requested for date range: ${startStr} to ${endStr}`);

    res.json({
      success: true,
      shifts: [],
    });
  } catch (error: any) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Schichten",
    });
  }
});

/**
 * Get shift notes for a week
 * GET /api/shifts/notes?week=...
 */
router.get("/notes", authenticateToken, async (req, res): Promise<void> => {
  try {
    const { week } = req.query;

    if (!week) {
      res.status(400).json({
        success: false,
        message: "Woche ist erforderlich",
      });
      return;
    }

    // Parse week date
    const weekDate = new Date(String(week));
    const weekStart = weekDate.toISOString().split("T")[0];

    // Calculate week end (7 days later)
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Temporarily return empty notes
    // TODO: Implement proper notes fetching when shift_notes table is created
    console.log(
      `Shift notes requested for week: ${weekStart} to ${weekEndStr}`,
    );

    res.json({
      success: true,
      notes: {},
    });
  } catch (error: any) {
    console.error("Error fetching shift notes:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Notizen",
    });
  }
});

/**
 * Create a new shift
 * POST /api/shifts
 */
router.post("/", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    // Check if user has permission to create shifts (admin, manager, team_lead)
    const userRole = authReq.user.role;
    if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
      res.status(403).json({
        success: false,
        message: "Keine Berechtigung zum Erstellen von Schichten",
      });
      return;
    }

    const shiftData = {
      ...req.body,
      tenant_id: authReq.user.tenant_id || 1,
      created_by: authReq.user.id,
    };

    const shift = await Shift.createShift(shiftData);
    res.status(201).json({
      success: true,
      message: "Schicht erfolgreich erstellt",
      shift,
    });
  } catch (error: any) {
    console.error("Error creating shift:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Fehler beim Erstellen der Schicht",
    });
  }
});

/**
 * Assign employee to shift
 * POST /api/shifts/:shiftId/assign
 */
router.post(
  "/:shiftId/assign",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      // Check if user has permission to assign shifts (admin, manager, team_lead)
      const userRole = authReq.user.role;
      if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
        res.status(403).json({
          success: false,
          message: "Keine Berechtigung zum Zuweisen von Schichten",
        });
        return;
      }

      const shiftId = parseInt(req.params.shiftId);
      const assignmentData = {
        ...req.body,
        tenant_id: authReq.user.tenant_id || 1,
        shift_id: shiftId,
        assigned_by: authReq.user.id,
      };

      const assignment = await Shift.assignEmployeeToShift(assignmentData);
      res.status(201).json({
        success: true,
        message: "Mitarbeiter erfolgreich zugewiesen",
        assignment,
      });
    } catch (error: any) {
      console.error("Error assigning employee to shift:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Fehler beim Zuweisen des Mitarbeiters",
      });
    }
  },
);

/**
 * Get employee availability
 * GET /api/shifts/availability
 */
router.get(
  "/availability",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { start_date, end_date, user_id } = req.query;

      if (!start_date || !end_date) {
        res.status(400).json({
          success: false,
          message: "Start- und Enddatum sind erforderlich",
        });
        return;
      }

      // Use provided user_id or current user's id
      const targetUserId = user_id
        ? parseInt(user_id as string)
        : authReq.user.id;

      // Check if user can view this availability
      if (targetUserId !== authReq.user.id) {
        const userRole = authReq.user.role;
        if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
          res.status(403).json({
            success: false,
            message: "Keine Berechtigung zum Anzeigen der Verfügbarkeit",
          });
          return;
        }
      }

      const availability = await Shift.getEmployeeAvailability(
        authReq.user.tenant_id || 1,
        targetUserId,
        String(start_date),
        String(end_date),
      );

      res.json({ availability });
    } catch (error: any) {
      console.error("Error fetching employee availability:", error);
      res.status(500).json({
        success: false,
        message: "Fehler beim Laden der Verfügbarkeit",
      });
    }
  },
);

/**
 * Set employee availability
 * POST /api/shifts/availability
 */
router.post(
  "/availability",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const availabilityData = {
        ...req.body,
        tenant_id: authReq.user.tenant_id || 1,
        user_id: req.body.user_id || authReq.user.id,
      };

      // Check if user can set this availability
      if (availabilityData.user_id !== authReq.user.id) {
        const userRole = authReq.user.role;
        if (!["admin", "root", "manager", "team_lead"].includes(userRole)) {
          res.status(403).json({
            success: false,
            message: "Keine Berechtigung zum Setzen der Verfügbarkeit",
          });
          return;
        }
      }

      const availability =
        await Shift.setEmployeeAvailability(availabilityData);
      res.json({
        success: true,
        message: "Verfügbarkeit erfolgreich gesetzt",
        availability,
      });
    } catch (error: any) {
      console.error("Error setting employee availability:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Fehler beim Setzen der Verfügbarkeit",
      });
    }
  },
);

/**
 * Get shift exchange requests
 * GET /api/shifts/exchange-requests
 */
router.get(
  "/exchange-requests",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const options: ShiftExchangeFilters = {
        status: req.query.status
          ? (String(req.query.status) as
              | "pending"
              | "approved"
              | "rejected"
              | "cancelled")
          : "pending",
        limit: parseInt(String(req.query.limit || "50"), 10),
      };

      const requests = await Shift.getShiftExchangeRequests(
        authReq.user.tenant_id || 1,
        authReq.user.id,
        options,
      );

      res.json({ requests });
    } catch (error: any) {
      console.error("Error fetching shift exchange requests:", error);
      res.status(500).json({
        success: false,
        message: "Fehler beim Laden der Tauschbörse",
      });
    }
  },
);

/**
 * Create shift exchange request
 * POST /api/shifts/exchange-requests
 */
router.post(
  "/exchange-requests",
  authenticateToken,
  async (req, res): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const requestData = {
        ...req.body,
        tenant_id: authReq.user.tenant_id || 1,
        requester_id: authReq.user.id,
      };

      const request = await Shift.createShiftExchangeRequest(requestData);
      res.status(201).json({
        success: true,
        message: "Tauschantrag erfolgreich erstellt",
        request,
      });
    } catch (error: any) {
      console.error("Error creating shift exchange request:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Fehler beim Erstellen des Tauschantrags",
      });
    }
  },
);

/**
 * Get employee shifts
 * GET /api/shifts/my-shifts
 */
router.get("/my-shifts", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: "Start- und Enddatum sind erforderlich",
      });
      return;
    }

    const shifts = await Shift.getEmployeeShifts(
      authReq.user.tenant_id || 1,
      authReq.user.id,
      String(start_date),
      String(end_date),
    );

    res.json({ shifts });
  } catch (error: any) {
    console.error("Error fetching employee shifts:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der eigenen Schichten",
    });
  }
});

/**
 * Get dashboard summary for shift planning
 * GET /api/shifts/dashboard
 */
router.get("/dashboard", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const tenantId = authReq.user.tenant_id || 1;
    const userId = authReq.user.id;

    // Get upcoming shifts for this week
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingShifts = await Shift.getEmployeeShifts(
      tenantId,
      userId,
      today.toISOString().split("T")[0],
      nextWeek.toISOString().split("T")[0],
    );

    // Get pending exchange requests
    const exchangeRequests = await Shift.getShiftExchangeRequests(
      tenantId,
      userId,
      { status: "pending", limit: 5 },
    );

    // Get availability status for this week
    const availability = await Shift.getEmployeeAvailability(
      tenantId,
      userId,
      today.toISOString().split("T")[0],
      nextWeek.toISOString().split("T")[0],
    );

    res.json({
      upcomingShifts: upcomingShifts.slice(0, 5), // Next 5 shifts
      exchangeRequests,
      availability,
      stats: {
        totalUpcomingShifts: upcomingShifts.length,
        pendingExchanges: exchangeRequests.length,
        availabilityDays: availability.filter(
          (a: any) => a.availability_type === "available",
        ).length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shift dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Schichtplan-Dashboards",
    });
  }
});

/**
 * Get weekly shifts with assignments
 * GET /api/shifts/weekly
 */
router.get("/weekly", authenticateToken, async (req, res): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        message: "Start- und Enddatum sind erforderlich",
      });
      return;
    }

    const tenantId = authReq.user.tenant_id || 1;

    // Get shifts with assignments for the week
    const query = `
      SELECT s.*, sa.user_id, sa.status as assignment_status,
             u.first_name, u.last_name, u.username,
             CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as employee_name
      FROM shifts s
      LEFT JOIN shift_assignments sa ON s.id = sa.shift_id
      LEFT JOIN users u ON sa.user_id = u.id
      WHERE s.tenant_id = ? AND s.date >= ? AND s.date <= ?
      ORDER BY s.date ASC, s.start_time ASC
    `;

    const [shifts] = await (db as any).execute(query, [
      tenantId,
      start_date,
      end_date,
    ]);

    res.json({
      success: true,
      shifts,
    });
  } catch (error: any) {
    console.error("Error fetching weekly shifts:", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Wochenschichten",
    });
  }
});

/**
 * Get weekly notes
 * GET /api/shifts/weekly-notes
 */
router.get(
  "/weekly-notes",
  authenticateToken as any,
  async (req: any, res: any): Promise<void> => {
    try {
      // const authReq = req as AuthenticatedRequest; // Unused
      const { week, year } = req.query;

      if (!week || !year) {
        res.status(400).json({
          success: false,
          message: "Week and year are required",
        });
        return;
      }

      // For now, return empty notes
      res.json({ notes: "" });
    } catch (error: any) {
      console.error("Error fetching weekly notes:", error);
      res.status(500).json({
        success: false,
        message: "Fehler beim Laden der Wochennotizen",
      });
    }
  },
);

/**
 * Save weekly notes
 * POST /api/shifts/weekly-notes
 */
router.post(
  "/weekly-notes",
  authenticateToken as any,
  async (req: any, res: any): Promise<void> => {
    try {
      // const authReq = req as AuthenticatedRequest; // Unused
      const { week, year } = req.body; // notes and context unused

      if (!week || !year) {
        res.status(400).json({
          success: false,
          message: "Week and year are required",
        });
        return;
      }

      // For now, just return success
      res.json({
        success: true,
        message: "Notizen gespeichert",
      });
    } catch (error: any) {
      console.error("Error saving weekly notes:", error);
      res.status(500).json({
        success: false,
        message: "Fehler beim Speichern der Wochennotizen",
      });
    }
  },
);

export default router;

// CommonJS compatibility
