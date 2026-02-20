const { isDBConnected, Analysis } = require('../config/db');
const { createError } = require('../utils/errorHandler');


const getHistory = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return res.json({ success: true, data: [], message: 'Database not connected. Use localStorage.' });
    }

    const history = await Analysis.find({})
      .select('videoId videoUrl title thumbnail summary createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};


const getHistoryById = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return next(createError('Database not connected.', 503));
    }

    const { id } = req.params;
    let record;

    if (id.match(/^[a-f\d]{24}$/i)) {
      record = await Analysis.findById(id);
    }
    if (!record) {
      record = await Analysis.findOne({ videoId: id });
    }

    if (!record) {
      return next(createError('Analysis not found.', 404));
    }

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/history/:id
 */
const deleteHistory = async (req, res, next) => {
  try {
    if (!isDBConnected()) {
      return next(createError('Database not connected.', 503));
    }

    const { id } = req.params;
    let result;

    if (id.match(/^[a-f\d]{24}$/i)) {
      result = await Analysis.findByIdAndDelete(id);
    } else {
      result = await Analysis.findOneAndDelete({ videoId: id });
    }

    if (!result) {
      return next(createError('Analysis not found.', 404));
    }

    res.json({ success: true, message: 'Analysis deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getHistoryById, deleteHistory };
