const { isDBConnected, Analysis } = require('../config/db');
const { generatePDF } = require('../services/pdfService');
const { createError } = require('../utils/errorHandler');


const downloadPDF = async (req, res, next) => {
  try {
    let analysis;
   if (req.body && req.body.data) {
      analysis = req.body.data;
    } else if (req.params.id) {
      if (!isDBConnected()) {
        return next(createError('Database not connected. Pass analysis data directly.', 503));
      }

      const { id } = req.params;
      if (id.match(/^[a-f\d]{24}$/i)) {
        analysis = await Analysis.findById(id);
      } else {
        analysis = await Analysis.findOne({ videoId: id });
      }

      if (!analysis) {
        return next(createError('Analysis not found.', 404));
      }
    } else {
      return next(createError('No analysis data or ID provided.', 400));
    }

    generatePDF(analysis, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadPDF };
