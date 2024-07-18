const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/user');
const Document = require('../models/document');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/info', authenticateToken, authorizeRole('employee'), async (req, res) => {
    const employeeId = req.user.id;
    logger.info(`Employee ${employeeId} requesting their information`);
    try {
        const employee = await User.findById(employeeId);
        if (!employee) {
            logger.warn(`Employee with ID ${employeeId} not found`);
            return res.status(404).json({ message: 'Mitarbeiter nicht gefunden' });
        }
        logger.info(`Information retrieved for Employee ${employeeId}`);
        res.json(employee);
    } catch (error) {
        logger.error(`Error retrieving information for Employee ${employeeId}: ${error.message}`);
        res.status(500).json({ message: 'Fehler beim Abrufen der Mitarbeiterinformationen', error: error.message });
    }
});

router.get('/documents', authenticateToken, authorizeRole('employee'), async (req, res) => {
    const employeeId = req.user.id;
    logger.info(`Employee ${employeeId} requesting their documents`);
    try {
        const documents = await Document.findByUserId(employeeId);
        logger.info(`Retrieved ${documents.length} documents for Employee ${employeeId}`);
        res.json(documents);
    } catch (error) {
        logger.error(`Error retrieving documents for Employee ${employeeId}: ${error.message}`);
        res.status(500).json({ message: 'Fehler beim Abrufen der Dokumente', error: error.message });
    }
});

router.get('/documents/:documentId', authenticateToken, authorizeRole('employee'), async (req, res) => {
    const employeeId = req.user.id;
    const { documentId } = req.params;
    logger.info(`Employee ${employeeId} attempting to download document ${documentId}`);
    try {
        const document = await Document.findById(documentId);
        
        if (!document || document.user_id !== employeeId) {
            logger.warn(`Document ${documentId} not found or not owned by Employee ${employeeId}`);
            return res.status(404).json({ message: 'Dokument nicht gefunden' });
        }

        logger.info(`Employee ${employeeId} successfully downloaded document ${documentId}`);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${document.file_name}`);
        res.send(document.file_content);
    } catch (error) {
        logger.error(`Error downloading document ${documentId} for Employee ${employeeId}: ${error.message}`);
        res.status(500).json({ message: 'Fehler beim Herunterladen des Dokuments', error: error.message });
    }
});

router.get('/search-documents', authenticateToken, authorizeRole('employee'), async (req, res) => {
    const employeeId = req.user.id;
    const { query } = req.query;
    logger.info(`Employee ${employeeId} searching documents with query: ${query}`);
    try {
        if (!query) {
            logger.warn(`Employee ${employeeId} attempted search without query`);
            return res.status(400).json({ message: 'Suchbegriff erforderlich' });
        }
        const documents = await Document.search(employeeId, query);
        logger.info(`Found ${documents.length} documents for Employee ${employeeId} with query: ${query}`);
        res.json(documents);
    } catch (error) {
        logger.error(`Error searching documents for Employee ${employeeId}: ${error.message}`);
        res.status(500).json({ message: 'Fehler bei der Dokumentensuche', error: error.message });
    }
});

module.exports = router;