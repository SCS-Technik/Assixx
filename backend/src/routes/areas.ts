/**
 * Areas Routes
 * API endpoints for area/location management
 */

import express, { Router } from "express";

import { authenticateToken } from "../auth";
import { getErrorMessage } from "../utils/errorHandler";

const router: Router = express.Router();

// Extended Request interfaces

// Area type definition
interface Area {
  id: number;
  name: string;
  description?: string;
  type: string;
  capacity?: number;
  supervisor?: string;
  created_at?: Date;
}

/**
 * Get all areas
 * GET /api/areas
 */
router.get("/", authenticateToken, async (req, res): Promise<void> => {
  try {
    // For now, return dummy area data
    // In production, this would query the areas table
    const areas: Area[] = [
      {
        id: 1,
        name: "Halle A",
        description: "Produktionsbereich A",
        type: "production",
      },
      {
        id: 2,
        name: "Halle B",
        description: "Produktionsbereich B",
        type: "production",
      },
      {
        id: 3,
        name: "Lager Nord",
        description: "Eingangslager",
        type: "warehouse",
      },
      {
        id: 4,
        name: "Lager Süd",
        description: "Ausgangslager",
        type: "warehouse",
      },
      {
        id: 5,
        name: "Bürobereich",
        description: "Verwaltung und Büros",
        type: "office",
      },
      {
        id: 6,
        name: "Qualitätsprüfung",
        description: "QS-Bereich",
        type: "quality",
      },
      {
        id: 7,
        name: "Wartung",
        description: "Werkstatt und Wartung",
        type: "maintenance",
      },
    ];

    // Filter by type if requested
    const areaType = req.query.type;
    let filteredAreas = areas;

    if (areaType) {
      filteredAreas = areas.filter((area) => area.type === areaType);
    }

    res.json({
      success: true,
      areas: filteredAreas,
    });
  } catch (error) {
    console.error("Error fetching areas:", getErrorMessage(error));
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Bereiche",
    });
  }
});

/**
 * Get area by ID
 * GET /api/areas/:id
 */
router.get("/:id", authenticateToken, async (req, res): Promise<void> => {
  try {
    const areaId = parseInt(req.params.id);

    // Dummy area data
    const area: Area = {
      id: areaId,
      name: `Bereich ${areaId}`,
      description: "Automatisch generierter Bereich",
      type: "production",
      capacity: 50,
      supervisor: "Max Mustermann",
    };

    res.json({
      success: true,
      area,
    });
  } catch (error) {
    console.error("Error fetching area:", getErrorMessage(error));
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden des Bereichs",
    });
  }
});

/**
 * Create new area (Admin only)
 * POST /api/areas
 */
router.post("/", authenticateToken, async (req, res): Promise<void> => {
  try {
    // Check admin permission
    if (!["admin", "root", "manager"].includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Keine Berechtigung zum Erstellen von Bereichen",
      });
      return;
    }

    const { name, description, type, capacity } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Name ist erforderlich",
      });
      return;
    }

    // For now, return dummy created area
    const area: Area = {
      id: Date.now(),
      name,
      description: description ?? undefined,
      type: type ?? "production",
      capacity: capacity ?? undefined,
      created_at: new Date(),
    };

    res.status(201).json({
      success: true,
      message: "Bereich erfolgreich erstellt",
      area,
    });
  } catch (error) {
    console.error("Error creating area:", getErrorMessage(error));
    res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen des Bereichs",
    });
  }
});

export default router;

// CommonJS compatibility
