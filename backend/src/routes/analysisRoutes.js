const express = require('express');
const router = express.Router();
const { analyzeVideo } = require('../controllers/analysisController');
const { downloadPDF } = require('../controllers/pdfController');


router.post('/analyze', analyzeVideo);

router.post('/analyze/pdf', downloadPDF);

module.exports = router;
