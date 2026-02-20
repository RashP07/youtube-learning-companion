const express = require('express');
const router = express.Router();
const { getHistory, getHistoryById, deleteHistory } = require('../controllers/historyController');
const { downloadPDF } = require('../controllers/pdfController');

// GET /api/history — get all history
router.get('/', getHistory);

// GET /api/history/:id — get single analysis
router.get('/:id', getHistoryById);

// DELETE /api/history/:id — delete analysis
router.delete('/:id', deleteHistory);

// GET /api/history/:id/pdf — download PDF
router.get('/:id/pdf', downloadPDF);

module.exports = router;
